import { supabase } from "@/lib/supabase/db";
import { apiError, apiSuccess } from "@/lib/api/response";
import { validateRequestBody } from "@/lib/api/validation";
import { authorizeTeacherRequest } from "@/lib/auth/guard";
import { updateMissionSchema } from "@/features/teacher/mission-management/schemas/missionSchemas";
import { StudentMissionStatus } from "@/constants";
import {
  safeDeleteMissionServer,
  getTeacherMissionsServer,
} from "@/features/teacher/mission-management/services/missionServerService";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PUT /api/teacher/missions/[id]
 * Cập nhật thông tin bài tập và đồng bộ danh sách lớp phân công
 */
export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const { id: missionId } = await params;
    const auth = await authorizeTeacherRequest(
      req,
      "Bạn không có quyền chỉnh sửa bài tập này."
    );
    if (!auth.success) {
      return auth.response;
    }
    const { session } = auth;

    const validation = await validateRequestBody(req, updateMissionSchema);
    if (!validation.success) {
      return validation.response;
    }

    const data = validation.data;
    const updatePayload: Record<string, unknown> = {
      updated_by: session.userId,
      updated_at: new Date().toISOString(),
    };

    if (data.title !== undefined) updatePayload.title = data.title;
    if (data.description !== undefined) updatePayload.description = data.description;
    if (data.submission_type !== undefined)
      updatePayload.submission_type = data.submission_type;
    if (data.min_reward_coins !== undefined)
      updatePayload.min_reward_coins = data.min_reward_coins;
    if (data.max_reward_coins !== undefined)
      updatePayload.max_reward_coins = data.max_reward_coins;
    if (data.due_at !== undefined)
      updatePayload.due_at = new Date(data.due_at).toISOString();
    if (data.is_active !== undefined) updatePayload.is_active = data.is_active;
    if (data.grading_focus !== undefined)
      updatePayload.grading_focus = data.grading_focus;
    if (data.custom_ai_prompt !== undefined)
      updatePayload.custom_ai_prompt = data.custom_ai_prompt;
    if (data.allow_late_submission !== undefined)
      updatePayload.allow_late_submission = data.allow_late_submission;
    if (data.ai_prompt_template_id !== undefined)
      updatePayload.ai_prompt_template_id = data.ai_prompt_template_id;

    // 1. Cập nhật bảng missions
    const { error: updateError } = await supabase
      .from("missions")
      .update(updatePayload)
      .eq("id", missionId);

    if (updateError) {
      console.error("Lỗi khi cập nhật bài tập:", updateError.message);
      return apiError("Không thể cập nhật bài tập. Vui lòng thử lại sau.");
    }

    // 2. Đồng bộ danh sách lớp được giao nếu có truyền assigned_class_ids
    if (data.assigned_class_ids !== undefined) {
      // 2.1. Tìm các lớp bị gỡ bỏ để dọn dẹp bài chưa nộp của học sinh các lớp đó
      const { data: existingMC } = await supabase
        .from("mission_classes")
        .select("class_id")
        .eq("mission_id", missionId);

      const existingClassIds = (existingMC || []).map((mc) => mc.class_id);
      const removedClassIds = existingClassIds.filter(
        (cid) => !data.assigned_class_ids!.includes(cid)
      );

      if (removedClassIds.length > 0) {
        await supabase
          .from("student_missions")
          .delete()
          .eq("mission_id", missionId)
          .in("class_id", removedClassIds)
          .eq("status", StudentMissionStatus.ASSIGNED);
      }

      // 2.2. Xóa các phân công cũ trong mission_classes
      await supabase
        .from("mission_classes")
        .delete()
        .eq("mission_id", missionId);

      // 2.3. Thêm các phân công mới (Trigger trg_auto_assign_mission_to_students sẽ tự động gán cho học sinh lớp mới)
      if (data.assigned_class_ids.length > 0) {
        const classRows = data.assigned_class_ids.map((classId) => ({
          mission_id: missionId,
          class_id: classId,
        }));
        await supabase.from("mission_classes").insert(classRows);
      }
    }

    // 3. Lấy dữ liệu bài tập mới nhất sau khi sửa
    const freshMissions = await getTeacherMissionsServer(session, {
      status: "all",
    });
    const updatedMission = freshMissions.find((m) => m.id === missionId);

    return apiSuccess(
      updatedMission,
      "Cập nhật thông tin bài tập thành công!"
    );
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Lỗi máy chủ tại PUT /api/teacher/missions/[id]:", error.message);
    return apiError("Đã xảy ra lỗi hệ thống khi cập nhật bài tập.");
  }
}

/**
 * DELETE /api/teacher/missions/[id]
 * Xóa thông minh bài tập qua RPC safe_delete_mission (Tự động xóa vĩnh viễn nếu chưa nộp, xóa mềm nếu đã nộp)
 */
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const { id: missionId } = await params;
    const auth = await authorizeTeacherRequest(
      req,
      "Bạn không có quyền xóa bài tập này."
    );
    if (!auth.success) {
      return auth.response;
    }
    const { session } = auth;

    const result = await safeDeleteMissionServer(missionId, session.userId);

    const message =
      result.resultType === "HARD_DELETED"
        ? "Đã xóa vĩnh viễn bài tập vì chưa có học sinh nào nộp bài."
        : "Đã chuyển bài tập vào thùng rác an toàn.";

    return apiSuccess(result, message);
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Lỗi máy chủ tại DELETE /api/teacher/missions/[id]:", error.message);
    return apiError(error.message || "Đã xảy ra lỗi hệ thống khi xóa bài tập.");
  }
}
