import { DEFAULT_AUTH_SECURITY_CONFIG } from "@/constants/system";
import { REWARD_CONFIG } from "@/constants/rewards";
import { TeacherSelectOption } from "@/components/ui/TeacherSelect";
import { SystemSettingsFormState, SystemSettingsPayload } from "./types";

/**
 * Các khóa lưu trữ trong bảng `public.system_settings`
 */
export const SYSTEM_SETTING_DB_KEYS = {
  AUTH_SECURITY: "auth_security",
  EXCHANGE_SETTING: "exchange_setting",
  DATA_RETENTION_SETTING: "data_retention_setting",
  AI_SYSTEM_SETTING: "ai_system_setting",
  MAINTENANCE_SETTING: "maintenance_setting",
} as const;

export const ALL_ADMIN_SETTING_DB_KEYS: readonly string[] = [
  SYSTEM_SETTING_DB_KEYS.AUTH_SECURITY,
  SYSTEM_SETTING_DB_KEYS.EXCHANGE_SETTING,
  SYSTEM_SETTING_DB_KEYS.DATA_RETENTION_SETTING,
  SYSTEM_SETTING_DB_KEYS.AI_SYSTEM_SETTING,
  SYSTEM_SETTING_DB_KEYS.MAINTENANCE_SETTING,
];

/**
 * Giá trị cấu hình mặc định chuẩn của hệ thống (Fallback an toàn & dùng cho nút Đặt lại mặc định)
 */
export const DEFAULT_SYSTEM_SETTINGS: SystemSettingsFormState = {
  security: {
    maxFailedAttempts: DEFAULT_AUTH_SECURITY_CONFIG.max_failed_attempts,
    lockoutMinutes: DEFAULT_AUTH_SECURITY_CONFIG.lockout_minutes,
    autoResetOnSuccess: DEFAULT_AUTH_SECURITY_CONFIG.auto_reset_on_success,
  },
  exchange: {
    stepCoins: REWARD_CONFIG.DEFAULT_COIN_STEP,
    vndPerStep: REWARD_CONFIG.DEFAULT_VND_PER_STEP,
    minExchangeCoins: REWARD_CONFIG.MIN_EXCHANGE_COINS,
    maxSpinGiftVnd: REWARD_CONFIG.MAX_SPIN_GIFT_VND,
    isExchangeWindowEnabled: true,
    exchangeOpenDay: 25,
    exchangeCloseDay: 31,
  },
  submissionArchive: {
    lateSubmissionGraceDays: 7,
    maxUploadFileSizeMb: 5,
    autoPurgeOldMedia: true,
    mediaRetentionDays: 60,
    authLogsDays: 90,
    auditLogsDays: 365,
    readNotificationsDays: 60,
  },
  aiGrading: {
    baseUrl: "https://api.xah.io/v1",
    apiKey: "",
    modelName: "gpt-4o",
    thinkingMode: "off",
    timeoutSeconds: 60,
    majorErrorPenalty: 1,
    minorErrorPenalty: 0.5,
    feedbackStyleGuide:
      "Nhận xét bằng giọng văn ấm áp, gần gũi, xưng cô - con. Luôn khen ngợi điểm làm tốt trước khi góp ý nhẹ nhàng những chỗ cần cẩn thận hơn.",
  },
  maintenance: {
    isMaintenanceMode: false,
    maintenanceMessage:
      "Hệ thống đang tạm nghỉ để tổng kết xu cuối tháng và nâng cấp tính năng mới. Các con vui lòng quay lại sau nhé!",
  },
};

export const DEFAULT_SYSTEM_SETTINGS_PAYLOAD: SystemSettingsPayload = {
  settings: DEFAULT_SYSTEM_SETTINGS,
  hasStoredAiApiKey: false,
  updatedAt: null,
};

export const DAY_OF_MONTH_OPTIONS: TeacherSelectOption[] = Array.from(
  { length: 31 },
  (_, index) => {
    const day = index + 1;
    return {
      label: day === 31 ? "Ngày 31 (Cuối tháng)" : `Ngày ${day} hàng tháng`,
      triggerLabel: `Ngày ${day}`,
      value: String(day),
    };
  }
);

export const THINKING_MODE_OPTIONS: TeacherSelectOption[] = [
  {
    label: "Nhanh (Phản hồi tức thì, phù hợp bài tập ngắn)",
    triggerLabel: "Nhanh",
    value: "off",
  },
  {
    label: "Cân bằng (Phân tích kỹ vừa phải, khuyên dùng)",
    triggerLabel: "Cân bằng",
    value: "low",
  },
  {
    label: "Chuyên sâu (Đọc kỹ bài văn, phiếu bài tập dài)",
    triggerLabel: "Chuyên sâu",
    value: "high",
  },
];
