"use client";

import { useCallback } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { CACHE_KEYS } from "@/constants/cacheKeys";
import { useTeacherWorkspaceStore } from "@/stores/useTeacherWorkspaceStore";
import { EMPTY_COMPUTED_LEADERBOARD, parseMonthKey } from "../constants";
import { leaderboardService } from "../services/leaderboardService";
import { TeacherLeaderboardApiPayload } from "../types";

interface UseLeaderboardQueryProps {
  initialData?: TeacherLeaderboardApiPayload;
  initialClassId?: string;
  selectedMonthKey: string;
}

/**
 * Micro-Hook 2: Data Fetching 2 tầng (Server Component + SWR Cache)
 * - Tự động lắng nghe `selectedClassId` trên Header Workspace và fetch lại ngay khi đổi lớp
 * - Tự động fetch lại khi chọn tháng khác; tin tưởng 100% initialData khi khớp SSR (0 duplicate fetch)
 */
export function useLeaderboardQuery({
  initialData,
  initialClassId,
  selectedMonthKey,
}: UseLeaderboardQueryProps) {
  const selectedWorkspaceClassId = useTeacherWorkspaceStore(
    (state) => state.selectedClassId
  );

  const activeClassId =
    selectedWorkspaceClassId ?? initialClassId ?? initialData?.classId ?? "all";

  const isMatchingInitial = Boolean(
    initialData &&
      activeClassId === (initialClassId ?? initialData.classId) &&
      selectedMonthKey === initialData.monthKey
  );

  const parsedMonth = parseMonthKey(selectedMonthKey);
  const swrKey = CACHE_KEYS.LEADERBOARD.MONTHLY(
    selectedMonthKey,
    activeClassId
  );

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    swrKey,
    () =>
      leaderboardService.getLeaderboard({
        classId: activeClassId,
        month: parsedMonth?.month,
        year: parsedMonth?.year,
      }),
    {
      fallbackData: isMatchingInitial ? initialData : undefined,
      revalidateOnMount: !isMatchingInitial,
      revalidateIfStale: !isMatchingInitial,
      revalidateOnFocus: false,
      dedupingInterval: 20000,
    }
  );

  const payload = data ?? (isMatchingInitial ? initialData : undefined);
  const isClosed = Boolean(payload?.isClosed);
  const closedAt = payload?.closedAt ?? null;

  const handleRefresh = useCallback(async () => {
    try {
      await mutate();
      toast.success("Đã làm mới bảng xếp hạng!");
    } catch {
      toast.error("Không thể làm mới bảng xếp hạng. Vui lòng thử lại.");
    }
  }, [mutate]);

  return {
    activeClassId,
    payload,
    computed: payload?.computed ?? EMPTY_COMPUTED_LEADERBOARD,
    availableMonths:
      payload?.availableMonths ?? initialData?.availableMonths ?? [],
    currentMonthLabel: payload?.monthLabel ?? initialData?.monthLabel ?? "",
    isClosed,
    closedAt,
    isBoardLoading: isLoading && !payload,
    isRefreshing: isValidating,
    isError: Boolean(error),
    handleRefresh,
  };
}
