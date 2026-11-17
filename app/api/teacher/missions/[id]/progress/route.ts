import { supabase } from "@/lib/supabase/db";
import { apiError, apiSuccess } from "@/lib/api/response";
import { authorizeTeacherRequest } from "@/lib/auth/guard";
import { HttpStatus } from "@/constants";
import { getMissionStudentProgressServer } from "@/features/mission-management/services/missionServerService";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/teacher/missions/[id]/progress
 * Lấy danh sách thực tế toàn bộ học sinh đã làm hoặc chưa làm bài tập này
 */
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { id: missionId } = await params;
    const auth = await authorizeTeacherRequest(
      req,
      "Bạn không có quyền xem tiến độ bài tập này."
    );
    if (!auth.success) {
      return auth.response;
    }
    const { session } = auth;

    const result = await getMissionStudentProgressServer(missionId, session);

    return apiSuccess(result);
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error(
      "Lỗi máy chủ tại GET /api/teacher/missions/[id]/progress:",
      error.message
    );
    return apiError("Đã xảy ra lỗi hệ thống khi tải tiến độ làm bài.");
  }
}

/**
 * PATCH /api/teacher/missions/[id]/progress
 * Bật/tắt trạng thái miễn bài tập (is_exempt = true/false) cho học sinh
 */
export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const { id: missionId } = await params;
    const auth = await authorizeTeacherRequest(
      req,
      "Bạn không có quyền chỉnh sửa trạng thái bài tập của học sinh."
    );
    if (!auth.success) {
      return auth.response;
    }

    const body = (await req.json()) as {
      student_id?: string;
      is_exempt?: boolean;
    };
    const { student_id, is_exempt } = body;

    if (!student_id || typeof is_exempt !== "boolean") {
      return apiError("Tham số không hợp lệ.", HttpStatus.BAD_REQUEST);
    }

    const { error: updateError } = await supabase
      .from("student_missions")
      .update({ is_exempt })
      .eq("mission_id", missionId)
      .eq("student_id", student_id);

    if (updateError) {
      console.error(
        "Lỗi khi cập nhật trạng thái miễn bài tập:",
        updateError.message
      );
      return apiError("Không thể cập nhật trạng thái miễn bài tập.");
    }

    return apiSuccess(
      { student_id, is_exempt },
      is_exempt
        ? "Đã đánh dấu miễn bài tập cho học sinh!"
        : "Đã hủy đánh dấu miễn bài tập cho học sinh!"
    );
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error(
      "Lỗi máy chủ tại PATCH /api/teacher/missions/[id]/progress:",
      error.message
    );
    return apiError(
      "Đã xảy ra lỗi hệ thống khi cập nhật trạng thái miễn bài tập."
    );
  }
}
