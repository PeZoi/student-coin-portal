import {
  WHEEL_CONSTANTS,
  WHEEL_PRIZE_TYPES,
  WHEEL_PRIZE_IMAGES,
} from "@/constants/wheel";
import {
  WheelPrizeType,
  WheelSlotItem,
  WheelGeneralSettings,
  WheelStatisticsData,
} from "../types";

export interface WheelPrizeTypeConfig {
  type: WheelPrizeType;
  /** Nhãn đầy đủ dùng trong form, modal, dropdown */
  label: string;
  /** Nhãn phân tích hiển thị trong biểu đồ Cơ cấu tỷ lệ */
  analyticsLabel: string;
  /** Nhãn ngắn gọn dùng cho badge hoặc hiển thị nhỏ gọn */
  badgeLabel: string;
  /** Mô tả ngắn về loại phần thưởng */
  description: string;
  /** Class Tailwind cho badge loại thưởng (bg, text, border) */
  badgeBg: string;
  /** Class Tailwind cho chữ giá trị nhận nổi bật */
  textColor: string;
  /** Mã màu Hex dùng cho thanh phân bổ tỷ lệ (Stacked Progress Bar) */
  chartColor: string;
  /** Đường dẫn ảnh WebP 3D chuẩn */
  imageSrc: string;
  /** Hàm format chuỗi giá trị nhận tương ứng */
  formatValue: (rewardCoins: number, rewardFreeSpins: number) => string;
}

/**
 * CẤU HÌNH TRUNG TÂM CÁC LOẠI PHẦN THƯỞNG VÒNG QUAY (Single Source of Truth)
 * - Khi cần thêm loại phần thưởng mới, chỉ cần bổ sung tại đây và toàn bộ Modal, Card, Bảng phân tích sẽ tự động nhận diện.
 */
export const WHEEL_PRIZE_CONFIG: Record<WheelPrizeType, WheelPrizeTypeConfig> = {
  [WHEEL_PRIZE_TYPES.COIN]: {
    type: WHEEL_PRIZE_TYPES.COIN,
    label: "Cộng Xu",
    analyticsLabel: "Cộng Xu Thưởng",
    badgeLabel: "Cộng Xu",
    description: "Tặng xu heo đất",
    badgeBg: "bg-amber-50 text-amber-800 border-amber-200",
    textColor: "text-amber-600",
    chartColor: "#F59E0B",
    imageSrc: WHEEL_PRIZE_IMAGES[WHEEL_PRIZE_TYPES.COIN],
    formatValue: (coins) => `+${Math.abs(coins)} Xu`,
  },
  [WHEEL_PRIZE_TYPES.DEDUCT_COIN]: {
    type: WHEEL_PRIZE_TYPES.DEDUCT_COIN,
    label: "Bị Trừ Xu",
    analyticsLabel: "Bị Trừ Xu",
    badgeLabel: "Bị Trừ Xu",
    description: "Phạt trừ xu",
    badgeBg: "bg-rose-50 text-rose-800 border-rose-200",
    textColor: "text-rose-600",
    chartColor: "#EF4444",
    imageSrc: WHEEL_PRIZE_IMAGES[WHEEL_PRIZE_TYPES.DEDUCT_COIN],
    formatValue: (coins) => `${coins < 0 ? coins : -coins} Xu`,
  },
  [WHEEL_PRIZE_TYPES.LUCK]: {
    type: WHEEL_PRIZE_TYPES.LUCK,
    label: "Chúc May Mắn",
    analyticsLabel: "Chúc May Mắn",
    badgeLabel: "May Mắn",
    description: "May mắn lần sau",
    badgeBg: "bg-slate-100 text-slate-700 border-slate-200",
    textColor: "text-slate-600",
    chartColor: "#64748B",
    imageSrc: WHEEL_PRIZE_IMAGES[WHEEL_PRIZE_TYPES.LUCK],
    formatValue: () => "Chúc May Mắn",
  },
  [WHEEL_PRIZE_TYPES.FREE_SPIN]: {
    type: WHEEL_PRIZE_TYPES.FREE_SPIN,
    label: "Free Spin",
    analyticsLabel: "Thêm Lượt Quay",
    badgeLabel: "Lượt Quay",
    description: "Tặng thêm lượt",
    badgeBg: "bg-emerald-50 text-emerald-800 border-emerald-200",
    textColor: "text-emerald-600",
    chartColor: "#10B981",
    imageSrc: WHEEL_PRIZE_IMAGES[WHEEL_PRIZE_TYPES.FREE_SPIN],
    formatValue: (_, spins) => `+${Math.max(1, spins)} Lượt quay`,
  },
  [WHEEL_PRIZE_TYPES.GIFT]: {
    type: WHEEL_PRIZE_TYPES.GIFT,
    label: "Quà Hiện Vật",
    analyticsLabel: "Quà Tặng Bí Ẩn",
    badgeLabel: "Quà Tặng",
    description: "Hộp quà, bút, thước",
    badgeBg: "bg-purple-50 text-purple-800 border-purple-200",
    textColor: "text-purple-600",
    chartColor: "#8B5CF6",
    imageSrc: WHEEL_PRIZE_IMAGES[WHEEL_PRIZE_TYPES.GIFT],
    formatValue: () => "Quà Hiện Vật",
  },
};

/**
 * Danh sách dạng mảng dùng để map render các nút chọn (Select / Radio / Grid / Biểu đồ)
 */
export const WHEEL_PRIZE_TYPES_LIST: WheelPrizeTypeConfig[] = Object.values(
  WHEEL_PRIZE_CONFIG
);

/**
 * Thiết lập kinh tế vòng quay khởi tạo chuẩn (khi DB chưa cấu hình)
 */
export const DEFAULT_WHEEL_SETTINGS: WheelGeneralSettings = {
  spin_cost: WHEEL_CONSTANTS.DEFAULT_SPIN_COST,
  allow_free_spin: false,
  daily_free_spins: 1,
  is_maintenance: false,
};

/**
 * Cấu trúc thống kê rỗng chuẩn (0 lượt quay, không dùng dữ liệu giả lập)
 */
export const EMPTY_WHEEL_STATISTICS: WheelStatisticsData = {
  total_spins_today: 0,
  total_historical_spins: 0,
  spins_change_vs_yesterday: 0,
  total_coins_rewarded_today: 0,
  total_coins_deducted_today: 0,
  net_coins_flow: 0,
  rtp_rate: 0,
  total_active_slots: 0,
  total_weight: 0,
  is_weight_balanced: false,
  categories: WHEEL_PRIZE_TYPES_LIST.map((item) => ({
    type: item.type,
    label: item.analyticsLabel,
    color: item.chartColor,
    badgeBg: item.badgeBg,
    badgeText: item.badgeLabel,
    total_weight: 0,
    percentage: 0,
    slot_count: 0,
  })),
  top_frequent_items: [],
};

/**
 * Lấy cấu hình của 1 loại giải thưởng
 */
export function getWheelPrizeConfig(
  type: WheelPrizeType
): WheelPrizeTypeConfig {
  return WHEEL_PRIZE_CONFIG[type] ?? WHEEL_PRIZE_CONFIG[WHEEL_PRIZE_TYPES.LUCK];
}

/**
 * Định dạng chuỗi hiển thị giá trị nhận của ô phần thưởng
 */
export function formatWheelPrizeValue(
  slot: Pick<WheelSlotItem, "prize_type" | "reward_coins" | "reward_free_spins">
): string {
  const config = getWheelPrizeConfig(slot.prize_type);
  return config.formatValue(slot.reward_coins, slot.reward_free_spins);
}
