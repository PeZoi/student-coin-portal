export interface MockClassItem {
  id: string;
  class_name: string;
  is_active: boolean;
  student_count: number;
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

export type SortField = "class_name" | "student_count" | "created_at";

export type SortDirection = "asc" | "desc" | "none";
