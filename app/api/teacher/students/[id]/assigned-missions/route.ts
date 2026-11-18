import { supabase } from "@/lib/supabase/db";
import { apiError, apiSuccess } from "@/lib/api/response";
import { authorizeTeacherRequest } from "@/lib/auth/guard";
import { HttpStatus } from "@/constants/http";
import { UserRole } from "@/constants/auth";
import {
  StudentMissionStatus,
  StudentMissionStatusType,
  MissionSubmissionType,
} from "@/constants";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export interface StudentAssignedMissionsApiResponse {
  student: {
    id: string;
    full_name: string;
    class_id?: string;
    class_name?: string;
  };
  summary: {
    total: number;
    completed: number;
    pending: number;
    unsubmitted: number;
    total_earned_coins: number;
  };
  items: Array<{
    id: string;
    mission_id: string;
    student_id: string;
    class_id?: string;
    title: string;
    description?: string;
    submission_type: string;
    reward_coins: number;
    min_reward_coins?: number;
    max_reward_coins?: number;
    status: StudentMissionStatusType;
    is_late: boolean;
    assigned_at: string;
    deadline?: string;
    submitted_at?: string | null;
    completed_at?: string | null;
    earned_coins: number;
    teacher_feedback?: string | null;
    proof_image_urls?: string[];
    attempt_number: number;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    has_more: boolean;
  };
}

/**
 * GET /api/teacher/students/[id]/assigned-missions
 * Lấy danh sách bài tập đã giao của học sinh kèm tiến độ và phân trang (Infinite Scroll)
 */
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    if (!id) {
      return apiError("Mã học sinh không hợp lệ.", HttpStatus.BAD_REQUEST);
    }

    const auth = await authorizeTeacherRequest(
      req,
      "Bạn không có quyền xem bài tập của học sinh."
    );
    if (!auth.success) {
      return auth.response;
    }

    // 1. Kiểm tra tài khoản học sinh
    const { data: studentRecord, error: studentError } = await supabase
      .from("users")
      .select("id, full_name, class_id")
      .eq("id", id)
      .eq("role", UserRole.STUDENT)
      .maybeSingle();

    if (studentError || !studentRecord) {
      return apiError("Không tìm thấy thông tin học sinh.", HttpStatus.NOT_FOUND);
    }

    // Lấy tên lớp
    let className = "Lớp học";
    if (studentRecord.class_id) {
      const { data: cls } = await supabase
        .from("classes")
        .select("class_name")
        .eq("id", studentRecord.class_id)
        .maybeSingle();
      if (cls?.class_name) className = cls.class_name;
    }

    // 2. Đọc query params: page, limit, status
    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get("limit") || "10", 10)));
    const filterStatus = url.searchParams.get("status") || "all";
    const offset = (page - 1) * limit;

    // 3. Lấy toàn bộ student_missions của học sinh để tính summary
    const { data: allStudentMissions, error: summaryError } = await supabase
      .from("student_missions")
      .select("id, mission_id, status, is_late, assigned_at, submitted_at, completed_at")
      .eq("student_id", id);

    if (summaryError) {
      console.error("Lỗi khi tải student_missions summary:", summaryError.message);
      return apiError("Không thể tải danh sách bài tập của học sinh.");
    }

    const allItems = allStudentMissions || [];
    const totalCount = allItems.length;
    const completedCount = allItems.filter(
      (m) => m.status === StudentMissionStatus.APPROVED
    ).length;
    const pendingCount = allItems.filter(
      (m) => m.status === StudentMissionStatus.SUBMITTED
    ).length;
    const unsubmittedCount = allItems.filter(
      (m) => m.status === StudentMissionStatus.ASSIGNED
    ).length;

    // 4. Lọc theo tab filterStatus nếu có
    let filteredList = allItems;
    if (filterStatus === "completed") {
      filteredList = allItems.filter(
        (m) => m.status === StudentMissionStatus.APPROVED
      );
    } else if (filterStatus === "pending") {
      filteredList = allItems.filter(
        (m) => m.status === StudentMissionStatus.SUBMITTED
      );
    } else if (filterStatus === "unsubmitted") {
      filteredList = allItems.filter(
        (m) => m.status === StudentMissionStatus.ASSIGNED
      );
    }

    const paginatedItems = filteredList.slice(offset, offset + limit);
    const hasMore = offset + limit < filteredList.length;

    if (paginatedItems.length === 0) {
      return apiSuccess({
        student: {
          id: studentRecord.id,
          full_name: studentRecord.full_name,
          class_id: studentRecord.class_id,
          class_name: className,
        },
        summary: {
          total: totalCount,
          completed: completedCount,
          pending: pendingCount,
          unsubmitted: unsubmittedCount,
          total_earned_coins: 0,
        },
        items: [],
        pagination: {
          page,
          limit,
          total: filteredList.length,
          has_more: false,
        },
      });
    }

    // 5. Lấy chi tiết thông tin bài tập từ bảng missions
    const missionIds = Array.from(new Set(paginatedItems.map((p) => p.mission_id)));
    const { data: missionsData } = await supabase
      .from("missions")
      .select("id, title, description, submission_type, min_reward_coins, max_reward_coins, due_at")
      .in("id", missionIds);

    const missionMap = new Map(
      (missionsData || []).map((m) => [m.id, m])
    );

    // 6. Lấy bài nộp mới nhất từ homework_submissions nếu học sinh đã nộp
    const { data: submissionsData } = await supabase
      .from("homework_submissions")
      .select("id, mission_id, proof_image_urls, teacher_feedback, final_coins, attempt_number, created_at")
      .eq("student_id", id)
      .in("mission_id", missionIds)
      .order("created_at", { ascending: false });

    const submissionMap = new Map<string, {
      proof_image_urls?: string[];
      teacher_feedback?: string | null;
      final_coins?: number;
      attempt_number?: number;
    }>();

    for (const sub of submissionsData || []) {
      if (!submissionMap.has(sub.mission_id)) {
        let proofs: string[] = [];
        if (Array.isArray(sub.proof_image_urls)) {
          proofs = sub.proof_image_urls as string[];
        }
        submissionMap.set(sub.mission_id, {
          proof_image_urls: proofs,
          teacher_feedback: sub.teacher_feedback,
          final_coins: sub.final_coins ?? 0,
          attempt_number: sub.attempt_number ?? 1,
        });
      }
    }

    // Tính tổng xu đã nhận từ bài tập
    let totalEarnedFromMissions = 0;
    for (const sub of submissionsData || []) {
      if (sub.final_coins) {
        totalEarnedFromMissions += sub.final_coins;
      }
    }

    // 7. Format kết quả
    const formattedItems = paginatedItems.map((sm) => {
      const mDetail = missionMap.get(sm.mission_id);
      const subDetail = submissionMap.get(sm.mission_id);

      return {
        id: sm.id,
        mission_id: sm.mission_id,
        student_id: id,
        class_id: studentRecord.class_id,
        title: mDetail?.title || "Bài tập rèn luyện",
        description: mDetail?.description || "",
        submission_type:
          mDetail?.submission_type || MissionSubmissionType.SUBJECTIVE_WRITING,
        reward_coins: mDetail?.max_reward_coins ?? 50,
        min_reward_coins: mDetail?.min_reward_coins ?? mDetail?.max_reward_coins ?? 50,
        max_reward_coins: mDetail?.max_reward_coins ?? 50,
        status: sm.status || StudentMissionStatus.ASSIGNED,
        is_late: sm.is_late ?? false,
        assigned_at: sm.assigned_at || new Date().toISOString(),
        deadline: mDetail?.due_at || undefined,
        submitted_at: sm.submitted_at || null,
        completed_at: sm.completed_at || null,
        earned_coins:
          subDetail?.final_coins ??
          (sm.status === StudentMissionStatus.APPROVED
            ? (mDetail?.max_reward_coins ?? 50)
            : 0),
        teacher_feedback: subDetail?.teacher_feedback || null,
        proof_image_urls: subDetail?.proof_image_urls || [],
        attempt_number: subDetail?.attempt_number ?? 1,
      };
    });

    return apiSuccess({
      student: {
        id: studentRecord.id,
        full_name: studentRecord.full_name,
        class_id: studentRecord.class_id,
        class_name: className,
      },
      summary: {
        total: totalCount,
        completed: completedCount,
        pending: pendingCount,
        unsubmitted: unsubmittedCount,
        total_earned_coins: totalEarnedFromMissions,
      },
      items: formattedItems,
      pagination: {
        page,
        limit,
        total: filteredList.length,
        has_more: hasMore,
      },
    });
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Lỗi máy chủ tại GET /api/teacher/students/[id]/assigned-missions:", error.message);
    return apiError(
      "Đã xảy ra lỗi máy chủ khi tải danh sách bài tập của học sinh.",
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}
