import { http } from "@/lib/http/httpClient";
import { AppRoutes } from "@/constants/routes";
import { ApiResponse } from "@/types/api";
import { TeacherLeaderboardApiPayload } from "../types";

export interface FetchLeaderboardParams {
  classId?: string | null;
  month?: number;
  year?: number;
}

/**
 * Client HTTP Service cho trang Bảng xếp hạng thi đua
 */
export const leaderboardService = {
  async getLeaderboard(
    params: FetchLeaderboardParams
  ): Promise<TeacherLeaderboardApiPayload> {
    const query = new URLSearchParams();
    if (params.classId) {
      query.set("classId", params.classId);
    }
    if (params.month !== undefined) {
      query.set("month", String(params.month));
    }
    if (params.year !== undefined) {
      query.set("year", String(params.year));
    }

    const qs = query.toString();
    const url = `${AppRoutes.API.TEACHER.LEADERBOARD}${qs ? `?${qs}` : ""}`;
    const res = await http.get<ApiResponse<TeacherLeaderboardApiPayload>>(url);

    if (!res.success || !res.data) {
      throw new Error(res.message || "Không thể tải bảng xếp hạng thi đua.");
    }

    return res.data;
  },
};
