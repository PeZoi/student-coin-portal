"use client";

import { useState } from "react";
import useSWR from "swr";
import { CACHE_KEYS } from "@/constants/cacheKeys";
import { studentLeaderboardService } from "../services/studentLeaderboardService";
import {
  PeriodType,
  StudentLeaderboardBoardId,
  StudentLeaderboardPayload,
} from "../types";

interface UseLeaderboardOptions {
  initialData: StudentLeaderboardPayload;
}

/**
 * Custom Hook quản lý Bảng xếp hạng học sinh (Mô hình 2 tầng SSR + SWR)
 * - 0 duplicate fetch khi khớp dữ liệu khởi tạo từ Server Component
 * - Hỗ trợ chuyển đổi kỳ (Tháng Hiện Tại / Tháng Trước), 3 Tab BXH, và chọn lớp (chỉ dành cho Admin)
 */
export function useLeaderboard({ initialData }: UseLeaderboardOptions) {
  const [activePeriod, setActivePeriod] = useState<PeriodType>(
    initialData.period
  );
  const [activeBoard, setActiveBoard] =
    useState<StudentLeaderboardBoardId>("top_coins");
  const [selectedClass, setSelectedClass] = useState<string>(
    initialData.selectedClassId
  );
  const [isRuleModalOpen, setIsRuleModalOpen] = useState<boolean>(false);

  const canSelectClass = initialData.canSelectClass;
  const effectiveClassId = canSelectClass
    ? selectedClass
    : initialData.selectedClassId;

  const isMatchingInitial =
    activePeriod === initialData.period &&
    (!canSelectClass || effectiveClassId === initialData.selectedClassId);

  const swrKey = CACHE_KEYS.LEADERBOARD.STUDENT(
    activePeriod,
    canSelectClass ? effectiveClassId || "all" : "self"
  );

  const { data: swrData, isValidating, error } = useSWR(
    swrKey,
    () =>
      studentLeaderboardService.getLeaderboard({
        period: activePeriod,
        classId: canSelectClass ? effectiveClassId : undefined,
      }),
    {
      fallbackData: isMatchingInitial ? initialData : undefined,
      revalidateOnMount: !isMatchingInitial,
      revalidateIfStale: !isMatchingInitial,
      revalidateOnFocus: false,
      dedupingInterval: 20000,
    }
  );

  const data = swrData ?? initialData;

  return {
    activePeriod,
    setActivePeriod,
    activeBoard,
    setActiveBoard,
    selectedClass: effectiveClassId,
    setSelectedClass,
    canSelectClass: data.canSelectClass,
    availableClasses: data.availableClasses,
    data,
    isLoading: isValidating && !isMatchingInitial,
    isError: Boolean(error),
    isRuleModalOpen,
    setIsRuleModalOpen,
  };
}
