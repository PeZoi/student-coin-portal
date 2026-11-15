"use client";

import { useState, useMemo, useCallback } from "react";
import { normalizeText } from "@/lib/utils";
import {
  TeacherGradingSubmissionItem,
  SubmissionStatusFilter,
} from "../types";

interface UseSubmissionFiltersParams {
  submissionsList: TeacherGradingSubmissionItem[];
  initialMissionId?: string;
}

/**
 * Micro-Hook 1: Quản lý Bộ lọc, Tìm kiếm, Thống kê KPI và Điều hướng Học sinh trong Studio Duyệt Bài Tập
 * - Tuân thủ Quy tắc 8: Tính toán `activeSubmission` trực tiếp khi render (Derive State), không dùng `useEffect`
 */
export function useSubmissionFilters({
  submissionsList,
  initialMissionId,
}: UseSubmissionFiltersParams) {
  const [missionIdFilter, setMissionIdFilter] = useState<string>(
    initialMissionId || "all"
  );
  const [statusFilter, setStatusFilter] =
    useState<SubmissionStatusFilter>("pending_approval");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<
    string | null
  >(null);

  // State điều khiển trang ảnh đang xem (1-based index: 1..5) khi bấm từ bảng lỗi AI bên phải
  const [activePhotoIndex, setActivePhotoIndex] = useState<number>(0);

  // 1. Lọc theo Bài tập đang chọn trước để tính số đếm trên từng Tab trạng thái
  const missionScopedList = useMemo(() => {
    if (missionIdFilter === "all") return submissionsList;
    return submissionsList.filter((item) => item.mission_id === missionIdFilter);
  }, [submissionsList, missionIdFilter]);

  // 2. Tính toán KPIs trên phạm vi Bài tập đang chọn
  const kpiStats = useMemo(() => {
    let pendingCount = 0;
    let approvedCount = 0;
    let rejectedCount = 0;
    let validAiPendingCount = 0;
    let totalCoinsAwarded = 0;

    for (const sub of missionScopedList) {
      if (sub.approval_status === "pending_approval") {
        pendingCount += 1;
        if (sub.readable && (sub.ai_score === null || sub.ai_score >= 8.0)) {
          validAiPendingCount += 1;
        }
      } else if (sub.approval_status === "approved") {
        approvedCount += 1;
        totalCoinsAwarded += sub.final_coins ?? sub.ai_suggested_coins;
      } else if (sub.approval_status === "rejected") {
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

  // 3. Danh sách bài nộp sau khi lọc theo Tab trạng thái + Từ khóa tìm kiếm
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

  // 4. Suy luận bài nộp đang chọn trực tiếp khi render (Không cần useEffect đồng bộ state)
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

  // Đảm bảo activePhotoIndex luôn hợp lệ với số lượng ảnh của bài đang xem
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

  const handleChangeMissionFilter = useCallback((nextMissionId: string) => {
    setMissionIdFilter(nextMissionId);
    setSelectedSubmissionId(null);
    setActivePhotoIndex(0);
  }, []);

  const handleChangeStatusFilter = useCallback(
    (nextStatus: SubmissionStatusFilter) => {
      setStatusFilter(nextStatus);
      setSelectedSubmissionId(null);
      setActivePhotoIndex(0);
    },
    []
  );

  const handleResetFilters = useCallback(() => {
    setMissionIdFilter("all");
    setStatusFilter("all");
    setSearchQuery("");
    setSelectedSubmissionId(null);
    setActivePhotoIndex(0);
  }, []);

  return {
    missionIdFilter,
    setMissionIdFilter: handleChangeMissionFilter,
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
    handleResetFilters,
    activePhotoIndex: safePhotoIndex,
    setActivePhotoIndex,
    ...kpiStats,
  };
}
