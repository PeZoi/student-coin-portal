"use client";

import { useState } from "react";
import { LeaderboardBoardId } from "../types";

/**
 * Micro-Hook 1: Quản lý trạng thái bộ lọc UI (Tháng chọn, Tab bảng, Tìm kiếm, Modal công thức)
 */
export function useLeaderboardFilters(defaultMonthKey: string) {
  const [selectedMonthKey, setSelectedMonthKey] =
    useState<string>(defaultMonthKey);
  const [activeBoard, setActiveBoard] =
    useState<LeaderboardBoardId>("top_coins");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isFormulaModalOpen, setIsFormulaModalOpen] = useState<boolean>(false);

  return {
    selectedMonthKey,
    setSelectedMonthKey,
    activeBoard,
    setActiveBoard,
    searchQuery,
    setSearchQuery,
    isFormulaModalOpen,
    setIsFormulaModalOpen,
  };
}
