import { supabase } from "@/lib/supabase/db";
import { apiError, apiSuccess } from "@/lib/api/response";
import { validateRequestBody } from "@/lib/api/validation";
import { authorizeTeacherRequest } from "@/lib/auth/guard";
import { HttpStatus } from "@/constants";
import { UserRole } from "@/constants/auth";
import { teacherBatchActionSchema } from "@/features/teacher-management/schemas/teacherSchemas";

/**
 * POST /api/teacher/teachers/batch
 * Thực hiện thao tác hàng loạt trên nhiều tài khoản giáo viên:
 * (Kích hoạt, Tạm khóa, Chuyển thùng rác, Khôi phục, Xóa vĩnh viễn)
 * - Giới hạn tối đa 100 giáo viên mỗi lượt
 * - Xóa vĩnh viễn chỉ áp dụng cho tài khoản đã nằm trong thùng rác (is_deleted = true)
 * - Bắt lỗi tuần tự bảo vệ dữ liệu và trả về số lượng bản ghi thực tế được tác động
 */
export async function POST(req: Request) {
  try {
    const auth = await authorizeTeacherRequest(
      req,
      "Bạn không có quyền thực hiện thao tác hàng loạt trên tài khoản giáo viên."
    );
    if (!auth.success) {
      return auth.response;
    }
    const { session } = auth;

    const validation = await validateRequestBody(req, teacherBatchActionSchema);
    if (!validation.success) {
      return validation.response;
    }

    const { ids, action } = validation.data;
    const uniqueIds = Array.from(new Set(ids));

    // Không cho phép thực hiện thao tác xóa hoặc khóa trên chính tài khoản của mình
    const filteredIds = uniqueIds.filter((id) => id !== session.userId);
    if (filteredIds.length === 0) {
      return apiError(
        "Bạn không thể thực hiện thao tác này trên chính tài khoản của mình.",
        HttpStatus.BAD_REQUEST
      );
    }

    // 1. Mở khóa / Kích hoạt hàng loạt (Chỉ áp dụng cho tài khoản chưa bị xóa)
    if (action === "activate") {
      const { data: activatedList, error: activateError } = await supabase
        .from("users")
        .update({
          is_active: true,
          failed_login_attempts: 0,
          locked_until: null,
          updated_at: new Date().toISOString(),
          updated_by: session.userId,
        })
        .in("id", filteredIds)
        .eq("is_deleted", false)
        .select("id");

      if (activateError) {
        console.error("Lỗi khi mở khóa hàng loạt giáo viên:", activateError.message);
        return apiError("Không thể mở khóa các tài khoản đã chọn. Vui lòng thử lại.");
      }

      const count = activatedList?.length || 0;
      return apiSuccess(
        { count, action: "activate" },
        `Đã mở khóa thành công ${count} tài khoản giáo viên!`
      );
    }

    // 2. Tạm khóa hàng loạt (Chỉ áp dụng cho tài khoản chưa bị xóa)
    if (action === "deactivate") {
      const { data: deactivatedList, error: deactivateError } = await supabase
        .from("users")
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
          updated_by: session.userId,
        })
        .in("id", filteredIds)
        .eq("is_deleted", false)
        .select("id");

      if (deactivateError) {
        console.error("Lỗi khi tạm khóa hàng loạt giáo viên:", deactivateError.message);
        return apiError("Không thể tạm khóa các tài khoản đã chọn. Vui lòng thử lại.");
      }

      const count = deactivatedList?.length || 0;
      return apiSuccess(
        { count, action: "deactivate" },
        `Đã tạm khóa thành công ${count} tài khoản giáo viên!`
      );
    }

    // 3. Chuyển vào thùng rác hàng loạt (Xóa mềm - CHỈ SUPER_TEACHER và ADMIN mới có quyền)
    if (action === "delete_soft") {
      if (
        session.role !== UserRole.SUPER_TEACHER &&
        session.role !== UserRole.ADMIN
      ) {
        return apiError(
          "Chỉ Tổ trưởng chuyên môn (Super Teacher) hoặc Quản trị viên (Admin) mới có quyền chuyển các tài khoản giáo viên vào thùng rác.",
          HttpStatus.FORBIDDEN
        );
      }

      const now = new Date().toISOString();
      const { data: softDeletedList, error: softDeleteError } = await supabase
        .from("users")
        .update({
          is_deleted: true,
          is_active: false,
          deleted_at: now,
          deleted_by: session.userId,
          updated_at: now,
          updated_by: session.userId,
        })
        .in("id", filteredIds)
        .eq("is_deleted", false)
        .select("id");

      if (softDeleteError) {
        console.error("Lỗi khi chuyển thùng rác hàng loạt giáo viên:", softDeleteError.message);
        return apiError("Không thể chuyển các tài khoản đã chọn vào thùng rác.");
      }

      const count = softDeletedList?.length || 0;
      return apiSuccess(
        { count, action: "delete_soft" },
        `Đã chuyển thành công ${count} tài khoản giáo viên vào thùng rác!`
      );
    }

    // 4. Khôi phục hàng loạt (Chỉ Quản trị viên tối cao mới có quyền và chỉ khôi phục tài khoản đang trong thùng rác)
    if (action === "restore") {
      if (session.role !== UserRole.ADMIN) {
        return apiError(
          "Chỉ Quản trị viên tối cao (Admin) mới có quyền khôi phục tài khoản giáo viên.",
          HttpStatus.FORBIDDEN
        );
      }

      const { data: restoredList, error: restoreError } = await supabase
        .from("users")
        .update({
          is_deleted: false,
          is_active: true,
          deleted_at: null,
          deleted_by: null,
          failed_login_attempts: 0,
          locked_until: null,
          updated_at: new Date().toISOString(),
          updated_by: session.userId,
        })
        .in("id", filteredIds)
        .eq("is_deleted", true)
        .select("id");

      if (restoreError) {
        console.error("Lỗi khi khôi phục hàng loạt giáo viên:", restoreError.message);
        return apiError("Không thể khôi phục các tài khoản đã chọn. Vui lòng thử lại.");
      }

      const count = restoredList?.length || 0;
      return apiSuccess(
        { count, action: "restore" },
        `Đã khôi phục thành công ${count} tài khoản giáo viên!`
      );
    }

    // 5. Xóa vĩnh viễn hàng loạt (Chỉ Quản trị viên tối cao và CHỈ xóa tài khoản đã trong thùng rác)
    if (action === "delete_permanent") {
      if (session.role !== UserRole.ADMIN) {
        return apiError(
          "Chỉ Quản trị viên tối cao (Admin) mới có quyền xóa vĩnh viễn các tài khoản giáo viên.",
          HttpStatus.FORBIDDEN
        );
      }

      // Lọc danh sách các tài khoản thực sự nằm trong thùng rác
      const { data: trashUsers, error: findError } = await supabase
        .from("users")
        .select("id")
        .in("id", filteredIds)
        .eq("is_deleted", true);

      if (findError) {
        console.error("Lỗi khi kiểm tra thùng rác:", findError.message);
        return apiError("Không thể kiểm tra danh sách tài khoản trong thùng rác.");
      }

      const validTrashIds = (trashUsers || []).map((u) => u.id);
      if (validTrashIds.length === 0) {
        return apiError(
          "Không có tài khoản nào trong danh sách đã chọn đủ điều kiện xóa vĩnh viễn (chỉ được xóa các tài khoản đang nằm trong thùng rác).",
          HttpStatus.BAD_REQUEST
        );
      }

      // a. Xóa toàn bộ phân công lớp học của các giáo viên này - Bắt lỗi
      const { error: tcDeleteError } = await supabase
        .from("teacher_classes")
        .delete()
        .in("teacher_id", validTrashIds);

      if (tcDeleteError) {
        console.error("Lỗi khi xóa phân công lớp học hàng loạt:", tcDeleteError.message);
        return apiError("Không thể gỡ phân công lớp học của các giáo viên đã chọn. Thao tác đã bị hủy để bảo vệ dữ liệu.");
      }

      // b. Xóa vĩnh viễn các bản ghi trong users và đếm số lượng thực tế
      const { data: deletedList, error: hardDeleteError } = await supabase
        .from("users")
        .delete()
        .in("id", validTrashIds)
        .select("id");

      if (hardDeleteError) {
        console.error("Lỗi khi xóa vĩnh viễn hàng loạt giáo viên:", hardDeleteError.message);
        return apiError("Không thể xóa vĩnh viễn các tài khoản đã chọn.");
      }

      const count = deletedList?.length || 0;
      return apiSuccess(
        { count, action: "delete_permanent" },
        `Đã xóa vĩnh viễn thành công ${count} tài khoản giáo viên!`
      );
    }

    return apiError("Thao tác không được hỗ trợ.", HttpStatus.BAD_REQUEST);
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Lỗi máy chủ tại POST /api/teacher/teachers/batch:", error.message);
    return apiError("Đã xảy ra lỗi hệ thống khi xử lý thao tác hàng loạt.");
  }
}
