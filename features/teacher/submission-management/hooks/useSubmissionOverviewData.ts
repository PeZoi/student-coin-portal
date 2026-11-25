"use client";

import { useMemo } from "react";
import useSWR from "swr";
import { CACHE_KEYS } from "@/constants";
import { MissionSubmissionSummary } from "../types";
import { submissionService } from "../services/submissionService";

interface UseSubmissionOverviewDataParams {
  enabled: boolean;
  workspaceClassId: string | null;
  initialClassId?: string;
  initialMissionsOverview?: MissionSubmissionSummary[];
}

/**
 * Micro-Hook: Tải & tổng hợp dữ liệu Level 1 (Danh sách Bài tập cần duyệt + 4 KPI toàn cục)
 * - Áp dụng SWR 2 tầng (Quy tắc 9 AGENTS.md): Không refetch ngầm nếu SSR đã cung cấp dữ liệu đúng lớp
 * - Tự động ngắt fetch (key = null) khi đang ở Level 2 để tránh lãng phí băng thông
 */
export function useSubmissionOverviewData({
  enabled,
  workspaceClassId,
  initialClassId,
  initialMissionsOverview,
}: UseSubmissionOverviewDataParams) {
  const isMatchingInitialClass =
    !workspaceClassId || workspaceClassId === initialClassId;
  const hasServerInitial = Boolean(
    isMatchingInitialClass && initialMissionsOverview !== undefined
  );

  const swrKey = enabled ? CACHE_KEYS.SUBMISSIONS.OVERVIEW(workspaceClassId) : null;

  const {
    data,
    mutate: mutateOverview,
    isLoading: isLoadingOverview,
    error: overviewError,
  } = useSWR(
    swrKey,
    () => submissionService.getMissionsOverview(workspaceClassId),
    {
      fallbackData: hasServerInitial ? initialMissionsOverview : undefined,
      revalidateOnMount: hasServerInitial ? false : true,
      revalidateIfStale: !hasServerInitial,
      revalidateOnFocus: false,
    }
  );

  const missionsOverview = useMemo<MissionSubmissionSummary[]>(
    () => data ?? [],
    [data]
  );

  // 4 Thẻ KPI toàn cục trên Level 1
  const globalKpis = useMemo(() => {
    let totalPending = 0;
    let totalApproved = 0;
    let totalRejected = 0;

    for (const mission of missionsOverview) {
      totalPending += mission.pending_count;
      totalApproved += mission.approved_count;
      totalRejected += mission.rejected_count;
    }

    return {
      totalMissionsCount: missionsOverview.length,
      totalPendingAllMissions: totalPending,
      totalApprovedAllMissions: totalApproved,
      totalRejectedAllMissions: totalRejected,
    };
  }, [missionsOverview]);

  return {
    missionsOverview,
    mutateOverview,
    isLoadingOverview,
    isOverviewError: Boolean(overviewError),
    ...globalKpis,
  };
}
