import { supabase } from "@/lib/supabase/db";
import { apiError, apiSuccess } from "@/lib/api/response";
import { validateRequestBody } from "@/lib/api/validation";
import { authorizeTeacherRequest } from "@/lib/auth/guard";
import { toggleMissionStatusSchema } from "@/features/mission-management/schemas/missionSchemas";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/teacher/missions/[id]/status
 * Bật / Tắt trạng thái mở nhận bài cho học sinh
 */
export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const { id: missionId } = await params;
    const auth = await authorizeTeacherRequest(
      req,
      "Bạn không có quyền đổi trạng thái bài tập."
    );
    if (!auth.success) {
      return auth.response;
    }
    const { session } = auth;

    const validation = await validateRequestBody(req, toggleMissionStatusSchema);
    if (!validation.success) {
      return validation.response;
    }

    const { is_active } = validation.data;

    const { error: updateError } = await supabase
      .from("missions")
      .update({
        is_active,
        updated_by: session.userId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", missionId);

    if (updateError) {
      console.error("Lỗi khi cập nhật trạng thái bài tập:", updateError.message);
      return apiError("Không thể thay đổi trạng thái nhận bài.");
    }

    const message = is_active
      ? "Đã mở nhận bài tập cho học sinh!"
      : "Đã tạm đóng nhận bài tập.";

    return apiSuccess({ id: missionId, is_active }, message);
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error(
      "Lỗi máy chủ tại PATCH /api/teacher/missions/[id]/status:",
      error.message
    );
    return apiError("Đã xảy ra lỗi hệ thống khi đổi trạng thái bài tập.");
  }
}
