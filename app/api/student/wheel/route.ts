import { apiError, apiSuccess } from "@/lib/api/response";
import { authorizeRequest } from "@/lib/auth/guard";
import { UserRole } from "@/constants";
import { getStudentWheelInitialDataServer } from "@/features/lucky-wheel/services/luckyWheelServerService";

/**
 * GET /api/student/wheel
 * Lấy cấu hình Vòng Quay May Mắn (các ô đang active & chưa xóa mềm) kèm lịch sử trúng thưởng
 */
export async function GET(req: Request) {
  try {
    const auth = await authorizeRequest(req, [
      UserRole.STUDENT,
      UserRole.TEACHER,
      UserRole.SUPER_TEACHER,
      UserRole.ADMIN,
    ]);
    if (!auth.success) {
      return auth.response;
    }

    const data = await getStudentWheelInitialDataServer(auth.session);
    return apiSuccess(data);
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Lỗi tại GET /api/student/wheel:", error.message);
    return apiError("Đã xảy ra lỗi máy chủ khi tải dữ liệu vòng quay.");
  }
}
