import { supabase } from "@/lib/supabase/db";
import { apiError, apiSuccess } from "@/lib/api/response";
import { validateRequestBody } from "@/lib/api/validation";
import { authorizeTeacherRequest } from "@/lib/auth/guard";
import { HttpStatus } from "@/constants";
import { resetTeacherPasswordSchema } from "@/features/teacher-management/schemas/teacherSchemas";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/teacher/teachers/[id]/reset-password
 * Đặt lại mật khẩu tài khoản cho giáo viên và mở khóa nếu tài khoản đang bị khóa
 */
export async function POST(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    if (!id) {
      return apiError("Mã giáo viên không hợp lệ.", HttpStatus.BAD_REQUEST);
    }

    const auth = await authorizeTeacherRequest(
      req,
      "Bạn không có quyền đặt lại mật khẩu cho giáo viên."
    );
    if (!auth.success) {
      return auth.response;
    }
    const { session } = auth;

    const validation = await validateRequestBody(req, resetTeacherPasswordSchema);
    if (!validation.success) {
      return validation.response;
    }

    const { new_password } = validation.data;

    // 1. Kiểm tra tài khoản giáo viên tồn tại
    const { data: targetUser, error: findError } = await supabase
      .from("users")
      .select("id, full_name, username, is_deleted")
      .eq("id", id)
      .maybeSingle();

    if (findError || !targetUser || targetUser.is_deleted) {
      return apiError(
        "Không tìm thấy tài khoản giáo viên yêu cầu hoặc tài khoản đã bị xóa.",
        HttpStatus.NOT_FOUND
      );
    }

    // 2. Cập nhật mật khẩu mới và reset các trường bảo mật
    const { error: updateError } = await supabase
      .from("users")
      .update({
        password: new_password,
        failed_login_attempts: 0,
        locked_until: null,
        updated_at: new Date().toISOString(),
        updated_by: session.userId,
      })
      .eq("id", id);

    if (updateError) {
      console.error(
        "Lỗi khi đặt lại mật khẩu giáo viên trong Supabase:",
        updateError.message
      );
      return apiError("Không thể đặt lại mật khẩu. Vui lòng thử lại sau.");
    }

    return apiSuccess(
      { id },
      `Đã đặt lại mật khẩu thành công cho giáo viên "${targetUser.full_name}" (@${targetUser.username})!`
    );
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error(
      "Lỗi máy chủ tại POST /api/teacher/teachers/[id]/reset-password:",
      error.message
    );
    return apiError("Đã xảy ra lỗi hệ thống khi đặt lại mật khẩu.");
  }
}
