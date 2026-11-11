import { supabase } from "@/lib/supabase/db";
import { apiError, apiSuccess } from "@/lib/api/response";
import { authorizeTeacherRequest } from "@/lib/auth/guard";
import { HttpStatus } from "@/constants";
import { UserRole } from "@/constants/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/teacher/students/[id]/restore
 * Khôi phục hồ sơ học sinh từ thùng rác (Chỉ Quản trị viên tối cao Admin)
 */
export async function POST(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    if (!id) {
      return apiError("Mã học sinh không hợp lệ.", HttpStatus.BAD_REQUEST);
    }

    const auth = await authorizeTeacherRequest(
      req,
      "Bạn không có quyền khôi phục hồ sơ học sinh."
    );
    if (!auth.success) {
      return auth.response;
    }
    const { session } = auth;

    if (session.role !== UserRole.ADMIN) {
      return apiError(
        "Chỉ Quản trị viên tối cao (Admin) mới có quyền khôi phục hồ sơ học sinh từ thùng rác.",
        HttpStatus.FORBIDDEN
      );
    }

    // 1. Kiểm tra học sinh có trong thùng rác không
    const { data: targetStudent, error: findError } = await supabase
      .from("users")
      .select("id, full_name, role, is_deleted")
      .eq("id", id)
      .eq("role", UserRole.STUDENT)
      .maybeSingle();

    if (findError || !targetStudent) {
      return apiError("Không tìm thấy hồ sơ học sinh yêu cầu.", HttpStatus.NOT_FOUND);
    }

    if (!targetStudent.is_deleted) {
      return apiError("Học sinh này đang hoạt động bình thường, không nằm trong thùng rác.", HttpStatus.BAD_REQUEST);
    }

    // 2. Khôi phục
    const { error: restoreError } = await supabase
      .from("users")
      .update({
        is_deleted: false,
        is_active: true,
        deleted_at: null,
        deleted_by: null,
        updated_at: new Date().toISOString(),
        updated_by: session.userId,
      })
      .eq("id", id);

    if (restoreError) {
      console.error("Lỗi khi khôi phục học sinh:", restoreError.message);
      return apiError("Không thể khôi phục hồ sơ học sinh. Vui lòng thử lại.");
    }

    return apiSuccess(
      { id, is_deleted: false, is_active: true },
      `Đã khôi phục hồ sơ học sinh "${targetStudent.full_name}" thành công!`
    );
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Lỗi máy chủ tại POST /api/teacher/students/[id]/restore:", error.message);
    return apiError("Đã xảy ra lỗi hệ thống khi khôi phục học sinh.");
  }
}
