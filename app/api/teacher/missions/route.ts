import { supabase } from "@/lib/supabase/db";
import { apiError, apiSuccess } from "@/lib/api/response";
import { validateRequestBody } from "@/lib/api/validation";
import { authorizeTeacherRequest } from "@/lib/auth/guard";
import { HttpStatus } from "@/constants";
import { createMissionSchema } from "@/features/teacher/mission-management/schemas/missionSchemas";
import { getTeacherMissionsServer } from "@/features/teacher/mission-management/services/missionServerService";

/**
 * GET /api/teacher/missions
 * Lấy danh sách bài tập kèm số liệu thống kê nộp bài
 */
export async function GET(req: Request) {
  try {
    const auth = await authorizeTeacherRequest(
      req,
      "Bạn không có quyền truy cập dữ liệu bài tập."
    );
    if (!auth.success) {
      return auth.response;
    }

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId") || undefined;
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;

    const missions = await getTeacherMissionsServer(auth.session, {
      classId,
      status,
      search,
    });

    return apiSuccess(missions);
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Lỗi máy chủ tại GET /api/teacher/missions:", error.message);
    return apiError("Đã xảy ra lỗi hệ thống khi tải danh sách bài tập.");
  }
}

/**
 * POST /api/teacher/missions
 * Giao bài tập mới cho học sinh và phân công vào lớp
 */
export async function POST(req: Request) {
  try {
    const auth = await authorizeTeacherRequest(
      req,
      "Bạn không có quyền giao bài tập mới."
    );
    if (!auth.success) {
      return auth.response;
    }
    const { session } = auth;

    const validation = await validateRequestBody(req, createMissionSchema);
    if (!validation.success) {
      return validation.response;
    }

    const data = validation.data;
    const nowIso = new Date().toISOString();

    // 1. Thêm bản ghi bài tập vào bảng missions
    const { data: createdMission, error: insertError } = await supabase
      .from("missions")
      .insert({
        title: data.title,
        description: data.description || "",
        submission_type: data.submission_type,
        min_reward_coins: data.min_reward_coins,
        max_reward_coins: data.max_reward_coins,
        due_at: new Date(data.due_at).toISOString(),
        is_active: data.is_active,
        is_deleted: false,
        grading_focus: data.grading_focus,
        custom_ai_prompt: data.custom_ai_prompt || null,
        allow_late_submission: data.allow_late_submission,
        ai_prompt_template_id: data.ai_prompt_template_id || null,
        created_by: session.userId,
        updated_by: session.userId,
        created_at: nowIso,
        updated_at: nowIso,
      })
      .select("*")
      .single();

    if (insertError || !createdMission) {
      console.error("Lỗi khi tạo bài tập:", insertError?.message);
      return apiError("Không thể tạo bài tập mới. Vui lòng thử lại sau.");
    }

    // 2. Thêm phân công lớp vào mission_classes
    if (data.assigned_class_ids.length > 0) {
      const classRows = data.assigned_class_ids.map((classId) => ({
        mission_id: createdMission.id,
        class_id: classId,
      }));

      const { error: assignError } = await supabase
        .from("mission_classes")
        .insert(classRows);

      if (assignError) {
        console.error("Lỗi khi phân công lớp cho bài tập:", assignError.message);
      }
    }

    // 3. Lấy thông tin hoàn chỉnh vừa tạo để trả về client
    const freshMissions = await getTeacherMissionsServer(session, {
      search: data.title,
    });

    const matchingItem =
      freshMissions.find((m) => m.id === createdMission.id) || createdMission;

    return apiSuccess(
      matchingItem,
      "Giao bài tập mới cho học sinh thành công!",
      HttpStatus.CREATED
    );
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Lỗi máy chủ tại POST /api/teacher/missions:", error.message);
    return apiError("Đã xảy ra lỗi hệ thống khi giao bài tập.");
  }
}
