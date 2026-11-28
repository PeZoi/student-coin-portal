"use client";

import { useMemo, useState } from "react";
import { MOCK_MONTHLY_LEADERBOARD_DATASETS } from "../constants";
import { LeaderboardBoardId } from "../types";
import { computeThreeLeaderboards } from "../utils/rankingCalculator";

/**
 * Hook quản lý state & tính toán 3 Bảng xếp hạng (Mock Data)
 * - Hỗ trợ chuyển đổi tháng (bao gồm Tháng 09/2026 chưa có dữ liệu tháng trước để test trạng thái chưa mở)
 * - Tự động tính 3 bảng xếp hạng từ dữ liệu gốc
 */
export function useTeacherLeaderboard() {
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>(
    MOCK_MONTHLY_LEADERBOARD_DATASETS[0].monthKey
  );
  const [activeBoard, setActiveBoard] =
    useState<LeaderboardBoardId>("top_coins");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isFormulaModalOpen, setIsFormulaModalOpen] = useState<boolean>(false);

  const monthOptions = useMemo(
    () =>
      MOCK_MONTHLY_LEADERBOARD_DATASETS.map((ds) => ({
        value: ds.monthKey,
        label: ds.label,
        badge: ds.hasPreviousMonthData ? undefined : "Khởi đầu",
      })),
    []
  );

  const currentDataset = useMemo(
    () =>
      MOCK_MONTHLY_LEADERBOARD_DATASETS.find(
        (ds) => ds.monthKey === selectedMonthKey
      ) ?? MOCK_MONTHLY_LEADERBOARD_DATASETS[0],
    [selectedMonthKey]
  );

  const computed = useMemo(
    () => computeThreeLeaderboards(currentDataset),
    [currentDataset]
  );

  const normalizedSearch = searchQuery.trim().toLowerCase();

  const filteredTopCoinsBoard = useMemo(() => {
    if (!normalizedSearch) return computed.topCoinsBoard;
    return computed.topCoinsBoard.filter((item) =>
      item.fullName.toLowerCase().includes(normalizedSearch)
    );
  }, [computed.topCoinsBoard, normalizedSearch]);

  const filteredProgressLeadersBoard = useMemo(() => {
    if (!normalizedSearch) return computed.progressLeadersBoard;
    return computed.progressLeadersBoard.filter((item) =>
      item.fullName.toLowerCase().includes(normalizedSearch)
    );
  }, [computed.progressLeadersBoard, normalizedSearch]);

  const filteredProgressRisersBoard = useMemo(() => {
    if (!normalizedSearch) return computed.progressRisersBoard;
    return computed.progressRisersBoard.filter((item) =>
      item.fullName.toLowerCase().includes(normalizedSearch)
    );
  }, [computed.progressRisersBoard, normalizedSearch]);

  const isProgressBoardLocked =
    !computed.hasPreviousMonthData && activeBoard !== "top_coins";

  return {
    selectedMonthKey,
    setSelectedMonthKey,
    monthOptions,
    currentDataset,
    activeBoard,
    setActiveBoard,
    searchQuery,
    setSearchQuery,
    isFormulaModalOpen,
    setIsFormulaModalOpen,
    computed,
    filteredTopCoinsBoard,
    filteredProgressLeadersBoard,
    filteredProgressRisersBoard,
    isProgressBoardLocked,
  };
}

export type UseTeacherLeaderboardReturn = ReturnType<
  typeof useTeacherLeaderboard
>;
