import { apiError, apiSuccess } from "@/lib/api/response";
import { authorizeTeacherRequest } from "@/lib/auth/guard";
import { getTeacherDashboardServer } from "@/features/teacher/dashboard/services/dashboardServerService";

/**
 * GET /api/teacher/dashboard
 * API tải toàn bộ dữ liệu tổng quan Dashboard giáo viên theo lớp đang chọn trên Header
 */
export async function GET(req: Request) {
  try {
    const auth = await authorizeTeacherRequest(
      req,
      "Bạn không có quyền truy cập trang tổng quan giáo viên."
    );
    if (!auth.success) {
      return auth.response;
    }

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId");

    const dashboard = await getTeacherDashboardServer(auth.session, classId);

    return apiSuccess(dashboard);
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Lỗi máy chủ tại GET /api/teacher/dashboard:", error.message);
    return apiError("Đã xảy ra lỗi máy chủ khi tải dữ liệu tổng quan.");
  }
}
