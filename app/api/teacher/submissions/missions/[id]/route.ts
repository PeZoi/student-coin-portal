import { apiError, apiSuccess } from "@/lib/api/response";
import { authorizeTeacherRequest } from "@/lib/auth/guard";
import { HttpStatus } from "@/constants/http";
import { getMissionSubmissionDetailServer } from "@/features/submission-management/services/submissionServerService";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/teacher/submissions/missions/[id]?classId=...
 * Lấy chi tiết bài tập, danh sách học sinh (Roster) và bài nộp kèm lỗi AI (Level 2)
 */
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    if (!id) {
      return apiError("Mã bài tập không hợp lệ.", HttpStatus.BAD_REQUEST);
    }

    const auth = await authorizeTeacherRequest(
      req,
      "Bạn không có quyền xem chi tiết duyệt bài tập."
    );
    if (!auth.success) {
      return auth.response;
    }

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId");

    const detail = await getMissionSubmissionDetailServer(
      id,
      auth.session,
      classId
    );

    if (!detail) {
      return apiError(
        "Không tìm thấy bài tập hoặc bạn không có quyền truy cập lớp này.",
        HttpStatus.NOT_FOUND
      );
    }

    return apiSuccess(detail);
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error(
      "Lỗi tại GET /api/teacher/submissions/missions/[id]:",
      error.message
    );
    return apiError("Đã xảy ra lỗi máy chủ khi tải chi tiết bài tập.");
  }
}
