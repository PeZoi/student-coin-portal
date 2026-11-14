export type WheelPrizeType =
  | "coin"
  | "free_spin"
  | "luck"
  | "gift"
  | "deduct_coin";

export interface WheelSlotItem {
  id: string;
  slot_order: number;
  label: string;
  short_label: string;
  prize_type: WheelPrizeType;
  reward_coins: number;
  reward_free_spins: number;
  probability_weight: number;
  is_active: boolean;
  is_locked?: boolean; // Khóa tỷ lệ ô này khi tự động cân bằng xác suất
  // Dữ liệu thống kê vận hành (gắn kèm từ bảng log wheel_spins)
  stats?: {
    total_hits: number;
    actual_rate: number; // % thực tế
    recent_hit_date?: string;
  };
}

export interface WheelGeneralSettings {
  spin_cost: number; // Phí mỗi lượt quay (ví dụ: 20 xu)
  allow_free_spin: boolean; // Bật/tắt lượt quay miễn phí hàng ngày
  daily_free_spins: number; // Số lượt miễn phí mỗi ngày (ví dụ: 1)
  is_maintenance: boolean; // Tạm dừng bảo trì vòng quay
}

export interface WheelCategoryDistribution {
  type: WheelPrizeType;
  label: string;
  color: string;
  badgeBg: string;
  badgeText: string;
  total_weight: number;
  percentage: number;
  slot_count: number;
}

export interface TopFrequentItem {
  slot_order: number;
  id: string;
  label: string;
  short_label: string;
  prize_type: WheelPrizeType;
  expected_rate: number; // % lý thuyết
  actual_rate: number; // % thực tế đã trúng
  total_hits: number; // Số lần trúng
  diff_percent: number; // Chênh lệch (+/-)
}

export interface WheelStatisticsData {
  total_spins_today: number;
  total_historical_spins?: number;
  spins_change_vs_yesterday: number;
  total_coins_rewarded_today: number;
  total_coins_deducted_today: number;
  net_coins_flow: number;
  rtp_rate: number; // Return To Player %
  total_active_slots: number;
  total_weight: number;
  is_weight_balanced: boolean; // Tổng trọng số có đạt chuẩn 100 hay không
  categories: WheelCategoryDistribution[];
  top_frequent_items: TopFrequentItem[];
}

/**
 * Bản ghi lịch sử lượt quay thực tế của học sinh (ánh xạ trực tiếp từ bảng wheel_spins + users)
 */
export interface WheelSpinHistoryItem {
  id: string;
  student_id: string;
  student_name: string;
  class_name: string;
  avatar_url: string;
  prize_id: string | null;
  prize_label_snapshot: string;
  prize_short_label_snapshot: string;
  prize_type_snapshot: WheelPrizeType;
  spin_cost: number;
  reward_coins: number;
  reward_free_spins: number;
  is_free_spin: boolean;
  created_at: string;
}

/**
 * Dữ liệu phân trang cho danh sách Lịch sử vòng quay (Infinite Scroll 20 bản ghi / trang)
 */
export interface WheelSpinHistoryPageData {
  items: WheelSpinHistoryItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    has_more: boolean;
  };
}
