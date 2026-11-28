import { http } from "@/lib/http/httpClient";
import { ApiResponse } from "@/types/api";
import { AppRoutes } from "@/constants/routes";
import {
  StudentWheelInitialData,
  WheelPrize,
  WheelHistoryPageData,
  ClaimWheelGiftResponseData,
} from "../types";

export interface SpinApiResponseData {
  config_changed: boolean;
  updated_data?: StudentWheelInitialData;
  prize_index?: number;
  winning_prize?: WheelPrize;
  spin_result?: {
    spin_id: string;
    created_at: string;
    is_free_spin: boolean;
    spin_cost: number;
    actual_reward_coins: number;
    actual_reward_free_spins: number;
    current_coins: number;
    total_earned_coins: number;
    free_spins: number;
    unclaimed_gifts?: number;
  };
}

export const luckyWheelService = {
  /**
   * Lấy cấu hình vòng quay và lịch sử trúng thưởng cho học sinh
   */
  async getWheelData(): Promise<StudentWheelInitialData | null> {
    const res = await http.get<ApiResponse<StudentWheelInitialData>>(
      AppRoutes.API.STUDENT.WHEEL
    );
    return res.data ?? null;
  },

  /**
   * Thực hiện quay vòng quay may mắn trên Server
   */
  async spinWheel(clientSlotIds: string[]): Promise<SpinApiResponseData> {
    const res = await http.post<ApiResponse<SpinApiResponseData>>(
      AppRoutes.API.STUDENT.WHEEL_SPIN,
      {
        client_slot_ids: clientSlotIds,
      }
    );
    if (!res.data) {
      throw new Error("Không nhận được phản hồi kết quả quay từ máy chủ.");
    }
    return res.data;
  },

  /**
   * Lấy danh sách lịch sử lượt quay may mắn cho học sinh (hỗ trợ phân trang Infinite Scroll)
   */
  async getSpinHistory(params: {
    tab?: "all" | "personal";
    page?: number;
    limit?: number;
  }): Promise<WheelHistoryPageData> {
    const { tab = "all", page = 1, limit = 20 } = params;
    const res = await http.get<ApiResponse<WheelHistoryPageData>>(
      `${AppRoutes.API.STUDENT.WHEEL_HISTORY}?tab=${tab}&page=${page}&limit=${limit}`
    );
    if (!res.data) {
      throw new Error("Không thể tải danh sách lịch sử vòng quay.");
    }
    return res.data;
  },

  /**
   * Mở Hộp quà Vòng quay và gửi yêu cầu nhận quà tuỳ chọn (Spin)
   */
  async claimGiftBox(payload: {
    link: string;
    priceVnd: number;
    note?: string;
  }): Promise<ClaimWheelGiftResponseData> {
    const res = await http.post<ApiResponse<ClaimWheelGiftResponseData>>(
      AppRoutes.API.STUDENT.WHEEL_CLAIM_GIFT,
      payload
    );
    if (!res.data) {
      throw new Error("Không nhận được phản hồi khi gửi yêu cầu nhận quà.");
    }
    return res.data;
  },
};
