import { supabase } from "@/lib/supabase/db";
import { apiError, apiSuccess } from "@/lib/api/response";
import { validateRequestBody } from "@/lib/api/validation";
import { authorizeTeacherRequest } from "@/lib/auth/guard";
import { UserRole } from "@/constants";
import { batchMissionActionSchema } from "@/features/mission-management/schemas/missionSchemas";
import { safeDeleteMissionServer } from "@/features/mission-management/services/missionServerService";

/**
 * POST /api/teacher/missions/batch
 * Thực hiện các thao tác hàng loạt cho bài tập (Kích hoạt, Tạm đóng, Xóa mềm, Khôi phục, Xóa vĩnh viễn)
 */
export async function POST(req: Request) {
  try {
    const auth = await authorizeTeacherRequest(
      req,
      "Bạn không có quyền thực hiện thao tác hàng loạt trên bài tập."
    );
    if (!auth.success) {
      return auth.response;
    }
    const { session } = auth;

    const validation = await validateRequestBody(req, batchMissionActionSchema);
    if (!validation.success) {
      return validation.response;
    }

    const { action, ids } = validation.data;
    const nowIso = new Date().toISOString();

    if (action === "activate") {
      const { error } = await supabase
        .from("missions")
        .update({
          is_active: true,
          updated_by: session.userId,
          updated_at: nowIso,
        })
        .in("id", ids);

      if (error) {
        return apiError("Không thể kích hoạt bài tập hàng loạt.");
      }
      return apiSuccess(
        { affectedCount: ids.length },
        `Đã mở nhận bài cho ${ids.length} bài tập!`
      );
    }

    if (action === "deactivate") {
      const { error } = await supabase
        .from("missions")
        .update({
          is_active: false,
          updated_by: session.userId,
          updated_at: nowIso,
        })
        .in("id", ids);

      if (error) {
        return apiError("Không thể tạm đóng bài tập hàng loạt.");
      }
      return apiSuccess(
        { affectedCount: ids.length },
        `Đã tạm đóng ${ids.length} bài tập.`
      );
    }

    if (action === "delete_soft") {
      // Gọi safe_delete_mission lần lượt cho từng id
      let successCount = 0;
      for (const id of ids) {
        try {
          await safeDeleteMissionServer(id, session.userId);
          successCount += 1;
        } catch (e) {
          console.error(`Lỗi khi xóa bài tập ${id}:`, e);
        }
      }

      return apiSuccess(
        { affectedCount: successCount },
        `Đã xử lý xóa ${successCount} bài tập.`
      );
    }

    if (action === "restore") {
      const { error } = await supabase
        .from("missions")
        .update({
          is_deleted: false,
          is_active: true,
          deleted_at: null,
          deleted_by: null,
          updated_by: session.userId,
          updated_at: nowIso,
        })
        .in("id", ids);

      if (error) {
        return apiError("Không thể khôi phục bài tập hàng loạt.");
      }
      return apiSuccess(
        { affectedCount: ids.length },
        `Đã khôi phục ${ids.length} bài tập!`
      );
    }

    if (action === "delete_permanent") {
      if (session.role !== UserRole.ADMIN) {
        return apiError(
          "Chỉ Quản trị viên tối cao mới có quyền xóa vĩnh viễn hàng loạt.",
          403
        );
      }

      await supabase.from("mission_classes").delete().in("mission_id", ids);
      await supabase.from("homework_submissions").delete().in("mission_id", ids);
      const { error } = await supabase.from("missions").delete().in("id", ids);

      if (error) {
        return apiError("Không thể xóa vĩnh viễn bài tập hàng loạt.");
      }

      return apiSuccess(
        { affectedCount: ids.length },
        `Đã xóa vĩnh viễn ${ids.length} bài tập khỏi hệ thống.`
      );
    }

    return apiError("Hành động không hợp lệ.");
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Lỗi máy chủ tại POST /api/teacher/missions/batch:", error.message);
    return apiError("Đã xảy ra lỗi hệ thống khi xử lý thao tác hàng loạt.");
  }
}
