"use client";

import { useState, useMemo, useCallback } from "react";
import useSWR from "swr";
import { TeacherExchangeRequestItem } from "../types";
import { rewardService } from "../services/rewardService";
import { useTeacherWorkspaceStore } from "@/stores/useTeacherWorkspaceStore";
import { useRewardFilters } from "./useRewardFilters";
import { useRewardModals } from "./useRewardModals";
import { useRewardMutations } from "./useRewardMutations";

export interface UseRewardManagementProps {
  initialRequests?: TeacherExchangeRequestItem[];
  initialMonth?: number;
  initialYear?: number;
  initialClassId?: string;
}

/**
 * Root Orchestrator Hook: Quản lý toàn bộ tính năng Đổi quà & Trả thưởng Heo Đất
 * - Đóng vai trò "Nhạc trưởng" điều phối: SWR data fetching, useRewardFilters, useRewardModals, useRewardMutations
 * - Tuân thủ Quy tắc 9 (Data Fetching 2 tầng) & Quy tắc 12 (Kiến trúc Micro-Hooks mỏng gọn < 100 dòng)
 */
export function useRewardManagement({
  initialRequests,
  initialMonth = 11,
  initialYear = 2026,
  initialClassId,
}: UseRewardManagementProps = {}) {
  // 1. Lấy lớp học đang chọn từ Header Workspace qua Zustand store
  const selectedWorkspaceClassId = useTeacherWorkspaceStore(
    (state) => state.selectedClassId
  );
  const activeClassId = selectedWorkspaceClassId ?? initialClassId ?? null;

  // 2. State kỳ chốt sổ (Month & Year)
  const [selectedMonth, setSelectedMonthState] = useState<number>(initialMonth);
  const [selectedYear, setSelectedYearState] = useState<number>(initialYear);

  // 3. SWR Data Fetching (Tầng 2 - Caching & Revalidation theo lớp và kỳ chốt sổ)
  const swrKey = useMemo(
    () => [
      "teacher-rewards",
      activeClassId ?? "all",
      selectedMonth,
      selectedYear,
    ],
    [activeClassId, selectedMonth, selectedYear]
  );

  const isMatchingInitial = Boolean(
    selectedMonth === initialMonth &&
      selectedYear === initialYear &&
      (!initialClassId || activeClassId === initialClassId)
  );

  const {
    data: requests = isMatchingInitial && initialRequests ? initialRequests : [],
    mutate,
    isLoading,
    isValidating,
  } = useSWR<TeacherExchangeRequestItem[]>(
    swrKey,
    () =>
      rewardService.getRewards({
        month: selectedMonth,
        year: selectedYear,
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
    (m: number) => {
      setSelectedMonthState(m);
      filters.resetPage();
    },
    [filters]
  );

  const setSelectedYear = useCallback(
    (y: number) => {
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
