import { z } from "zod";

export const securitySettingsSchema = z.object({
  maxFailedAttempts: z
    .number()
    .int()
    .min(1, "Số lần nhập sai tối đa phải từ 1 trở lên.")
    .max(20, "Số lần nhập sai tối đa không vượt quá 20."),
  lockoutMinutes: z
    .number()
    .int()
    .min(1, "Thời gian tạm khóa phải ít nhất 1 phút.")
    .max(1440, "Thời gian tạm khóa tối đa 1.440 phút (24 giờ)."),
  autoResetOnSuccess: z.boolean(),
});

export const exchangeSettingsSchema = z
  .object({
    stepCoins: z
      .number()
      .int()
      .min(1, "Mức nhảy quy đổi phải lớn hơn 0 xu.")
      .max(1000000),
    vndPerStep: z
      .number()
      .int()
      .min(1000, "Tiền tương ứng mỗi mốc phải từ 1.000 VNĐ trở lên.")
      .max(10000000),
    minExchangeCoins: z
      .number()
      .int()
      .min(0, "Số xu tối thiểu không được âm.")
      .max(10000000),
    maxSpinGiftVnd: z
      .number()
      .int()
      .min(1000, "Hạn mức Hộp quà Vòng quay phải từ 1.000 VNĐ trở lên.")
      .max(10000000),
    isExchangeWindowEnabled: z.boolean(),
    exchangeOpenDay: z.number().int().min(1).max(31),
    exchangeCloseDay: z.number().int().min(1).max(31),
  })
  .refine(
    (data) =>
      !data.isExchangeWindowEnabled ||
      data.exchangeOpenDay <= data.exchangeCloseDay,
    {
      message: "Ngày bắt đầu mở đổi quà không được lớn hơn ngày đóng cổng.",
      path: ["exchangeOpenDay"],
    }
  );

export const submissionArchiveSettingsSchema = z.object({
  lateSubmissionGraceDays: z.number().int().min(0).max(30),
  maxUploadFileSizeMb: z.number().int().min(1).max(25),
  autoPurgeOldMedia: z.boolean(),
  mediaRetentionDays: z.number().int().min(7).max(365),
  authLogsDays: z.number().int().min(7).max(730),
  auditLogsDays: z.number().int().min(30).max(1095),
  readNotificationsDays: z.number().int().min(7).max(365),
});

export const aiGradingSettingsSchema = z.object({
  baseUrl: z
    .string()
    .trim()
    .max(500)
    .refine(
      (val) => val === "" || /^https?:\/\/.+/i.test(val),
      "Đường dẫn máy chủ AI phải bắt đầu bằng http:// hoặc https://"
    ),
  apiKey: z.string().trim().max(500),
  modelName: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập tên mô hình AI.")
    .max(120),
  thinkingMode: z.enum(["off", "low", "high"]),
  timeoutSeconds: z.number().int().min(15).max(180),
  majorErrorPenalty: z.number().min(0).max(5),
  minorErrorPenalty: z.number().min(0).max(5),
  feedbackStyleGuide: z.string().trim().max(1000),
});

export const maintenanceSettingsSchema = z.object({
  isMaintenanceMode: z.boolean(),
  maintenanceMessage: z.string().trim().max(500),
});

export const systemSettingsUpdateSchema = z.object({
  security: securitySettingsSchema,
  exchange: exchangeSettingsSchema,
  submissionArchive: submissionArchiveSettingsSchema,
  aiGrading: aiGradingSettingsSchema,
  maintenance: maintenanceSettingsSchema,
});

export const testAiConnectionSchema = z.object({
  baseUrl: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập đường dẫn máy chủ AI.")
    .refine(
      (val) => /^https?:\/\/.+/i.test(val),
      "Đường dẫn máy chủ AI phải bắt đầu bằng http:// hoặc https://"
    ),
  apiKey: z.string().trim().max(500).default(""),
  modelName: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập tên mô hình AI.")
    .max(120),
  timeoutSeconds: z.number().int().min(5).max(60).optional(),
});
