import { apiError, apiSuccess } from "@/lib/api/response";
import { authorizeTeacherRequest } from "@/lib/auth/guard";
import { restoreMissionServer } from "@/features/teacher/mission-management/services/missionServerService";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/teacher/missions/[id]/restore
 * Khôi phục bài tập từ thùng rác qua RPC restore_mission
 */
export async function POST(req: Request, { params }: RouteParams) {
  try {
    const { id: missionId } = await params;
    const auth = await authorizeTeacherRequest(
      req,
      "Bạn không có quyền khôi phục bài tập này."
    );
    if (!auth.success) {
      return auth.response;
    }

    const success = await restoreMissionServer(missionId);

    return apiSuccess(success, "Khôi phục bài tập thành công!");
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error(
      "Lỗi máy chủ tại POST /api/teacher/missions/[id]/restore:",
      error.message
    );
    return apiError(error.message || "Đã xảy ra lỗi khi khôi phục bài tập.");
  }
}
