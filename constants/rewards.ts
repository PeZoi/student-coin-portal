/**
 * ==============================================================================
 * REWARDS & COIN EXCHANGE CONSTANTS
 * ==============================================================================
 */

export const REWARD_CONFIG = {
  /** Bước quy đổi xu mặc định (Ví dụ: 5.000 xu) */
  DEFAULT_COIN_STEP: 5000,
  /** Số tiền VND tương ứng với mỗi bước quy đổi (Ví dụ: 25.000 VNĐ) */
  DEFAULT_VND_PER_STEP: 25000,
  /** Số xu tối thiểu để có thể gửi yêu cầu đổi thưởng */
  MIN_EXCHANGE_COINS: 5000,
} as const;

export const COIN_STEP = REWARD_CONFIG.DEFAULT_COIN_STEP;
export const VND_PER_STEP = REWARD_CONFIG.DEFAULT_VND_PER_STEP;
