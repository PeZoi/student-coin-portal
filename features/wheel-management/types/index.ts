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
