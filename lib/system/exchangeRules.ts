import {
  COIN_STEP,
  MAX_SPIN_GIFT_VND,
  REWARD_CONFIG,
  VND_PER_STEP,
} from "@/constants/rewards";
import { getCurrentVietnamDayOfMonth } from "@/lib/date";
import { ExchangeSettingConfig } from "@/types/systemConfig";

export const DEFAULT_EXCHANGE_SETTING_CONFIG: ExchangeSettingConfig = {
  step_coins: COIN_STEP,
  vnd_per_step: VND_PER_STEP,
  min_exchange_coins: REWARD_CONFIG.MIN_EXCHANGE_COINS,
  max_spin_gift_vnd: MAX_SPIN_GIFT_VND,
  is_exchange_window_enabled: true,
  exchange_open_day: 25,
  exchange_close_day: 31,
};

function clampDayOfMonth(day: unknown, fallback: number): number {
  if (typeof day === "number" && Number.isFinite(day)) {
    const rounded = Math.trunc(day);
    if (rounded >= 1 && rounded <= 31) {
      return rounded;
    }
  }
  return fallback;
}

/**
 * Chuẩn hóa cấu hình `exchange_setting` từ DB hoặc Store, đảm bảo luôn đủ trường hợp lệ
 */
export function normalizeExchangeConfig(
  rawConfig?: Partial<ExchangeSettingConfig> | null
): ExchangeSettingConfig {
  const step_coins =
    typeof rawConfig?.step_coins === "number" && rawConfig.step_coins > 0
      ? Math.trunc(rawConfig.step_coins)
      : DEFAULT_EXCHANGE_SETTING_CONFIG.step_coins;

  const vnd_per_step =
    typeof rawConfig?.vnd_per_step === "number" && rawConfig.vnd_per_step > 0
      ? Math.trunc(rawConfig.vnd_per_step)
      : DEFAULT_EXCHANGE_SETTING_CONFIG.vnd_per_step;

  const min_exchange_coins =
    typeof rawConfig?.min_exchange_coins === "number" &&
    rawConfig.min_exchange_coins > 0
      ? Math.trunc(rawConfig.min_exchange_coins)
      : step_coins;

  const max_spin_gift_vnd =
    typeof rawConfig?.max_spin_gift_vnd === "number" &&
    rawConfig.max_spin_gift_vnd > 0
      ? Math.trunc(rawConfig.max_spin_gift_vnd)
      : DEFAULT_EXCHANGE_SETTING_CONFIG.max_spin_gift_vnd;

  const is_exchange_window_enabled =
    typeof rawConfig?.is_exchange_window_enabled === "boolean"
      ? rawConfig.is_exchange_window_enabled
      : DEFAULT_EXCHANGE_SETTING_CONFIG.is_exchange_window_enabled;

  const exchange_open_day = clampDayOfMonth(
    rawConfig?.exchange_open_day,
    DEFAULT_EXCHANGE_SETTING_CONFIG.exchange_open_day
  );

  const exchange_close_day = clampDayOfMonth(
    rawConfig?.exchange_close_day,
    DEFAULT_EXCHANGE_SETTING_CONFIG.exchange_close_day
  );

  return {
    step_coins,
    vnd_per_step,
    min_exchange_coins,
    max_spin_gift_vnd,
    is_exchange_window_enabled,
    exchange_open_day,
    exchange_close_day,
  };
}

/**
 * Kiểm tra hôm nay (theo giờ Việt Nam) có nằm trong khung ngày mở cổng đổi quà hay không
 * - Hỗ trợ cả khung ngày bình thường (vd: Ngày 25 -> 31) và khung vắt qua tháng (vd: Ngày 28 -> 5)
 */
export function isWithinExchangeWindow(
  config: ExchangeSettingConfig,
  currentDay: number = getCurrentVietnamDayOfMonth()
): boolean {
  if (!config.is_exchange_window_enabled) {
    return true;
  }

  const { exchange_open_day: openDay, exchange_close_day: closeDay } = config;
  if (openDay <= closeDay) {
    return currentDay >= openDay && currentDay <= closeDay;
  }
  return currentDay >= openDay || currentDay <= closeDay;
}

/**
 * Tạo nhãn hiển thị gọn gàng cho lịch mở cổng đổi quà
 */
export function formatExchangeWindowLabel(
  config: ExchangeSettingConfig
): string {
  if (!config.is_exchange_window_enabled) {
    return "Mở quanh tháng";
  }

  if (config.exchange_open_day === config.exchange_close_day) {
    return `Ngày ${config.exchange_open_day} hàng tháng`;
  }

  return `Ngày ${config.exchange_open_day} – Ngày ${config.exchange_close_day} hàng tháng`;
}

/**
 * Mốc xu khởi đầu hợp lệ khi đổi tiền mặt:
 * Vừa >= min_exchange_coins, vừa là bội số của step_coins
 */
export function calculateFirstValidCashCoins(
  config: ExchangeSettingConfig
): number {
  const step = Math.max(1, config.step_coins);
  const min = Math.max(1, config.min_exchange_coins);
  return Math.ceil(min / step) * step;
}

/**
 * Số xu tương đương của Hộp quà Vòng quay theo tỷ giá hiện hành
 */
export function calculateSpinGiftEquivalentCoins(
  config: ExchangeSettingConfig
): number {
  if (config.vnd_per_step <= 0) {
    return REWARD_CONFIG.SPIN_GIFT_EQUIVALENT_COINS;
  }
  return Math.ceil(
    (config.max_spin_gift_vnd * config.step_coins) / config.vnd_per_step
  );
}

export interface ExchangeEligibilityResult {
  isWindowOpen: boolean;
  hasEnoughCoins: boolean;
  canExchange: boolean;
  missingCoins: number;
  windowLabel: string;
  blockReason: string | null;
}

/**
 * Đánh giá toàn diện điều kiện mở cổng đổi quà của học sinh
 */
export function evaluateExchangeEligibility(
  config: ExchangeSettingConfig,
  currentCoins: number,
  currentDay: number = getCurrentVietnamDayOfMonth()
): ExchangeEligibilityResult {
  const isWindowOpen = isWithinExchangeWindow(config, currentDay);
  const hasEnoughCoins = currentCoins >= config.min_exchange_coins;
  const canExchange = isWindowOpen && hasEnoughCoins;
  const missingCoins = Math.max(0, config.min_exchange_coins - currentCoins);
  const windowLabel = formatExchangeWindowLabel(config);

  let blockReason: string | null = null;
  if (!isWindowOpen) {
    blockReason = `Cổng đổi quà hiện đang đóng. Con hãy quay lại vào ${windowLabel} nhé!`;
  } else if (!hasEnoughCoins) {
    blockReason = `Con cần tích thêm ${missingCoins.toLocaleString("vi-VN")} xu nữa để đạt mốc tối thiểu ${config.min_exchange_coins.toLocaleString("vi-VN")} xu mở cổng đổi quà nhé!`;
  }

  return {
    isWindowOpen,
    hasEnoughCoins,
    canExchange,
    missingCoins,
    windowLabel,
    blockReason,
  };
}
