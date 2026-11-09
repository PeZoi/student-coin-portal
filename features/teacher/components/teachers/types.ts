export type StaffRole = "teacher" | "super_teacher" | "admin";

/**
 * Dữ liệu giáo viên dựa trên bảng `public.users` (`role = 'teacher'`), `public.teacher_classes` và `public.auth_logs`
 */
export interface TeacherStaffItem {
  id: string;
  username: string;
  full_name: string;
  email: string | null;
  phone_zalo: string | null;
  avatar_url: string | null;
  role: StaffRole;
  is_active: boolean;
  failed_login_attempts: number;
  locked_until: string | null;
  assigned_classes: string[];
  assigned_class_ids: string[];
  last_login_at: string | null;
  created_at: string;
}

/**
 * Dữ liệu lớp học dùng trong Modal Phân công lớp cho giáo viên
 */
export interface AvailableClassItem {
  id: string;
  class_name: string;
  is_active: boolean;
  student_count: number;
}

export type TeacherStatusFilter = "all" | "active" | "inactive";

export type TeacherSortField =
  | "full_name"
  | "assigned_classes"
  | "last_login_at"
  | "created_at";

export type SortDirection = "asc" | "desc" | "none";

export interface TeacherFormValues {
  full_name: string;
  username: string;
  password?: string;
  phone_zalo: string;
  email: string;
}
