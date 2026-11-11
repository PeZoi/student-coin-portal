import { supabase } from "@/lib/supabase/db";
import { apiError, apiSuccess } from "@/lib/api/response";
import { validateRequestBody } from "@/lib/api/validation";
import { authorizeTeacherRequest } from "@/lib/auth/guard";
import { HttpStatus } from "@/constants";
import { UserRole } from "@/constants/auth";
import { batchChangeStudentClassSchema } from "@/features/teacher/schemas/studentSchemas";

/**
 * POST /api/teacher/students/batch-change-class
 * Chuyển lớp học hàng loạt cho nhiều học sinh
 */
export async function POST(req: Request) {
  try {
    const auth = await authorizeTeacherRequest(
      req,
      "Bạn không có quyền chuyển lớp học cho học sinh."
    );
    if (!auth.success) {
      return auth.response;
    }
    const { session } = auth;

    const validation = await validateRequestBody(
      req,
      batchChangeStudentClassSchema
    );
    if (!validation.success) {
      return validation.response;
    }

    const { student_ids, new_class_id, reset_progress = false } = validation.data;

    // 1. Kiểm tra lớp tiếp nhận nếu có chỉ định
    let targetClassName = "Chưa phân lớp";
    if (new_class_id && new_class_id.trim() !== "") {
      const { data: classRecord } = await supabase
        .from("classes")
        .select("id, class_name, is_deleted")
        .eq("id", new_class_id)
        .maybeSingle();

      if (!classRecord || classRecord.is_deleted) {
        return apiError(
          "Lớp học tiếp nhận không tồn tại hoặc đã bị xóa.",
          HttpStatus.BAD_REQUEST
        );
      }
      targetClassName = classRecord.class_name;
    }

    // 2. Chuẩn bị payload cập nhật người dùng hàng loạt
    const batchPayload: Record<string, unknown> = {
      class_id:
        new_class_id && new_class_id.trim() !== "" ? new_class_id : null,
      updated_at: new Date().toISOString(),
      updated_by: session.userId,
    };

    if (reset_progress) {
      batchPayload.current_coins = 0;
      batchPayload.total_earned_coins = 0;
      batchPayload.free_spins = 0;
    }

    const { error: batchUpdateError, count } = await supabase
      .from("users")
      .update(batchPayload)
      .in("id", student_ids)
      .eq("role", UserRole.STUDENT)
      .eq("is_deleted", false);

    if (batchUpdateError) {
      console.error(
        "Lỗi khi chuyển lớp hàng loạt:",
        batchUpdateError.message
      );
      return apiError(
        "Không thể thực hiện chuyển lớp hàng loạt. Vui lòng thử lại."
      );
    }

    // 3. Nếu reset toàn bộ dữ liệu: xóa bài nộp và lịch sử liên quan hàng loạt
    if (reset_progress) {
      // 3.1. Tìm các bài nộp để xóa ai_submission_errors trước
      const { data: submissions } = await supabase
        .from("homework_submissions")
        .select("id")
        .in("student_id", student_ids);

      if (submissions && submissions.length > 0) {
        const subIds = submissions.map((s) => s.id);
        await supabase
          .from("ai_submission_errors")
          .delete()
          .in("submission_id", subIds);

        await supabase
          .from("homework_submissions")
          .delete()
          .in("student_id", student_ids);
      }

      // 3.2. Xóa các bảng liên quan
      // await supabase
      //   .from("monthly_exchange_requests")
      //   .delete()
      //   .in("student_id", student_ids);

      await supabase
        .from("coin_transactions")
        .delete()
        .in("user_id", student_ids);

      await supabase
        .from("wheel_spins")
        .delete()
        .in("student_id", student_ids);

      await supabase
        .from("monthly_leaderboard")
        .delete()
        .in("student_id", student_ids);
    }

    const message = reset_progress
      ? `Đã chuyển ${student_ids.length} học sinh sang "${targetClassName}" và làm mới toàn bộ dữ liệu bài tập & số xu thành công!`
      : `Đã chuyển ${student_ids.length} học sinh sang "${targetClassName}" thành công!`;

    return apiSuccess(
      {
        updated_count: count ?? student_ids.length,
        new_class_id: new_class_id || null,
        class_name: targetClassName,
        is_reset: reset_progress,
      },
      message
    );
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error(
      "Lỗi máy chủ tại POST /api/teacher/students/batch-change-class:",
      error.message
    );
    return apiError("Đã xảy ra lỗi hệ thống khi chuyển lớp hàng loạt.");
  }
}
