"use client";

import { useState, useMemo, useCallback } from "react";
import { normalizeText } from "@/lib/utils";
import { SubmissionApprovalStatus } from "@/constants";
import {
  TeacherGradingSubmissionItem,
  SubmissionStatusFilter,
  MissionDetailViewMode,
} from "../types";

interface UseSubmissionFiltersParams {
  submissionsList: TeacherGradingSubmissionItem[];
  initialMissionId?: string;
  initialViewMode?: MissionDetailViewMode;
}

/**
 * Micro-Hook 1: Quản lý Bộ lọc, Điều hướng Bài tập (Level 1 ↔ Level 2),
 * Thống kê KPI và Danh sách Học sinh trong Studio Duyệt Bài Tập
 * - Tuân thủ Quy tắc 8: Tính toán trực tiếp khi render (Derive State), không dùng `useEffect`
 */
export function useSubmissionFilters({
  submissionsList,
  initialMissionId,
  initialViewMode,
}: UseSubmissionFiltersParams) {
  // 1. Quản lý Bài tập đang chọn: null = Màn hình Danh sách Bài tập; string = Màn hình Chi tiết Bài tập
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(
    initialMissionId || null
  );

  // 2. Chế độ xem trong màn hình Chi tiết: "studio" (Chấm nhanh 3 cột) hoặc "roster" (Danh sách toàn bộ học sinh)
  const [viewMode, setViewMode] = useState<MissionDetailViewMode>(
    initialViewMode ?? "studio"
  );

  // 3. Bộ lọc trạng thái bài nộp trong Studio/Roster
  const [statusFilter, setStatusFilter] =
    useState<SubmissionStatusFilter>(SubmissionApprovalStatus.PENDING_APPROVAL);

  // 4. Từ khóa tìm kiếm học sinh
  const [searchQuery, setSearchQuery] = useState<string>("");

  // 5. Học sinh / Bài nộp đang được active trong Studio
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<
    string | null
  >(null);

  // 6. Trang ảnh đang soi (0-based index: 0..4)
  const [activePhotoIndex, setActivePhotoIndex] = useState<number>(0);

  // Danh sách bài nộp thuộc phạm vi Bài tập đang chọn
  const missionScopedList = useMemo(() => {
    if (!selectedMissionId || selectedMissionId === "all") {
      return submissionsList;
    }
    return submissionsList.filter((item) => item.mission_id === selectedMissionId);
  }, [submissionsList, selectedMissionId]);

  // Thống kê KPIs trên phạm vi bài tập đang chọn
  const kpiStats = useMemo(() => {
    let pendingCount = 0;
    let approvedCount = 0;
    let rejectedCount = 0;
    let validAiPendingCount = 0;
    let totalCoinsAwarded = 0;

    for (const sub of missionScopedList) {
      if (sub.approval_status === SubmissionApprovalStatus.PENDING_APPROVAL) {
        pendingCount += 1;
        if (sub.readable && (sub.ai_score === null || sub.ai_score >= 8.0)) {
          validAiPendingCount += 1;
        }
      } else if (sub.approval_status === SubmissionApprovalStatus.APPROVED) {
        approvedCount += 1;
        totalCoinsAwarded += sub.final_coins ?? sub.ai_suggested_coins;
      } else if (sub.approval_status === SubmissionApprovalStatus.REJECTED) {
        rejectedCount += 1;
      }
    }

    return {
      totalCount: missionScopedList.length,
      pendingCount,
      approvedCount,
      rejectedCount,
      validAiPendingCount,
      totalCoinsAwarded,
    };
  }, [missionScopedList]);

  // Danh sách bài nộp sau khi áp dụng Tab trạng thái + Tìm kiếm
  const filteredSubmissions = useMemo(() => {
    const query = normalizeText(searchQuery);

    return missionScopedList.filter((item) => {
      if (statusFilter !== "all" && item.approval_status !== statusFilter) {
        return false;
      }
      if (query) {
        const matchStudent = normalizeText(item.student_name).includes(query);
        const matchMission = normalizeText(item.mission_title).includes(query);
        if (!matchStudent && !matchMission) return false;
      }
      return true;
    });
  }, [missionScopedList, statusFilter, searchQuery]);

  // Suy luận bài nộp đang chọn trực tiếp khi render
  const activeSubmission = useMemo(() => {
    if (filteredSubmissions.length === 0) return null;
    if (selectedSubmissionId) {
      const found = filteredSubmissions.find(
        (s) => s.id === selectedSubmissionId
      );
      if (found) return found;
    }
    return filteredSubmissions[0];
  }, [filteredSubmissions, selectedSubmissionId]);

  const activeIndex = useMemo(() => {
    if (!activeSubmission) return -1;
    return filteredSubmissions.findIndex((s) => s.id === activeSubmission.id);
  }, [filteredSubmissions, activeSubmission]);

  const hasPrevSubmission = activeIndex > 0;
  const hasNextSubmission =
    activeIndex >= 0 && activeIndex < filteredSubmissions.length - 1;

  // Đảm bảo activePhotoIndex luôn hợp lệ với số ảnh của bài đang xem
  const safePhotoIndex = useMemo(() => {
    if (!activeSubmission) return 0;
    const maxIdx = Math.max(0, activeSubmission.proof_image_urls.length - 1);
    return activePhotoIndex > maxIdx ? 0 : activePhotoIndex;
  }, [activeSubmission, activePhotoIndex]);

  const handleSelectSubmission = useCallback((id: string) => {
    setSelectedSubmissionId(id);
    setActivePhotoIndex(0);
  }, []);

  const handlePrevSubmission = useCallback(() => {
    if (activeIndex > 0) {
      setSelectedSubmissionId(filteredSubmissions[activeIndex - 1].id);
      setActivePhotoIndex(0);
    }
  }, [activeIndex, filteredSubmissions]);

  const handleNextSubmission = useCallback(() => {
    if (activeIndex >= 0 && activeIndex < filteredSubmissions.length - 1) {
      setSelectedSubmissionId(filteredSubmissions[activeIndex + 1].id);
      setActivePhotoIndex(0);
    }
  }, [activeIndex, filteredSubmissions]);

  // Chọn hoặc đổi Bài tập (null để quay về Danh sách bài tập Level 1)
  const handleSelectMission = useCallback((missionId: string | null) => {
    setSelectedMissionId(missionId);
    setSelectedSubmissionId(null);
    setActivePhotoIndex(0);
    setSearchQuery("");
    setStatusFilter(SubmissionApprovalStatus.PENDING_APPROVAL);
  }, []);

  // Chấm bài siêu tốc: Nhảy thẳng vào Studio của bài tập đó và chọn bài chờ duyệt đầu tiên
  const handleQuickGradeMission = useCallback(
    (missionId: string) => {
      setSelectedMissionId(missionId);
      setViewMode("studio");
      setStatusFilter(SubmissionApprovalStatus.PENDING_APPROVAL);
      setSearchQuery("");
      setActivePhotoIndex(0);

      // Tìm bài chờ duyệt đầu tiên của bài tập này
      const firstPending = submissionsList.find(
        (sub) =>
          sub.mission_id === missionId &&
          sub.approval_status === SubmissionApprovalStatus.PENDING_APPROVAL
      );
      if (firstPending) {
        setSelectedSubmissionId(firstPending.id);
      } else {
        setSelectedSubmissionId(null);
      }
    },
    [submissionsList]
  );

  // Mở Studio chấm bài cho một học sinh cụ thể từ Danh sách Học sinh (Roster)
  const handleOpenStudentGrading = useCallback(
    (submissionId: string) => {
      const targetSubmission = submissionsList.find(
        (sub) => sub.id === submissionId
      );
      if (targetSubmission) {
        setStatusFilter(targetSubmission.approval_status);
        setSearchQuery("");
      }
      setSelectedSubmissionId(submissionId);
      setViewMode("studio");
      setActivePhotoIndex(0);
    },
    [submissionsList]
  );

  const handleChangeStatusFilter = useCallback(
    (nextStatus: SubmissionStatusFilter) => {
      setStatusFilter(nextStatus);
      setSelectedSubmissionId(null);
      setActivePhotoIndex(0);
    },
    []
  );

  const handleResetFilters = useCallback(() => {
    setStatusFilter("all");
    setSearchQuery("");
    setSelectedSubmissionId(null);
    setActivePhotoIndex(0);
  }, []);

  return {
    selectedMissionId,
    setSelectedMissionId,
    missionIdFilter: selectedMissionId ?? "all",
    setMissionIdFilter: handleSelectMission,
    viewMode,
    setViewMode,
    statusFilter,
    setStatusFilter: handleChangeStatusFilter,
    searchQuery,
    setSearchQuery,
    filteredSubmissions,
    activeSubmission,
    activeIndex,
    hasPrevSubmission,
    hasNextSubmission,
    handleSelectSubmission,
    handlePrevSubmission,
    handleNextSubmission,
    handleSelectMission,
    handleQuickGradeMission,
    handleOpenStudentGrading,
    handleResetFilters,
    activePhotoIndex: safePhotoIndex,
    setActivePhotoIndex,
    ...kpiStats,
  };
}
