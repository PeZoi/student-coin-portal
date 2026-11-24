import { apiError, apiSuccess } from "@/lib/api/response";
import { authorizeTeacherRequest } from "@/lib/auth/guard";
import { getSubmissionMissionsOverviewServer } from "@/features/submission-management/services/submissionServerService";

/**
 * GET /api/teacher/submissions?classId=...
 * Lấy danh sách tổng quan các bài tập cần duyệt (Level 1) theo phân quyền & lớp workspace
 */
export async function GET(req: Request) {
  try {
    const auth = await authorizeTeacherRequest(
      req,
      "Bạn không có quyền xem danh sách duyệt bài tập."
    );
    if (!auth.success) {
      return auth.response;
    }

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId");

    const missions = await getSubmissionMissionsOverviewServer(
      auth.session,
      classId
    );

    return apiSuccess(missions);
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Lỗi tại GET /api/teacher/submissions:", error.message);
    return apiError("Đã xảy ra lỗi máy chủ khi tải danh sách bài tập duyệt bài.");
  }
}
