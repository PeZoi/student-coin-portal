import { http } from "@/lib/http/httpClient";
import { AppRoutes } from "@/constants/routes";
import { ApiResponse } from "@/types/api";
import { PeriodType, StudentLeaderboardPayload } from "../types";

export interface FetchStudentLeaderboardParams {
  period: PeriodType;
  classId?: string;
}

/**
 * Client HTTP Service nạp dữ liệu Bảng xếp hạng học sinh
 */
export const studentLeaderboardService = {
  async getLeaderboard(
    params: FetchStudentLeaderboardParams
  ): Promise<StudentLeaderboardPayload> {
    const query = new URLSearchParams();
    query.set("period", params.period);
    if (params.classId) {
      query.set("classId", params.classId);
    }

    const url = `${AppRoutes.API.STUDENT.LEADERBOARD}?${query.toString()}`;
    const res = await http.get<ApiResponse<StudentLeaderboardPayload>>(url);

    if (!res.success || !res.data) {
      throw new Error(res.message || "Không thể tải bảng xếp hạng lúc này.");
    }

    return res.data;
  },
};
