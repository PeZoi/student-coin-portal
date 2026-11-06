import { http } from "@/lib/http/httpClient";
import { ApiResponse } from "@/types/api";
import { SystemPublicConfigs } from "@/types/systemConfig";

/**
 * ==============================================================================
 * SYSTEM CONFIG SERVICE
 * Quản lý việc gọi API lấy cấu hình hệ thống tập trung
 * ==============================================================================
 */
export const systemConfigService = {
  /**
   * Gọi API GET /api/system/config để lấy cấu hình hệ thống công khai
   */
  async getPublicConfigs(): Promise<SystemPublicConfigs | null> {
    try {
      const response = await http.get<ApiResponse<SystemPublicConfigs>>(
        "/api/system/config",
        {
          skipUnauthorizedHandler: true, // Tránh gọi nhầm handler khi token vừa hết hạn
        }
      );

      if (response.success && response.data) {
        return response.data;
      }
      return null;
    } catch {
      return null;
    }
  },
};
