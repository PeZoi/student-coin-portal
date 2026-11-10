import { supabase } from "@/lib/supabase/db";
import { apiError, apiSuccess } from "@/lib/api/response";
import { validateRequestBody } from "@/lib/api/validation";
import { authorizeTeacherRequest } from "@/lib/auth/guard";
import { HttpStatus } from "@/constants";
import { UserRole } from "@/constants/auth";
import { batchClassActionSchema } from "@/features/teacher/schemas/classSchemas";

/**
 * POST /api/teacher/classes/batch
 * Thực hiện thao tác hàng loạt trên nhiều lớp học:
 * (Kích hoạt, Tạm ẩn, Chuyển thùng rác, Khôi phục, Xóa vĩnh viễn)
 * - Giới hạn tối đa 100 mục mỗi lượt
 * - Xóa vĩnh viễn chỉ áp dụng cho lớp đã nằm trong thùng rác (is_deleted = true)
 * - Bắt lỗi tuần tự bảo vệ dữ liệu và trả về số lượng bản ghi thực tế được tác động
 */
export async function POST(req: Request) {
  try {
    const auth = await authorizeTeacherRequest(
      req,
      "Bạn không có quyền thực hiện thao tác hàng loạt."
    );
    if (!auth.success) {
      return auth.response;
    }
    const { session } = auth;

    const validation = await validateRequestBody(req, batchClassActionSchema);
    if (!validation.success) {
      return validation.response;
    }

    const { ids, action } = validation.data;
    const uniqueIds = Array.from(new Set(ids));

    // 1. Khôi phục hàng loạt (Chỉ Quản trị viên tối cao mới có quyền và chỉ khôi phục các lớp đang nằm trong thùng rác)
    if (action === "restore") {
      if (session.role !== UserRole.ADMIN) {
        return apiError(
          "Chỉ Quản trị viên tối cao (Admin) mới có quyền khôi phục các lớp học.",
          HttpStatus.FORBIDDEN
        );
      }

      const { data: restoredList, error: restoreError } = await supabase
        .from("classes")
        .update({
          is_deleted: false,
          is_active: true,
          deleted_at: null,
          deleted_by: null,
          updated_at: new Date().toISOString(),
          updated_by: session.userId,
        })
        .in("id", uniqueIds)
        .eq("is_deleted", true)
        .select("id");

      if (restoreError) {
        console.error("Lỗi khi khôi phục hàng loạt lớp học:", restoreError.message);
        return apiError("Không thể khôi phục các lớp học đã chọn. Vui lòng thử lại.");
      }

      const count = restoredList?.length || 0;
      return apiSuccess(
        { count, action: "restore" },
        `Đã khôi phục thành công ${count} lớp học!`
      );
    }

    // 2. Xóa vĩnh viễn hàng loạt (Chỉ Quản trị viên tối cao mới có quyền và CHỈ xóa lớp đã nằm trong thùng rác)
    if (action === "delete_permanent") {
      if (session.role !== UserRole.ADMIN) {
        return apiError(
          "Chỉ Quản trị viên tối cao (Admin) mới có quyền xóa vĩnh viễn các lớp học.",
          HttpStatus.FORBIDDEN
        );
      }

      // Lọc danh sách các lớp thực sự nằm trong thùng rác
      const { data: trashClasses, error: findError } = await supabase
        .from("classes")
        .select("id")
        .in("id", uniqueIds)
        .eq("is_deleted", true);

      if (findError) {
        console.error("Lỗi khi kiểm tra thùng rác:", findError.message);
        return apiError("Không thể kiểm tra danh sách lớp học trong thùng rác.");
      }

      const validTrashIds = (trashClasses || []).map((c) => c.id);
      if (validTrashIds.length === 0) {
        return apiError(
          "Không có lớp học nào trong danh sách đã chọn đủ điều kiện xóa vĩnh viễn (chỉ được xóa các lớp đang nằm trong thùng rác).",
          HttpStatus.BAD_REQUEST
        );
      }

      // a. Giải phóng học sinh khỏi các lớp này - Kiểm tra lỗi
      const { error: unassignError } = await supabase
        .from("users")
        .update({ class_id: null })
        .in("class_id", validTrashIds);

      if (unassignError) {
        console.error("Lỗi khi giải phóng học sinh hàng loạt:", unassignError.message);
        return apiError("Không thể giải phóng học sinh khỏi các lớp đã chọn. Thao tác đã bị hủy để bảo vệ dữ liệu.");
      }

      // b. Xóa các phân công giáo viên liên quan - Kiểm tra lỗi
      const { error: tcDeleteError } = await supabase
        .from("teacher_classes")
        .delete()
        .in("class_id", validTrashIds);

      if (tcDeleteError) {
        console.error("Lỗi khi xóa phân công giáo viên hàng loạt:", tcDeleteError.message);
        return apiError("Không thể xóa phân công giáo viên liên quan. Vui lòng thử lại.");
      }

      // c. Xóa các phân công nhiệm vụ liên quan - Kiểm tra lỗi
      const { error: mcDeleteError } = await supabase
        .from("mission_classes")
        .delete()
        .in("class_id", validTrashIds);

      if (mcDeleteError) {
        console.error("Lỗi khi xóa nhiệm vụ của các lớp:", mcDeleteError.message);
        return apiError("Không thể xóa bài tập liên quan của các lớp học.");
      }

      // d. Xóa vĩnh viễn các bản ghi lớp học và đếm số lượng thực tế
      const { data: deletedList, error: hardDeleteError } = await supabase
        .from("classes")
        .delete()
        .in("id", validTrashIds)
        .select("id");

      if (hardDeleteError) {
        console.error("Lỗi khi xóa vĩnh viễn hàng loạt lớp học:", hardDeleteError.message);
        return apiError("Không thể xóa vĩnh viễn các lớp học đã chọn. Vui lòng thử lại.");
      }

      const count = deletedList?.length || 0;
      return apiSuccess(
        { count, action: "delete_permanent" },
        `Đã xóa vĩnh viễn thành công ${count} lớp học!`
      );
    }

    // 3. Kích hoạt / Mở lại hàng loạt các lớp học (Chỉ áp dụng cho lớp chưa bị xóa)
    if (action === "activate") {
      const { data: activatedList, error: activateError } = await supabase
        .from("classes")
        .update({
          is_active: true,
          updated_at: new Date().toISOString(),
          updated_by: session.userId,
        })
        .in("id", uniqueIds)
        .eq("is_deleted", false)
        .select("id");

      if (activateError) {
        console.error("Lỗi khi kích hoạt hàng loạt lớp học:", activateError.message);
        return apiError("Không thể kích hoạt các lớp học đã chọn. Vui lòng thử lại.");
      }

      const count = activatedList?.length || 0;
      return apiSuccess(
        { count, action: "activate" },
        `Đã hiện lại và kích hoạt thành công ${count} lớp học!`
      );
    }

    // 4. Tạm ẩn hàng loạt các lớp học (Chỉ áp dụng cho lớp chưa bị xóa)
    if (action === "deactivate") {
      const { data: deactivatedList, error: deactivateError } = await supabase
        .from("classes")
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
          updated_by: session.userId,
        })
        .in("id", uniqueIds)
        .eq("is_deleted", false)
        .select("id");

      if (deactivateError) {
        console.error("Lỗi khi tạm ẩn hàng loạt lớp học:", deactivateError.message);
        return apiError("Không thể tạm ẩn các lớp học đã chọn. Vui lòng thử lại.");
      }

      const count = deactivatedList?.length || 0;
      return apiSuccess(
        { count, action: "deactivate" },
        `Đã chuyển ${count} lớp học sang trạng thái tạm ẩn!`
      );
    }

    // 5. Chuyển vào thùng rác hàng loạt (Xóa mềm - Chỉ áp dụng cho lớp chưa bị xóa)
    if (action === "delete_soft") {
      const now = new Date().toISOString();
      const { data: softDeletedList, error: softDeleteError } = await supabase
        .from("classes")
        .update({
          is_deleted: true,
          is_active: false,
          deleted_at: now,
          deleted_by: session.userId,
          updated_at: now,
          updated_by: session.userId,
        })
        .in("id", uniqueIds)
        .eq("is_deleted", false)
        .select("id");

      if (softDeleteError) {
        console.error("Lỗi khi chuyển thùng rác hàng loạt lớp học:", softDeleteError.message);
        return apiError("Không thể chuyển các lớp học đã chọn vào thùng rác. Vui lòng thử lại.");
      }

      const count = softDeletedList?.length || 0;
      return apiSuccess(
        { count, action: "delete_soft" },
        `Đã chuyển thành công ${count} lớp học vào thùng rác!`
      );
    }

    return apiError("Thao tác không được hỗ trợ.", HttpStatus.BAD_REQUEST);
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Lỗi máy chủ tại POST /api/teacher/classes/batch:", error.message);
    return apiError("Đã xảy ra lỗi hệ thống khi xử lý thao tác hàng loạt.");
  }
}
