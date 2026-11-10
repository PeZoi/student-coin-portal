import { supabase } from "@/lib/supabase/db";
import { apiError, apiSuccess } from "@/lib/api/response";
import { validateRequestBody } from "@/lib/api/validation";
import { authorizeTeacherRequest } from "@/lib/auth/guard";
import { HttpStatus } from "@/constants";
import { UserRole } from "@/constants/auth";
import { updateClassSchema } from "@/features/teacher/schemas/classSchemas";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/teacher/classes/[id]
 * Cập nhật tên lớp học hoặc trạng thái hoạt động (hoạt động / tạm ẩn)
 */
export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    if (!id) {
      return apiError("Mã lớp học không hợp lệ.", HttpStatus.BAD_REQUEST);
    }

    const auth = await authorizeTeacherRequest(req, "Bạn không có quyền chỉnh sửa lớp học.");
    if (!auth.success) {
      return auth.response;
    }
    const { session } = auth;

    // Xác thực body động thông qua helper tập trung
    const validation = await validateRequestBody(req, updateClassSchema);
    if (!validation.success) {
      return validation.response;
    }

    const { class_name, is_active } = validation.data;

    // 1. Kiểm tra lớp học có tồn tại không
    const { data: existingClass, error: findError } = await supabase
      .from("classes")
      .select("id, class_name, is_active")
      .eq("id", id)
      .eq("is_deleted", false)
      .maybeSingle();

    if (findError || !existingClass) {
      return apiError("Không tìm thấy lớp học yêu cầu hoặc lớp đã bị xóa.", HttpStatus.NOT_FOUND);
    }

    // 2. Nếu đổi tên lớp, kiểm tra trùng tên với lớp khác
    if (class_name && class_name.toLowerCase() !== existingClass.class_name.toLowerCase()) {
      const { data: duplicate } = await supabase
        .from("classes")
        .select("id")
        .ilike("class_name", class_name)
        .neq("id", id)
        .eq("is_deleted", false)
        .maybeSingle();

      if (duplicate) {
        return apiError("Tên lớp học này đã được sử dụng bởi lớp khác.", HttpStatus.CONFLICT);
      }
    }

    // 3. Tiến hành cập nhật
    const updatePayload: {
      class_name?: string;
      is_active?: boolean;
      updated_at: string;
      updated_by: string;
    } = {
      updated_at: new Date().toISOString(),
      updated_by: session.userId,
    };

    if (class_name !== undefined) updatePayload.class_name = class_name;
    if (is_active !== undefined) updatePayload.is_active = is_active;

    const { data: updatedClass, error: updateError } = await supabase
      .from("classes")
      .update(updatePayload)
      .eq("id", id)
      .select("id, class_name, is_active, updated_at")
      .single();

    if (updateError || !updatedClass) {
      console.error("Lỗi khi cập nhật lớp học tại Supabase:", updateError?.message);
      return apiError("Không thể cập nhật thông tin lớp học. Vui lòng thử lại sau.");
    }

    return apiSuccess(updatedClass, "Cập nhật thông tin lớp học thành công!");
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Lỗi máy chủ tại PATCH /api/teacher/classes/[id]:", error.message);
    return apiError("Đã xảy ra lỗi hệ thống khi cập nhật lớp học.");
  }
}

/**
 * DELETE /api/teacher/classes/[id]
 * - Nếu lớp CHƯA CÓ HỌC SINH (student_count === 0): Xóa vĩnh viễn luôn khỏi cần xuống tầng 2.
 * - Nếu lớp ĐÃ CÓ HỌC SINH:
 *   + Mặc định: Xóa mềm (chuyển vào thùng rác, bảo vệ an toàn học sinh và lịch sử học tập).
 *   + Kèm ?permanent=true (chỉ dành cho Admin / Super-Teacher): Xóa vĩnh viễn (giải phóng học sinh, xóa quan hệ).
 */
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    if (!id) {
      return apiError("Mã lớp học không hợp lệ.", HttpStatus.BAD_REQUEST);
    }

    const { searchParams } = new URL(req.url);
    const isPermanent = searchParams.get("permanent") === "true";

    const auth = await authorizeTeacherRequest(
      req,
      "Bạn không có quyền xoá lớp học."
    );
    if (!auth.success) {
      return auth.response;
    }
    const { session } = auth;

    // 1. Kiểm tra lớp học có học sinh hay không (Existence Check: LIMIT 1, dừng ngay khi tìm thấy 1 bản ghi - O(1))
    const { data: existingStudent, error: checkError } = await supabase
      .from("users")
      .select("id")
      .eq("class_id", id)
      .limit(1)
      .maybeSingle();

    if (checkError) {
      console.error("Lỗi khi kiểm tra học sinh trong lớp học:", checkError.message);
      return apiError("Không thể kiểm tra thông tin lớp học. Vui lòng thử lại.");
    }

    const hasStudents = !!existingStudent;

    // 2. XÓA VĨNH VIỄN: Nếu lớp chưa có học sinh HOẶC người dùng yêu cầu xóa vĩnh viễn (?permanent=true)
    if (!hasStudents || isPermanent) {
      // Nếu lớp ĐÃ CÓ học sinh mà muốn xóa vĩnh viễn: bắt buộc phải có quyền Admin hoặc Super-Teacher
      if (hasStudents && session.role !== UserRole.ADMIN && session.role !== UserRole.SUPER_TEACHER) {
        return apiError("Chỉ Quản trị viên mới có quyền xóa vĩnh viễn lớp học đang có học sinh.", HttpStatus.FORBIDDEN);
      }

      // a. Giải phóng học sinh khỏi lớp (nếu có)
      if (hasStudents) {
        await supabase.from("users").update({ class_id: null }).eq("class_id", id);
      }

      // b. Xóa các phân công giáo viên liên quan
      await supabase.from("teacher_classes").delete().eq("class_id", id);

      // c. Xóa các liên kết nhiệm vụ theo lớp
      await supabase.from("mission_classes").delete().eq("class_id", id);

      // d. Xóa vĩnh viễn lớp học khỏi cơ sở dữ liệu
      const { error: hardDeleteError } = await supabase.from("classes").delete().eq("id", id);

      if (hardDeleteError) {
        console.error("Lỗi khi xóa vĩnh viễn lớp học:", hardDeleteError.message);
        return apiError("Không thể xóa vĩnh viễn lớp học. Vui lòng thử lại sau.");
      }

      return apiSuccess(
        { id, permanent: true },
        hasStudents
          ? "Đã xóa vĩnh viễn lớp học thành công!"
          : "Lớp học chưa có học sinh nên đã được xóa vĩnh viễn thành công!"
      );
    }

    // 3. XÓA MỀM (TẦNG 1): Dành cho lớp đang có học sinh (bảo vệ an toàn dữ liệu)
    const { error: deleteError } = await supabase
      .from("classes")
      .update({
        is_deleted: true,
        is_active: false,
        deleted_at: new Date().toISOString(),
        deleted_by: session.userId,
      })
      .eq("id", id);

    if (deleteError) {
      console.error("Lỗi khi chuyển lớp học vào thùng rác:", deleteError.message);
      return apiError("Không thể xóa lớp học. Vui lòng thử lại sau.");
    }

    return apiSuccess({ id, permanent: false }, "Đã xóa lớp học thành công!");
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Lỗi máy chủ tại DELETE /api/teacher/classes/[id]:", error.message);
    return apiError("Đã xảy ra lỗi hệ thống khi xóa lớp học.");
  }
}
