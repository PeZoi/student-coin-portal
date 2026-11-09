export interface MockClassItem {
  id: string;
  class_name: string;
  is_active: boolean;
  student_count: number;
  teachers: string[];
  created_at: string;
}

export type StatusFilter = "all" | "active" | "inactive";

export type SortField = "class_name" | "student_count" | "created_at";

export type SortDirection = "asc" | "desc" | "none";
