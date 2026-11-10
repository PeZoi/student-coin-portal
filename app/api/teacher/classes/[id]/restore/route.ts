import { supabase } from "@/lib/supabase/db";
import { apiError, apiSuccess } from "@/lib/api/response";
import { authorizeTeacherRequest } from "@/lib/auth/guard";
import { HttpStatus } from "@/constants";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/teacher/classes/[id]/restore
 * Khôi phục lớp học từ thùng rác về trạng thái hoạt động
 */
export async function POST(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    if (!id) {
      return apiError("Mã lớp học không hợp lệ.", HttpStatus.BAD_REQUEST);
    }

    const auth = await authorizeTeacherRequest(
      req,
      "Bạn không có quyền khôi phục lớp học."
    );
    if (!auth.success) {
      return auth.response;
    }
    const { session } = auth;

    const { error: restoreError } = await supabase
      .from("classes")
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
      console.error("Lỗi khi khôi phục lớp học:", restoreError.message);
      return apiError("Không thể khôi phục lớp học. Vui lòng thử lại sau.");
    }

    return apiSuccess({ id }, "Đã khôi phục lớp học thành công!");
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Lỗi máy chủ tại POST /api/teacher/classes/[id]/restore:", error.message);
    return apiError("Đã xảy ra lỗi hệ thống khi khôi phục lớp học.");
  }
}
