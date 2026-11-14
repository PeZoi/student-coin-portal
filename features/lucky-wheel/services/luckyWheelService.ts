import { http } from "@/lib/http/httpClient";
import { ApiResponse } from "@/types/api";
import { StudentWheelInitialData, WheelPrize } from "../types";

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
  };
}

export const luckyWheelService = {
  /**
   * Lấy cấu hình vòng quay và lịch sử trúng thưởng cho học sinh
   */
  async getWheelData(): Promise<StudentWheelInitialData | null> {
    const res = await http.get<ApiResponse<StudentWheelInitialData>>(
      "/api/student/wheel"
    );
    return res.data ?? null;
  },

  /**
   * Thực hiện quay vòng quay may mắn trên Server
   */
  async spinWheel(clientSlotIds: string[]): Promise<SpinApiResponseData> {
    const res = await http.post<ApiResponse<SpinApiResponseData>>(
      "/api/student/wheel/spin",
      {
        client_slot_ids: clientSlotIds,
      }
    );
    if (!res.data) {
      throw new Error("Không nhận được phản hồi kết quả quay từ máy chủ.");
    }
    return res.data;
  },
};
