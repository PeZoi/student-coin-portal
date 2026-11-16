import { apiError, apiSuccess } from "@/lib/api/response";
import { authorizeTeacherRequest } from "@/lib/auth/guard";
import { getMissionStudentProgressServer } from "@/features/mission-management/services/missionServerService";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/teacher/missions/[id]/progress
 * Lấy danh sách thực tế toàn bộ học sinh đã làm hoặc chưa làm bài tập này
 */
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { id: missionId } = await params;
    const auth = await authorizeTeacherRequest(
      req,
      "Bạn không có quyền xem tiến độ bài tập này."
    );
    if (!auth.success) {
      return auth.response;
    }
    const { session } = auth;

    const result = await getMissionStudentProgressServer(missionId, session);

    return apiSuccess(result);
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error(
      "Lỗi máy chủ tại GET /api/teacher/missions/[id]/progress:",
      error.message
    );
    return apiError("Đã xảy ra lỗi hệ thống khi tải tiến độ làm bài.");
  }
}
