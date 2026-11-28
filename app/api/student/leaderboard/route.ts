import { NextResponse } from "next/server";
import { unstable_rethrow } from "next/navigation";
import { z } from "zod";
import { apiError, apiSuccess } from "@/lib/api/response";
import { authorizeRequest } from "@/lib/auth/guard";
import { getMaintenanceSettingConfig } from "@/lib/system/serverConfig";
import { HttpStatus, UserRole } from "@/constants";
import { ApiResponse } from "@/types/api";
import { getStudentLeaderboardServer } from "@/features/student/leaderboard/services/studentLeaderboardServerService";
import { StudentLeaderboardPayload } from "@/features/student/leaderboard/types";

const studentLeaderboardQuerySchema = z.object({
  period: z.enum(["current_month", "previous_month"]).default("current_month"),
  classId: z.string().trim().optional(),
});

/**
 * GET /api/student/leaderboard?period=current_month|previous_month&classId=...
 * - Cho phép Học sinh, Giáo viên, Tổ trưởng và Admin truy cập
 * - Chỉ ADMIN mới có quyền truyền `classId` để chuyển lớp test UI; học sinh luôn xem đúng lớp của mình
 */
export async function GET(
  req: Request
): Promise<NextResponse<ApiResponse<StudentLeaderboardPayload>>> {
  try {
    const auth = await authorizeRequest(req, [
      UserRole.STUDENT,
      UserRole.TEACHER,
      UserRole.SUPER_TEACHER,
      UserRole.ADMIN,
    ]);
    if (!auth.success) {
      return auth.response as NextResponse<
        ApiResponse<StudentLeaderboardPayload>
      >;
    }

    if (auth.session.role === UserRole.STUDENT) {
      const maintenance = await getMaintenanceSettingConfig();
      if (maintenance.is_maintenance_mode) {
        return apiError(
          maintenance.maintenance_message,
          HttpStatus.SERVICE_UNAVAILABLE
        ) as NextResponse<ApiResponse<StudentLeaderboardPayload>>;
      }
    }

    const { searchParams } = new URL(req.url);
    const parsed = studentLeaderboardQuerySchema.safeParse({
      period: searchParams.get("period") ?? "current_month",
      classId: searchParams.get("classId") ?? undefined,
    });

    if (!parsed.success) {
      return apiError(
        "Tham số truy vấn bảng xếp hạng không hợp lệ.",
        HttpStatus.BAD_REQUEST
      );
    }

    const payload = await getStudentLeaderboardServer(auth.session, {
      period: parsed.data.period,
      classId: parsed.data.classId,
    });

    return apiSuccess<StudentLeaderboardPayload>(
      payload,
      "Tải bảng xếp hạng thành công."
    );
  } catch (err: unknown) {
    unstable_rethrow(err);
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Lỗi tại GET /api/student/leaderboard:", error.message);
    return apiError("Đã xảy ra lỗi máy chủ khi tải bảng xếp hạng.");
  }
}
