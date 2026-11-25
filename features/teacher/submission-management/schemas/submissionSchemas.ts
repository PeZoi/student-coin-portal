import { z } from "zod";
import { SUBMISSION_GRADING_CONFIG } from "../constants";

/**
 * Schema xác thực payload duyệt 1 bài nộp (`POST /api/teacher/submissions/[id]/approve`)
 */
export const approveSubmissionSchema = z
  .object({
    final_coins: z
      .number()
      .int("Số xu thưởng phải là số nguyên.")
      .min(SUBMISSION_GRADING_CONFIG.MIN_COINS, "Số xu thưởng không được âm.")
      .max(
        SUBMISSION_GRADING_CONFIG.MAX_MANUAL_COINS,
        `Số xu thưởng không vượt quá ${SUBMISSION_GRADING_CONFIG.MAX_MANUAL_COINS} xu.`
      ),
    final_score: z
      .number()
      .min(
        SUBMISSION_GRADING_CONFIG.MIN_SCORE,
        `Điểm số phải từ ${SUBMISSION_GRADING_CONFIG.MIN_SCORE} đến ${SUBMISSION_GRADING_CONFIG.MAX_SCORE}.`
      )
      .max(
        SUBMISSION_GRADING_CONFIG.MAX_SCORE,
        `Điểm số phải từ ${SUBMISSION_GRADING_CONFIG.MIN_SCORE} đến ${SUBMISSION_GRADING_CONFIG.MAX_SCORE}.`
      )
      .nullable()
      .optional(),
    teacher_feedback: z
      .string()
      .max(1000, "Lời nhận xét không vượt quá 1.000 ký tự.")
      .nullable()
      .optional(),
    correct_count: z
      .number()
      .int("Số câu đúng phải là số nguyên.")
      .min(0, "Số câu đúng không được âm.")
      .max(SUBMISSION_GRADING_CONFIG.MAX_QUESTION_COUNT)
      .nullable()
      .optional(),
    total_questions: z
      .number()
      .int("Tổng số câu phải là số nguyên.")
      .min(0, "Tổng số câu không được âm.")
      .max(SUBMISSION_GRADING_CONFIG.MAX_QUESTION_COUNT)
      .nullable()
      .optional(),
  })
  .refine(
    (data) =>
      data.correct_count == null ||
      data.total_questions == null ||
      data.correct_count <= data.total_questions,
    {
      message: "Số câu đúng không được lớn hơn tổng số câu hỏi.",
      path: ["correct_count"],
    }
  );

export type ApproveSubmissionPayload = z.infer<typeof approveSubmissionSchema>;

/**
 * Schema xác thực payload từ chối / yêu cầu nộp lại (`POST /api/teacher/submissions/[id]/reject`)
 */
export const rejectSubmissionSchema = z.object({
  teacher_feedback: z
    .string()
    .max(1000, "Lý do yêu cầu nộp lại không vượt quá 1.000 ký tự.")
    .nullable()
    .optional(),
});

export type RejectSubmissionPayload = z.infer<typeof rejectSubmissionSchema>;

/**
 * Schema xác thực payload duyệt nhanh hàng loạt (`POST /api/teacher/submissions/batch-approve`)
 */
export const batchApproveSubmissionsSchema = z.object({
  submission_ids: z
    .array(z.string().uuid("Mã bài nộp không đúng định dạng UUID."))
    .min(1, "Vui lòng chọn ít nhất 1 bài nộp hợp lệ để duyệt nhanh."),
  teacher_feedback: z
    .string()
    .max(1000, "Lời nhận xét mặc định không vượt quá 1.000 ký tự.")
    .nullable()
    .optional(),
});

export type BatchApproveSubmissionsPayload = z.infer<
  typeof batchApproveSubmissionsSchema
>;
