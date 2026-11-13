import { WheelPrizeType, WheelSlotItem } from "../types";

export interface WheelPrizeTypeConfig {
  type: WheelPrizeType;
  /** Nhãn đầy đủ dùng trong form, modal, dropdown */
  label: string;
  /** Nhãn ngắn gọn dùng cho badge hoặc hiển thị nhỏ gọn */
  badgeLabel: string;
  /** Mô tả ngắn về loại phần thưởng */
  description: string;
  /** Class Tailwind cho badge loại thưởng (bg, text, border) */
  badgeBg: string;
  /** Class Tailwind cho chữ giá trị nhận nổi bật */
  textColor: string;
  /** Đường dẫn ảnh WebP 3D chuẩn */
  imageSrc: string;
  /** Hàm format chuỗi giá trị nhận tương ứng */
  formatValue: (rewardCoins: number, rewardFreeSpins: number) => string;
}

/**
 * CẤU HÌNH TRUNG TÂM CÁC LOẠI PHẦN THƯỞNG VÒNG QUAY (Single Source of Truth)
 * - Khi cần thêm loại phần thưởng mới (ví dụ: voucher, huy hiệu, v.v.),
 *   chỉ cần bổ sung tại đây và toàn bộ Modal, Card, Bảng phân tích sẽ tự động nhận diện.
 */
export const WHEEL_PRIZE_CONFIG: Record<WheelPrizeType, WheelPrizeTypeConfig> = {
  coin: {
    type: "coin",
    label: "Cộng Xu",
    badgeLabel: "Cộng Xu",
    description: "Tặng xu heo đất",
    badgeBg: "bg-amber-50 text-amber-800 border-amber-200",
    textColor: "text-amber-600",
    imageSrc: "/wheel/coin.webp",
    formatValue: (coins) => `+${Math.abs(coins)} Xu`,
  },
  deduct_coin: {
    type: "deduct_coin",
    label: "Bị Trừ Xu",
    badgeLabel: "Bị Trừ Xu",
    description: "Phạt trừ xu",
    badgeBg: "bg-rose-50 text-rose-800 border-rose-200",
    textColor: "text-rose-600",
    imageSrc: "/wheel/deduct-coin.webp",
    formatValue: (coins) => `${coins < 0 ? coins : -coins} Xu`,
  },
  free_spin: {
    type: "free_spin",
    label: "Free Spin",
    badgeLabel: "Lượt Quay",
    description: "Tặng thêm lượt",
    badgeBg: "bg-emerald-50 text-emerald-800 border-emerald-200",
    textColor: "text-emerald-600",
    imageSrc: "/wheel/free-spin.webp",
    formatValue: (_, spins) => `+${Math.max(1, spins)} Lượt quay`,
  },
  gift: {
    type: "gift",
    label: "Quà Hiện Vật",
    badgeLabel: "Quà Tặng",
    description: "Hộp quà, bút, thước",
    badgeBg: "bg-purple-50 text-purple-800 border-purple-200",
    textColor: "text-purple-600",
    imageSrc: "/wheel/gift.webp",
    formatValue: () => "Quà Hiện Vật",
  },
  luck: {
    type: "luck",
    label: "Chúc May Mắn",
    badgeLabel: "May Mắn",
    description: "May mắn lần sau",
    badgeBg: "bg-slate-100 text-slate-700 border-slate-200",
    textColor: "text-slate-600",
    imageSrc: "/wheel/luck.webp",
    formatValue: () => "Chúc May Mắn",
  },
};

/**
 * Danh sách dạng mảng dùng để map render các nút chọn (Select / Radio / Grid)
 */
export const WHEEL_PRIZE_TYPES_LIST: WheelPrizeTypeConfig[] = Object.values(
  WHEEL_PRIZE_CONFIG
);

/**
 * Lấy cấu hình của 1 loại giải thưởng (hỗ trợ fallback an toàn)
 */
export function getWheelPrizeConfig(type: WheelPrizeType): WheelPrizeTypeConfig {
  return WHEEL_PRIZE_CONFIG[type] ?? WHEEL_PRIZE_CONFIG.luck;
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
