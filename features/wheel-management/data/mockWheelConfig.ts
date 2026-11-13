import {
  WheelGeneralSettings,
  WheelStatisticsData,
} from "../types";

/**
 * Cấu hình tổng quát vòng quay mặc định (dùng làm fallback khi CSDL chưa có key 'wheel_setting')
 */
export const defaultWheelSettings: WheelGeneralSettings = {
  spin_cost: 20,
  allow_free_spin: true,
  daily_free_spins: 1,
  is_maintenance: false,
};

/**
 * Thống kê vận hành chi tiết: Tỷ lệ trúng, tần suất các item hay trúng nhất
 * (Tạm thời lưu giữ để phục vụ UI phân tích do chưa làm API analytics riêng)
 */
export const initialMockStatistics: WheelStatisticsData = {
  total_spins_today: 483,
  spins_change_vs_yesterday: 14.2,
  total_coins_rewarded_today: 13420,
  total_coins_deducted_today: 4320,
  net_coins_flow: 9100,
  rtp_rate: 82.4, // Return To Player
  total_active_slots: 8,
  total_weight: 100,
  is_weight_balanced: true,
  categories: [
    {
      type: "coin",
      label: "Cộng Xu Thưởng",
      color: "#F59E0B",
      badgeBg: "bg-amber-50 border-amber-200 text-amber-800",
      badgeText: "Cộng Xu",
      total_weight: 50,
      percentage: 50,
      slot_count: 3,
    },
    {
      type: "deduct_coin",
      label: "Bị Trừ Xu",
      color: "#EF4444",
      badgeBg: "bg-rose-50 border-rose-200 text-rose-800",
      badgeText: "Bị Trừ Xu",
      total_weight: 17,
      percentage: 17,
      slot_count: 2,
    },
    {
      type: "luck",
      label: "Chúc May Mắn",
      color: "#64748B",
      badgeBg: "bg-slate-100 border-slate-200 text-slate-700",
      badgeText: "May Mắn",
      total_weight: 15,
      percentage: 15,
      slot_count: 1,
    },
    {
      type: "free_spin",
      label: "Lượt Quay Free",
      color: "#10B981",
      badgeBg: "bg-emerald-50 border-emerald-200 text-emerald-800",
      badgeText: "Lượt Quay",
      total_weight: 10,
      percentage: 10,
      slot_count: 1,
    },
    {
      type: "gift",
      label: "Quà Hiện Vật",
      color: "#8B5CF6",
      badgeBg: "bg-purple-50 border-purple-200 text-purple-800",
      badgeText: "Quà Tặng",
      total_weight: 8,
      percentage: 8,
      slot_count: 1,
    },
  ],
  top_frequent_items: [
    {
      slot_order: 1,
      id: "slot-1",
      label: "+20 Xu Heo Đất",
      short_label: "+20 Xu",
      prize_type: "coin",
      expected_rate: 25.0,
      actual_rate: 26.1,
      total_hits: 126,
      diff_percent: 1.1,
    },
    {
      slot_order: 3,
      id: "slot-3",
      label: "+50 Xu May Mắn",
      short_label: "+50 Xu",
      prize_type: "coin",
      expected_rate: 18.0,
      actual_rate: 18.5,
      total_hits: 89,
      diff_percent: 0.5,
    },
    {
      slot_order: 5,
      id: "slot-5",
      label: "Chúc Bạn May Mắn Lần Sau",
      short_label: "May Mắn",
      prize_type: "luck",
      expected_rate: 15.0,
      actual_rate: 15.3,
      total_hits: 74,
      diff_percent: 0.3,
    },
    {
      slot_order: 2,
      id: "slot-2",
      label: "Rơi Túi Xu (-10 Xu)",
      short_label: "-10 Xu",
      prize_type: "deduct_coin",
      expected_rate: 12.0,
      actual_rate: 11.6,
      total_hits: 56,
      diff_percent: -0.4,
    },
    {
      slot_order: 4,
      id: "slot-4",
      label: "+1 Lượt Quay Thưởng",
      short_label: "+1 Lượt",
      prize_type: "free_spin",
      expected_rate: 10.0,
      actual_rate: 9.7,
      total_hits: 47,
      diff_percent: -0.3,
    },
  ],
};
