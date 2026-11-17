import { supabase } from "@/lib/supabase/db";
import { apiError, apiSuccess } from "@/lib/api/response";
import { authorizeTeacherRequest } from "@/lib/auth/guard";
import { HttpStatus } from "@/constants/http";

interface RouteParams {
  params: Promise<{ id: string; missionId: string }>;
}

/**
 * PATCH /api/teacher/students/[id]/assigned-missions/[missionId]/exempt
 * Cho phép giáo viên miễn làm hoặc bỏ miễn làm một bài tập cho học sinh
 */
export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const { id: studentId, missionId } = await params;
    if (!studentId || !missionId) {
      return apiError("Tham số không hợp lệ.", HttpStatus.BAD_REQUEST);
    }

    const auth = await authorizeTeacherRequest(
      req,
      "Bạn không có quyền thay đổi trạng thái miễn làm bài tập."
    );
    if (!auth.success) {
      return auth.response;
    }

    const body = await req.json().catch(() => ({}));
    const isExempt = body?.is_exempt ?? true;

    // Tìm bản ghi student_missions
    const { data: currentRecord, error: findError } = await supabase
      .from("student_missions")
      .select("id, status")
      .eq("student_id", studentId)
      .eq("mission_id", missionId)
      .maybeSingle();

    if (findError || !currentRecord) {
      return apiError("Không tìm thấy phân bổ bài tập này của học sinh.", HttpStatus.NOT_FOUND);
    }

    // Chỉ cho phép miễn làm nếu bài chưa nộp (assigned) hoặc đang là exempt
    if (currentRecord.status === "approved" || currentRecord.status === "submitted") {
      return apiError(
        "Không thể miễn làm bài tập đã nộp hoặc đã được chấm duyệt.",
        HttpStatus.BAD_REQUEST
      );
    }

    const newStatus = isExempt ? "exempt" : "assigned";

    const { error: updateError } = await supabase
      .from("student_missions")
      .update({
        status: newStatus,
      })
      .eq("id", currentRecord.id);

    if (updateError) {
      console.error("Lỗi khi cập nhật miễn làm bài:", updateError.message);
      return apiError("Không thể cập nhật trạng thái bài tập. Vui lòng thử lại.");
    }

    return apiSuccess(
      {
        student_id: studentId,
        mission_id: missionId,
        status: newStatus,
      },
      isExempt
        ? "Đã đánh dấu miễn làm bài tập này cho học sinh."
        : "Đã hủy miễn làm bài tập cho học sinh."
    );
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Lỗi máy chủ tại PATCH exempt mission:", error.message);
    return apiError("Đã xảy ra lỗi máy chủ khi cập nhật miễn làm bài.");
  }
}
