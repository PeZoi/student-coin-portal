/**
 * ==============================================================================
 * COIN & TRANSACTION CONSTANTS
 * - Tập trung định nghĩa các hằng số, loại giao dịch và mô tả chuẩn cho sổ cái xu (coin_transactions).
 * - Khớp 100% với CHECK constraints trong cơ sở dữ liệu PostgreSQL.
 * ==============================================================================
 */

/**
 * Các loại giao dịch xu (Khớp với CHECK constraint coin_transactions_tx_type_check)
 */
export const CoinTxType = {
  MANUAL_ADJUST: "MANUAL_ADJUST",
  SPEAKING_REWARD: "SPEAKING_REWARD",
  MISSION_REWARD: "MISSION_REWARD",
  WHEEL_SPIN_FEE: "WHEEL_SPIN_FEE",
  WHEEL_PRIZE: "WHEEL_PRIZE",
  EXCHANGE_HOLD: "EXCHANGE_HOLD",
  EXCHANGE_REFUND: "EXCHANGE_REFUND",
  EXCHANGE_FULFILLED: "EXCHANGE_FULFILLED",
  TOP_RANK_BONUS: "TOP_RANK_BONUS",
  TOP_PROGRESS_BONUS: "TOP_PROGRESS_BONUS",
} as const;

export type CoinTxTypeValue = (typeof CoinTxType)[keyof typeof CoinTxType];

/**
 * Các loại thực thể tham chiếu (Khớp với CHECK constraint coin_transactions_reference_type_check)
 */
export const CoinReferenceType = {
  MANUAL_ADJUST: "manual_adjust",
  HOMEWORK_SUBMISSIONS: "homework_submissions",
  WHEEL_SPINS: "wheel_spins",
  MONTHLY_EXCHANGE_REQUESTS: "monthly_exchange_requests",
  MONTHLY_LEADERBOARD: "monthly_leaderboard",
} as const;

export type CoinReferenceTypeValue =
  (typeof CoinReferenceType)[keyof typeof CoinReferenceType];

/**
 * Các mẫu mô tả tiêu chuẩn cho giao dịch xu (Standard Coin Transaction Descriptions)
 */
export const COIN_TX_DESCRIPTIONS = {
  /** Tặng xu khởi tạo khi vừa tạo hồ sơ học sinh mới */
  INITIAL_GRANT: "Tặng xu khởi tạo khi tạo hồ sơ học sinh",

  /** Đặt lại toàn bộ số dư xu về 0 khi chuyển lớp lẻ và chọn reset tiến trình */
  RESET_PROGRESS_SINGLE:
    "Đặt lại số dư xu về 0 khi chuyển lớp và reset tiến trình",

  /** Đặt lại toàn bộ số dư xu về 0 khi chuyển lớp hàng loạt và chọn reset tiến trình */
  RESET_PROGRESS_BATCH:
    "Đặt lại số dư xu về 0 khi chuyển lớp hàng loạt và reset tiến trình",

  /** Thưởng phát biểu xây dựng bài */
  SPEAKING_REWARD: "Thưởng phát biểu xây dựng bài",

  /** Thưởng làm bài tập chăm chỉ */
  HOMEWORK_REWARD: "Thưởng làm bài tập chăm chỉ và đạt điểm cao",

  /** Thưởng thái độ học tập tích cực */
  POSITIVE_ATTITUDE: "Thưởng thái độ học tập tích cực",

  /** Lý do mặc định khi giáo viên thưởng xu */
  DEFAULT_ADD: "Thưởng xu học sinh",

  /** Lý do mặc định khi giáo viên khấu trừ xu */
  DEFAULT_DEDUCT: "Khấu trừ xu",

  /** Lý do mặc định khi thưởng lượt quay */
  DEFAULT_SPIN_ADD: "Thưởng lượt quay may mắn vì thành tích tốt",

  /** Lý do mặc định khi trừ lượt quay */
  DEFAULT_SPIN_DEDUCT: "Khấu trừ lượt quay may mắn",

  /** Phí quay Vòng Quay May Mắn */
  WHEEL_SPIN_FEE: "Phí quay Vòng Quay May Mắn",
} as const;

/**
 * ==============================================================================
 * CẤU HÌNH CÁC NGUỒN XU / TRANSACTION SOURCES (Single Source of Truth)
 * - Quản lý tập trung: mã nguồn, tên nhãn, icon đại diện, màu sắc visual.
 * - Hỗ trợ nhận diện các nguồn: Làm bài tập, Quay thưởng, Thưởng phát biểu,
 *   Điều chỉnh thủ công, Đổi quà Heo Đất, Đua top, Phí quay...
 * ==============================================================================
 */

export const CoinSourceKey = {
  HOMEWORK: "HOMEWORK", // Làm bài tập / Nhiệm vụ
  WHEEL: "WHEEL", // Trúng thưởng vòng quay
  SPEAKING: "SPEAKING", // Thưởng phát biểu xây dựng bài
  MANUAL: "MANUAL", // Điều chỉnh thủ công
  EXCHANGE: "EXCHANGE", // Đổi quà Heo Đất
  LEADERBOARD: "LEADERBOARD", // Đua top bảng xếp hạng
  SPIN_FEE: "SPIN_FEE", // Phí quay vòng quay
  OTHER: "OTHER", // Khác / Hệ thống
} as const;

export type CoinSourceKeyValue =
  (typeof CoinSourceKey)[keyof typeof CoinSourceKey];

export interface CoinSourceItemConfig {
  key: CoinSourceKeyValue;
  label: string;
  shortLabel: string;
  iconName:
    | "BookOpenCheck"
    | "Sparkles"
    | "Mic"
    | "SlidersHorizontal"
    | "Gift"
    | "Trophy"
    | "Dices"
    | "Coins";
  iconBg: string;
  iconColor: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  defaultActor: string;
}

export const COIN_SOURCE_CONFIG: Record<CoinSourceKeyValue, CoinSourceItemConfig> =
  {
    [CoinSourceKey.HOMEWORK]: {
      key: CoinSourceKey.HOMEWORK,
      label: "Làm bài tập",
      shortLabel: "Bài tập",
      iconName: "BookOpenCheck",
      iconBg: "bg-emerald-50 text-emerald-600",
      iconColor: "text-emerald-600",
      badgeBg: "bg-emerald-50/80",
      badgeBorder: "border-emerald-200",
      badgeText: "text-emerald-700",
      defaultActor: "Hệ thống bài tập",
    },
    [CoinSourceKey.WHEEL]: {
      key: CoinSourceKey.WHEEL,
      label: "Quay thưởng",
      shortLabel: "Vòng quay",
      iconName: "Sparkles",
      iconBg: "bg-amber-50 text-amber-600",
      iconColor: "text-amber-600",
      badgeBg: "bg-amber-50/80",
      badgeBorder: "border-amber-200",
      badgeText: "text-amber-700",
      defaultActor: "Vòng quay",
    },
    [CoinSourceKey.SPEAKING]: {
      key: CoinSourceKey.SPEAKING,
      label: "Thưởng phát biểu",
      shortLabel: "Phát biểu",
      iconName: "Mic",
      iconBg: "bg-orange-50 text-orange-600",
      iconColor: "text-orange-600",
      badgeBg: "bg-orange-50/80",
      badgeBorder: "border-orange-200",
      badgeText: "text-orange-700",
      defaultActor: "Giáo viên đứng lớp",
    },
    [CoinSourceKey.MANUAL]: {
      key: CoinSourceKey.MANUAL,
      label: "Điều chỉnh thủ công",
      shortLabel: "Điều chỉnh",
      iconName: "SlidersHorizontal",
      iconBg: "bg-sky-50 text-sky-600",
      iconColor: "text-sky-600",
      badgeBg: "bg-sky-50/80",
      badgeBorder: "border-sky-200",
      badgeText: "text-sky-700",
      defaultActor: "Giáo viên",
    },
    [CoinSourceKey.EXCHANGE]: {
      key: CoinSourceKey.EXCHANGE,
      label: "Đổi quà Heo Đất",
      shortLabel: "Đổi quà",
      iconName: "Gift",
      iconBg: "bg-indigo-50 text-indigo-600",
      iconColor: "text-indigo-600",
      badgeBg: "bg-indigo-50/80",
      badgeBorder: "border-indigo-200",
      badgeText: "text-indigo-700",
      defaultActor: "Cửa hàng Heo Đất",
    },
    [CoinSourceKey.LEADERBOARD]: {
      key: CoinSourceKey.LEADERBOARD,
      label: "Thưởng đua top",
      shortLabel: "Đua top",
      iconName: "Trophy",
      iconBg: "bg-yellow-50 text-yellow-600",
      iconColor: "text-yellow-600",
      badgeBg: "bg-yellow-50/80",
      badgeBorder: "border-yellow-200",
      badgeText: "text-yellow-700",
      defaultActor: "Bảng xếp hạng",
    },
    [CoinSourceKey.SPIN_FEE]: {
      key: CoinSourceKey.SPIN_FEE,
      label: "Phí quay",
      shortLabel: "Phí quay",
      iconName: "Dices",
      iconBg: "bg-purple-50 text-purple-600",
      iconColor: "text-purple-600",
      badgeBg: "bg-purple-50/80",
      badgeBorder: "border-purple-200",
      badgeText: "text-purple-700",
      defaultActor: "Vòng quay",
    },
    [CoinSourceKey.OTHER]: {
      key: CoinSourceKey.OTHER,
      label: "Giao dịch xu",
      shortLabel: "Giao dịch",
      iconName: "Coins",
      iconBg: "bg-slate-50 text-slate-600",
      iconColor: "text-slate-600",
      badgeBg: "bg-slate-50/80",
      badgeBorder: "border-slate-200",
      badgeText: "text-slate-700",
      defaultActor: "Hệ thống",
    },
  };

/**
 * Hàm phân loại nguồn xu thuần túy dựa trên tx_type từ CSDL (Không kiểm tra hay phụ thuộc vào chuỗi description)
 * @param txType Cột tx_type trong bảng coin_transactions
 */
export function resolveCoinSourceKey(txType: string): CoinSourceKeyValue {
  switch (txType) {
    case CoinTxType.SPEAKING_REWARD:
      return CoinSourceKey.SPEAKING;

    case CoinTxType.MANUAL_ADJUST:
      return CoinSourceKey.MANUAL;

    case CoinTxType.MISSION_REWARD:
      return CoinSourceKey.HOMEWORK;

    case CoinTxType.WHEEL_PRIZE:
      return CoinSourceKey.WHEEL;

    case CoinTxType.WHEEL_SPIN_FEE:
      return CoinSourceKey.SPIN_FEE;

    case CoinTxType.EXCHANGE_HOLD:
    case CoinTxType.EXCHANGE_REFUND:
    case CoinTxType.EXCHANGE_FULFILLED:
      return CoinSourceKey.EXCHANGE;

    case CoinTxType.TOP_RANK_BONUS:
    case CoinTxType.TOP_PROGRESS_BONUS:
      return CoinSourceKey.LEADERBOARD;

    default:
      return CoinSourceKey.OTHER;
  }
}

/**
 * Lấy cấu hình đầy đủ của một giao dịch xu thuần túy dựa trên tx_type
 */
export function getCoinSourceConfig(txType: string): CoinSourceItemConfig {
  const sourceKey = resolveCoinSourceKey(txType);
  return COIN_SOURCE_CONFIG[sourceKey] || COIN_SOURCE_CONFIG[CoinSourceKey.OTHER];
}

/**
 * Helper tạo chuỗi mô tả hoàn chỉnh cho giao dịch xu có kèm lượt quay (nếu có)
 * @param reason Lý do điều chỉnh chính
 * @param spinsChange Số lượng lượt quay biến động (+ hoặc -)
 */
export function formatCoinTxDescription(
  reason: string,
  spinsChange?: number
): string {
  const baseReason = reason.trim() || COIN_TX_DESCRIPTIONS.DEFAULT_ADD;
  if (!spinsChange || spinsChange === 0) {
    return baseReason;
  }
  const spinText = spinsChange > 0 ? `+${spinsChange}` : `${spinsChange}`;
  return `${baseReason} (Kèm ${spinText} lượt quay)`;
}

/**
 * Helper tạo mô tả chuẩn cho giao dịch nhận thưởng / phạt xu từ Vòng Quay May Mắn
 */
export function formatWheelPrizeTxDescription(
  prizeLabel: string,
  rewardCoins: number
): string {
  const cleanLabel = prizeLabel.trim();
  if (rewardCoins > 0) {
    return `Trúng thưởng Vòng Quay May Mắn: ${cleanLabel}`;
  }
  if (rewardCoins < 0) {
    return `Bị trừ xu từ Vòng Quay May Mắn: ${cleanLabel}`;
  }
  return `Kết quả Vòng Quay May Mắn: ${cleanLabel}`;
}



