import { supabase } from "@/lib/supabase/db";
import { invalidateSystemSettingCache } from "@/lib/system/serverConfig";
import {
  ALL_ADMIN_SETTING_DB_KEYS,
  DEFAULT_SYSTEM_SETTINGS,
  DEFAULT_SYSTEM_SETTINGS_PAYLOAD,
  SYSTEM_SETTING_DB_KEYS,
} from "../constants";
import {
  AiThinkingMode,
  SystemSettingsFormState,
  SystemSettingsPayload,
  TestAiConnectionPayload,
  TestAiConnectionResult,
} from "../types";

interface SystemSettingRow {
  key: string;
  value: Record<string, unknown> | null;
  updated_at: string | null;
}

function asRecord(val: unknown): Record<string, unknown> {
  if (val && typeof val === "object" && !Array.isArray(val)) {
    return val as Record<string, unknown>;
  }
  return {};
}

function readNumber(
  obj: Record<string, unknown>,
  key: string,
  fallback: number
): number {
  const val = obj[key];
  return typeof val === "number" && Number.isFinite(val) ? val : fallback;
}

function readBoolean(
  obj: Record<string, unknown>,
  key: string,
  fallback: boolean
): boolean {
  const val = obj[key];
  return typeof val === "boolean" ? val : fallback;
}

function readString(
  obj: Record<string, unknown>,
  key: string,
  fallback: string
): string {
  const val = obj[key];
  return typeof val === "string" ? val : fallback;
}

function readThinkingMode(
  obj: Record<string, unknown>,
  key: string,
  fallback: AiThinkingMode
): AiThinkingMode {
  const val = obj[key];
  if (val === "off" || val === "low" || val === "high") {
    return val;
  }
  return fallback;
}

function normalizeAiChatEndpoint(rawUrl: string): string {
  const trimmed = rawUrl.trim().replace(/\/+$/, "");
  if (trimmed.endsWith("/chat/completions")) {
    return trimmed;
  }
  if (trimmed.endsWith("/v1")) {
    return `${trimmed}/chat/completions`;
  }
  return `${trimmed}/v1/chat/completions`;
}

/**
 * Đọc toàn bộ 5 nhóm cấu hình hệ thống trực tiếp từ Supabase trên Server
 * - Dùng trực tiếp trong Server Component (0ms HTTP round-trip) và GET /api/admin/system-settings
 * - Luôn merge an toàn với DEFAULT_SYSTEM_SETTINGS để chống thiếu trường
 * - Không trả nguyên văn chuỗi api_key về client (chỉ trả cờ hasStoredAiApiKey)
 */
export async function getAdminSystemSettingsServer(): Promise<SystemSettingsPayload> {
  try {
    const { data, error } = await supabase
      .from("system_settings")
      .select("key, value, updated_at")
      .in("key", [...ALL_ADMIN_SETTING_DB_KEYS]);

    if (error || !data) {
      if (error) {
        console.error(
          "[SystemSettingsServer] Lỗi đọc system_settings:",
          error.message
        );
      }
      return DEFAULT_SYSTEM_SETTINGS_PAYLOAD;
    }

    const rowMap = new Map<string, SystemSettingRow>();
    let latestUpdatedAt: string | null = null;

    for (const row of data as SystemSettingRow[]) {
      rowMap.set(row.key, row);
      if (
        row.updated_at &&
        (!latestUpdatedAt || row.updated_at > latestUpdatedAt)
      ) {
        latestUpdatedAt = row.updated_at;
      }
    }

    const authRaw = asRecord(
      rowMap.get(SYSTEM_SETTING_DB_KEYS.AUTH_SECURITY)?.value
    );
    const exchangeRaw = asRecord(
      rowMap.get(SYSTEM_SETTING_DB_KEYS.EXCHANGE_SETTING)?.value
    );
    const retentionRaw = asRecord(
      rowMap.get(SYSTEM_SETTING_DB_KEYS.DATA_RETENTION_SETTING)?.value
    );
    const aiRaw = asRecord(
      rowMap.get(SYSTEM_SETTING_DB_KEYS.AI_SYSTEM_SETTING)?.value
    );
    const maintenanceRaw = asRecord(
      rowMap.get(SYSTEM_SETTING_DB_KEYS.MAINTENANCE_SETTING)?.value
    );

    const storedApiKey = readString(aiRaw, "api_key", "").trim();

    const settings: SystemSettingsFormState = {
      security: {
        maxFailedAttempts: readNumber(
          authRaw,
          "max_failed_attempts",
          DEFAULT_SYSTEM_SETTINGS.security.maxFailedAttempts
        ),
        lockoutMinutes: readNumber(
          authRaw,
          "lockout_minutes",
          DEFAULT_SYSTEM_SETTINGS.security.lockoutMinutes
        ),
        autoResetOnSuccess: readBoolean(
          authRaw,
          "auto_reset_on_success",
          DEFAULT_SYSTEM_SETTINGS.security.autoResetOnSuccess
        ),
      },
      exchange: {
        stepCoins: readNumber(
          exchangeRaw,
          "step_coins",
          DEFAULT_SYSTEM_SETTINGS.exchange.stepCoins
        ),
        vndPerStep: readNumber(
          exchangeRaw,
          "vnd_per_step",
          DEFAULT_SYSTEM_SETTINGS.exchange.vndPerStep
        ),
        minExchangeCoins: readNumber(
          exchangeRaw,
          "min_exchange_coins",
          DEFAULT_SYSTEM_SETTINGS.exchange.minExchangeCoins
        ),
        maxSpinGiftVnd: readNumber(
          exchangeRaw,
          "max_spin_gift_vnd",
          DEFAULT_SYSTEM_SETTINGS.exchange.maxSpinGiftVnd
        ),
        isExchangeWindowEnabled: readBoolean(
          exchangeRaw,
          "is_exchange_window_enabled",
          DEFAULT_SYSTEM_SETTINGS.exchange.isExchangeWindowEnabled
        ),
        exchangeOpenDay: readNumber(
          exchangeRaw,
          "exchange_open_day",
          DEFAULT_SYSTEM_SETTINGS.exchange.exchangeOpenDay
        ),
        exchangeCloseDay: readNumber(
          exchangeRaw,
          "exchange_close_day",
          DEFAULT_SYSTEM_SETTINGS.exchange.exchangeCloseDay
        ),
      },
      submissionArchive: {
        lateSubmissionGraceDays: readNumber(
          retentionRaw,
          "late_submission_grace_days",
          DEFAULT_SYSTEM_SETTINGS.submissionArchive.lateSubmissionGraceDays
        ),
        maxUploadFileSizeMb: readNumber(
          retentionRaw,
          "max_upload_file_size_mb",
          DEFAULT_SYSTEM_SETTINGS.submissionArchive.maxUploadFileSizeMb
        ),
        autoPurgeOldMedia: readBoolean(
          retentionRaw,
          "auto_cleanup_enabled",
          DEFAULT_SYSTEM_SETTINGS.submissionArchive.autoPurgeOldMedia
        ),
        mediaRetentionDays: readNumber(
          retentionRaw,
          "submission_media_days",
          DEFAULT_SYSTEM_SETTINGS.submissionArchive.mediaRetentionDays
        ),
        authLogsDays: readNumber(
          retentionRaw,
          "auth_logs_days",
          DEFAULT_SYSTEM_SETTINGS.submissionArchive.authLogsDays
        ),
        auditLogsDays: readNumber(
          retentionRaw,
          "audit_logs_days",
          DEFAULT_SYSTEM_SETTINGS.submissionArchive.auditLogsDays
        ),
        readNotificationsDays: readNumber(
          retentionRaw,
          "read_notifications_days",
          DEFAULT_SYSTEM_SETTINGS.submissionArchive.readNotificationsDays
        ),
      },
      aiGrading: {
        baseUrl: readString(
          aiRaw,
          "api_url",
          DEFAULT_SYSTEM_SETTINGS.aiGrading.baseUrl
        ),
        // Không trả nguyên văn api_key về trình duyệt để đảm bảo an toàn
        apiKey: "",
        modelName: readString(
          aiRaw,
          "model_name",
          DEFAULT_SYSTEM_SETTINGS.aiGrading.modelName
        ),
        thinkingMode: readThinkingMode(
          aiRaw,
          "thinking_mode",
          DEFAULT_SYSTEM_SETTINGS.aiGrading.thinkingMode
        ),
        timeoutSeconds: readNumber(
          aiRaw,
          "timeout_seconds",
          DEFAULT_SYSTEM_SETTINGS.aiGrading.timeoutSeconds
        ),
        majorErrorPenalty: readNumber(
          aiRaw,
          "major_error_penalty",
          DEFAULT_SYSTEM_SETTINGS.aiGrading.majorErrorPenalty
        ),
        minorErrorPenalty: readNumber(
          aiRaw,
          "minor_error_penalty",
          DEFAULT_SYSTEM_SETTINGS.aiGrading.minorErrorPenalty
        ),
        feedbackStyleGuide: readString(
          aiRaw,
          "feedback_style_guide",
          DEFAULT_SYSTEM_SETTINGS.aiGrading.feedbackStyleGuide
        ),
      },
      maintenance: {
        isMaintenanceMode: readBoolean(
          maintenanceRaw,
          "is_maintenance_mode",
          DEFAULT_SYSTEM_SETTINGS.maintenance.isMaintenanceMode
        ),
        maintenanceMessage: readString(
          maintenanceRaw,
          "maintenance_message",
          DEFAULT_SYSTEM_SETTINGS.maintenance.maintenanceMessage
        ),
      },
    };

    return {
      settings,
      hasStoredAiApiKey: storedApiKey.length > 0,
      updatedAt: latestUpdatedAt,
    };
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error(
      "[SystemSettingsServer] Lỗi ngoại lệ getAdminSystemSettingsServer:",
      error.message
    );
    return DEFAULT_SYSTEM_SETTINGS_PAYLOAD;
  }
}

/**
 * Lưu đồng bộ toàn bộ 5 nhóm cấu hình vào bảng `public.system_settings`
 * - Tự động giữ nguyên `api_key` cũ nếu quản trị viên không nhập khóa mới
 * - Tự động xóa Server In-Memory Cache ngay sau khi lưu thành công
 */
export async function updateAdminSystemSettingsServer(
  settings: SystemSettingsFormState,
  updatedByUserId: string
): Promise<SystemSettingsPayload> {
  // Đọc api_key hiện tại để giữ nguyên nếu admin để trống ô apiKey
  const { data: currentAiRow } = await supabase
    .from("system_settings")
    .select("value")
    .eq("key", SYSTEM_SETTING_DB_KEYS.AI_SYSTEM_SETTING)
    .maybeSingle();

  const existingApiKey = readString(
    asRecord(currentAiRow?.value),
    "api_key",
    ""
  ).trim();

  const nextApiKey = settings.aiGrading.apiKey.trim() || existingApiKey;
  const nowIso = new Date().toISOString();

  const rowsToUpsert = [
    {
      key: SYSTEM_SETTING_DB_KEYS.AUTH_SECURITY,
      value: {
        max_failed_attempts: settings.security.maxFailedAttempts,
        lockout_minutes: settings.security.lockoutMinutes,
        auto_reset_on_success: settings.security.autoResetOnSuccess,
      },
      description:
        "Cấu hình bảo mật mã PIN: Số lần nhập sai tối đa và thời gian khóa tài khoản (phút)",
      is_public: false,
      updated_at: nowIso,
      updated_by: updatedByUserId,
    },
    {
      key: SYSTEM_SETTING_DB_KEYS.EXCHANGE_SETTING,
      value: {
        step_coins: settings.exchange.stepCoins,
        vnd_per_step: settings.exchange.vndPerStep,
        min_exchange_coins: settings.exchange.minExchangeCoins,
        max_spin_gift_vnd: settings.exchange.maxSpinGiftVnd,
        is_exchange_window_enabled: settings.exchange.isExchangeWindowEnabled,
        exchange_open_day: settings.exchange.exchangeOpenDay,
        exchange_close_day: settings.exchange.exchangeCloseDay,
      },
      description:
        "Cấu hình quy đổi Heo Đất sang tiền mặt, quà tự chọn và điều kiện mở cổng đổi quà",
      is_public: true,
      updated_at: nowIso,
      updated_by: updatedByUserId,
    },
    {
      key: SYSTEM_SETTING_DB_KEYS.DATA_RETENTION_SETTING,
      value: {
        late_submission_grace_days:
          settings.submissionArchive.lateSubmissionGraceDays,
        max_upload_file_size_mb: settings.submissionArchive.maxUploadFileSizeMb,
        auto_cleanup_enabled: settings.submissionArchive.autoPurgeOldMedia,
        submission_media_days: settings.submissionArchive.mediaRetentionDays,
        auth_logs_days: settings.submissionArchive.authLogsDays,
        audit_logs_days: settings.submissionArchive.auditLogsDays,
        read_notifications_days:
          settings.submissionArchive.readNotificationsDays,
      },
      description:
        "Cấu hình quy định nộp bài, thời gian lưu trữ và dọn dẹp dữ liệu tự động (Private/Internal)",
      is_public: false,
      updated_at: nowIso,
      updated_by: updatedByUserId,
    },
    {
      key: SYSTEM_SETTING_DB_KEYS.AI_SYSTEM_SETTING,
      value: {
        api_url: settings.aiGrading.baseUrl.trim(),
        api_key: nextApiKey,
        model_name: settings.aiGrading.modelName.trim(),
        thinking_mode: settings.aiGrading.thinkingMode,
        timeout_seconds: settings.aiGrading.timeoutSeconds,
        major_error_penalty: settings.aiGrading.majorErrorPenalty,
        minor_error_penalty: settings.aiGrading.minorErrorPenalty,
        feedback_style_guide: settings.aiGrading.feedbackStyleGuide.trim(),
      },
      description: "Cấu hình tích hợp AI chấm bài tự động (Private/Internal)",
      is_public: false,
      updated_at: nowIso,
      updated_by: updatedByUserId,
    },
    {
      key: SYSTEM_SETTING_DB_KEYS.MAINTENANCE_SETTING,
      value: {
        is_maintenance_mode: settings.maintenance.isMaintenanceMode,
        maintenance_message: settings.maintenance.maintenanceMessage.trim(),
      },
      description: "Cấu hình chế độ bảo trì cổng học sinh",
      is_public: true,
      updated_at: nowIso,
      updated_by: updatedByUserId,
    },
  ];

  const { error } = await supabase
    .from("system_settings")
    .upsert(rowsToUpsert, { onConflict: "key" });

  if (error) {
    throw new Error(`Không thể lưu cài đặt hệ thống: ${error.message}`);
  }

  // Xóa toàn bộ RAM cache server ngay lập tức để cấu hình mới có hiệu lực tức thì
  invalidateSystemSettingCache();

  return getAdminSystemSettingsServer();
}

/**
 * Kiểm tra kết nối thực tế tới máy chủ AI đã cấu hình
 * - Nếu ô apiKey để trống sẽ tự động dùng khóa đang lưu trong Database
 */
export async function testAiConnectionServer(
  input: TestAiConnectionPayload
): Promise<TestAiConnectionResult> {
  let effectiveApiKey = input.apiKey.trim();

  if (!effectiveApiKey) {
    const { data: currentAiRow } = await supabase
      .from("system_settings")
      .select("value")
      .eq("key", SYSTEM_SETTING_DB_KEYS.AI_SYSTEM_SETTING)
      .maybeSingle();

    effectiveApiKey = readString(
      asRecord(currentAiRow?.value),
      "api_key",
      ""
    ).trim();
  }

  if (!effectiveApiKey) {
    throw new Error(
      "Chưa có khóa kết nối bí mật. Vui lòng nhập khóa trước khi kiểm tra."
    );
  }

  const endpoint = normalizeAiChatEndpoint(input.baseUrl);
  const timeoutMs = Math.min(20000, (input.timeoutSeconds ?? 15) * 1000);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const startedAt = Date.now();

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${effectiveApiKey}`,
      },
      body: JSON.stringify({
        model: input.modelName.trim(),
        messages: [{ role: "user", content: "Reply OK" }],
        max_tokens: 5,
      }),
      signal: controller.signal,
    });

    const latencyMs = Date.now() - startedAt;

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        throw new Error(
          "Khóa kết nối bí mật không hợp lệ hoặc đã hết hạn (lỗi 401/403)."
        );
      }
      if (res.status === 404) {
        throw new Error(
          "Không tìm thấy đường dẫn máy chủ hoặc tên mô hình AI không tồn tại (lỗi 404)."
        );
      }
      throw new Error(`Máy chủ AI phản hồi mã lỗi ${res.status}.`);
    }

    return {
      connected: true,
      latencyMs,
      model: input.modelName.trim(),
      message: `Kết nối thành công tới mô hình ${input.modelName.trim()} (${latencyMs}ms).`,
    };
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    if (error.name === "AbortError") {
      throw new Error(
        `Kết nối quá thời gian chờ (${Math.round(timeoutMs / 1000)} giây). Vui lòng kiểm tra lại đường dẫn máy chủ.`
      );
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
