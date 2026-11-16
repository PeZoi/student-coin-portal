import { supabase } from "@/lib/supabase/db";
import { apiError, apiSuccess } from "@/lib/api/response";
import { authorizeRequest } from "@/lib/auth/guard";
import { UserRole } from "@/constants";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * DELETE /api/teacher/missions/[id]/permanent
 * Xóa vĩnh viễn bài tập khỏi cơ sở dữ liệu (Dành riêng cho Quản trị viên Admin)
 */
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const { id: missionId } = await params;
    const auth = await authorizeRequest(
      req,
      [UserRole.ADMIN],
      "Chỉ Quản trị viên tối cao mới có quyền xóa vĩnh viễn bài tập."
    );
    if (!auth.success) {
      return auth.response;
    }

    // 1. Xóa liên kết lớp học trước
    await supabase
      .from("mission_classes")
      .delete()
      .eq("mission_id", missionId);

    // 2. Xóa bài nộp liên quan (nếu có)
    await supabase
      .from("homework_submissions")
      .delete()
      .eq("mission_id", missionId);

    // 3. Xóa bài tập
    const { error: deleteError } = await supabase
      .from("missions")
      .delete()
      .eq("id", missionId);

    if (deleteError) {
      console.error("Lỗi khi xóa vĩnh viễn bài tập:", deleteError.message);
      return apiError("Không thể xóa vĩnh viễn bài tập.");
    }

    return apiSuccess(true, "Đã xóa vĩnh viễn bài tập khỏi hệ thống!");
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error(
      "Lỗi máy chủ tại DELETE /api/teacher/missions/[id]/permanent:",
      error.message
    );
    return apiError("Đã xảy ra lỗi hệ thống khi xóa vĩnh viễn bài tập.");
  }
}
