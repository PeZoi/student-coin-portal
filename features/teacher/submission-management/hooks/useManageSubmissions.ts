"use client";

import { useParams } from "next/navigation";
import { useTeacherWorkspaceStore } from "@/stores/useTeacherWorkspaceStore";
import {
  MissionSubmissionDetailPayload,
  MissionSubmissionSummary,
  MissionDetailViewMode,
} from "../types";
import { useSubmissionOverviewData } from "./useSubmissionOverviewData";
import { useSubmissionDetailData } from "./useSubmissionDetailData";
import { useSubmissionFilters } from "./useSubmissionFilters";
import { useSubmissionMutations } from "./useSubmissionMutations";

export interface UseManageSubmissionsParams {
  initialMissionsOverview?: MissionSubmissionSummary[];
  initialDetail?: MissionSubmissionDetailPayload | null;
  initialClassId?: string;
  initialMissionId?: string;
  initialStudentId?: string;
  initialViewMode?: MissionDetailViewMode;
}

/**
 * Root Orchestrator Hook: Điều phối toàn bộ Không gian Duyệt Bài Tập của Giáo Viên (< 80 dòng)
 * - Đồng bộ lớp học theo Workspace Store (`useTeacherWorkspaceStore`)
 * - Ghép 4 Micro-Hooks chuyên trách: OverviewData, DetailData, Filters và Mutations (Quy tắc 12 AGENTS.md)
 */
export function useManageSubmissions({
  initialMissionsOverview,
  initialDetail,
  initialClassId,
  initialMissionId,
  initialStudentId,
  initialViewMode,
}: UseManageSubmissionsParams = {}) {
  const params = useParams();
  const activeMissionId =
    (params?.id as string | undefined) || initialMissionId || null;

  // Lớp học đang chọn từ Header Workspace (ưu tiên initialClassId từ SSR trước khi store hydrate)
  const selectedWorkspaceClass = useTeacherWorkspaceStore((state) =>
    state.getSelectedClass()
  );
  const workspaceClassId =
    selectedWorkspaceClass?.id ?? initialClassId ?? null;

  // 1. Micro-Hook Data Level 1 (Tổng quan danh sách bài tập)
  const overviewData = useSubmissionOverviewData({
    enabled: !activeMissionId,
    workspaceClassId,
    initialClassId,
    initialMissionsOverview,
  });

  // 2. Micro-Hook Data Level 2 (Chi tiết 1 bài tập + Roster + Submissions & Lỗi AI)
  const detailData = useSubmissionDetailData({
    missionId: activeMissionId,
    workspaceClassId,
    initialClassId,
    initialDetail,
  });

  // 3. Micro-Hook Điều hướng URL, KPIs Level 2, Active & Next Pending Submission
  const filters = useSubmissionFilters({
    submissionsList: detailData.submissionsList,
    initialMissionId,
    initialViewMode,
    initialStudentId,
  });

  // 4. Micro-Hook Mutations gọi API thật + đồng bộ SWR & Sidebar Badges
  const mutations = useSubmissionMutations({
    submissionsList: detailData.submissionsList,
    validAiPendingIds: filters.validAiPendingIds,
    mutateDetail: detailData.mutateDetail,
  });

  return {
    workspaceClassId,
    ...overviewData,
    ...detailData,
    ...filters,
    ...mutations,
  };
}
