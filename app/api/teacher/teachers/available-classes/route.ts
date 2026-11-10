import { apiError, apiSuccess } from "@/lib/api/response";
import { authorizeTeacherRequest } from "@/lib/auth/guard";
import { getAvailableClassesForTeachersServer } from "@/features/teacher/services/teacherStaffServerService";
import { AvailableClassItem } from "@/features/teacher/components/teachers/types";

/**
 * GET /api/teacher/teachers/available-classes
 * Lấy danh sách lớp học sẵn có phục vụ Modal phân công lớp cho giáo viên
 */
export async function GET(req: Request) {
  try {
    const auth = await authorizeTeacherRequest(
      req,
      "Bạn không có quyền truy cập dữ liệu lớp học."
    );
    if (!auth.success) {
      return auth.response;
    }

    const classes = await getAvailableClassesForTeachersServer(auth.session);
    return apiSuccess<AvailableClassItem[]>(classes);
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error(
      "Lỗi máy chủ tại GET /api/teacher/teachers/available-classes:",
      error.message
    );
    return apiError("Đã xảy ra lỗi hệ thống khi tải danh sách lớp học.");
  }
}
