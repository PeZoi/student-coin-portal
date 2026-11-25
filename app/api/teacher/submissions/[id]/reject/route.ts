import { supabase } from "@/lib/supabase/db";
import { apiError, apiSuccess } from "@/lib/api/response";
import { validateRequestBody } from "@/lib/api/validation";
import { authorizeTeacherRequest } from "@/lib/auth/guard";
import { HttpStatus } from "@/constants/http";
import { rejectSubmissionSchema } from "@/features/teacher/submission-management/schemas/submissionSchemas";
import { assertTeacherCanGradeSubmissionsServer } from "@/features/teacher/submission-management/services/submissionServerService";
import { SUBMISSION_GRADING_CONFIG } from "@/features/teacher/submission-management/constants";
import { RejectSubmissionResult } from "@/features/teacher/submission-management/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/teacher/submissions/[id]/reject
 * Yêu cầu học sinh nộp lại bài (gọi RPC Atomic ACID Transaction)
 */
export async function POST(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const auth = await authorizeTeacherRequest(
      req,
      "Bạn không có quyền yêu cầu nộp lại bài tập."
    );
    if (!auth.success) {
      return auth.response;
    }

    const validation = await validateRequestBody(req, rejectSubmissionSchema);
    if (!validation.success) {
      return validation.response;
    }

    const permission = await assertTeacherCanGradeSubmissionsServer(
      auth.session,
      [id]
    );
    if (!permission.ok) {
      return apiError(permission.message, permission.status);
    }

    const feedbackText =
      validation.data.teacher_feedback?.trim() ||
      SUBMISSION_GRADING_CONFIG.DEFAULT_REJECT_FEEDBACK;

    const { data, error } = await supabase.rpc("reject_homework_submission", {
      p_submission_id: id,
      p_reviewer_id: auth.session.userId,
      p_teacher_feedback: feedbackText,
    });

    if (error) {
      console.error("Lỗi RPC reject_homework_submission:", error.message);
      if (error.message.includes("SUBMISSION_NOT_PENDING")) {
        return apiError(
          "Chỉ có thể yêu cầu nộp lại đối với bài đang chờ duyệt.",
          HttpStatus.BAD_REQUEST
        );
      }
      if (error.message.includes("SUBMISSION_NOT_FOUND")) {
        return apiError(
          "Không tìm thấy bài nộp trong hệ thống.",
          HttpStatus.NOT_FOUND
        );
      }
      return apiError("Không thể gửi yêu cầu nộp lại lúc này. Vui lòng thử lại.");
    }

    const result = data as unknown as RejectSubmissionResult;
    return apiSuccess(result, "Đã gửi yêu cầu nộp lại bài cho học sinh.");
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error(
      "Lỗi tại POST /api/teacher/submissions/[id]/reject:",
      error.message
    );
    return apiError("Đã xảy ra lỗi máy chủ khi yêu cầu nộp lại bài.");
  }
}
