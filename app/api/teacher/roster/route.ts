import { authorizeTeacherRequest } from "@/lib/auth/guard";
import { apiError, apiSuccess } from "@/lib/api/response";
import { HttpStatus } from "@/constants/http";
import { getTeacherStudentRosterServer } from "@/features/student-roster/services/studentRosterServerService";

/**
 * GET /api/teacher/roster?classId=...
 * Lấy danh sách học sinh theo lớp học phục vụ Client SWR
 */
export async function GET(req: Request) {
  try {
    const auth = await authorizeTeacherRequest(
      req,
      "Bạn không có quyền truy cập danh sách học sinh theo lớp."
    );
    if (!auth.success) {
      return auth.response;
    }
    const { session } = auth;

    const url = new URL(req.url);
    const classId = url.searchParams.get("classId") || undefined;
    const search = url.searchParams.get("search") || undefined;

    const students = await getTeacherStudentRosterServer(session, {
      classId,
      search,
    });

    return apiSuccess(students);
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Lỗi máy chủ tại GET /api/teacher/roster:", error.message);
    return apiError(
      "Đã xảy ra lỗi máy chủ khi tải danh sách học sinh.",
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}
