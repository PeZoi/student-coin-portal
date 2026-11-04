import { http } from "@/lib/http/httpClient";
import { ApiResponse } from "@/types/api";
import { RegisteredStudentData, StudentRegisterFormValues } from "../types";

/**
 * ==============================================================================
 * AUTH SERVICE (SERVICE LAYER CHO MODULE XÁC THỰC)
 * - Tách biệt hoàn toàn việc gọi API xác thực khỏi React Component và Hook
 * - Quản lý việc gọi API đăng ký, đăng nhập học sinh và giáo viên
 * - Tuân thủ mô hình phân tầng Layered Architecture và nguyên tắc DRY
 * ==============================================================================
 */
export const authService = {
  /**
   * Đăng ký tài khoản học sinh mới
   * Gửi dữ liệu lên API POST /api/auth/register
   *
   * @param payload Dữ liệu từ form đăng ký học sinh
   * @returns Thông tin tài khoản học sinh đã được tạo
   */
  async registerStudent(payload: StudentRegisterFormValues): Promise<RegisteredStudentData> {
    const response = await http.post<ApiResponse<RegisteredStudentData>>(
      "/api/auth/register",
      payload,
      {
        skipUnauthorizedHandler: true, // Không trigger logout handler với auth endpoint
      }
    );

    if (!response.success || !response.data) {
      throw new Error(response.error || "Đăng ký tài khoản không thành công.");
    }

    return response.data;
  },
};

