export type UserRole = "student" | "teacher" | "admin";

export type AuthMode = "login" | "register";

/**
 * Dữ liệu Form đăng nhập học sinh (bảng `users` trong database_schema.sql)
 */
export interface StudentLoginFormValues {
  phone_zalo: string;
  pin_number: string;
}

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

