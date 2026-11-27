export interface AuthSecurityConfig {
  max_failed_attempts: number;
  lockout_minutes: number;
  auto_reset_on_success: boolean;
}

export interface WheelSettingConfig {
  spin_cost: number;
  allow_free_spin: boolean;
}

export interface ExchangeSettingConfig {
  min_exchange_coins: number;
  step_coins: number;
  vnd_per_step: number;
  max_spin_gift_vnd: number;
  is_exchange_window_enabled: boolean;
  exchange_open_day: number;
  exchange_close_day: number;
}

export interface MonthlyRewardSettingConfig {
  top1_bonus_coins: number;
  top2_bonus_coins: number;
  top3_bonus_coins: number;
  progress_reward_mode: "all_qualifying" | "top_rank_only";
}

export interface MaintenanceSettingConfig {
  is_maintenance_mode: boolean;
  maintenance_message: string;
}

/**
 * Toàn bộ cấu hình hệ thống công khai trả về cho client
 */
export interface SystemPublicConfigs {
  auth_security: AuthSecurityConfig;
  wheel_setting: WheelSettingConfig;
  exchange_setting: ExchangeSettingConfig;
  monthly_reward_setting: MonthlyRewardSettingConfig;
  maintenance_setting: MaintenanceSettingConfig;
  [key: string]: unknown;
}
