import { http } from "@/lib/http/httpClient";
import { ApiResponse } from "@/types/api";
import {
  RegisteredStudentData,
  StudentLoginPayload,
  StudentLookupData,
  StudentRegisterFormValues,
  StudentSessionData,
} from "../types";

/**
 * ==============================================================================
 * AUTH SERVICE (SERVICE LAYER CHO MODULE XÁC THỰC)
 * - Tách biệt hoàn toàn việc gọi API xác thực khỏi React Component và Hook
 * - Quản lý việc gọi API tra cứu, đăng ký, đăng nhập học sinh và giáo viên
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

  /**
   * Tra cứu thông tin công khai an toàn của học sinh theo Số điện thoại Zalo
   * Gửi dữ liệu lên API POST /api/auth/lookup
   *
   * @param phone_zalo Số điện thoại Zalo cần tra cứu
   * @returns Thông tin học sinh (Avatar, Họ tên, Lớp, Số xu)
   */
  async lookupStudent(phone_zalo: string): Promise<StudentLookupData> {
    const response = await http.post<ApiResponse<StudentLookupData>>(
      "/api/auth/lookup",
      { phone_zalo },
      {
        skipUnauthorizedHandler: true,
      }
    );

    if (!response.success || !response.data) {
      throw new Error(response.error || "Không tìm thấy thông tin học sinh.");
    }

    return response.data;
  },

  /**
   * Xác thực mã PIN và đăng nhập vào hệ thống
   * Gửi dữ liệu lên API POST /api/auth/login
   *
   * @param payload Gồm SĐT và mã PIN 4 số
   * @returns Thông tin phiên học sinh thành công
   */
  async loginStudent(payload: StudentLoginPayload): Promise<StudentSessionData> {
    const response = await http.post<ApiResponse<StudentSessionData>>(
      "/api/auth/login",
      payload,
      {
        skipUnauthorizedHandler: true,
      }
    );

    if (!response.success || !response.data) {
      throw new Error(response.error || "Mã PIN không chính xác.");
    }

    return response.data;
  },

  /**
   * Lấy thông tin phiên người dùng hiện tại từ API GET /api/auth/me
   * Dùng khi khởi động ứng dụng hoặc khi người dùng F5 trang
   */
  async getCurrentUser(): Promise<StudentSessionData | null> {
    try {
      const response = await http.get<ApiResponse<StudentSessionData>>(
        "/api/auth/me",
        {
          skipUnauthorizedHandler: true, // Tránh gọi logout lặp khi chưa có session
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

  /**
   * Đăng xuất và xóa phiên làm việc
   */
  async logout(): Promise<void> {
    try {
      await http.post("/api/auth/logout", {}, { skipUnauthorizedHandler: true });
    } catch {
      // Bỏ qua lỗi mạng khi logout
    }
  },
};

