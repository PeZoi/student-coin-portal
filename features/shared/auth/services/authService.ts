import { http, isHttpError } from "@/lib/http/httpClient";
import { ApiResponse } from "@/types/api";
import { AppRoutes } from "@/constants/routes";
import {
  AuthLockInfo,
  PinVerificationError,
  RegisteredStudentData,
  StudentLoginPayload,
  StudentLookupData,
  StudentRegisterFormValues,
  StudentSessionData,
  TeacherLoginFormValues,
} from "../types";

export interface StaffLoginResult {
  user: StudentSessionData;
  redirect_url: string;
}

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
      AppRoutes.API.AUTH.REGISTER,
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
      AppRoutes.API.AUTH.LOOKUP,
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
    try {
      const response = await http.post<ApiResponse<StudentSessionData>>(
        AppRoutes.API.AUTH.LOGIN,
        payload,
        {
          skipUnauthorizedHandler: true,
        }
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || "Mã PIN không chính xác.");
      }

      return response.data;
    } catch (err: unknown) {
      if (isHttpError(err) && typeof err.data === "object" && err.data !== null) {
        const errorBody = err.data as { data?: AuthLockInfo };
        const lockInfo = errorBody.data;
        if (lockInfo) {
          throw new PinVerificationError(err.message, {
            isLocked: lockInfo.is_locked,
            remainingMinutes: lockInfo.remaining_minutes,
            remainingAttempts: lockInfo.remaining_attempts,
            lockedUntil: lockInfo.locked_until,
          });
        }
      }
      throw err;
    }
  },

  /**
   * Đăng nhập dành cho Giáo viên & Quản trị viên
   * Gửi username và password lên API POST /api/auth/staff-login
   */
  async loginStaff(payload: TeacherLoginFormValues): Promise<StaffLoginResult> {
    const response = await http.post<ApiResponse<StaffLoginResult>>(
      AppRoutes.API.AUTH.STAFF_LOGIN,
      payload,
      {
        skipUnauthorizedHandler: true,
      }
    );

    if (!response.success || !response.data) {
      throw new Error(response.error || "Tên đăng nhập hoặc mật khẩu không chính xác.");
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
        AppRoutes.API.AUTH.ME,
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
      await http.post(AppRoutes.API.AUTH.LOGOUT, {}, { skipUnauthorizedHandler: true });
    } catch {
      // Bỏ qua lỗi mạng khi logout
    }
  },
};
