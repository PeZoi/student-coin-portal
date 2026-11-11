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

  /** Lý do mặc định khi giáo viên thưởng xu */
  DEFAULT_ADD: "Thưởng xu học sinh",

  /** Lý do mặc định khi giáo viên khấu trừ xu */
  DEFAULT_DEDUCT: "Khấu trừ xu",

  /** Lý do mặc định khi thưởng lượt quay */
  DEFAULT_SPIN_ADD: "Thưởng lượt quay may mắn vì thành tích tốt",

  /** Lý do mặc định khi trừ lượt quay */
  DEFAULT_SPIN_DEDUCT: "Khấu trừ lượt quay may mắn",
} as const;

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


