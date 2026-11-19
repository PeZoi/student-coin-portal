import { apiError, apiSuccess } from "@/lib/api/response";
import { authorizeTeacherRequest } from "@/lib/auth/guard";
import { getTeacherRewardRequestsServer } from "@/features/reward-management/services/rewardServerService";

/**
 * GET /api/teacher/rewards
 * Lấy danh sách yêu cầu đổi quà tháng kèm bộ lọc theo tháng, năm, trạng thái, hình thức
 */
export async function GET(req: Request) {
  try {
    const auth = await authorizeTeacherRequest(
      req,
      "Bạn không có quyền truy cập dữ liệu đổi quà của học sinh."
    );
    if (!auth.success) {
      return auth.response;
    }

    const { searchParams } = new URL(req.url);
    const monthParam = searchParams.get("month");
    const yearParam = searchParams.get("year");
    const statusParam = searchParams.get("status");
    const choiceTypeParam = searchParams.get("choice_type");
    const classIdParam = searchParams.get("class_id");
    const searchParam = searchParams.get("search");

    const month =
      monthParam && monthParam !== "all" && !isNaN(Number(monthParam))
        ? Number(monthParam)
        : undefined;
    const year =
      yearParam && yearParam !== "all" && !isNaN(Number(yearParam))
        ? Number(yearParam)
        : undefined;

    const requests = await getTeacherRewardRequestsServer(auth.session, {
      month,
      year,
      status: statusParam || undefined,
      choiceType: choiceTypeParam || undefined,
      classId: classIdParam || undefined,
      search: searchParam || undefined,
    });

    return apiSuccess({ requests });
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Lỗi máy chủ tại GET /api/teacher/rewards:", error.message);
    return apiError("Đã xảy ra lỗi máy chủ khi tải danh sách đổi quà.");
  }
}
