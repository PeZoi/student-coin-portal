import { NextResponse } from "next/server";
import { unstable_rethrow } from "next/navigation";
import { apiError, apiSuccess } from "@/lib/api/response";
import { authorizeTeacherRequest } from "@/lib/auth/guard";
import { HttpStatus } from "@/constants";
import { ApiResponse } from "@/types/api";
import { leaderboardQuerySchema } from "@/features/teacher/leaderboard/schemas/leaderboardSchema";
import { getTeacherLeaderboardServer } from "@/features/teacher/leaderboard/services/leaderboardServerService";
import { TeacherLeaderboardApiPayload } from "@/features/teacher/leaderboard/types";

/**
 * GET /api/teacher/leaderboard?classId=...&month=...&year=...
 * Trả về dữ liệu 3 Bảng xếp hạng thi đua (Top Xu Tháng, Tiến Bộ Nhóm Dẫn Đầu, Tiến Bộ Nhóm Vươn Lên)
 */
export async function GET(
  req: Request
): Promise<NextResponse<ApiResponse<TeacherLeaderboardApiPayload>>> {
  try {
    const auth = await authorizeTeacherRequest(
      req,
      "Chỉ giáo viên mới có quyền xem bảng xếp hạng thi đua."
    );
    if (!auth.success) {
      return auth.response as NextResponse<
        ApiResponse<TeacherLeaderboardApiPayload>
      >;
    }

    const { searchParams } = new URL(req.url);
    const parsed = leaderboardQuerySchema.safeParse({
      classId: searchParams.get("classId") ?? undefined,
      month: searchParams.get("month") ?? undefined,
      year: searchParams.get("year") ?? undefined,
    });

    if (!parsed.success) {
      return apiError(
        "Tham số truy vấn bảng xếp hạng không hợp lệ.",
        HttpStatus.BAD_REQUEST
      );
    }

    const payload = await getTeacherLeaderboardServer(auth.session, {
      classId: parsed.data.classId,
      month: parsed.data.month,
      year: parsed.data.year,
    });

    return apiSuccess<TeacherLeaderboardApiPayload>(
      payload,
      "Tải bảng xếp hạng thi đua thành công."
    );
  } catch (err: unknown) {
    unstable_rethrow(err);
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Lỗi tại GET /api/teacher/leaderboard:", error.message);
    return apiError("Đã xảy ra lỗi máy chủ khi tải bảng xếp hạng.");
  }
}
