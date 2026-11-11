import { supabase } from "@/lib/supabase/db";
import { apiError, apiSuccess } from "@/lib/api/response";
import { validateRequestBody } from "@/lib/api/validation";
import { authorizeTeacherRequest } from "@/lib/auth/guard";
import { HttpStatus } from "@/constants";
import { UserRole } from "@/constants/auth";
import { resetStudentPinSchema } from "@/features/teacher/schemas/studentSchemas";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/teacher/students/[id]/reset-pin
 * Đặt lại mã PIN 4 chữ số cho học sinh và mở khóa tài khoản tức thì
 */
export async function POST(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    if (!id) {
      return apiError("Mã học sinh không hợp lệ.", HttpStatus.BAD_REQUEST);
    }

    const auth = await authorizeTeacherRequest(
      req,
      "Bạn không có quyền đặt lại mã PIN cho học sinh."
    );
    if (!auth.success) {
      return auth.response;
    }
    const { session } = auth;

    const validation = await validateRequestBody(req, resetStudentPinSchema);
    if (!validation.success) {
      return validation.response;
    }

    const { new_pin } = validation.data;

    // 1. Kiểm tra tài khoản học sinh tồn tại
    const { data: studentRecord, error: findError } = await supabase
      .from("users")
      .select("id, full_name, is_deleted")
      .eq("id", id)
      .eq("role", UserRole.STUDENT)
      .maybeSingle();

    if (findError || !studentRecord) {
      return apiError("Không tìm thấy hồ sơ học sinh yêu cầu.", HttpStatus.NOT_FOUND);
    }

    if (studentRecord.is_deleted) {
      return apiError("Học sinh này đang ở trong thùng rác, không thể đổi mã PIN.", HttpStatus.BAD_REQUEST);
    }

    // 2. Cập nhật mã PIN mới và mở khóa tài khoản
    const { error: updateError } = await supabase
      .from("users")
      .update({
        pin_number: new_pin,
        failed_login_attempts: 0,
        locked_until: null,
        updated_at: new Date().toISOString(),
        updated_by: session.userId,
      })
      .eq("id", id);

    if (updateError) {
      console.error("Lỗi khi đặt lại mã PIN:", updateError.message);
      return apiError("Không thể đặt lại mã PIN cho học sinh. Vui lòng thử lại.");
    }

    return apiSuccess(
      { student_id: id },
      `Đã cập nhật mã PIN mới và mở khóa thành công cho bé "${studentRecord.full_name}"!`
    );
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Lỗi máy chủ tại POST /api/teacher/students/[id]/reset-pin:", error.message);
    return apiError("Đã xảy ra lỗi hệ thống khi đặt lại mã PIN.");
  }
}
