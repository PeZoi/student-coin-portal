import { supabase } from "@/lib/supabase/db";
import { apiError, apiSuccess } from "@/lib/api/response";
import { validateRequestBody } from "@/lib/api/validation";
import { authorizeTeacherRequest } from "@/lib/auth/guard";
import { HttpStatus, HttpStatusCode } from "@/constants/http";
import { approveSubmissionSchema } from "@/features/submission-management/schemas/submissionSchemas";
import { assertTeacherCanGradeSubmissionsServer } from "@/features/submission-management/services/submissionServerService";
import { ApproveSubmissionResult } from "@/features/submission-management/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

function mapApproveRpcError(
  message: string
): { status: HttpStatusCode; text: string } {
  if (message.includes("SUBMISSION_ALREADY_APPROVED")) {
    return {
      status: HttpStatus.CONFLICT,
      text: "Bài nộp này đã được duyệt và cộng xu trước đó.",
    };
  }
  if (message.includes("SUBMISSION_CANCELLED")) {
    return {
      status: HttpStatus.BAD_REQUEST,
      text: "Bài nộp đã bị học sinh hủy trước đó nên không thể duyệt.",
    };
  }
  if (message.includes("SUBMISSION_REJECTED")) {
    return {
      status: HttpStatus.BAD_REQUEST,
      text: "Bài nộp đã bị yêu cầu làm lại. Vui lòng chờ học sinh nộp phiên bản mới.",
    };
  }
  if (message.includes("SUBMISSION_NOT_FOUND")) {
    return {
      status: HttpStatus.NOT_FOUND,
      text: "Không tìm thấy bài nộp trong hệ thống.",
    };
  }
  if (message.includes("CORRECT_EXCEEDS_TOTAL")) {
    return {
      status: HttpStatus.BAD_REQUEST,
      text: "Số câu đúng không được lớn hơn tổng số câu hỏi.",
    };
  }
  return {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    text: "Không thể duyệt bài nộp lúc này. Vui lòng thử lại.",
  };
}

/**
 * POST /api/teacher/submissions/[id]/approve
 * Duyệt 1 bài nộp & cộng xu Heo Đất (gọi RPC Atomic ACID Transaction)
 */
export async function POST(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const auth = await authorizeTeacherRequest(
      req,
      "Bạn không có quyền duyệt bài tập."
    );
    if (!auth.success) {
      return auth.response;
    }

    const validation = await validateRequestBody(req, approveSubmissionSchema);
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

    const {
      final_coins,
      final_score,
      teacher_feedback,
      correct_count,
      total_questions,
    } = validation.data;

    const { data, error } = await supabase.rpc("approve_homework_submission", {
      p_submission_id: id,
      p_reviewer_id: auth.session.userId,
      p_final_coins: final_coins,
      p_final_score: final_score ?? undefined,
      p_teacher_feedback: teacher_feedback ?? undefined,
      p_correct_count: correct_count ?? undefined,
      p_total_questions: total_questions ?? undefined,
    });

    if (error) {
      console.error("Lỗi RPC approve_homework_submission:", error.message);
      const mapped = mapApproveRpcError(error.message);
      return apiError(mapped.text, mapped.status);
    }

    const result = data as unknown as ApproveSubmissionResult;
    return apiSuccess(
      result,
      `Đã duyệt bài nộp và cộng +${final_coins} xu Heo Đất thành công!`
    );
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error(
      "Lỗi tại POST /api/teacher/submissions/[id]/approve:",
      error.message
    );
    return apiError("Đã xảy ra lỗi máy chủ khi duyệt bài nộp.");
  }
}
