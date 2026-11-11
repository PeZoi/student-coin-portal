import { supabase } from "@/lib/supabase/db";
import { apiError, apiSuccess } from "@/lib/api/response";
import { authorizeTeacherRequest } from "@/lib/auth/guard";
import { HttpStatus } from "@/constants";
import { UserRole } from "@/constants/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/teacher/students/[id]/unlock
 * Mở khóa tức thì tài khoản học sinh bị tạm khóa do nhập sai mã PIN quá 5 lần
 */
export async function POST(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    if (!id) {
      return apiError("Mã học sinh không hợp lệ.", HttpStatus.BAD_REQUEST);
    }

    const auth = await authorizeTeacherRequest(
      req,
      "Bạn không có quyền mở khóa tài khoản học sinh."
    );
    if (!auth.success) {
      return auth.response;
    }
    const { session } = auth;

    // 1. Kiểm tra tài khoản học sinh tồn tại
    const { data: studentRecord, error: findError } = await supabase
      .from("users")
      .select("id, full_name, failed_login_attempts, locked_until, is_deleted")
      .eq("id", id)
      .eq("role", UserRole.STUDENT)
      .maybeSingle();

    if (findError || !studentRecord) {
      return apiError("Không tìm thấy hồ sơ học sinh yêu cầu.", HttpStatus.NOT_FOUND);
    }

    if (studentRecord.is_deleted) {
      return apiError("Học sinh này đang ở trong thùng rác, không thể mở khóa.", HttpStatus.BAD_REQUEST);
    }

    // 2. Mở khóa tức thì: reset số lần sai về 0 và xóa locked_until
    const { error: unlockError } = await supabase
      .from("users")
      .update({
        failed_login_attempts: 0,
        locked_until: null,
        updated_at: new Date().toISOString(),
        updated_by: session.userId,
      })
      .eq("id", id);

    if (unlockError) {
      console.error("Lỗi khi mở khóa học sinh:", unlockError.message);
      return apiError("Không thể mở khóa tài khoản học sinh. Vui lòng thử lại.");
    }

    return apiSuccess(
      { student_id: id, unlocked: true },
      `Đã mở khóa tài khoản thành công cho bé "${studentRecord.full_name}"!`
    );
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Lỗi máy chủ tại POST /api/teacher/students/[id]/unlock:", error.message);
    return apiError("Đã xảy ra lỗi hệ thống khi mở khóa tài khoản.");
  }
}
