import { supabase } from "@/lib/supabase/db";
import { apiError, apiSuccess } from "@/lib/api/response";
import { validateRequestBody } from "@/lib/api/validation";
import { authorizeTeacherRequest } from "@/lib/auth/guard";
import { HttpStatus } from "@/constants";
import { UserRole } from "@/constants/auth";
import { changeStudentClassSchema } from "@/features/teacher/schemas/studentSchemas";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/teacher/students/[id]/change-class
 * Chuyển lớp học cho 1 học sinh
 */
export async function POST(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    if (!id) {
      return apiError("Mã học sinh không hợp lệ.", HttpStatus.BAD_REQUEST);
    }

    const auth = await authorizeTeacherRequest(
      req,
      "Bạn không có quyền chuyển lớp học cho học sinh."
    );
    if (!auth.success) {
      return auth.response;
    }
    const { session } = auth;

    const validation = await validateRequestBody(req, changeStudentClassSchema);
    if (!validation.success) {
      return validation.response;
    }

    const { new_class_id, reset_progress = false } = validation.data;

    // 1. Kiểm tra học sinh có tồn tại không
    const { data: studentRecord, error: findError } = await supabase
      .from("users")
      .select("id, full_name, role, is_deleted, class_id")
      .eq("id", id)
      .eq("role", UserRole.STUDENT)
      .maybeSingle();

    if (findError || !studentRecord) {
      return apiError("Không tìm thấy hồ sơ học sinh yêu cầu.", HttpStatus.NOT_FOUND);
    }

    if (studentRecord.is_deleted) {
      return apiError("Học sinh này đang ở trong thùng rác, vui lòng khôi phục trước khi chuyển lớp.", HttpStatus.BAD_REQUEST);
    }

    // 2. Nếu có chọn lớp mới, kiểm tra lớp có hợp lệ không
    let targetClassName = "Chưa phân lớp";
    if (new_class_id && new_class_id.trim() !== "") {
      const { data: classRecord } = await supabase
        .from("classes")
        .select("id, class_name, is_deleted")
        .eq("id", new_class_id)
        .maybeSingle();

      if (!classRecord || classRecord.is_deleted) {
        return apiError("Lớp học tiếp nhận không tồn tại hoặc đã bị xóa.", HttpStatus.BAD_REQUEST);
      }
      targetClassName = classRecord.class_name;
    }

    // 3. Chuẩn bị payload cập nhật người dùng
    const userUpdatePayload: Record<string, unknown> = {
      class_id: new_class_id && new_class_id.trim() !== "" ? new_class_id : null,
      updated_at: new Date().toISOString(),
      updated_by: session.userId,
    };

    // Nếu chọn Reset toàn bộ: đưa số xu Heo Đất, tổng xu tích lũy và lượt quay về 0
    if (reset_progress) {
      userUpdatePayload.current_coins = 0;
      userUpdatePayload.total_earned_coins = 0;
      userUpdatePayload.free_spins = 0;
    }

    const { error: updateError } = await supabase
      .from("users")
      .update(userUpdatePayload)
      .eq("id", id);

    if (updateError) {
      console.error("Lỗi khi chuyển lớp học sinh:", updateError.message);
      return apiError("Không thể chuyển lớp học sinh. Vui lòng thử lại.");
    }

    // 4. Nếu yêu cầu làm mới toàn bộ dữ liệu: xóa sạch bài tập và nhật ký liên quan
    if (reset_progress) {
      // 4.1. Tìm các bài nộp để xóa ai_submission_errors trước khi xóa homework_submissions
      const { data: submissions } = await supabase
        .from("homework_submissions")
        .select("id")
        .eq("student_id", id);

      if (submissions && submissions.length > 0) {
        const subIds = submissions.map((s) => s.id);
        await supabase
          .from("ai_submission_errors")
          .delete()
          .in("submission_id", subIds);

        await supabase
          .from("homework_submissions")
          .delete()
          .eq("student_id", id);
      }

      // 4.2. Xóa yêu cầu đổi quà nếu có trước khi xóa coin_transactions
      // await supabase
      //   .from("monthly_exchange_requests")
      //   .delete()
      //   .eq("student_id", id);

      // 4.3. Xóa sổ nhật ký giao dịch xu
      await supabase
        .from("coin_transactions")
        .delete()
        .eq("user_id", id);

      // 4.4. Xóa lịch sử quay thưởng
      await supabase
        .from("wheel_spins")
        .delete()
        .eq("student_id", id);

      // 4.5. Xóa xếp hạng tháng
      await supabase
        .from("monthly_leaderboard")
        .delete()
        .eq("student_id", id);
    }

    const message = reset_progress
      ? `Đã chuyển học sinh "${studentRecord.full_name}" sang "${targetClassName}" và làm mới toàn bộ dữ liệu bài tập & số xu thành công!`
      : `Đã chuyển học sinh "${studentRecord.full_name}" sang "${targetClassName}" thành công!`;

    return apiSuccess(
      {
        student_id: id,
        new_class_id: new_class_id || null,
        class_name: targetClassName,
        is_reset: reset_progress,
      },
      message
    );
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Lỗi máy chủ tại POST /api/teacher/students/[id]/change-class:", error.message);
    return apiError("Đã xảy ra lỗi hệ thống khi chuyển lớp học sinh.");
  }
}
