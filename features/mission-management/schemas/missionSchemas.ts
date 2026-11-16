import { z } from "zod";

/**
 * Tiêu chí trọng tâm bắt lỗi của AI
 */
export const aiGradingErrorTypeSchema = z.enum([
  "spelling",
  "grammar",
  "vocab",
  "punctuation",
  "content",
]);

/**
 * Hình thức nộp bài
 */
export const missionSubmissionTypeSchema = z.enum([
  "platform_proof",
  "subjective_writing",
]);

/**
 * Schema xác thực dữ liệu khi tạo bài tập mới
 */
export const createMissionSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Tên bài tập phải có ít nhất 3 ký tự")
      .max(255, "Tên bài tập không được vượt quá 255 ký tự"),
    description: z.string().trim().optional().nullable().default(""),
    submission_type: missionSubmissionTypeSchema.default("subjective_writing"),
    min_reward_coins: z.coerce
      .number()
      .int("Xu thưởng phải là số nguyên")
      .min(0, "Xu thưởng tối thiểu không được âm")
      .default(20),
    max_reward_coins: z.coerce
      .number()
      .int("Xu thưởng phải là số nguyên")
      .positive("Xu thưởng tối đa phải lớn hơn 0"),
    due_at: z
      .string()
      .min(10, "Hạn chót nộp bài không hợp lệ"),
    is_active: z.boolean().default(true),
    assigned_class_ids: z
      .array(z.string().uuid("ID lớp học không hợp lệ"))
      .default([]),
    grading_focus: z.array(aiGradingErrorTypeSchema).default(["spelling", "grammar"]),
    custom_ai_prompt: z.string().trim().optional().nullable().default(""),
    allow_late_submission: z.boolean().default(true),
    ai_prompt_template_id: z.string().uuid().optional().nullable(),
  })
  .refine((data) => data.min_reward_coins <= data.max_reward_coins, {
    message: "Xu thưởng tối thiểu không được lớn hơn xu thưởng tối đa",
    path: ["min_reward_coins"],
  });

export type CreateMissionInput = z.infer<typeof createMissionSchema>;

/**
 * Schema xác thực khi cập nhật bài tập
 */
export const updateMissionSchema = z
  .object({
    title: z.string().trim().min(3).max(255).optional(),
    description: z.string().trim().optional().nullable(),
    submission_type: missionSubmissionTypeSchema.optional(),
    min_reward_coins: z.coerce.number().int().min(0).optional(),
    max_reward_coins: z.coerce.number().int().positive().optional(),
    due_at: z.string().min(10).optional(),
    is_active: z.boolean().optional(),
    assigned_class_ids: z.array(z.string().uuid()).optional(),
    grading_focus: z.array(aiGradingErrorTypeSchema).optional(),
    custom_ai_prompt: z.string().trim().optional().nullable(),
    allow_late_submission: z.boolean().optional(),
    ai_prompt_template_id: z.string().uuid().optional().nullable(),
  })
  .refine(
    (data) => {
      if (
        data.min_reward_coins !== undefined &&
        data.max_reward_coins !== undefined
      ) {
        return data.min_reward_coins <= data.max_reward_coins;
      }
      return true;
    },
    {
      message: "Xu thưởng tối thiểu không được lớn hơn xu thưởng tối đa",
      path: ["min_reward_coins"],
    }
  );

export type UpdateMissionInput = z.infer<typeof updateMissionSchema>;

/**
 * Schema xác thực khi bật/tắt nhận bài
 */
export const toggleMissionStatusSchema = z.object({
  is_active: z.boolean(),
});

export type ToggleMissionStatusInput = z.infer<typeof toggleMissionStatusSchema>;

/**
 * Schema xác thực các thao tác hàng loạt (Batch Actions)
 */
export const batchMissionActionSchema = z.object({
  action: z.enum([
    "activate",
    "deactivate",
    "delete_soft",
    "restore",
    "delete_permanent",
  ]),
  ids: z
    .array(z.string().uuid("ID bài tập không hợp lệ"))
    .min(1, "Vui lòng chọn ít nhất một bài tập"),
});

export type BatchMissionActionInput = z.infer<typeof batchMissionActionSchema>;
