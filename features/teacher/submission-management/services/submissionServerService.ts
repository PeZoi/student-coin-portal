import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase/db";
import { AuthTokenPayload, getAuthSession } from "@/lib/auth/jwt";
import { getMyAssignedClassesServer } from "@/features/teacher/class-management/services/classServerService";
import { TEACHER_WORKSPACE_COOKIE_NAME } from "@/stores/useTeacherWorkspaceStore";
import {
  UserRole,
  StudentMissionStatus,
  SubmissionApprovalStatus,
  AiGradingErrorType,
  HttpStatus,
  HttpStatusCode,
} from "@/constants";
import { SUBMISSION_GRADING_CONFIG } from "../constants";
import {
  AiDetailedReviewItem,
  AiRawResponseData,
  GradingSubmissionErrorItem,
  MissionSubmissionDetailPayload,
  MissionSubmissionSummary,
  MissionSubmissionType,
  StudentRosterItem,
  TeacherGradingSubmissionItem,
} from "../types";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUuid(value: string | null | undefined): value is string {
  return typeof value === "string" && UUID_REGEX.test(value.trim());
}

function normalizeClassIdParam(classId?: string | null): string | null {
  if (!classId) return null;
  const trimmed = classId.trim();
  if (
    !trimmed ||
    trimmed === "all" ||
    trimmed === "null" ||
    trimmed === "undefined"
  ) {
    return null;
  }
  return isValidUuid(trimmed) ? trimmed : null;
}

interface AuthorizedClassScope {
  authorized: boolean;
  /** `null` = toàn trường (Admin / Super Teacher không lọc lớp) */
  targetClassIds: string[] | null;
}

/**
 * Helper dùng chung cho các Server Component `page.tsx`:
 * Đọc `teacher_selected_class_id` từ Cookie và đối chiếu với danh sách lớp giáo viên phụ trách
 */
export async function resolveTeacherActiveClassIdServer(
  session: AuthTokenPayload
): Promise<string | undefined> {
  const [cookieStore, teacherClasses] = await Promise.all([
    cookies(),
    getMyAssignedClassesServer(session),
  ]);

  const cookieClassId = cookieStore.get(TEACHER_WORKSPACE_COOKIE_NAME)?.value;
  const isValidClass =
    cookieClassId && teacherClasses.some((c) => c.id === cookieClassId);

  if (isValidClass) return cookieClassId;
  return teacherClasses.length > 0 ? teacherClasses[0].id : undefined;
}

/**
 * Helper dùng chung xác định danh sách lớp học giáo viên được phép truy cập
 */
export async function resolveAuthorizedClassIds(
  session: AuthTokenPayload,
  requestedClassId?: string | null
): Promise<AuthorizedClassScope> {
  const cleanClassId = normalizeClassIdParam(requestedClassId);
  const isGlobalAccess =
    session.role === UserRole.ADMIN || session.role === UserRole.SUPER_TEACHER;

  if (isGlobalAccess) {
    return {
      authorized: true,
      targetClassIds: cleanClassId ? [cleanClassId] : null,
    };
  }

  const { data: assignments, error } = await supabase
    .from("teacher_classes")
    .select("class_id")
    .eq("teacher_id", session.userId);

  if (error || !assignments || assignments.length === 0) {
    return { authorized: false, targetClassIds: [] };
  }

  const assignedClassIds = assignments.map((row) => row.class_id);

  if (cleanClassId) {
    if (!assignedClassIds.includes(cleanClassId)) {
      return { authorized: false, targetClassIds: [] };
    }
    return { authorized: true, targetClassIds: [cleanClassId] };
  }

  return { authorized: true, targetClassIds: assignedClassIds };
}

/**
 * Chuẩn hóa cột JSONB `proof_image_urls` thành `string[]` an toàn
 */
function normalizeProofImageUrls(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const urls: string[] = [];
  for (const item of raw) {
    if (typeof item === "string" && item.trim()) {
      urls.push(item.trim());
    } else if (
      typeof item === "object" &&
      item !== null &&
      "url" in item &&
      typeof (item as { url: unknown }).url === "string"
    ) {
      const u = (item as { url: string }).url.trim();
      if (u) urls.push(u);
    }
  }
  return urls;
}

function toStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const result = value.filter(
    (item): item is string => typeof item === "string" && item.trim().length > 0
  );
  return result.length > 0 ? result : [];
}

function toDetailedReviews(value: unknown): AiDetailedReviewItem[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const items: AiDetailedReviewItem[] = [];
  for (const rawItem of value) {
    if (typeof rawItem !== "object" || rawItem === null) continue;
    const obj = rawItem as Record<string, unknown>;
    const questionNumber =
      typeof obj.question_number === "string"
        ? obj.question_number
        : typeof obj.questionNumber === "string"
          ? obj.questionNumber
          : "";
    const statusRaw = obj.status;
    const status: AiDetailedReviewItem["status"] =
      statusRaw === "correct" ||
      statusRaw === "partially_correct" ||
      statusRaw === "incorrect"
        ? statusRaw
        : "incorrect";
    const feedback = typeof obj.feedback === "string" ? obj.feedback : "";
    if (!questionNumber && !feedback) continue;

    items.push({
      question_number: questionNumber,
      status,
      student_answer:
        typeof obj.student_answer === "string"
          ? obj.student_answer
          : typeof obj.studentAnswer === "string"
            ? obj.studentAnswer
            : undefined,
      correct_answer:
        typeof obj.correct_answer === "string"
          ? obj.correct_answer
          : typeof obj.correctAnswer === "string"
            ? obj.correctAnswer
            : undefined,
      feedback,
    });
  }
  return items;
}

/**
 * Chuẩn hóa `homework_submissions.ai_raw_response` sang chuẩn `snake_case`
 * (Tương thích ngược cả dữ liệu snake_case lẫn camelCase từ AI API)
 */
export function normalizeAiRawResponse(raw: unknown): AiRawResponseData | null {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    return null;
  }
  const obj = raw as Record<string, unknown>;

  const readable =
    typeof obj.readable === "boolean" ? obj.readable : undefined;
  const unreadableReason =
    typeof obj.unreadable_reason === "string"
      ? obj.unreadable_reason
      : typeof obj.unreadableReason === "string"
        ? obj.unreadableReason
        : null;
  const transcribedText =
    typeof obj.transcribed_text === "string"
      ? obj.transcribed_text
      : typeof obj.transcribedText === "string"
        ? obj.transcribedText
        : typeof obj.ocr_transcript === "string"
          ? obj.ocr_transcript
          : undefined;
  const overallComment =
    typeof obj.overall_comment === "string"
      ? obj.overall_comment
      : typeof obj.overallComment === "string"
        ? obj.overallComment
        : typeof obj.summary_comment === "string"
          ? obj.summary_comment
          : undefined;
  const suggestedRevision =
    typeof obj.suggested_revision === "string"
      ? obj.suggested_revision
      : typeof obj.suggestedRevision === "string"
        ? obj.suggestedRevision
        : undefined;

  const strengths = toStringArray(obj.strengths);
  const weaknesses = toStringArray(obj.weaknesses);
  const suggestions = toStringArray(obj.suggestions ?? obj.improvements);
  const uncertainties = toStringArray(obj.uncertainties);
  const detailedReviews = toDetailedReviews(
    obj.detailed_reviews ?? obj.detailedReviews
  );

  return {
    readable,
    unreadable_reason: unreadableReason,
    transcribed_text: transcribedText,
    overall_comment: overallComment,
    suggested_revision: suggestedRevision,
    strengths,
    weaknesses,
    suggestions,
    uncertainties,
    detailed_reviews: detailedReviews,
  };
}

/**
 * Lọc lấy lần nộp hợp lệ mới nhất (`attempt_number` lớn nhất, loại bỏ `cancelled`)
 * cho mỗi cặp `(mission_id, student_id)`
 */
function pickLatestActiveSubmissions<
  T extends {
    mission_id: string;
    student_id: string;
    attempt_number: number;
    approval_status: string;
  },
>(rows: T[]): T[] {
  const latestMap = new Map<string, T>();
  for (const row of rows) {
    if (row.approval_status === SubmissionApprovalStatus.CANCELLED) continue;
    const key = `${row.mission_id}::${row.student_id}`;
    const existing = latestMap.get(key);
    if (!existing || row.attempt_number > existing.attempt_number) {
      latestMap.set(key, row);
    }
  }
  return Array.from(latestMap.values());
}

/**
 * ==============================================================================
 * LEVEL 1 SERVER SERVICE: Danh sách Tổng quan Bài tập Cần duyệt
 * - Gọi thẳng Postgres RPC `get_submission_missions_overview` (SQL GROUP BY + DISTINCT ON)
 * - Triệt tiêu hoàn toàn giới hạn 1.000 dòng PostgREST, chỉ trả về đúng N bài tập
 * - Tự động lọc chỉ hiển thị bài còn hạn HOẶC đã quá hạn dưới `OVERVIEW_EXPIRED_WINDOW_DAYS` (7 ngày)
 * ==============================================================================
 */
export async function getSubmissionMissionsOverviewServer(
  customSession?: AuthTokenPayload | null,
  requestedClassId?: string | null
): Promise<MissionSubmissionSummary[]> {
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

    const scope = await resolveAuthorizedClassIds(session, requestedClassId);
    if (!scope.authorized) {
      return [];
    }

    if (scope.targetClassIds !== null && scope.targetClassIds.length === 0) {
      return [];
    }

    const { data, error } = await supabase.rpc(
      "get_submission_missions_overview",
      {
        p_class_ids: scope.targetClassIds ?? undefined,
        p_expired_window_days:
          SUBMISSION_GRADING_CONFIG.OVERVIEW_EXPIRED_WINDOW_DAYS,
      }
    );

    if (error || !data) {
      console.error(
        "Lỗi RPC get_submission_missions_overview:",
        error?.message
      );
      return [];
    }

    const rows = (data ?? []) as {
      id: string;
      title: string;
      description: string | null;
      due_at: string;
      min_reward_coins: number;
      max_reward_coins: number;
      submission_type: MissionSubmissionType;
      allow_late_submission: boolean;
      grading_focus: AiGradingErrorType[] | null;
      total_students: number;
      submitted_count: number;
      pending_count: number;
      approved_count: number;
      rejected_count: number;
      exempt_count: number;
      is_expired: boolean;
    }[];

    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      due_at: row.due_at,
      min_reward_coins: row.min_reward_coins,
      max_reward_coins: row.max_reward_coins,
      submission_type: row.submission_type as MissionSubmissionType,
      allow_late_submission: row.allow_late_submission,
      grading_focus: (row.grading_focus as AiGradingErrorType[] | null) ?? null,
      total_students: row.total_students,
      submitted_count: row.submitted_count,
      pending_count: row.pending_count,
      approved_count: row.approved_count,
      rejected_count: row.rejected_count,
      exempt_count: row.exempt_count,
      is_expired: row.is_expired,
    }));
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error(
      "Lỗi tại getSubmissionMissionsOverviewServer:",
      error.message
    );
    return [];
  }
}

interface JoinedUserSnippet {
  id: string;
  full_name: string;
  avatar_url?: string | null;
  phone_zalo?: string | null;
  is_deleted?: boolean;
}

function unwrapRelation<T>(raw: T | T[] | null | undefined): T | null {
  if (!raw) return null;
  return Array.isArray(raw) ? (raw[0] ?? null) : raw;
}

const ROSTER_STATUS_ORDER: Record<string, number> = {
  [SubmissionApprovalStatus.PENDING_APPROVAL]: 0,
  [SubmissionApprovalStatus.REJECTED]: 1,
  [SubmissionApprovalStatus.APPROVED]: 2,
  unsubmitted: 3,
};

/**
 * ==============================================================================
 * LEVEL 2 SERVER SERVICE: Chi tiết Bài tập + Danh sách Học sinh (Roster) + Bài nộp & Lỗi AI
 * - Tối ưu tốc độ: Chạy song song 4 truy vấn + 1 truy vấn gộp lỗi AI (0 N+1 query)
 * ==============================================================================
 */
export async function getMissionSubmissionDetailServer(
  missionId: string,
  customSession?: AuthTokenPayload | null,
  requestedClassId?: string | null
): Promise<MissionSubmissionDetailPayload | null> {
  try {
    if (!isValidUuid(missionId)) {
      return null;
    }

    const session =
      customSession !== undefined ? customSession : await getAuthSession();

    if (
      !session ||
      (session.role !== UserRole.TEACHER &&
        session.role !== UserRole.SUPER_TEACHER &&
        session.role !== UserRole.ADMIN)
    ) {
      return null;
    }

    const scope = await resolveAuthorizedClassIds(session, requestedClassId);
    if (!scope.authorized) {
      return null;
    }

    // Truy vấn song song thông tin bài tập, phân công lớp, học sinh được giao và bài nộp
    let studentMissionsQuery = supabase
      .from("student_missions")
      .select(
        `
        id,
        student_id,
        class_id,
        status,
        is_late,
        submitted_at,
        student:users!student_missions_student_id_fkey (
          id,
          full_name,
          avatar_url,
          phone_zalo,
          is_deleted
        )
      `
      )
      .eq("mission_id", missionId);

    if (scope.targetClassIds !== null) {
      if (scope.targetClassIds.length === 0) return null;
      studentMissionsQuery = studentMissionsQuery.in(
        "class_id",
        scope.targetClassIds
      );
    }

    const [missionRes, missionClassesRes, studentMissionsRes, submissionsRes] =
      await Promise.all([
        supabase
          .from("missions")
          .select(
            "id, title, description, due_at, min_reward_coins, max_reward_coins, submission_type, allow_late_submission, grading_focus, is_deleted"
          )
          .eq("id", missionId)
          .maybeSingle(),
        supabase
          .from("mission_classes")
          .select("class_id")
          .eq("mission_id", missionId),
        studentMissionsQuery,
        supabase
          .from("homework_submissions")
          .select(
            `
            id,
            attempt_number,
            mission_id,
            student_id,
            submission_type,
            is_late,
            proof_image_urls,
            readable,
            unreadable_reason,
            ai_raw_response,
            ai_score,
            correct_count,
            total_questions,
            ai_suggested_coins,
            final_coins,
            final_score,
            teacher_feedback,
            approval_status,
            reviewed_by,
            reviewed_at,
            cancelled_at,
            is_media_purged,
            media_purged_at,
            created_at,
            student:users!homework_submissions_student_id_fkey (
              id,
              full_name,
              avatar_url,
              phone_zalo
            ),
            reviewer:users!homework_submissions_reviewed_by_fkey (
              id,
              full_name
            )
          `
          )
          .eq("mission_id", missionId)
          .neq("approval_status", SubmissionApprovalStatus.CANCELLED)
          .order("created_at", { ascending: false }),
      ]);

    if (missionRes.error || !missionRes.data || missionRes.data.is_deleted) {
      return null;
    }

    const missionRow = missionRes.data;

    // Kiểm tra phân quyền lớp của giáo viên thường trên mission này
    if (session.role === UserRole.TEACHER && scope.targetClassIds !== null) {
      const missionClassIds = (missionClassesRes.data ?? []).map(
        (mc) => mc.class_id
      );
      const hasAccess = missionClassIds.some((cid) =>
        scope.targetClassIds!.includes(cid)
      );
      if (!hasAccess) {
        return null;
      }
    }

    // Lọc học sinh hợp lệ (bỏ exempt & học sinh đã xóa mềm)
    let exemptCount = 0;
    const validStudentMissions: {
      id: string;
      student_id: string;
      full_name: string;
      avatar_url: string | null;
      phone_zalo: string | null;
    }[] = [];

    for (const sm of studentMissionsRes.data ?? []) {
      if (sm.status === StudentMissionStatus.EXEMPT) {
        exemptCount += 1;
        continue;
      }
      const studentObj = unwrapRelation(
        sm.student as JoinedUserSnippet | JoinedUserSnippet[] | null
      );
      if (!studentObj || studentObj.is_deleted) continue;

      validStudentMissions.push({
        id: sm.id,
        student_id: sm.student_id,
        full_name: studentObj.full_name,
        avatar_url: studentObj.avatar_url ?? null,
        phone_zalo: studentObj.phone_zalo ?? null,
      });
    }

    const allowedStudentIds = new Set(
      validStudentMissions.map((s) => s.student_id)
    );

    // Lọc lấy bài nộp mới nhất cho mỗi học sinh trong phạm vi lớp hợp lệ
    const dedupedRawSubs = pickLatestActiveSubmissions(
      submissionsRes.data ?? []
    ).filter((sub) =>
      allowedStudentIds.size > 0
        ? allowedStudentIds.has(sub.student_id)
        : scope.targetClassIds === null
    );

    // Truy vấn gộp toàn bộ lỗi AI của các bài nộp trong 1 query duy nhất
    const submissionIds = dedupedRawSubs.map((s) => s.id);
    const errorsBySubmission = new Map<string, GradingSubmissionErrorItem[]>();

    if (submissionIds.length > 0) {
      const { data: errRows } = await supabase
        .from("ai_submission_errors")
        .select(
          "id, submission_id, line_number, student_text, correction_text, error_type, severity, explanation"
        )
        .in("submission_id", submissionIds)
        .order("line_number", { ascending: true, nullsFirst: false });

      for (const e of errRows ?? []) {
        let list = errorsBySubmission.get(e.submission_id);
        if (!list) {
          list = [];
          errorsBySubmission.set(e.submission_id, list);
        }
        list.push({
          id: e.id,
          submission_id: e.submission_id,
          line_number: e.line_number,
          student_text: e.student_text,
          correction_text: e.correction_text,
          error_type: e.error_type as AiGradingErrorType,
          severity: e.severity,
          explanation: e.explanation,
        });
      }
    }

    // Dựng danh sách TeacherGradingSubmissionItem
    const submissions: TeacherGradingSubmissionItem[] = dedupedRawSubs.map(
      (sub) => {
        const studentObj = unwrapRelation(
          sub.student as JoinedUserSnippet | JoinedUserSnippet[] | null
        );
        const reviewerObj = unwrapRelation(
          sub.reviewer as JoinedUserSnippet | JoinedUserSnippet[] | null
        );

        return {
          id: sub.id,
          attempt_number: sub.attempt_number,
          mission_id: sub.mission_id,
          student_id: sub.student_id,
          submission_type: sub.submission_type as MissionSubmissionType,
          is_late: sub.is_late,
          proof_image_urls: normalizeProofImageUrls(sub.proof_image_urls),
          readable: sub.readable,
          unreadable_reason: sub.unreadable_reason,
          ai_raw_response: normalizeAiRawResponse(sub.ai_raw_response),
          ai_score: sub.ai_score !== null ? Number(sub.ai_score) : null,
          correct_count: sub.correct_count,
          total_questions: sub.total_questions,
          ai_suggested_coins: sub.ai_suggested_coins,
          final_coins: sub.final_coins,
          final_score:
            sub.final_score !== null ? Number(sub.final_score) : null,
          teacher_feedback: sub.teacher_feedback,
          approval_status: sub.approval_status as SubmissionApprovalStatus,
          reviewed_by: sub.reviewed_by,
          reviewed_by_name: reviewerObj?.full_name ?? null,
          reviewed_at: sub.reviewed_at,
          cancelled_at: sub.cancelled_at,
          is_media_purged: sub.is_media_purged,
          media_purged_at: sub.media_purged_at,
          created_at: sub.created_at ?? new Date().toISOString(),
          student_name: studentObj?.full_name ?? "Học sinh",
          student_avatar: studentObj?.avatar_url ?? null,
          student_phone: studentObj?.phone_zalo ?? null,
          mission_title: missionRow.title,
          mission_description: missionRow.description,
          min_reward_coins: missionRow.min_reward_coins,
          max_reward_coins: missionRow.max_reward_coins,
          mission_due_at: missionRow.due_at,
          allow_late_submission: missionRow.allow_late_submission,
          grading_focus:
            (missionRow.grading_focus as AiGradingErrorType[] | null) ?? null,
          errors: errorsBySubmission.get(sub.id) ?? [],
        };
      }
    );

    const submissionByStudentId = new Map<string, TeacherGradingSubmissionItem>(
      submissions.map((s) => [s.student_id, s])
    );

    // Dựng danh sách StudentRosterItem (đã nộp + chưa nộp)
    const roster: StudentRosterItem[] = validStudentMissions.map((st) => {
      const sub = submissionByStudentId.get(st.student_id);
      if (sub) {
        return {
          id: `ros-${missionId}-${st.student_id}`,
          student_id: st.student_id,
          student_name: st.full_name,
          student_avatar: st.avatar_url,
          student_phone: st.phone_zalo,
          submission_id: sub.id,
          attempt_number: sub.attempt_number,
          has_submitted: true,
          submitted_at: sub.created_at,
          is_late: sub.is_late,
          proof_image_count: sub.proof_image_urls.length,
          correct_count: sub.correct_count,
          total_questions: sub.total_questions,
          error_count: sub.errors.length,
          ai_score: sub.ai_score,
          approval_status: sub.approval_status,
          ai_suggested_coins: sub.ai_suggested_coins,
          final_coins: sub.final_coins,
          final_score: sub.final_score,
          readable: sub.readable,
          teacher_feedback: sub.teacher_feedback,
          reviewed_by: sub.reviewed_by,
          reviewed_by_name: sub.reviewed_by_name ?? null,
          reviewed_at: sub.reviewed_at,
        };
      }

      return {
        id: `ros-${missionId}-${st.student_id}`,
        student_id: st.student_id,
        student_name: st.full_name,
        student_avatar: st.avatar_url,
        student_phone: st.phone_zalo,
        submission_id: null,
        attempt_number: 0,
        has_submitted: false,
        submitted_at: null,
        is_late: false,
        proof_image_count: 0,
        correct_count: null,
        total_questions: null,
        error_count: 0,
        ai_score: null,
        approval_status: "unsubmitted",
        ai_suggested_coins: null,
        final_coins: null,
        final_score: null,
        readable: false,
        teacher_feedback: null,
        reviewed_by: null,
        reviewed_by_name: null,
        reviewed_at: null,
      };
    });

    // Sắp xếp Roster: Chờ duyệt -> Cần sửa -> Đã duyệt -> Chưa nộp
    roster.sort((a, b) => {
      const orderDiff =
        (ROSTER_STATUS_ORDER[a.approval_status] ?? 9) -
        (ROSTER_STATUS_ORDER[b.approval_status] ?? 9);
      if (orderDiff !== 0) return orderDiff;
      return a.student_name.localeCompare(b.student_name, "vi");
    });

    // Tính KPI tổng hợp của mission
    let pendingCount = 0;
    let approvedCount = 0;
    let rejectedCount = 0;
    for (const sub of submissions) {
      if (sub.approval_status === SubmissionApprovalStatus.PENDING_APPROVAL) {
        pendingCount += 1;
      } else if (sub.approval_status === SubmissionApprovalStatus.APPROVED) {
        approvedCount += 1;
      } else if (sub.approval_status === SubmissionApprovalStatus.REJECTED) {
        rejectedCount += 1;
      }
    }

    const mission: MissionSubmissionSummary = {
      id: missionRow.id,
      title: missionRow.title,
      description: missionRow.description,
      due_at: missionRow.due_at,
      min_reward_coins: missionRow.min_reward_coins,
      max_reward_coins: missionRow.max_reward_coins,
      submission_type: missionRow.submission_type as MissionSubmissionType,
      allow_late_submission: missionRow.allow_late_submission,
      grading_focus:
        (missionRow.grading_focus as AiGradingErrorType[] | null) ?? null,
      total_students: Math.max(roster.length, submissions.length),
      submitted_count: submissions.length,
      pending_count: pendingCount,
      approved_count: approvedCount,
      rejected_count: rejectedCount,
      exempt_count: exemptCount,
      is_expired: new Date(missionRow.due_at).getTime() < Date.now(),
    };

    return {
      mission,
      roster,
      submissions,
    };
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Lỗi tại getMissionSubmissionDetailServer:", error.message);
    return null;
  }
}

/**
 * Helper kiểm tra phân quyền giáo viên đối với danh sách bài nộp trước khi gọi RPC Duyệt / Từ chối
 */
export async function assertTeacherCanGradeSubmissionsServer(
  session: AuthTokenPayload,
  submissionIds: string[]
): Promise<
  | { ok: true }
  | { ok: false; status: HttpStatusCode; message: string }
> {
  const validIds = submissionIds.filter((id) => isValidUuid(id));
  if (validIds.length === 0 || validIds.length !== submissionIds.length) {
    return {
      ok: false,
      status: HttpStatus.BAD_REQUEST,
      message: "Mã bài nộp không hợp lệ.",
    };
  }

  const { data: subRows, error } = await supabase
    .from("homework_submissions")
    .select(
      `
      id,
      mission_id,
      student_id,
      approval_status,
      student:users!homework_submissions_student_id_fkey (
        id,
        class_id
      )
    `
    )
    .in("id", validIds);

  if (error || !subRows || subRows.length === 0) {
    return {
      ok: false,
      status: HttpStatus.NOT_FOUND,
      message: "Không tìm thấy bài nộp trong hệ thống.",
    };
  }

  if (subRows.length !== validIds.length) {
    return {
      ok: false,
      status: HttpStatus.NOT_FOUND,
      message: "Một số bài nộp không tồn tại trong hệ thống.",
    };
  }

  // Giáo viên thường chỉ được duyệt bài thuộc lớp mình phụ trách
  // Ưu tiên kiểm tra theo lớp lúc giao bài (`student_missions.class_id`) kết hợp `users.class_id` (xử lý học sinh chuyển lớp giữa kỳ)
  if (session.role === UserRole.TEACHER) {
    const missionIds = Array.from(new Set(subRows.map((r) => r.mission_id)));
    const studentIds = Array.from(new Set(subRows.map((r) => r.student_id)));

    const [assignmentsRes, studentMissionsRes] = await Promise.all([
      supabase
        .from("teacher_classes")
        .select("class_id")
        .eq("teacher_id", session.userId),
      supabase
        .from("student_missions")
        .select("mission_id, student_id, class_id")
        .in("mission_id", missionIds)
        .in("student_id", studentIds),
    ]);

    if (
      assignmentsRes.error ||
      !assignmentsRes.data ||
      assignmentsRes.data.length === 0
    ) {
      return {
        ok: false,
        status: HttpStatus.FORBIDDEN,
        message: "Bạn chưa được phân công phụ trách lớp học nào.",
      };
    }

    const assignedSet = new Set(assignmentsRes.data.map((a) => a.class_id));
    const smClassMap = new Map<string, string>();
    for (const sm of studentMissionsRes.data ?? []) {
      smClassMap.set(`${sm.mission_id}::${sm.student_id}`, sm.class_id);
    }

    for (const row of subRows) {
      const assignedClassAtMission = smClassMap.get(
        `${row.mission_id}::${row.student_id}`
      );
      const studentObj = unwrapRelation(
        row.student as
          | { id: string; class_id: string | null }
          | { id: string; class_id: string | null }[]
          | null
      );
      const currentStudentClassId = studentObj?.class_id;

      const hasPermission =
        (assignedClassAtMission && assignedSet.has(assignedClassAtMission)) ||
        (currentStudentClassId && assignedSet.has(currentStudentClassId));

      if (!hasPermission) {
        return {
          ok: false,
          status: HttpStatus.FORBIDDEN,
          message:
            "Bạn không được phân công phụ trách lớp của học sinh có bài nộp này.",
        };
      }
    }
  }

  return { ok: true };
}
