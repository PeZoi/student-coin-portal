export type StudentRosterStatusFilter = "all" | "active" | "locked";

export type StudentRosterSortField =
  | "fullName"
  | "coins"
  | "completedMissions"
  | "redeemedRewards";

export type SortOrder = "asc" | "desc" | "none";

export interface PiggyBankLevel {
  name: string;
  levelNumber: number;
  tier: "gold" | "silver" | "bronze" | "starter";
  colorClass: string;
  badgeBg: string;
}

/**
 * 2 hình thức đổi quà khớp 100% với cột `choice_type` trong DB `monthly_exchange_requests`:
 * 1. 'cash': Đổi thành tiền thật (VNĐ)
 * 2. 'shopee': Đổi thành quà tặng tự chọn qua link sản phẩm (Shopee, Tiki, Lazada...)
 * 3. 'save_piggy': Bỏ heo tiết kiệm tiếp
 */
export type ExchangeChoiceType = "cash" | "shopee" | "save_piggy";

/**
 * Trạng thái yêu cầu đổi quà khớp cột `status` trong DB `monthly_exchange_requests`
 */
export type ExchangeRequestStatus =
  | "pending"
  | "approved"
  | "completed"
  | "rejected"
  | "cancelled";

/**
 * Chi tiết phiếu đổi quà khớp 100% cấu trúc bảng `monthly_exchange_requests`
 */
export interface MonthlyExchangeRequestItem {
  id: string;
  month: number;
  year: number;
  student_id: string;
  choice_type: ExchangeChoiceType;
  coins_to_exchange: number;
  amount_vnd: number;
  shopee_product_url?: string | null;
  shopee_note?: string | null;
  status: ExchangeRequestStatus;
  processed_by?: string | null;
  processed_at?: string | null;
  created_at: string;
}

export interface TeacherRosterStudent {
  id: string;
  code: string;
  fullName: string;
  avatar: string;
  gender: "male" | "female";
  parentPhone?: string;
  coins: number;
  redeemedRewards: number; // Tổng số phần quà / tiền đã đổi
  exchangeRequests?: MonthlyExchangeRequestItem[]; // Danh sách chi tiết các lần đổi quà khớp DB
  level: PiggyBankLevel;
  missions: {
    completed: number;
    total: number;
  };
  lastActive: string;
  pinStatus: "ok" | "locked" | "failed_attempts";
  failedAttempts?: number;
  lockedUntil?: string | null;
  isActive: boolean;
}
