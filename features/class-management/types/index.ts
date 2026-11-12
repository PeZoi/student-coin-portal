export interface MockClassItem {
  id: string;
  class_name: string;
  is_active: boolean;
  student_count: number;
  total_coins?: number;
  teachers: string[];
  teacher_ids?: string[];
  created_at: string;
  is_deleted?: boolean;
}

export type TeacherClassItem = MockClassItem;

export interface AvailableTeacherItem {
  id: string;
  full_name: string;
  username: string | null;
  role: string;
  assigned_class_count?: number;
}

export type StatusFilter = "all" | "active" | "inactive" | "deleted";

export type SortField = "class_name" | "student_count" | "total_coins" | "created_at";

export type SortDirection = "asc" | "desc" | "none";

export interface ClassStudentItem {
  id: string;
  full_name: string;
  username: string | null;
  phone_zalo: string | null;
  avatar_url: string | null;
  current_coins: number;
  total_earned_coins?: number;
  is_active: boolean;
  created_at: string;
}

/**
 * Kiểu dữ liệu lớp học phụ trách của giáo viên (phục vụ Header Workspace Selector và lọc theo lớp)
 */
export interface TeacherAssignedClassItem {
  id: string;
  class_name: string;
  student_count?: number;
}
