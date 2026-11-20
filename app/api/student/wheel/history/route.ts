import { apiError, apiSuccess } from "@/lib/api/response";
import { authorizeStudentRequest } from "@/lib/auth/guard";
import { HttpStatus, WHEEL_CONSTANTS } from "@/constants";
import { getStudentWheelHistoryPageServer } from "@/features/lucky-wheel/services/luckyWheelServerService";

/**
 * GET /api/student/wheel/history
 * Lấy danh sách lịch sử lượt quay may mắn cho học sinh (hỗ trợ Infinite Scroll & Lazy-load khi mở Popup)
 * Query Params:
 * - tab: "all" (mặc định) | "personal"
 * - page: number (mặc định 1)
 * - limit: number (mặc định 20)
 */
export async function GET(req: Request) {
  try {
    const auth = await authorizeStudentRequest(
      req,
      "Chỉ học sinh mới có thể xem lịch sử vòng quay."
    );
    if (!auth.success) {
      return auth.response;
    }

    const url = new URL(req.url);
    const tabParam = url.searchParams.get("tab");
    const tab: "all" | "personal" = tabParam === "personal" ? "personal" : "all";

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

    const data = await getStudentWheelHistoryPageServer({
      studentId: auth.session.userId,
      tab,
      page,
      limit,
    });

    return apiSuccess(data);
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Lỗi tại GET /api/student/wheel/history:", error.message);
    return apiError(
      "Đã xảy ra lỗi máy chủ khi tải lịch sử vòng quay.",
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}
