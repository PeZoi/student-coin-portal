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
    COIN: "TIỀN VỀ HEO ĐẤT!",
    DEDUCT: "ỐI! RƠI MẤT XU RỒI",
    FREE_SPIN: "THƯỞNG LƯỢT QUAY!",
    GIFT: "HỘP QUÀ BÍ ẨN!",
    LUCK: "THÊM CHÚT MAY MẮN NÈ!",
    WIN: "CHÚC MỪNG CHIẾN THẮNG!",
  },
  BUTTON: {
    COIN: "Bỏ vào Heo Đất ngay!",
    DEDUCT: "Không sao, quay gỡ lại!",
    FREE_SPIN: "Quay miễn phí ngay!",
    GIFT: "Mở quà ngay thôi!",
    LUCK: "Quay tiếp thử vận may!",
    RETRY: "Đã hiểu, quay tiếp!",
    CLAIM: "Tuyệt vời, Nhận ngay!",
  },
  DESCRIPTION: {
    COIN: (coins: number, label: string) =>
      coins > 0
        ? `Tuyệt vời! +${coins.toLocaleString("vi-VN")} xu đã được chuyển thẳng vào ví Heo Đất của bạn!`
        : `Tuyệt vời! Phần thưởng ${label} đã sẵn sàng trong Heo Đất của bạn!`,
    DEDUCT: (label: string) =>
      `Bạn vừa quay vào ô "${label}". Đừng buồn nhé, hãy thử lại ở lượt sau để gỡ gạc gấp đôi nha!`,
    FREE_SPIN: (spins: number) =>
      `Tuyệt cú mèo! Bạn vừa nhận thêm +${spins || 1} lượt quay miễn phí để tiếp tục săn quà!`,
    GIFT: (label: string) =>
      `Chúc mừng bạn đã quay trúng phần quà đặc biệt "${label}"! Hãy gặp thầy cô để nhận quà nhé!`,
    LUCK: "Đừng nản lòng nhé! Vận may lớn đang chờ bạn ở những lượt quay tiếp theo đó!",
  },
} as const;

export type PrizeModalButtonVariant =
  | "yellow"
  | "green"
  | "blue"
  | "purple"
  | "orange";

export interface WheelPrizeModalTheme {
  isLuck: boolean;
  isDeduct: boolean;
  isFreeSpin: boolean;
  isGift: boolean;
  isCoin: boolean;
  badgeText: string;
  badgeEmoji: string;
  descriptionText: string;
  buttonText: string;
  buttonVariant: PrizeModalButtonVariant;
  imageUrl: string;
  // Tokens giao diện mịn màng & màu sắc tương phản cao
  modalBorder: string;
  modalShadow: string;
  modalBg: string;
  auraColor: string;
  badgeBg: string;
  badgeBorder: string;
  badgeTextColor: string;
  titleColor: string;
  descColor: string;
  closeBtnClasses: string;
  sparkleColor: string;
}

/**
 * Trả về toàn bộ thông điệp, hình ảnh và hệ thống màu sắc theo chủ đề của từng phần thưởng
 */
export function getWheelPrizeModalContent(prize: {
  prize_type: string;
  label: string;
  reward_coins?: number;
  reward_free_spins?: number;
}): WheelPrizeModalTheme {
  const isLuck = prize.prize_type === WHEEL_PRIZE_TYPES.LUCK;
  const isDeduct =
    prize.prize_type === WHEEL_PRIZE_TYPES.DEDUCT_COIN ||
    (typeof prize.reward_coins === "number" && prize.reward_coins < 0);
  const isFreeSpin =
    prize.prize_type === WHEEL_PRIZE_TYPES.FREE_SPIN ||
    (typeof prize.reward_free_spins === "number" &&
      prize.reward_free_spins > 0);
  const isGift = prize.prize_type === WHEEL_PRIZE_TYPES.GIFT;

  // 1. Phân loại TRỪ XU (Deduct Coin) - Hồng dâu tây dịu mắt, ấm áp an ủi
  if (isDeduct) {
    return {
      isLuck: false,
      isDeduct: true,
      isFreeSpin: false,
      isGift: false,
      isCoin: false,
      badgeText: WHEEL_PRIZE_MODAL_TEXTS.BADGE.DEDUCT,
      badgeEmoji: "😿",
      descriptionText: WHEEL_PRIZE_MODAL_TEXTS.DESCRIPTION.DEDUCT(prize.label),
      buttonText: WHEEL_PRIZE_MODAL_TEXTS.BUTTON.DEDUCT,
      buttonVariant: "yellow",
      imageUrl: getWheelPrizeImageUrl(WHEEL_PRIZE_TYPES.DEDUCT_COIN),
      modalBorder: "border-[#FDA4AF]",
      modalShadow:
        "shadow-[0_24px_60px_rgba(244,63,94,0.22),inset_0_2px_4px_rgba(255,255,255,0.95)]",
      modalBg: "bg-gradient-to-b from-[#FFF5F7] via-[#FFEBF0] to-[#FFE2E8]",
      auraColor: "bg-rose-300/35",
      badgeBg: "bg-rose-100/90",
      badgeBorder: "border-rose-300",
      badgeTextColor: "text-rose-700",
      titleColor: "text-[#881337]",
      descColor: "text-rose-950/80",
      closeBtnClasses:
        "bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300/70",
      sparkleColor: "text-rose-400",
    };
  }

  // 2. Phân loại LƯỢT QUAY MIỄN PHÍ (Free Spin) - Xanh da trời trong vắt, hào hứng
  if (isFreeSpin) {
    return {
      isLuck: false,
      isDeduct: false,
      isFreeSpin: true,
      isGift: false,
      isCoin: false,
      badgeText: WHEEL_PRIZE_MODAL_TEXTS.BADGE.FREE_SPIN,
      badgeEmoji: "🎟️",
      descriptionText: WHEEL_PRIZE_MODAL_TEXTS.DESCRIPTION.FREE_SPIN(
        prize.reward_free_spins || 1
      ),
      buttonText: WHEEL_PRIZE_MODAL_TEXTS.BUTTON.FREE_SPIN,
      buttonVariant: "blue",
      imageUrl: getWheelPrizeImageUrl(WHEEL_PRIZE_TYPES.FREE_SPIN),
      modalBorder: "border-[#7DD3FC]",
      modalShadow:
        "shadow-[0_24px_60px_rgba(14,165,233,0.25),inset_0_2px_4px_rgba(255,255,255,0.95)]",
      modalBg: "bg-gradient-to-b from-[#F0F9FF] via-[#E0F2FE] to-[#BAE6FD]",
      auraColor: "bg-sky-400/30",
      badgeBg: "bg-sky-100/90",
      badgeBorder: "border-sky-300",
      badgeTextColor: "text-sky-700",
      titleColor: "text-[#0C4A6E]",
      descColor: "text-sky-950/80",
      closeBtnClasses:
        "bg-sky-100 hover:bg-sky-200 text-sky-800 border border-sky-300/70",
      sparkleColor: "text-sky-400",
    };
  }

  // 3. Phân loại CHÚC BẠN MAY MẮN LẦN SAU (Luck) - Xanh bạc hà mát rượi, cỏ 4 lá hy vọng
  if (isLuck) {
    return {
      isLuck: true,
      isDeduct: false,
      isFreeSpin: false,
      isGift: false,
      isCoin: false,
      badgeText: WHEEL_PRIZE_MODAL_TEXTS.BADGE.LUCK,
      badgeEmoji: "🍀",
      descriptionText: WHEEL_PRIZE_MODAL_TEXTS.DESCRIPTION.LUCK,
      buttonText: WHEEL_PRIZE_MODAL_TEXTS.BUTTON.LUCK,
      buttonVariant: "green",
      imageUrl: getWheelPrizeImageUrl(WHEEL_PRIZE_TYPES.LUCK),
      modalBorder: "border-[#6EE7B7]",
      modalShadow:
        "shadow-[0_24px_60px_rgba(16,185,129,0.22),inset_0_2px_4px_rgba(255,255,255,0.95)]",
      modalBg: "bg-gradient-to-b from-[#F2FBF7] via-[#E8F8F0] to-[#DCFCE7]",
      auraColor: "bg-emerald-300/35",
      badgeBg: "bg-emerald-100/90",
      badgeBorder: "border-emerald-300",
      badgeTextColor: "text-emerald-700",
      titleColor: "text-[#064E3B]",
      descColor: "text-emerald-950/80",
      closeBtnClasses:
        "bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300/70",
      sparkleColor: "text-emerald-400",
    };
  }

  // 4. Phân loại HỘP QUÀ THẦN KỲ (Gift) - Tím kẹo ngọt thần tiên, lung linh
  if (isGift) {
    return {
      isLuck: false,
      isDeduct: false,
      isFreeSpin: false,
      isGift: true,
      isCoin: false,
      badgeText: WHEEL_PRIZE_MODAL_TEXTS.BADGE.GIFT,
      badgeEmoji: "🎁",
      descriptionText: WHEEL_PRIZE_MODAL_TEXTS.DESCRIPTION.GIFT(prize.label),
      buttonText: WHEEL_PRIZE_MODAL_TEXTS.BUTTON.GIFT,
      buttonVariant: "purple",
      imageUrl: getWheelPrizeImageUrl(WHEEL_PRIZE_TYPES.GIFT),
      modalBorder: "border-[#D8B4FE]",
      modalShadow:
        "shadow-[0_24px_60px_rgba(168,85,247,0.25),inset_0_2px_4px_rgba(255,255,255,0.95)]",
      modalBg: "bg-gradient-to-b from-[#FAF5FF] via-[#F3E8FF] to-[#E9D5FF]",
      auraColor: "bg-fuchsia-400/35",
      badgeBg: "bg-purple-100/90",
      badgeBorder: "border-purple-300",
      badgeTextColor: "text-purple-700",
      titleColor: "text-[#581C87]",
      descColor: "text-purple-950/80",
      closeBtnClasses:
        "bg-purple-100 hover:bg-purple-200 text-purple-800 border border-purple-300/70",
      sparkleColor: "text-purple-400",
    };
  }

  // 5. Mặc định: CỘNG XU VÀNG (Coin) - Vàng bơ mật ong rực rỡ, ngọt ngào
  return {
    isLuck: false,
    isDeduct: false,
    isFreeSpin: false,
    isGift: false,
    isCoin: true,
    badgeText: WHEEL_PRIZE_MODAL_TEXTS.BADGE.COIN,
    badgeEmoji: "🎉",
    descriptionText: WHEEL_PRIZE_MODAL_TEXTS.DESCRIPTION.COIN(
      prize.reward_coins || 0,
      prize.label
    ),
    buttonText: WHEEL_PRIZE_MODAL_TEXTS.BUTTON.COIN,
    buttonVariant: "yellow",
    imageUrl: getWheelPrizeImageUrl(WHEEL_PRIZE_TYPES.COIN),
    modalBorder: "border-[#FCD34D]",
    modalShadow:
      "shadow-[0_24px_60px_rgba(245,158,11,0.3),inset_0_2px_4px_rgba(255,255,255,0.95)]",
    modalBg: "bg-gradient-to-b from-[#FFFDF2] via-[#FFF9E6] to-[#FEF3C7]",
    auraColor: "bg-amber-400/35",
    badgeBg: "bg-amber-100/90",
    badgeBorder: "border-amber-300",
    badgeTextColor: "text-[#B45309]",
    titleColor: "text-[#78350F]",
    descColor: "text-amber-950/80",
    closeBtnClasses:
      "bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300/70",
    sparkleColor: "text-amber-400",
  };
}
