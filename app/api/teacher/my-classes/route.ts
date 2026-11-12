import { apiError, apiSuccess } from "@/lib/api/response";
import { authorizeTeacherRequest } from "@/lib/auth/guard";
import { getMyAssignedClassesServer } from "@/features/class-management/services/classServerService";
import { TeacherAssignedClassItem } from "@/features/class-management/types";

/**
 * GET /api/teacher/my-classes
 * Lấy danh sách lớp học đang hoạt động theo phân quyền người dùng đang đăng nhập:
 * - Admin & Super Teacher: Lấy toàn bộ lớp học đang hoạt động (is_active: true, is_deleted: false)
 * - Teacher thường: Chỉ lấy các lớp học mà giáo viên đó đang phụ trách (thông qua bảng teacher_classes)
 * - Kết quả là danh sách lớp học thuần túy, không chứa "Toàn hệ thống" hay phần tử ảo
 */
export async function GET(req: Request) {
  try {
    const auth = await authorizeTeacherRequest(
      req,
      "Bạn không có quyền truy cập danh sách lớp học của giáo viên."
    );
    if (!auth.success) {
      return auth.response;
    }

    const classes = await getMyAssignedClassesServer(auth.session);
    return apiSuccess<TeacherAssignedClassItem[]>(classes);
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Lỗi máy chủ tại GET /api/teacher/my-classes:", error.message);
    return apiError("Đã xảy ra lỗi hệ thống khi tải danh sách lớp học.");
  }
}
