"use client";

import { useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import {
  TeacherGradingSubmissionItem,
  SubmissionMissionFilterOption,
  MissionSubmissionSummary,
  StudentRosterItem,
  MissionDetailViewMode,
} from "../types";
import {
  MOCK_GRADING_SUBMISSIONS,
  MOCK_SUBMISSION_MISSIONS_FILTER,
  MOCK_MISSIONS_OVERVIEW,
  MOCK_CLASS_STUDENTS_ROSTER,
} from "../constants";
import { useSubmissionFilters } from "./useSubmissionFilters";
import { useSubmissionMutations } from "./useSubmissionMutations";

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
  initialViewMode?: MissionDetailViewMode
) {
  const [submissionsList, setSubmissionsList] = useState<
    TeacherGradingSubmissionItem[]
  >(() => initialSubmissions ?? MOCK_GRADING_SUBMISSIONS);

  const [missionFilterOptions] = useState<SubmissionMissionFilterOption[]>(
    () => MOCK_SUBMISSION_MISSIONS_FILTER
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mốc thời gian chuẩn tính từ lúc mount (Lazy State Initialization tuân thủ tuyệt đối React Pure Rules)
  const [currentSnapshotTime] = useState<number>(() => Date.now());

  // 1. Micro-Hook Bộ lọc, Thống kê KPI, Điều hướng Bài tập & Học sinh
  const filters = useSubmissionFilters({
    submissionsList,
    initialMissionId,
    initialViewMode,
  });

  // 2. Micro-Hook Chấm điểm, Duyệt bài, Yêu cầu nộp lại & Duyệt hàng loạt
  const mutations = useSubmissionMutations({
    submissionsList,
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

      // Đếm số bài trong submissionsList của mission này
      const relatedSubs = submissionsList.filter(
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
  }, [submissionsList, currentSnapshotTime]);

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

    // Nếu bài tập có danh sách tĩnh (như msn-001): đồng bộ lại trạng thái nộp bài theo submissionsList
    if (staticRoster) {
      return staticRoster.map((rosterItem) => {
        const liveSub = submissionsList.find(
          (s) =>
            s.mission_id === missionId &&
            s.student_id === rosterItem.student_id
        );

        if (!liveSub) return rosterItem;

        return {
          ...rosterItem,
          submission_id: liveSub.id,
          has_submitted: true,
          submitted_at: liveSub.created_at,
          is_late: liveSub.is_late,
          proof_image_count: liveSub.proof_image_urls.length,
          ai_score: liveSub.ai_score,
          ai_summary:
            liveSub.ai_raw_response?.summary_comment ?? rosterItem.ai_summary,
          approval_status: liveSub.approval_status,
          final_coins: liveSub.final_coins,
          readable: liveSub.readable,
        };
      });
    }

    // Các bài tập chưa có danh sách tĩnh: tổng hợp từ bài nộp thực tế của bài tập + danh sách học sinh nền
    const missionSubs = submissionsList.filter(
      (s) => s.mission_id === missionId
    );
    const className = selectedMission?.class_name ?? "Lớp 3A1";

    const submittedItems: StudentRosterItem[] = missionSubs.map((sub) => ({
      id: `ros-${missionId}-${sub.student_id}`,
      student_id: sub.student_id,
      student_name: sub.student_name,
      student_avatar: sub.student_avatar,
      student_phone: sub.student_phone,
      class_name: className,
      submission_id: sub.id,
      has_submitted: true,
      submitted_at: sub.created_at,
      is_late: sub.is_late,
      proof_image_count: sub.proof_image_urls.length,
      ai_score: sub.ai_score,
      ai_summary: sub.ai_raw_response?.summary_comment ?? null,
      approval_status: sub.approval_status,
      final_coins: sub.final_coins,
      readable: sub.readable,
    }));

    const submittedStudentIds = new Set(missionSubs.map((s) => s.student_id));
    const baseStudents = MOCK_CLASS_STUDENTS_ROSTER["msn-001"] ?? [];

    const unsubmittedItems: StudentRosterItem[] = baseStudents
      .filter((st) => !submittedStudentIds.has(st.student_id))
      .map((st) => ({
        ...st,
        id: `ros-${missionId}-${st.student_id}`,
        class_name: selectedMission?.class_name ?? st.class_name,
        submission_id: null,
        has_submitted: false,
        submitted_at: null,
        is_late: false,
        proof_image_count: 0,
        ai_score: null,
        ai_summary: null,
        approval_status: "unsubmitted",
        final_coins: null,
        readable: false,
      }));

    return [...submittedItems, ...unsubmittedItems];
  }, [filters.selectedMissionId, submissionsList, selectedMission]);

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
    submissionsList,
    missionFilterOptions,
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
