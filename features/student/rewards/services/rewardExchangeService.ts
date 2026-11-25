import { http } from "@/lib/http/httpClient";
import { ApiResponse } from "@/types/api";
import { AppRoutes } from "@/constants/routes";
import { StudentRewardExchangeInput } from "../schemas/rewardSchemas";
import { SubmitRewardExchangeResponseData } from "../types";

export const rewardExchangeService = {
  /**
   * Học sinh gửi yêu cầu đổi quà Heo Đất (Tiền mặt hoặc Tự chọn quà)
   */
  async submitExchange(
    payload: StudentRewardExchangeInput
  ): Promise<SubmitRewardExchangeResponseData> {
    const res = await http.post<ApiResponse<SubmitRewardExchangeResponseData>>(
      AppRoutes.API.STUDENT.REWARDS_EXCHANGE,
      payload
    );
    if (!res.data) {
      throw new Error("Không nhận được phản hồi khi gửi yêu cầu đổi quà.");
    }
    return res.data;
  },
};
