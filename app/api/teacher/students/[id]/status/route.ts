import { supabase } from "@/lib/supabase/db";
import { apiError, apiSuccess } from "@/lib/api/response";
import { validateRequestBody } from "@/lib/api/validation";
import { authorizeTeacherRequest } from "@/lib/auth/guard";
import { HttpStatus } from "@/constants";
import { UserRole } from "@/constants/auth";
import { updateStudentStatusSchema } from "@/features/teacher/schemas/studentSchemas";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/teacher/students/[id]/status
 * Thay đổi trạng thái hoạt động học sinh (Tạm ngưng / Hoạt động)
 */
export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    if (!id) {
      return apiError("Mã học sinh không hợp lệ.", HttpStatus.BAD_REQUEST);
    }

    const auth = await authorizeTeacherRequest(
      req,
      "Bạn không có quyền thay đổi trạng thái tài khoản học sinh."
    );
    if (!auth.success) {
      return auth.response;
    }
    const { session } = auth;

    const validation = await validateRequestBody(req, updateStudentStatusSchema);
    if (!validation.success) {
      return validation.response;
    }

    const { is_active } = validation.data;

    // 1. Kiểm tra tài khoản học sinh tồn tại
    const { data: studentRecord, error: findError } = await supabase
      .from("users")
      .select("id, full_name, is_active, is_deleted")
      .eq("id", id)
      .eq("role", UserRole.STUDENT)
      .maybeSingle();

    if (findError || !studentRecord) {
      return apiError("Không tìm thấy hồ sơ học sinh yêu cầu.", HttpStatus.NOT_FOUND);
    }

    if (studentRecord.is_deleted) {
      return apiError("Học sinh này đang ở trong thùng rác, không thể đổi trạng thái.", HttpStatus.BAD_REQUEST);
    }

    // 2. Cập nhật trạng thái
    const { error: updateError } = await supabase
      .from("users")
      .update({
        is_active,
        updated_at: new Date().toISOString(),
        updated_by: session.userId,
      })
      .eq("id", id);

    if (updateError) {
      console.error("Lỗi khi cập nhật trạng thái học sinh:", updateError.message);
      return apiError("Không thể cập nhật trạng thái học sinh. Vui lòng thử lại.");
    }

    return apiSuccess(
      { id, is_active },
      is_active
        ? `Đã kích hoạt lại tài khoản cho bé "${studentRecord.full_name}"!`
        : `Đã tạm ngưng tài khoản của bé "${studentRecord.full_name}".`
    );
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Lỗi máy chủ tại PATCH /api/teacher/students/[id]/status:", error.message);
    return apiError("Đã xảy ra lỗi hệ thống khi cập nhật trạng thái.");
  }
}
