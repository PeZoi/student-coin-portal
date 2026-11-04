import { http } from "@/lib/http/httpClient";
import { ApiResponse } from "@/types/api";
import { ClassItem } from "../types";

/**
 * ==============================================================================
 * CLASS SERVICE (SERVICE LAYER CHO MODULE AUTH / LỚP HỌC)
 * - Tách biệt hoàn toàn việc gọi API khỏi React Component và Hook
 * - Sử dụng bộ shorthand http.get tiện lợi
 * ==============================================================================
 */
export const classService = {
  /**
   * Lấy danh sách các lớp học đang hoạt động từ hệ thống
   */
  async getActiveClasses(): Promise<ClassItem[]> {
    const response = await http.get<ApiResponse<ClassItem[]>>("/api/classes");

    if (!response.success || !response.data) {
      throw new Error(response.error || "Không thể tải danh sách lớp học.");
    }

    return response.data;
  },
};
