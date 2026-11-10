import { supabase } from "@/lib/supabase/db";
import { apiError, apiSuccess } from "@/lib/api/response";
import { authorizeTeacherRequest } from "@/lib/auth/guard";
import { HttpStatus, PostgresErrorCode } from "@/constants";
import { UserRole } from "@/constants/auth";
import { escapeSqlWildcards } from "@/lib/utils";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/teacher/teachers/[id]/restore
 * Khôi phục tài khoản giáo viên đã bị xóa mềm từ thùng rác:
 * - Chỉ Quản trị viên tối cao (Admin) mới có quyền khôi phục
 * - Kiểm tra tài khoản tồn tại và đang trong thùng rác (is_deleted = true)
 * - Kiểm tra không trùng username, phone_zalo, email với tài khoản đang hoạt động
 * - Cập nhật có kiểm tra số dòng ảnh hưởng thực tế
 */
export async function POST(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    if (!id) {
      return apiError("Mã giáo viên không hợp lệ.", HttpStatus.BAD_REQUEST);
    }

    const auth = await authorizeTeacherRequest(
      req,
      "Bạn không có quyền khôi phục tài khoản giáo viên."
    );
    if (!auth.success) {
      return auth.response;
    }
    const { session } = auth;

    // Chỉ Quản trị viên tối cao (Admin) mới có quyền khôi phục tài khoản giáo viên
    if (session.role !== UserRole.ADMIN) {
      return apiError(
        "Chỉ Quản trị viên tối cao (Admin) mới có quyền khôi phục tài khoản giáo viên.",
        HttpStatus.FORBIDDEN
      );
    }

    // 1. Kiểm tra tài khoản có đang ở trong thùng rác không
    const { data: targetUser, error: findError } = await supabase
      .from("users")
      .select("id, username, full_name, phone_zalo, email, is_deleted")
      .eq("id", id)
      .maybeSingle();

    if (findError || !targetUser) {
      return apiError("Không tìm thấy tài khoản giáo viên yêu cầu.", HttpStatus.NOT_FOUND);
    }

    if (!targetUser.is_deleted) {
      return apiError("Tài khoản này hiện không ở trong thùng rác.", HttpStatus.BAD_REQUEST);
    }

    // 2. Kiểm tra trùng username với tài khoản đang hoạt động
    if (targetUser.username) {
      const { data: duplicateUsername } = await supabase
        .from("users")
        .select("id")
        .eq("username", targetUser.username)
        .eq("is_deleted", false)
        .neq("id", id)
        .maybeSingle();

      if (duplicateUsername) {
        return apiError(
          `Không thể khôi phục vì tên đăng nhập "@${targetUser.username}" đã được sử dụng bởi một tài khoản đang hoạt động.`,
          HttpStatus.CONFLICT
        );
      }
    }

    // 3. Kiểm tra trùng số điện thoại với tài khoản đang hoạt động
    if (targetUser.phone_zalo) {
      const { data: duplicatePhone } = await supabase
        .from("users")
        .select("id")
        .eq("phone_zalo", targetUser.phone_zalo)
        .eq("is_deleted", false)
        .neq("id", id)
        .maybeSingle();

      if (duplicatePhone) {
        return apiError(
          `Không thể khôi phục vì số điện thoại "${targetUser.phone_zalo}" đã được sử dụng bởi tài khoản khác.`,
          HttpStatus.CONFLICT
        );
      }
    }

    // 4. Kiểm tra trùng email với tài khoản đang hoạt động
    if (targetUser.email) {
      const { data: duplicateEmail } = await supabase
        .from("users")
        .select("id")
        .ilike("email", escapeSqlWildcards(targetUser.email.trim()))
        .eq("is_deleted", false)
        .neq("id", id)
        .maybeSingle();

      if (duplicateEmail) {
        return apiError(
          `Không thể khôi phục vì email "${targetUser.email}" đã được sử dụng bởi tài khoản khác.`,
          HttpStatus.CONFLICT
        );
      }
    }

    // 5. Khôi phục lại trạng thái bình thường và kiểm tra kết quả
    const { data: restoredUser, error: restoreError } = await supabase
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
      .eq("id", id)
      .eq("is_deleted", true)
      .select("id, full_name")
      .maybeSingle();

    if (restoreError || !restoredUser) {
      // Bắt lỗi vi phạm ràng buộc UNIQUE của PostgreSQL (trùng username, phone_zalo hoặc email)
      if (restoreError?.code === PostgresErrorCode.UNIQUE_VIOLATION) {
        return apiError("Tài khoản này bị trùng tên đăng nhập, số điện thoại hoặc email với tài khoản khác.", HttpStatus.CONFLICT);
      }
      console.error("Lỗi khi khôi phục giáo viên trong Supabase:", restoreError?.message);
      return apiError("Không thể khôi phục tài khoản giáo viên. Vui lòng thử lại sau.");
    }

    return apiSuccess(
      { id: restoredUser.id, full_name: restoredUser.full_name },
      `Đã khôi phục thành công tài khoản "${restoredUser.full_name}"!`
    );
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Lỗi máy chủ tại POST /api/teacher/teachers/[id]/restore:", error.message);
    return apiError("Đã xảy ra lỗi hệ thống khi khôi phục tài khoản giáo viên.");
  }
}
