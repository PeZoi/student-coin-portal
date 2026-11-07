/**
 * ==============================================================================
 * AUTHENTICATION & SECURITY CONSTANTS
 * - Định nghĩa tập trung tên Cookie, JWT, Hành động và Lý do lỗi xác thực
 * ==============================================================================
 */

/**
 * Tên Cookie bảo mật lưu trữ JWT Token
 */
export const AUTH_COOKIE_NAME = "auth_token" as const;

/**
 * Thời gian hết hạn mặc định của JWT Token (7 ngày)
 */
export const DEFAULT_JWT_EXPIRES_IN = "7d" as const;

/**
 * Các hành động xác thực hợp lệ (đồng bộ 100% với CHECK constraint của bảng `auth_logs`)
 */
export const AuthAction = {
  LOGIN: "LOGIN",
  LOGOUT: "LOGOUT",
  REGISTER: "REGISTER",
} as const;

export type AuthActionType = (typeof AuthAction)[keyof typeof AuthAction];

/**
 * Trạng thái của sự kiện xác thực
 */
export const AuthStatus = {
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
} as const;

export type AuthStatusType = (typeof AuthStatus)[keyof typeof AuthStatus];

/**
 * Mã lý do thất bại chuẩn hóa khi xác thực (Tránh magic strings, dễ GROUP BY báo cáo)
 */
export const AuthFailureReason = {
  WRONG_PIN: "WRONG_PIN",
  WRONG_PASSWORD: "WRONG_PASSWORD",
  ACCOUNT_LOCKED: "ACCOUNT_LOCKED",
  USER_NOT_FOUND: "USER_NOT_FOUND",
  ACCOUNT_INACTIVE: "ACCOUNT_INACTIVE",
  PHONE_ALREADY_EXISTS: "PHONE_ALREADY_EXISTS",
  INVALID_DATA: "INVALID_DATA",
} as const;

export type AuthFailureReasonType =
  (typeof AuthFailureReason)[keyof typeof AuthFailureReason];

/**
 * Danh sách vai trò người dùng trong hệ thống
 */
export const UserRole = {
  STUDENT: "student",
  TEACHER: "teacher",
  ADMIN: "admin",
} as const;

export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];

/**
 * Danh sách thiết bị người dùng
 */
export const DeviceType = {
  MOBILE: "mobile",
  TABLET: "tablet",
  DESKTOP: "desktop",
} as const;

export type DeviceType = (typeof DeviceType)[keyof typeof DeviceType];
