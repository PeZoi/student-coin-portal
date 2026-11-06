export type UserRole = "student" | "teacher" | "admin";

export type AuthMode = "login" | "register";

/**
 * Dữ liệu Form đăng nhập học sinh (bước 1: nhập Số điện thoại Zalo)
 */
export interface StudentLoginFormValues {
  phone_zalo: string;
}

/**
 * Thông tin trạng thái khóa bảo mật tài khoản
 */
export interface AuthLockInfo {
  is_locked: boolean;
  locked_until?: string | null;
  remaining_minutes?: number;
  remaining_attempts?: number;
}

/**
 * Lỗi đặc thù khi xác thực mã PIN thất bại (chứa trạng thái khóa và số lần còn lại)
 */
export class PinVerificationError extends Error {
  isLocked: boolean;
  remainingMinutes: number;
  remainingAttempts: number;
  lockedUntil: string | null;

  constructor(
    message: string,
    options?: {
      isLocked?: boolean;
      remainingMinutes?: number;
      remainingAttempts?: number;
      lockedUntil?: string | null;
    }
  ) {
    super(message);
    this.name = "PinVerificationError";
    this.isLocked = options?.isLocked ?? false;
    this.remainingMinutes = options?.remainingMinutes ?? 0;
    this.remainingAttempts = options?.remainingAttempts ?? 0;
    this.lockedUntil = options?.lockedUntil ?? null;
  }
}

/**
 * Thông tin học sinh tìm thấy từ số điện thoại (dùng để hiển thị Popup xác nhận)
 */
export interface StudentLookupData {
  id: string;
  full_name: string;
  phone_zalo: string;
  avatar_url: string;
  current_coins: number;
  class_name: string | null;
  is_locked?: boolean;
  locked_until?: string | null;
  remaining_minutes?: number;
  remaining_attempts?: number;
}

/**
 * Payload gửi lên API đăng nhập xác thực mã PIN
 */
export interface StudentLoginPayload {
  phone_zalo: string;
  pin_number: string;
}

/**
 * Thông tin phiên học sinh trả về sau khi xác thực mã PIN thành công
 */
export interface StudentSessionData {
  id: string;
  full_name: string;
  phone_zalo: string;
  avatar_url: string;
  current_coins: number;
  role: string;
  class_name?: string | null;
  token?: string;
}

/**
 * Kiểu dữ liệu trả về từ API đăng nhập học sinh (thành công hoặc thông tin khóa/lỗi thử)
 */
export type StudentLoginResponseData =
  | StudentSessionData
  | AuthLockInfo;

/**
 * Dữ liệu Form đăng ký học sinh (bảng `users` & `classes` trong database_schema.sql)
 */
export interface StudentRegisterFormValues {
  full_name: string;
  phone_zalo: string;
  class_id: string;
  pin_number: string;
  confirm_pin_number: string;
  avatar_url?: string;
}

/**
 * Dữ liệu Form đăng nhập giáo viên & admin (bảng `users.username` và `users.password`)
 */
export interface TeacherLoginFormValues {
  username: string;
  password: string;
}

export interface AuthStateProps {
  initialRole?: UserRole;
  initialMode?: AuthMode;
}

/**
 * Thông tin lớp học lấy từ cơ sở dữ liệu (bảng `classes`)
 */
export interface ClassItem {
  id: string;
  class_name: string;
}

/**
 * Thông tin học sinh trả về sau khi đăng ký thành công
 */
export interface RegisteredStudentData {
  id: string;
  full_name: string;
  phone_zalo: string;
  class_id: string;
  avatar_url: string;
  current_coins: number;
  role: string;
}

