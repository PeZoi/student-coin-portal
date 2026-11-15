"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import {
  TeacherGradingSubmissionItem,
  SubmissionMissionFilterOption,
} from "../types";
import {
  MOCK_GRADING_SUBMISSIONS,
  MOCK_SUBMISSION_MISSIONS_FILTER,
} from "../constants";
import { useSubmissionFilters } from "./useSubmissionFilters";
import { useSubmissionMutations } from "./useSubmissionMutations";

/**
 * Root Orchestrator Hook: Điều phối Studio Duyệt Bài Tập
 * - Tuân thủ kiến trúc Micro-Hooks (Quy tắc 12): Ngắn gọn dưới 80 dòng
 */
export function useManageSubmissions(
  initialSubmissions?: TeacherGradingSubmissionItem[],
  initialMissionId?: string
) {
  const [submissionsList, setSubmissionsList] = useState<
    TeacherGradingSubmissionItem[]
  >(() => initialSubmissions ?? MOCK_GRADING_SUBMISSIONS);

  const [missionFilterOptions] = useState<SubmissionMissionFilterOption[]>(
    () => MOCK_SUBMISSION_MISSIONS_FILTER
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 1. Micro-Hook Bộ lọc, Thống kê KPI & Chọn học sinh
  const filters = useSubmissionFilters({
    submissionsList,
    initialMissionId,
  });

  // 2. Micro-Hook Chấm điểm, Duyệt bài & Yêu cầu nộp lại
  const mutations = useSubmissionMutations({
    submissionsList,
    setSubmissionsList,
    filteredSubmissions: filters.filteredSubmissions,
    activeIndex: filters.activeIndex,
    handleSelectSubmission: filters.handleSelectSubmission,
    missionIdFilter: filters.missionIdFilter,
  });

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Đã đồng bộ danh sách bài nộp mới nhất!");
    }, 300);
  }, []);

  return {
    submissionsList,
    missionFilterOptions,
    isRefreshing,
    handleRefresh,
    ...filters,
    ...mutations,
  };
}
