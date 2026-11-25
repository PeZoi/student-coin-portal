/**
 * ==============================================================================
 * STUDENT MANAGEMENT TYPES
 * Mô tả cấu trúc dữ liệu cho học sinh, dựa trên bảng `public.users` (role = 'student'),
 * liên kết bảng `public.classes` và lịch sử xác thực mã PIN.
 * ==============================================================================
 */

export interface StudentItem {
  id: string;
  full_name: string;
  phone_zalo: string;
  pin_number?: string | null;
  class_id: string | null;
  class_name: string;
  avatar_url?: string | null;
  current_coins: number;
  free_spins: number;
  total_earned_coins: number;
  is_active: boolean;
  is_deleted: boolean;
  failed_login_attempts: number;
  locked_until: string | null;
  lock_remaining_text?: string | null;
  last_login_at?: string | null;
  created_at: string;
}

export interface StudentClassOption {
  id: string;
  class_name: string;
  is_active: boolean;
  student_count?: number;
}

export type StudentStatusFilter = "all" | "active" | "locked" | "inactive" | "deleted";

export type StudentBatchAction =
  | "change_class"
  | "adjust_coins"
  | "activate"
  | "deactivate"
  | "delete_soft"
  | "restore"
  | "delete_permanent";

export type StudentSortField =
  | "full_name"
  | "class_name"
  | "current_coins"
  | "pin_status"
  | "last_login_at"
  | "created_at";

export type SortDirection = "asc" | "desc" | "none";

export interface StudentFormValues {
  full_name: string;
  phone_zalo: string;
  pin_number?: string;
  class_id?: string;
  initial_coins?: number;
  is_active: boolean;
}

export interface AdjustCoinsValues {
  student_id: string;
  student_name: string;
  type: "add" | "deduct";
  amount: number;
  spins_change?: number;
  reason: string;
  tx_type?: string;
}

export interface StudentCoinTransactionItem {
  id: string;
  user_id: string;
  amount: number;
  balance_before: number;
  balance_after: number;
  tx_type: string;
  reference_type: string;
  reference_id: string | null;
  description: string;
  created_at: string;
  created_by: string | null;
  creator_name: string | null;
  creator_role: string | null;
}

export interface StudentCoinTransactionsData {
  student: {
    id: string;
    full_name: string;
    current_coins: number;
    total_earned_coins: number;
  };
  transactions: StudentCoinTransactionItem[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    has_more: boolean;
  };
}


