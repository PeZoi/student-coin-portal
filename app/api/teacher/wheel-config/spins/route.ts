import { apiError, apiSuccess } from "@/lib/api/response";
import { authorizeTeacherRequest } from "@/lib/auth/guard";
import { HttpStatus, WHEEL_CONSTANTS } from "@/constants";
import { getWheelSpinHistoryPageServer } from "@/features/wheel-management/services/wheelServerService";

/**
 * GET /api/teacher/wheel-config/spins
 * Lấy danh sách lịch sử lượt quay thực tế của học sinh có phân trang (hỗ trợ Infinite Scroll 20 bản ghi / trang)
 */
export async function GET(req: Request) {
  try {
    const auth = await authorizeTeacherRequest(
      req,
      "Bạn không có quyền truy cập lịch sử vòng quay may mắn."
    );
    if (!auth.success) {
      return auth.response;
    }

    const url = new URL(req.url);
    const page = Math.max(
      1,
      parseInt(url.searchParams.get("page") || "1", 10)
    );
    const limit = Math.min(
      50,
      Math.max(
        1,
        parseInt(
          url.searchParams.get("limit") ||
            String(WHEEL_CONSTANTS.RECENT_WINNERS_LIMIT),
          10
        )
      )
    );

    const historyPage = await getWheelSpinHistoryPageServer(page, limit);
    return apiSuccess(historyPage);
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Lỗi tại GET /api/teacher/wheel-config/spins:", error.message);
    return apiError(
      "Đã xảy ra lỗi máy chủ khi tải lịch sử vòng quay.",
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}
