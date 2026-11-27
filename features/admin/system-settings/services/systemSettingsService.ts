import { http } from "@/lib/http/httpClient";
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
      "/api/admin/system-settings"
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
      "/api/admin/system-settings",
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
      "/api/admin/system-settings/test-ai",
      payload
    );
    if (!res.success || !res.data) {
      throw new Error(res.message || "Kiểm tra kết nối AI thất bại.");
    }
    return res.data;
  },
};
