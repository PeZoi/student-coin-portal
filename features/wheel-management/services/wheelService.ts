import { http } from "@/lib/http/httpClient";
import { ApiResponse } from "@/types/api";
import {
  WheelSlotItem,
  WheelGeneralSettings,
} from "../types";
import { InitialWheelConfigData } from "./wheelServerService";

/**
 * Client Service: Gọi các API quản lý cấu hình vòng quay
 */
export const wheelService = {
  /**
   * Lấy toàn bộ cấu hình vòng quay
   */
  async getConfig(): Promise<InitialWheelConfigData | null> {
    const res = await http.get<ApiResponse<InitialWheelConfigData>>(
      "/api/teacher/wheel-config"
    );
    return res.data ?? null;
  },

  /**
   * Lưu cơ cấu các ô phần thưởng
   */
  async saveSlots(slots: WheelSlotItem[]): Promise<boolean> {
    const res = await http.post<ApiResponse<{ updated_count: number }>>(
      "/api/teacher/wheel-config",
      { slots }
    );
    return res.success;
  },

  /**
   * Lưu thiết lập kinh tế vòng quay
   */
  async saveEconomy(settings: WheelGeneralSettings): Promise<boolean> {
    const res = await http.put<ApiResponse<WheelGeneralSettings>>(
      "/api/teacher/wheel-config",
      settings
    );
    return res.success;
  },
};
