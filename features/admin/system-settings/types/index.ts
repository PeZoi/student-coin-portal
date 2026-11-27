/**
 * ==============================================================================
 * TYPES: ADMIN SYSTEM SETTINGS
 * ==============================================================================
 */

export type SystemSettingsTabId =
  | "exchange"
  | "ai"
  | "security"
  | "archive"
  | "maintenance";

export type AiThinkingMode = "off" | "low" | "high";

export interface SecuritySettingsFormState {
  maxFailedAttempts: number;
  lockoutMinutes: number;
  autoResetOnSuccess: boolean;
  allowTeacherPinReset: boolean;
}

export interface ExchangeSettingsFormState {
  stepCoins: number;
  vndPerStep: number;
  minExchangeCoins: number;
  maxSpinGiftVnd: number;
  isExchangeWindowEnabled: boolean;
  exchangeOpenDay: number;
  exchangeCloseDay: number;
}

export interface SubmissionArchiveSettingsFormState {
  lateSubmissionGraceDays: number;
  maxUploadFileSizeMb: number;
  autoPurgeOldMedia: boolean;
  mediaRetentionDays: number;
  authLogsDays: number;
  auditLogsDays: number;
  readNotificationsDays: number;
}

export interface AiGradingSettingsFormState {
  baseUrl: string;
  apiKey: string;
  modelName: string;
  thinkingMode: AiThinkingMode;
  timeoutSeconds: number;
  majorErrorPenalty: number;
  minorErrorPenalty: number;
  feedbackStyleGuide: string;
}

export interface MaintenanceSettingsFormState {
  isMaintenanceMode: boolean;
  maintenanceMessage: string;
}

export interface SystemSettingsFormState {
  security: SecuritySettingsFormState;
  exchange: ExchangeSettingsFormState;
  submissionArchive: SubmissionArchiveSettingsFormState;
  aiGrading: AiGradingSettingsFormState;
  maintenance: MaintenanceSettingsFormState;
}

export interface SystemSettingsPayload {
  settings: SystemSettingsFormState;
  hasStoredAiApiKey: boolean;
  updatedAt: string | null;
}

export interface TestAiConnectionPayload {
  baseUrl: string;
  apiKey: string;
  modelName: string;
  timeoutSeconds?: number;
}

export interface TestAiConnectionResult {
  connected: boolean;
  latencyMs: number;
  model: string;
  message: string;
}
