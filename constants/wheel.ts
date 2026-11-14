/**
 * ==============================================================================
 * LUCKY WHEEL CONSTANTS & DESIGN TOKENS
 * - Định nghĩa tập trung các hằng số vận hành, loại giải thưởng, đường dẫn ảnh và văn bản Vòng quay may mắn
 * ==============================================================================
 */

/**
 * Các tham số kỹ thuật vòng quay (Thời gian quay, chi phí, góc quay)
 */
export const WHEEL_CONSTANTS = {
  SPIN_DURATION_MS: 5400,
  SIMULATOR_SPIN_DURATION_MS: 4200,
  DEFAULT_SPIN_COST: 500,
  TOTAL_SEGMENTS: 8,
  SEGMENT_ANGLE: 45, // 360 / 8
  MIN_EXTRA_ROUNDS: 5,
  MAX_EXTRA_ROUNDS: 7,
  JITTER_ANGLE_RANGE: 20, // Biên độ lệch ngẫu nhiên tâm múi (-10° đến +10°)
  MIN_SLOTS: 4, // Số lượng ô tối thiểu trên vòng quay
  TARGET_TOTAL_WEIGHT: 100, // Tổng trọng số chuẩn 100%
  MIN_SLOT_WEIGHT: 1, // Trọng số tối thiểu của 1 ô
  MAX_SLOT_WEIGHT: 50, // Trọng số tối đa trên thanh trượt của 1 ô
  MAX_DAILY_FREE_SPINS: 10, // Số lượt quay miễn phí tối đa/ngày
  RECENT_WINNERS_LIMIT: 20, // Số lượng lịch sử lượt quay gần nhất tải cho học sinh
  SYSTEM_SETTING_KEY: "wheel_setting", // Key lưu trong bảng system_settings
} as const;

/**
 * Các loại phần thưởng chuẩn trong CSDL (Single Source of Truth)
 */
export const WHEEL_PRIZE_TYPES = {
  COIN: "coin",
  DEDUCT_COIN: "deduct_coin",
  FREE_SPIN: "free_spin",
  GIFT: "gift",
  LUCK: "luck",
  MULTIPLIER: "multiplier",
} as const;

/**
 * Đường dẫn hình ảnh tập trung dùng cho toàn bộ tính năng Vòng Quay May Mắn
 */
export const WHEEL_ASSETS = {
  DEFAULT_AVATAR: "/avatar.jpg",
  COIN: "/wheel/coin.webp",
  DEDUCT_COIN: "/wheel/deduct-coin.webp",
  FREE_SPIN: "/wheel/free-spin.webp",
  GIFT: "/wheel/gift.webp",
  LUCK: "/wheel/luck.webp",
} as const;

/**
 * Đường dẫn hình ảnh 3D chính thức cho từng loại phần thưởng trên Vòng quay
 */
export const WHEEL_PRIZE_IMAGES = {
  [WHEEL_PRIZE_TYPES.COIN]: WHEEL_ASSETS.COIN,
  [WHEEL_PRIZE_TYPES.DEDUCT_COIN]: WHEEL_ASSETS.DEDUCT_COIN,
  [WHEEL_PRIZE_TYPES.FREE_SPIN]: WHEEL_ASSETS.FREE_SPIN,
  [WHEEL_PRIZE_TYPES.GIFT]: WHEEL_ASSETS.GIFT,
  [WHEEL_PRIZE_TYPES.LUCK]: WHEEL_ASSETS.LUCK,
} as const;

export type WheelPrizeImageType = keyof typeof WHEEL_PRIZE_IMAGES;

/**
 * Hàm tiện ích lấy URL ảnh đại diện theo loại phần thưởng
 */
export function getWheelPrizeImageUrl(type: string): string {
  const normalizedType = type.replace(/-/g, "_") as WheelPrizeImageType;
  return WHEEL_PRIZE_IMAGES[normalizedType] || WHEEL_ASSETS.COIN;
}

/**
 * Hệ thống màu chuẩn cho Vòng Quay May Mắn (Lucky Wheel Design Tokens)
 * Đồng bộ màu sắc giữa viền, đèn, múi quạt, chip chữ, nút bấm và kim chỉ.
 */
export const WHEEL_THEME = {
  rim: {
    from: "#FFF0B3",
    mid: "#FFC93C",
    to: "#E39A0B",
    edge: "#9A5B00",
  },
  ring: {
    from: "#16337A",
    to: "#0B2058",
  },
  bulb: {
    on: "#FFF7C2",
    glow: "#FFC93C",
    off: "#C9962E",
  },
  slices: [
    { from: "#FFE680", to: "#FFC93C", text: "#7A4300" }, // Miếng chẵn: vàng kem
    { from: "#3E9BFF", to: "#1B66E0", text: "#0C3A8C" }, // Miếng lẻ: xanh dương
  ],
  divider: "rgba(255,255,255,0.85)",
  special: {
    from: "#A78BFA",
    to: "#7C3AED",
  },
  action: {
    from: "#FF6B81",
    to: "#E0194B",
    ring: "#FFD45A",
    shadow: "#8F0F2E",
  },
} as const;

/**
 * Lấy theme màu cho múi thứ i (xen kẽ chẵn/lẻ)
 */
export const getSliceTheme = (i: number) => WHEEL_THEME.slices[i % 2];

/**
 * Quản lý tập trung toàn bộ câu chữ / thông điệp hiển thị trên Popup Trúng Thưởng (WheelPrizeModal)
 */
export const WHEEL_PRIZE_MODAL_TEXTS = {
  BADGE: {
    LUCK: "CỐ GẮNG LẦN SAU NHÉ!",
    DEDUCT: "ÔI TIẾC QUÁ!",
    WIN: "CHÚC MỪNG CHIẾN THẮNG!",
  },
  BUTTON: {
    RETRY: "Đã hiểu, quay tiếp!",
    CLAIM: "Tuyệt vời, Nhận ngay!",
  },
  DESCRIPTION: {
    LUCK: "Đừng nản lòng nhé! Hãy tiếp tục chăm ngoan làm bài tập để thử vận may lần sau nhé!",
    DEDUCT: (label: string) =>
      `Bạn vừa quay trúng ô "${label}". Đừng buồn nhé, hãy thử lại ở lượt sau để gỡ gạc gấp đôi!`,
    FREE_SPIN: (spins: number) =>
      `Tuyệt vời! Bạn vừa nhận thêm +${spins || 1} lượt quay miễn phí để tiếp tục thử vận may!`,
    REWARD: (label: string) =>
      `Tuyệt vời! Phần thưởng ${label} đã được chuyển thẳng vào Heo Đất của bạn!`,
  },
} as const;

/**
 * Trả về toàn bộ thông điệp, ảnh và kiểu nút tương ứng với giải thưởng vừa trúng
 */
export function getWheelPrizeModalContent(prize: {
  prize_type: string;
  label: string;
  reward_free_spins?: number;
}) {
  const isLuck = prize.prize_type === WHEEL_PRIZE_TYPES.LUCK;
  const isDeduct = prize.prize_type === WHEEL_PRIZE_TYPES.DEDUCT_COIN;
  const isFreeSpin = prize.prize_type === WHEEL_PRIZE_TYPES.FREE_SPIN;

  const badgeText = isLuck
    ? WHEEL_PRIZE_MODAL_TEXTS.BADGE.LUCK
    : isDeduct
    ? WHEEL_PRIZE_MODAL_TEXTS.BADGE.DEDUCT
    : WHEEL_PRIZE_MODAL_TEXTS.BADGE.WIN;

  const descriptionText = isLuck
    ? WHEEL_PRIZE_MODAL_TEXTS.DESCRIPTION.LUCK
    : isDeduct
    ? WHEEL_PRIZE_MODAL_TEXTS.DESCRIPTION.DEDUCT(prize.label)
    : isFreeSpin
    ? WHEEL_PRIZE_MODAL_TEXTS.DESCRIPTION.FREE_SPIN(
        prize.reward_free_spins || 1
      )
    : WHEEL_PRIZE_MODAL_TEXTS.DESCRIPTION.REWARD(prize.label);

  const buttonText =
    isLuck || isDeduct
      ? WHEEL_PRIZE_MODAL_TEXTS.BUTTON.RETRY
      : WHEEL_PRIZE_MODAL_TEXTS.BUTTON.CLAIM;

  const buttonVariant: "yellow" | "green" =
    isLuck || isDeduct ? "yellow" : "green";

  return {
    isLuck,
    isDeduct,
    isFreeSpin,
    badgeText,
    descriptionText,
    buttonText,
    buttonVariant,
    imageUrl: getWheelPrizeImageUrl(prize.prize_type),
  };
}
