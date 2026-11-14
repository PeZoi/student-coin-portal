import { http } from "@/lib/http/httpClient";
import { ApiResponse } from "@/types/api";
import { AppRoutes } from "@/constants/routes";
import { WHEEL_CONSTANTS } from "@/constants/wheel";
import {
  WheelSlotItem,
  WheelGeneralSettings,
  WheelSpinHistoryPageData,
} from "../types";
import { InitialWheelConfigData } from "./wheelServerService";

/**
 * Client Service: Gọi các API quản lý cấu hình và lịch sử vòng quay
 */
export const wheelService = {
  /**
   * Lấy toàn bộ cấu hình vòng quay
   */
  async getConfig(): Promise<InitialWheelConfigData | null> {
    const res = await http.get<ApiResponse<InitialWheelConfigData>>(
      AppRoutes.API.TEACHER.WHEEL_CONFIG
    );
    return res.data ?? null;
  },

  /**
   * Lưu cơ cấu các ô phần thưởng
   */
  async saveSlots(slots: WheelSlotItem[]): Promise<boolean> {
    const res = await http.post<ApiResponse<{ updated_count: number }>>(
      AppRoutes.API.TEACHER.WHEEL_CONFIG,
      { slots }
    );
    return res.success;
  },

  /**
   * Lưu thiết lập kinh tế vòng quay
   */
  async saveEconomy(settings: WheelGeneralSettings): Promise<boolean> {
    const res = await http.put<ApiResponse<WheelGeneralSettings>>(
      AppRoutes.API.TEACHER.WHEEL_CONFIG,
      settings
    );
    return res.success;
  },

  /**
   * Lấy lịch sử lượt quay thực tế của học sinh (Infinite Scroll 20 bản ghi / trang)
   */
  async getSpinHistory(
    page: number = 1,
    limit: number = WHEEL_CONSTANTS.RECENT_WINNERS_LIMIT
  ): Promise<WheelSpinHistoryPageData> {
    const res = await http.get<ApiResponse<WheelSpinHistoryPageData>>(
      `${AppRoutes.API.TEACHER.WHEEL_SPINS_HISTORY}?page=${page}&limit=${limit}`
    );
    if (!res.data) {
      throw new Error(
        res.message || "Không thể tải danh sách lịch sử vòng quay."
      );
    }
    return res.data;
  },
};
