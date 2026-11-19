"use client";

import { useState, useCallback } from "react";
import useSWR from "swr";
import { CACHE_KEYS } from "@/constants/cacheKeys";
import { TeacherExchangeRequestItem } from "../types";
import { rewardService } from "../services/rewardService";
import { useTeacherWorkspaceStore } from "@/stores/useTeacherWorkspaceStore";
import { useRewardFilters } from "./useRewardFilters";
import { useRewardModals } from "./useRewardModals";
import { useRewardMutations } from "./useRewardMutations";

export interface UseRewardManagementProps {
  initialRequests?: TeacherExchangeRequestItem[];
  initialMonth?: number | "all";
  initialYear?: number | "all";
  initialClassId?: string;
}

/**
 * Root Orchestrator Hook: Quản lý toàn bộ tính năng Đổi quà & Trả thưởng Heo Đất
 * - Đóng vai trò "Nhạc trưởng" điều phối: SWR data fetching, useRewardFilters, useRewardModals, useRewardMutations
 * - Tuân thủ Quy tắc 9 (Data Fetching 2 tầng) & Quy tắc 12 (Kiến trúc Micro-Hooks mỏng gọn < 100 dòng)
 */
export function useRewardManagement({
  initialRequests,
  initialMonth,
  initialYear,
  initialClassId,
}: UseRewardManagementProps = {}) {
  // 1. Khởi tạo tháng và năm động theo thời gian thực hiện tại nếu không được truyền từ props
  const now = new Date();
  const currentYear = initialYear ?? now.getFullYear();
  const maxAllowedMonth =
    currentYear === "all" || currentYear === now.getFullYear()
      ? now.getMonth() + 1
      : 12;
  const currentMonth: number | "all" =
    initialMonth === "all"
      ? "all"
      : initialMonth !== undefined
      ? Math.min(maxAllowedMonth, Math.max(1, initialMonth))
      : maxAllowedMonth;

  // 2. Lấy lớp học đang chọn từ Header Workspace qua Zustand store
  const selectedWorkspaceClassId = useTeacherWorkspaceStore(
    (state) => state.selectedClassId
  );
  const activeClassId = selectedWorkspaceClassId ?? initialClassId ?? null;

  // 3. State kỳ chốt sổ (Month & Year)
  const [selectedMonth, setSelectedMonthState] =
    useState<number | "all">(currentMonth);
  const [selectedYear, setSelectedYearState] =
    useState<number | "all">(currentYear);

  // 4. SWR Data Fetching (Tầng 2 - Caching & Revalidation theo lớp và kỳ chốt sổ)
  const isMatchingInitial = Boolean(
    selectedMonth === currentMonth &&
      selectedYear === currentYear &&
      (!initialClassId || activeClassId === initialClassId)
  );

  const {
    data: requests = isMatchingInitial && initialRequests ? initialRequests : [],
    mutate,
    isLoading,
    isValidating,
  } = useSWR<TeacherExchangeRequestItem[]>(
    CACHE_KEYS.REWARDS.LIST(activeClassId, selectedMonth, selectedYear),
    () =>
      rewardService.getRewards({
        month: selectedMonth === "all" ? undefined : selectedMonth,
        year: selectedYear === "all" ? undefined : selectedYear,
        class_id:
          activeClassId && activeClassId !== "all" ? activeClassId : undefined,
      }),
    {
      fallbackData: isMatchingInitial ? initialRequests : undefined,
      revalidateOnMount: !(isMatchingInitial && initialRequests),
      revalidateIfStale: !(isMatchingInitial && initialRequests),
      revalidateOnFocus: false,
      keepPreviousData: false, // Xóa dữ liệu cũ khi đổi lớp/kỳ để skeleton hiển thị mượt mà
    }
  );

  // 4. Micro-hook: Bộ lọc, Tìm kiếm, Sắp xếp, Phân trang và KPIs
  const filters = useRewardFilters({
    requests,
    selectedMonth,
    selectedYear,
  });

  // Tự động đưa về trang 1 khi chuyển đổi lớp học (Quy tắc 8 AGENTS.md: Derive State during Rendering)
  const [prevClassId, setPrevClassId] = useState(activeClassId);
  if (prevClassId !== activeClassId) {
    setPrevClassId(activeClassId);
    filters.resetPage();
  }

  const setSelectedMonth = useCallback(
    (m: number | "all") => {
      setSelectedMonthState(m);
      filters.resetPage();
    },
    [filters]
  );

  const setSelectedYear = useCallback(
    (y: number | "all") => {
      setSelectedYearState(y);
      filters.resetPage();
    },
    [filters]
  );

  // 5. Micro-hook: Quản lý đóng/mở & state của các Modals
  const modals = useRewardModals();

  // 6. Micro-hook: Tương tác API, Cập nhật SWR Cache & Optimistic UI
  const mutations = useRewardMutations({
    requests,
    mutate,
    onCloseRejectModal: modals.handleCloseRejectModal,
    onCloseDetailModal: modals.handleCloseDetail,
    selectedRequestId: modals.selectedRequest?.id,
  });

  return {
    // Không gian lớp học & Kỳ chốt sổ
    activeClassId,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,

    // Trạng thái SWR
    isLoading,
    isValidating,

    // Micro-hook Bộ lọc, Sắp xếp, Phân trang & KPIs
    ...filters,

    // Micro-hook Modals
    ...modals,

    // Micro-hook Mutations & Actions
    ...mutations,
  };
}
