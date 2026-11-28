import { http } from "@/lib/http/httpClient";
import { AppRoutes } from "@/constants/routes";
import { ApiResponse } from "@/types/api";
import {
  SystemSettingsFormState,
  SystemSettingsPayload,
  TestAiConnectionPayload,
  TestAiConnectionResult,
} from "../types";

/**
 * Client HTTP Service cho phân hệ Cài đặt hệ thống (Admin)
 */
export const systemSettingsService = {
  async getSettings(): Promise<SystemSettingsPayload> {
    const res = await http.get<ApiResponse<SystemSettingsPayload>>(
      AppRoutes.API.ADMIN.SYSTEM_SETTINGS
    );
    if (!res.success || !res.data) {
      throw new Error(res.message || "Không thể tải cài đặt hệ thống.");
    }
    return res.data;
  },

  async saveSettings(
    settings: SystemSettingsFormState
  ): Promise<SystemSettingsPayload> {
    const res = await http.put<ApiResponse<SystemSettingsPayload>>(
      AppRoutes.API.ADMIN.SYSTEM_SETTINGS,
      settings
    );
    if (!res.success || !res.data) {
      throw new Error(res.message || "Không thể lưu cài đặt hệ thống.");
    }
    return res.data;
  },

  async testAiConnection(
    payload: TestAiConnectionPayload
  ): Promise<TestAiConnectionResult> {
    const res = await http.post<ApiResponse<TestAiConnectionResult>>(
      AppRoutes.API.ADMIN.SYSTEM_SETTINGS_TEST_AI,
      payload
    );
    if (!res.success || !res.data) {
      throw new Error(res.message || "Kiểm tra kết nối AI thất bại.");
    }
    return res.data;
  },
};
