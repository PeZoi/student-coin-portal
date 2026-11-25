import { supabase } from "@/lib/supabase/db";
import { apiError, apiSuccess } from "@/lib/api/response";
import { validateRequestBody } from "@/lib/api/validation";
import { authorizeTeacherRequest } from "@/lib/auth/guard";
import { batchApproveSubmissionsSchema } from "@/features/teacher/submission-management/schemas/submissionSchemas";
import { assertTeacherCanGradeSubmissionsServer } from "@/features/teacher/submission-management/services/submissionServerService";
import { SUBMISSION_GRADING_CONFIG } from "@/features/teacher/submission-management/constants";
import { BatchApproveSubmissionsResult } from "@/features/teacher/submission-management/types";

/**
 * POST /api/teacher/submissions/batch-approve
 * Duyệt nhanh hàng loạt bài nộp hợp lệ trong 1 round-trip DB (Atomic ACID RPC)
 */
export async function POST(req: Request) {
  try {
    const auth = await authorizeTeacherRequest(
      req,
      "Bạn không có quyền duyệt hàng loạt bài tập."
    );
    if (!auth.success) {
      return auth.response;
    }

    const validation = await validateRequestBody(
      req,
      batchApproveSubmissionsSchema
    );
    if (!validation.success) {
      return validation.response;
    }

    const { submission_ids, teacher_feedback } = validation.data;

    const permission = await assertTeacherCanGradeSubmissionsServer(
      auth.session,
      submission_ids
    );
    if (!permission.ok) {
      return apiError(permission.message, permission.status);
    }

    const { data, error } = await supabase.rpc(
      "batch_approve_homework_submissions",
      {
        p_submission_ids: submission_ids,
        p_reviewer_id: auth.session.userId,
        p_default_feedback:
          teacher_feedback?.trim() ||
          SUBMISSION_GRADING_CONFIG.DEFAULT_BATCH_APPROVE_FEEDBACK,
      }
    );

    if (error) {
      console.error(
        "Lỗi RPC batch_approve_homework_submissions:",
        error.message
      );
      return apiError("Không thể duyệt hàng loạt bài nộp. Vui lòng thử lại.");
    }

    const result = data as unknown as BatchApproveSubmissionsResult;
    return apiSuccess(
      result,
      `Đã duyệt nhanh ${result.approved_count} bài nộp hợp lệ (+${result.total_coins_awarded} xu)!`
    );
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error(
      "Lỗi tại POST /api/teacher/submissions/batch-approve:",
      error.message
    );
    return apiError("Đã xảy ra lỗi máy chủ khi duyệt hàng loạt bài nộp.");
  }
}
