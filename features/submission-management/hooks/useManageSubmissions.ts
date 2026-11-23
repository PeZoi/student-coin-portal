"use client";

import { useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import {
  TeacherGradingSubmissionItem,
  MissionSubmissionSummary,
  StudentRosterItem,
  MissionDetailViewMode,
} from "../types";
import {
  MOCK_GRADING_SUBMISSIONS,
  MOCK_MISSIONS_OVERVIEW,
  MOCK_CLASS_STUDENTS_ROSTER,
} from "../constants";
import { useSubmissionFilters } from "./useSubmissionFilters";
import { useSubmissionMutations } from "./useSubmissionMutations";

/**
 * Lấy danh sách bài nộp hợp lệ mới nhất cho mỗi cặp (mission_id, student_id):
 * - Bỏ qua các bản ghi đã bị học sinh hủy (`cancelled`)
 * - Ưu tiên `attempt_number` lớn nhất
 */
function getLatestActiveSubmissions(
  list: TeacherGradingSubmissionItem[]
): TeacherGradingSubmissionItem[] {
  const latestByKey = new Map<string, TeacherGradingSubmissionItem>();
  for (const sub of list) {
    if (sub.approval_status === "cancelled") continue;
    const key = `${sub.mission_id}::${sub.student_id}`;
    const existing = latestByKey.get(key);
    if (!existing || sub.attempt_number > existing.attempt_number) {
      latestByKey.set(key, sub);
    }
  }
  return Array.from(latestByKey.values());
}

/**
 * Root Orchestrator Hook: Điều phối toàn bộ Không gian Duyệt Bài Tập của Giáo Viên
 * - Quản lý 2 tầng màn hình:
 *   + Level 1: Tổng quan danh sách bài tập (Assignment Hub)
 *   + Level 2: Chi tiết bài tập & Không gian chấm bài (Grading Studio & Student Roster)
 * - Tuân thủ kiến trúc Micro-Hooks (Quy tắc 12) & Thin Component Pattern
 */
export function useManageSubmissions(
  initialSubmissions?: TeacherGradingSubmissionItem[],
  initialMissionId?: string,
  initialViewMode?: MissionDetailViewMode,
  initialStudentId?: string
) {
  const [submissionsList, setSubmissionsList] = useState<
    TeacherGradingSubmissionItem[]
  >(() => initialSubmissions ?? MOCK_GRADING_SUBMISSIONS);

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mốc thời gian chuẩn tính từ lúc mount (Lazy State Initialization tuân thủ tuyệt đối React Pure Rules)
  const [currentSnapshotTime] = useState<number>(() => Date.now());

  // Danh sách bài nộp mới nhất (bỏ qua cancelled, chọn attempt_number lớn nhất)
  const latestSubmissionsList = useMemo(
    () => getLatestActiveSubmissions(submissionsList),
    [submissionsList]
  );

  // 1. Micro-Hook Bộ lọc, Thống kê KPI, Điều hướng Bài tập & Học sinh
  const filters = useSubmissionFilters({
    submissionsList: latestSubmissionsList,
    initialMissionId,
    initialViewMode,
    initialStudentId,
  });

  // 2. Micro-Hook Chấm điểm, Duyệt bài, Yêu cầu nộp lại & Duyệt hàng loạt
  const mutations = useSubmissionMutations({
    submissionsList: latestSubmissionsList,
    setSubmissionsList,
    filteredSubmissions: filters.filteredSubmissions,
    activeIndex: filters.activeIndex,
    handleSelectSubmission: filters.handleSelectSubmission,
    missionIdFilter: filters.missionIdFilter,
  });

  // 3. Tính toán Danh sách Bài tập Tổng hợp & Sắp xếp bài còn hạn lên trước, bài quá hạn ở CUỐI CÙNG
  const missionsOverview = useMemo<MissionSubmissionSummary[]>(() => {
    const rawList = MOCK_MISSIONS_OVERVIEW.map((item) => {
      const isExpired = new Date(item.due_at).getTime() < currentSnapshotTime;

      // Đếm số bài trong latestSubmissionsList của mission này
      const relatedSubs = latestSubmissionsList.filter(
        (sub) => sub.mission_id === item.id
      );
      if (relatedSubs.length === 0) {
        return {
          ...item,
          is_expired: isExpired,
        };
      }

      let pending = 0;
      let approved = 0;
      let rejected = 0;

      for (const sub of relatedSubs) {
        if (sub.approval_status === "pending_approval") pending += 1;
        else if (sub.approval_status === "approved") approved += 1;
        else if (sub.approval_status === "rejected") rejected += 1;
      }

      return {
        ...item,
        pending_count: pending,
        approved_count: approved,
        rejected_count: rejected,
        is_expired: isExpired,
      };
    });

    // Sắp xếp: Bài còn hạn lên trước, bài quá hạn ở CUỐI CÙNG
    return rawList.sort((a, b) => {
      if (a.is_expired && !b.is_expired) return 1;
      if (!a.is_expired && b.is_expired) return -1;
      if (!a.is_expired && !b.is_expired) {
        if (a.pending_count > 0 && b.pending_count === 0) return -1;
        if (a.pending_count === 0 && b.pending_count > 0) return 1;
        return new Date(a.due_at).getTime() - new Date(b.due_at).getTime();
      }
      return new Date(b.due_at).getTime() - new Date(a.due_at).getTime();
    });
  }, [latestSubmissionsList, currentSnapshotTime]);

  // Thông tin bài tập đang được chọn
  const selectedMission = useMemo(() => {
    if (!filters.selectedMissionId) return undefined;
    return missionsOverview.find((m) => m.id === filters.selectedMissionId);
  }, [missionsOverview, filters.selectedMissionId]);

  // Danh sách toàn bộ học sinh (cả đã nộp và chưa nộp) cho bài tập đang chọn
  const studentRoster = useMemo<StudentRosterItem[]>(() => {
    const missionId = filters.selectedMissionId;
    if (!missionId) return [];

    const staticRoster = MOCK_CLASS_STUDENTS_ROSTER[missionId];

    // Nếu bài tập có danh sách tĩnh (như msn-001): đồng bộ lại trạng thái nộp bài theo latestSubmissionsList
    if (staticRoster) {
      return staticRoster.map((rosterItem) => {
        const liveSub = latestSubmissionsList.find(
          (s) =>
            s.mission_id === missionId &&
            s.student_id === rosterItem.student_id
        );

        if (!liveSub) return rosterItem;

        return {
          ...rosterItem,
          submission_id: liveSub.id,
          attempt_number: liveSub.attempt_number,
          has_submitted: true,
          submitted_at: liveSub.created_at,
          is_late: liveSub.is_late,
          proof_image_count: liveSub.proof_image_urls.length,
          correct_count: liveSub.correct_count,
          total_questions: liveSub.total_questions,
          error_count: liveSub.errors.length,
          ai_score: liveSub.ai_score,
          approval_status: liveSub.approval_status,
          ai_suggested_coins: liveSub.ai_suggested_coins,
          final_coins: liveSub.final_coins,
          final_score: liveSub.final_score,
          readable: liveSub.readable,
          teacher_feedback: liveSub.teacher_feedback,
          reviewed_by: liveSub.reviewed_by,
          reviewed_by_name:
            liveSub.reviewed_by_name ??
            (liveSub.reviewed_by ? "Cô Minh Anh" : null),
          reviewed_at: liveSub.reviewed_at,
        };
      });
    }

    // Các bài tập chưa có danh sách tĩnh: tổng hợp từ bài nộp thực tế của bài tập + danh sách học sinh nền
    const missionSubs = latestSubmissionsList.filter(
      (s) => s.mission_id === missionId
    );

    const submittedItems: StudentRosterItem[] = missionSubs.map((sub) => ({
      id: `ros-${missionId}-${sub.student_id}`,
      student_id: sub.student_id,
      student_name: sub.student_name,
      student_avatar: sub.student_avatar,
      student_phone: sub.student_phone,
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
      reviewed_by_name:
        sub.reviewed_by_name ?? (sub.reviewed_by ? "Cô Minh Anh" : null),
      reviewed_at: sub.reviewed_at,
    }));

    const submittedStudentIds = new Set(missionSubs.map((s) => s.student_id));
    const baseStudents = MOCK_CLASS_STUDENTS_ROSTER["msn-001"] ?? [];

    const unsubmittedItems: StudentRosterItem[] = baseStudents
      .filter((st) => !submittedStudentIds.has(st.student_id))
      .map((st) => ({
        ...st,
        id: `ros-${missionId}-${st.student_id}`,
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
      }));

    return [...submittedItems, ...unsubmittedItems];
  }, [filters.selectedMissionId, latestSubmissionsList]);

  // Thống kê toàn cục trên toàn bộ các bài tập (Level 1 KPIs)
  const globalKpis = useMemo(() => {
    let totalPending = 0;
    let totalApproved = 0;
    let totalSubmitted = 0;
    let totalStudentsSum = 0;

    for (const mission of missionsOverview) {
      totalPending += mission.pending_count;
      totalApproved += mission.approved_count;
      totalSubmitted += mission.submitted_count;
      totalStudentsSum += mission.total_students;
    }

    const overallRate =
      totalStudentsSum > 0
        ? Math.round((totalSubmitted / totalStudentsSum) * 100)
        : 0;

    return {
      totalMissionsCount: missionsOverview.length,
      totalPendingAllMissions: totalPending,
      totalApprovedAllMissions: totalApproved,
      totalSubmittedAllMissions: totalSubmitted,
      overallSubmissionRate: overallRate,
    };
  }, [missionsOverview]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Đã đồng bộ danh sách bài tập và bài nộp mới nhất!");
    }, 300);
  }, []);

  return {
    submissionsList: latestSubmissionsList,
    missionsOverview,
    selectedMission,
    studentRoster,
    isRefreshing,
    handleRefresh,
    ...globalKpis,
    ...filters,
    ...mutations,
  };
}
