"use client";

import { useMemo } from "react";
import { TeacherLeaderboardApiPayload } from "../types";
import { useLeaderboardFilters } from "./useLeaderboardFilters";
import { useLeaderboardQuery } from "./useLeaderboardQuery";

interface UseTeacherLeaderboardProps {
  initialData?: TeacherLeaderboardApiPayload;
  initialClassId?: string;
}

/**
 * Root Orchestrator Hook: Điều phối 2 Micro-Hooks (Filters + Query) cho trang Bảng xếp hạng
 * - Tự động cập nhật dữ liệu khi giáo viên đổi lớp trên Header Workspace hoặc đổi tháng
 */
export function useTeacherLeaderboard({
  initialData,
  initialClassId,
}: UseTeacherLeaderboardProps = {}) {
  const defaultMonthKey = initialData?.monthKey ?? "";
  const filters = useLeaderboardFilters(defaultMonthKey);

  const query = useLeaderboardQuery({
    initialData,
    initialClassId,
    selectedMonthKey: filters.selectedMonthKey,
  });

  const monthOptions = useMemo(
    () =>
      query.availableMonths.map((opt) => ({
        value: opt.monthKey,
        label: opt.label,
      })),
    [query.availableMonths]
  );

  const normalizedSearch = filters.searchQuery.trim().toLowerCase();

  const filteredTopCoinsBoard = useMemo(() => {
    if (!normalizedSearch) return query.computed.topCoinsBoard;
    return query.computed.topCoinsBoard.filter((item) =>
      item.fullName.toLowerCase().includes(normalizedSearch)
    );
  }, [query.computed.topCoinsBoard, normalizedSearch]);

  const filteredProgressLeadersBoard = useMemo(() => {
    if (!normalizedSearch) return query.computed.progressLeadersBoard;
    return query.computed.progressLeadersBoard.filter((item) =>
      item.fullName.toLowerCase().includes(normalizedSearch)
    );
  }, [query.computed.progressLeadersBoard, normalizedSearch]);

  const filteredProgressRisersBoard = useMemo(() => {
    if (!normalizedSearch) return query.computed.progressRisersBoard;
    return query.computed.progressRisersBoard.filter((item) =>
      item.fullName.toLowerCase().includes(normalizedSearch)
    );
  }, [query.computed.progressRisersBoard, normalizedSearch]);

  const isProgressBoardLocked =
    !query.isBoardLoading &&
    !query.computed.hasPreviousMonthData &&
    filters.activeBoard !== "top_coins";

  return {
    ...filters,
    ...query,
    monthOptions,
    filteredTopCoinsBoard,
    filteredProgressLeadersBoard,
    filteredProgressRisersBoard,
    isProgressBoardLocked,
  };
}

export type UseTeacherLeaderboardReturn = ReturnType<
  typeof useTeacherLeaderboard
>;
