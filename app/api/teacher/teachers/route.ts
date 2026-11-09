import { apiError, apiSuccess } from "@/lib/api/response";
import { authorizeTeacherRequest } from "@/lib/auth/guard";
import { getAvailableTeachersServer } from "@/features/teacher/services/teacherClassServerService";
import { AvailableTeacherItem } from "@/features/teacher/components/classes/types";

export type { AvailableTeacherItem };

/**
 * GET /api/teacher/teachers
 * Lấy danh sách giáo viên có thể phân công kèm số lượng lớp đang phụ trách
 */
export async function GET(req: Request) {
  try {
    const auth = await authorizeTeacherRequest(req, "Bạn không có quyền truy cập danh sách giáo viên.");
    if (!auth.success) {
      return auth.response;
    }

    const teachers = await getAvailableTeachersServer(auth.session);
    return apiSuccess<AvailableTeacherItem[]>(teachers);
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Lỗi máy chủ tại GET /api/teacher/teachers:", error.message);
    return apiError("Đã xảy ra lỗi hệ thống khi tải danh sách giáo viên.");
  }
}
