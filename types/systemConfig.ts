export interface AuthSecurityConfig {
  max_failed_attempts: number;
  lockout_minutes: number;
}

export interface WheelSettingConfig {
  spin_cost: number;
  allow_free_spin: boolean;
}

export interface ExchangeSettingConfig {
  min_exchange_coins: number;
  step_coins: number;
  vnd_per_step: number;
}

export interface MonthlyRewardSettingConfig {
  top1_bonus_coins: number;
  top2_bonus_coins: number;
  top3_bonus_coins: number;
  progress_reward_mode: "all_qualifying" | "top_rank_only";
}

/**
 * Toàn bộ cấu hình hệ thống công khai trả về cho client
 */
export interface SystemPublicConfigs {
  auth_security: AuthSecurityConfig;
  wheel_setting: WheelSettingConfig;
  exchange_setting: ExchangeSettingConfig;
  monthly_reward_setting: MonthlyRewardSettingConfig;
  [key: string]: unknown;
}
