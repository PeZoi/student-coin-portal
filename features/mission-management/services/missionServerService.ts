import { supabase } from "@/lib/supabase/db";
import { getAuthSession, AuthTokenPayload } from "@/lib/auth/jwt";
import { UserRole } from "@/constants";
import {
  TeacherMissionItem,
  MissionStudentProgressItem,
  MissionSubmissionType,
  AiGradingErrorType,
  SubmissionApprovalStatus,
} from "../types";

export interface GetTeacherMissionsOptions {
  classId?: string;
  status?: string;
  search?: string;
}

/**
 * Service tải danh sách bài tập trực tiếp trên máy chủ (Server Component / Route Handler)
 * - Tối ưu 0ms độ trễ mạng client (Quy tắc 9 AGENTS.md)
 * - Bảo mật: chỉ cho phép TEACHER, SUPER_TEACHER và ADMIN truy xuất dữ liệu
 * - Sử dụng truy vấn song song (Parallel Queries) bằng Promise.all
 */
export async function getTeacherMissionsServer(
  customSession?: AuthTokenPayload | null,
  options?: GetTeacherMissionsOptions
): Promise<TeacherMissionItem[]> {
  try {
    const session =
      customSession !== undefined ? customSession : await getAuthSession();

    if (
      !session ||
      (session.role !== UserRole.TEACHER &&
        session.role !== UserRole.SUPER_TEACHER &&
        session.role !== UserRole.ADMIN)
    ) {
      return [];
    }

    const isAdmin = session.role === UserRole.ADMIN;
    const isGlobalAccess =
      session.role === UserRole.ADMIN || session.role === UserRole.SUPER_TEACHER;

    // 0. Kiểm tra phân công lớp học: Giáo viên thường chỉ được xem bài tập của các lớp mình phụ trách
    let teacherAssignedClassIds: string[] | null = null;
    if (!isGlobalAccess) {
      const { data: assignments, error: assignError } = await supabase
        .from("teacher_classes")
        .select("class_id")
        .eq("teacher_id", session.userId);

      if (assignError) {
        console.error("Lỗi khi kiểm tra phân công lớp của giáo viên:", assignError.message);
        return [];
      }

      // Giáo viên chưa được phân công lớp nào -> Tuyệt đối không được thấy bài tập của lớp khác
      if (!assignments || assignments.length === 0) {
        return [];
      }

      teacherAssignedClassIds = assignments.map((a: { class_id: string }) => a.class_id);
    }

    // 1. Khởi tạo truy vấn bảng missions
    let query = supabase
      .from("missions")
      .select(
        `
        id,
        title,
        description,
        submission_type,
        min_reward_coins,
        max_reward_coins,
        due_at,
        created_by,
        is_active,
        is_deleted,
        deleted_at,
        deleted_by,
        updated_by,
        updated_at,
        created_at,
        grading_focus,
        allow_late_submission,
        ai_prompt_template_id,
        custom_ai_prompt,
        users:created_by(full_name),
        mission_classes(
          class_id,
          classes(id, class_name)
        )
      `
      )
      .order("created_at", { ascending: false });

    // Lọc theo trạng thái xóa (Chỉ duy nhất Quản trị viên tối cao Admin mới có quyền tải cả danh sách thùng rác)
    if (!isAdmin) {
      query = query.eq("is_deleted", false);
    } else if (options?.status === "deleted") {
      query = query.eq("is_deleted", true);
    } else if (options?.status && options.status !== "all") {
      query = query.eq("is_deleted", false);
    }

    // Lọc theo trạng thái hoạt động / hết hạn
    if (options?.status && options.status !== "all" && options.status !== "deleted") {
      const nowIso = new Date().toISOString();
      if (options.status === "active") {
        query = query.eq("is_active", true).gt("due_at", nowIso);
      } else if (options.status === "expired") {
        query = query.eq("is_active", true).lte("due_at", nowIso);
      } else if (options.status === "inactive") {
        query = query.eq("is_active", false);
      }
    }

    // Tìm kiếm nhanh theo tiêu đề
    if (options?.search && options.search.trim()) {
      query = query.ilike("title", `%${options.search.trim()}%`);
    }

    // 2. Thực thi song song: Missions, Tổng hợp Submissions và Sĩ số học sinh từng lớp
    const [missionsRes, submissionsRes, studentsCountRes] = await Promise.all([
      query,
      supabase
        .from("homework_submissions")
        .select("mission_id, approval_status, is_late, final_coins, ai_score"),
      supabase
        .from("users")
        .select("class_id")
        .eq("role", UserRole.STUDENT)
        .eq("is_deleted", false),
    ]);

    if (missionsRes.error || !missionsRes.data) {
      console.error(
        "Lỗi khi tải danh sách bài tập trên server:",
        missionsRes.error?.message
      );
      return [];
    }

    // 3. Xây dựng Map sĩ số học sinh theo từng lớp
    const classStudentCountMap = new Map<string, number>();
    if (studentsCountRes.data) {
      for (const row of studentsCountRes.data) {
        if (row.class_id) {
          const current = classStudentCountMap.get(row.class_id) ?? 0;
          classStudentCountMap.set(row.class_id, current + 1);
        }
      }
    }

    // 4. Xây dựng Map thống kê bài nộp theo mission_id
    interface SubmissionStats {
      submitted_count: number;
      pending_review_count: number;
      approved_count: number;
      rejected_count: number;
      late_count: number;
      total_coins_awarded: number;
      ai_scores: number[];
    }

    const missionStatsMap = new Map<string, SubmissionStats>();
    if (submissionsRes.data) {
      for (const sub of submissionsRes.data) {
        if (!sub.mission_id) continue;
        const stats = missionStatsMap.get(sub.mission_id) ?? {
          submitted_count: 0,
          pending_review_count: 0,
          approved_count: 0,
          rejected_count: 0,
          late_count: 0,
          total_coins_awarded: 0,
          ai_scores: [],
        };

        stats.submitted_count += 1;
        if (sub.approval_status === "pending_approval") {
          stats.pending_review_count += 1;
        } else if (sub.approval_status === "approved") {
          stats.approved_count += 1;
          stats.total_coins_awarded += sub.final_coins ?? 0;
        } else if (sub.approval_status === "rejected") {
          stats.rejected_count += 1;
        }

        if (sub.is_late) {
          stats.late_count += 1;
        }

        if (sub.ai_score !== null && sub.ai_score !== undefined) {
          stats.ai_scores.push(Number(sub.ai_score));
        }

        missionStatsMap.set(sub.mission_id, stats);
      }
    }

    // 5. Chuẩn hóa và ghép nối dữ liệu
    const result: TeacherMissionItem[] = [];

    for (const raw of missionsRes.data) {
      // Phân tách danh sách lớp được giao
      const rawMissionClasses = (raw.mission_classes as unknown as {
        class_id: string;
        classes: { id: string; class_name: string } | null;
      }[]) || [];

      const assignedClassIds: string[] = [];
      const assignedClasses = rawMissionClasses
        .filter((mc) => mc.classes !== null)
        .map((mc) => {
          const cls = mc.classes!;
          assignedClassIds.push(cls.id);
          const studentCount = classStudentCountMap.get(cls.id) ?? 0;
          return {
            id: cls.id,
            class_name: cls.class_name,
            student_count: studentCount,
          };
        });

      // 1. Phân quyền giáo viên thường: Bài tập này PHẢI thuộc ít nhất 1 lớp mà giáo viên phụ trách
      if (teacherAssignedClassIds !== null) {
        const hasAccess = assignedClassIds.some((cid) =>
          teacherAssignedClassIds!.includes(cid)
        );
        if (!hasAccess) {
          continue;
        }
      }

      // 2. Nếu có lọc theo classId nhưng bài tập này không gán cho classId đó thì bỏ qua
      if (
        options?.classId &&
        options.classId !== "all" &&
        !assignedClassIds.includes(options.classId)
      ) {
        continue;
      }

      // Tổng sĩ số học sinh của các lớp được giao
      const totalStudents = assignedClasses.reduce(
        (sum, c) => sum + c.student_count,
        0
      );

      // Thống kê bài nộp
      const stats = missionStatsMap.get(raw.id);
      const submittedCount = stats?.submitted_count ?? 0;
      const pendingReviewCount = stats?.pending_review_count ?? 0;
      const approvedCount = stats?.approved_count ?? 0;
      const rejectedCount = stats?.rejected_count ?? 0;
      const lateCount = stats?.late_count ?? 0;
      const totalCoinsAwarded = stats?.total_coins_awarded ?? 0;
      const avgAiScore =
        stats && stats.ai_scores.length > 0
          ? Math.round(
              (stats.ai_scores.reduce((a, b) => a + b, 0) /
                stats.ai_scores.length) *
                10
            ) / 10
          : null;

      const creatorName =
        (raw.users as unknown as { full_name: string } | null)?.full_name ||
        "Giáo viên";

      result.push({
        id: raw.id,
        title: raw.title,
        description: raw.description || "",
        submission_type: (raw.submission_type as MissionSubmissionType) || "subjective_writing",
        min_reward_coins: raw.min_reward_coins,
        max_reward_coins: raw.max_reward_coins,
        due_at: raw.due_at,
        created_by: raw.created_by,
        creator_name: creatorName,
        is_active: raw.is_active ?? true,
        is_deleted: raw.is_deleted,
        deleted_at: raw.deleted_at,
        deleted_by: raw.deleted_by,
        updated_by: raw.updated_by,
        updated_at: raw.updated_at,
        created_at: raw.created_at || new Date().toISOString(),
        grading_focus: (raw.grading_focus as AiGradingErrorType[]) || ["spelling", "grammar"],
        allow_late_submission: raw.allow_late_submission ?? true,
        ai_prompt_template_id: raw.ai_prompt_template_id ?? null,
        custom_ai_prompt: raw.custom_ai_prompt ?? null,
        assigned_class_ids: assignedClassIds,
        assigned_classes: assignedClasses,
        total_students: totalStudents,
        submitted_count: submittedCount,
        pending_review_count: pendingReviewCount,
        approved_count: approvedCount,
        rejected_count: rejectedCount,
        late_count: lateCount,
        total_coins_awarded: totalCoinsAwarded,
        avg_ai_score: avgAiScore,
      });
    }

    return result;
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Lỗi ngoại lệ tại getTeacherMissionsServer:", error.message);
    return [];
  }
}

/**
 * Lấy danh sách tiến độ làm bài chi tiết của học sinh cho một bài tập cụ thể
 * - Trả về chính xác học sinh nào đã nộp (submitted) và học sinh nào chưa nộp (not_submitted)
 * - Lấy trực tiếp từ database, không sử dụng dữ liệu giả lập
 */
export async function getMissionStudentProgressServer(
  missionId: string,
  customSession?: AuthTokenPayload | null
): Promise<{
  mission: TeacherMissionItem | null;
  students: MissionStudentProgressItem[];
}> {
  try {
    const session =
      customSession !== undefined ? customSession : await getAuthSession();

    if (
      !session ||
      (session.role !== UserRole.TEACHER &&
        session.role !== UserRole.SUPER_TEACHER &&
        session.role !== UserRole.ADMIN)
    ) {
      return { mission: null, students: [] };
    }

    // 1. Lấy thông tin bài tập và các lớp được phân công
    const { data: missionData, error: missionError } = await supabase
      .from("missions")
      .select(
        `
        id,
        title,
        submission_type,
        due_at,
        is_active,
        is_deleted,
        mission_classes(
          class_id,
          classes(id, class_name)
        )
      `
      )
      .eq("id", missionId)
      .maybeSingle();

    if (missionError || !missionData) {
      return { mission: null, students: [] };
    }

    const rawClasses = (missionData.mission_classes as unknown as {
      class_id: string;
      classes: { id: string; class_name: string } | null;
    }[]) || [];

    const assignedClasses = rawClasses
      .filter((rc) => rc.classes !== null)
      .map((rc) => rc.classes!);

    const classIds = assignedClasses.map((c) => c.id);
    const classNameMap = new Map<string, string>();
    for (const c of assignedClasses) {
      classNameMap.set(c.id, c.class_name);
    }

    const isGlobalAccess =
      session.role === UserRole.ADMIN || session.role === UserRole.SUPER_TEACHER;

    // Phân quyền giáo viên thường: Chỉ được xem tiến độ bài tập nếu bài tập thuộc lớp mình phụ trách
    if (!isGlobalAccess) {
      const { data: assignments } = await supabase
        .from("teacher_classes")
        .select("class_id")
        .eq("teacher_id", session.userId);

      const teacherClassIds = (assignments || []).map(
        (a: { class_id: string }) => a.class_id
      );
      const hasPermission = classIds.some((cid) =>
        teacherClassIds.includes(cid)
      );
      if (!hasPermission) {
        return { mission: null, students: [] };
      }
    }

    // 2. Lấy toàn bộ học sinh thuộc các lớp được giao và bài nộp song song
    const [studentsRes, submissionsRes] = await Promise.all([
      classIds.length > 0
        ? supabase
            .from("users")
            .select("id, full_name, avatar_url, phone_zalo, class_id")
            .in("class_id", classIds)
            .eq("role", UserRole.STUDENT)
            .eq("is_deleted", false)
            .order("full_name", { ascending: true })
        : Promise.resolve({ data: [], error: null }),
      supabase
        .from("homework_submissions")
        .select(
          `
          id,
          student_id,
          submission_type,
          is_late,
          proof_image_urls,
          readable,
          unreadable_reason,
          ai_score,
          ai_suggested_coins,
          final_coins,
          teacher_feedback,
          approval_status,
          reviewed_by,
          reviewed_at,
          created_at
        `
        )
        .eq("mission_id", missionId),
    ]);

    const students = studentsRes.data || [];
    const submissions = submissionsRes.data || [];

    // Map bài nộp theo student_id
    interface RawSub {
      id: string;
      student_id: string;
      submission_type: string;
      is_late: boolean;
      proof_image_urls: unknown;
      readable: boolean;
      unreadable_reason: string | null;
      ai_score: number | null;
      ai_suggested_coins: number;
      final_coins: number | null;
      teacher_feedback: string | null;
      approval_status: string;
      reviewed_by: string | null;
      reviewed_at: string | null;
      created_at: string;
    }

    const subByStudent = new Map<string, RawSub>();
    for (const sub of (submissions as unknown as RawSub[])) {
      subByStudent.set(sub.student_id, sub);
    }

    // 3. Ghép nối danh sách học sinh: Đã nộp hoặc Chưa nộp
    const result: MissionStudentProgressItem[] = [];

    for (const student of students) {
      const sub = subByStudent.get(student.id);
      const studentClassName =
        student.class_id && classNameMap.has(student.class_id)
          ? classNameMap.get(student.class_id)!
          : "Lớp học";

      if (sub) {
        // Học sinh đã nộp bài
        let proofUrls: string[] = [];
        if (Array.isArray(sub.proof_image_urls)) {
          proofUrls = sub.proof_image_urls as string[];
        }

        result.push({
          id: student.id,
          student_name: student.full_name,
          student_avatar: student.avatar_url,
          student_phone: student.phone_zalo,
          class_id: student.class_id || "",
          class_name: studentClassName,
          submission_status: "submitted",
          submission_id: sub.id,
          submitted_at: sub.created_at,
          is_late: sub.is_late,
          approval_status: (sub.approval_status as SubmissionApprovalStatus) || "pending_approval",
          ai_score: sub.ai_score,
          final_coins: sub.final_coins,
          ai_suggested_coins: sub.ai_suggested_coins,
          teacher_feedback: sub.teacher_feedback,
          proof_image_urls: proofUrls,
        });
      } else {
        // Học sinh chưa nộp bài
        result.push({
          id: student.id,
          student_name: student.full_name,
          student_avatar: student.avatar_url,
          student_phone: student.phone_zalo,
          class_id: student.class_id || "",
          class_name: studentClassName,
          submission_status: "not_submitted",
        });
      }
    }

    return {
      mission: null,
      students: result,
    };
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error(
      "Lỗi ngoại lệ tại getMissionStudentProgressServer:",
      error.message
    );
    return { mission: null, students: [] };
  }
}

/**
 * Xóa mềm hoặc xóa vĩnh viễn thông minh qua RPC safe_delete_mission
 */
export async function safeDeleteMissionServer(
  missionId: string,
  userId: string
): Promise<{ success: boolean; resultType: string }> {
  const { data, error } = await supabase.rpc("safe_delete_mission", {
    p_mission_id: missionId,
    p_requesting_user_id: userId,
  });

  if (error) {
    console.error("Lỗi RPC safe_delete_mission:", error.message);
    throw new Error(error.message);
  }

  return { success: true, resultType: String(data) };
}

/**
 * Khôi phục bài tập từ thùng rác qua RPC restore_mission
 */
export async function restoreMissionServer(
  missionId: string
): Promise<boolean> {
  const { data, error } = await supabase.rpc("restore_mission", {
    p_mission_id: missionId,
  });

  if (error) {
    console.error("Lỗi RPC restore_mission:", error.message);
    throw new Error(error.message);
  }

  return Boolean(data);
}
