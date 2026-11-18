"use client";

import { useState, useMemo, useCallback } from "react";
import {
  TeacherExchangeRequestItem,
  ExchangeFilterStatus,
  ExchangeFilterChoiceType,
  ExchangeViewMode,
  ExchangeSortField,
  SortOrder,
} from "../types";
import { ExchangeRequestStatus } from "@/constants/rewards";

export interface UseRewardFiltersProps {
  requests: TeacherExchangeRequestItem[];
  selectedMonth: number;
  selectedYear: number;
}

/**
 * Micro-hook chuyên trách: Bộ lọc, Tìm kiếm, Sắp xếp, Phân trang và Tính toán KPIs đổi quà
 * - Tuân thủ Quy tắc 12 AGENTS.md (Kiến trúc Micro-Hooks)
 */
export function useRewardFilters({
  requests,
  selectedMonth,
  selectedYear,
}: UseRewardFiltersProps) {
  // 1. Bộ lọc & tìm kiếm
  const [searchQuery, setSearchQueryState] = useState("");
  const [statusFilter, setStatusFilterState] =
    useState<ExchangeFilterStatus>("all");
  const [choiceTypeFilter, setChoiceTypeFilterState] =
    useState<ExchangeFilterChoiceType>("all");
  const [viewMode, setViewMode] = useState<ExchangeViewMode>("table");

  // 2. Sắp xếp (Sorting)
  const [sortField, setSortField] = useState<ExchangeSortField | undefined>(
    undefined
  );
  const [sortOrder, setSortOrder] = useState<SortOrder>("none");

  // 3. Phân trang (Pagination)
  const [currentPage, setCurrentPageState] = useState(1);
  const [pageSize, setPageSizeState] = useState(10);

  const resetPage = useCallback(() => {
    setCurrentPageState(1);
  }, []);

  const setSearchQuery = useCallback((q: string) => {
    setSearchQueryState(q);
    setCurrentPageState(1);
  }, []);

  const setStatusFilter = useCallback((s: ExchangeFilterStatus) => {
    setStatusFilterState(s);
    setCurrentPageState(1);
  }, []);

  const setChoiceTypeFilter = useCallback((c: ExchangeFilterChoiceType) => {
    setChoiceTypeFilterState(c);
    setCurrentPageState(1);
  }, []);

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size);
    setCurrentPageState(1);
  }, []);

  // 4. Lọc dữ liệu theo kỳ, trạng thái, hình thức và tìm kiếm
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      // Lọc theo tháng & năm
      if (r.month !== selectedMonth || r.year !== selectedYear) return false;

      // Lọc theo trạng thái
      if (statusFilter !== "all" && r.status !== statusFilter) return false;

      // Lọc theo hình thức (tiền mặt / quà tặng tự chọn)
      if (choiceTypeFilter !== "all" && r.choice_type !== choiceTypeFilter) {
        return false;
      }

      // Tìm kiếm theo tên học sinh hoặc ghi chú
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const studentNameMatch = r.student_name.toLowerCase().includes(query);
        const noteMatch = r.shopee_note?.toLowerCase().includes(query);
        if (!studentNameMatch && !noteMatch) return false;
      }

      return true;
    });
  }, [
    requests,
    selectedMonth,
    selectedYear,
    statusFilter,
    choiceTypeFilter,
    searchQuery,
  ]);

  // 5. Sắp xếp danh sách (Sorting)
  const sortedRequests = useMemo(() => {
    if (!sortField || sortOrder === "none") return filteredRequests;

    return [...filteredRequests].sort((a, b) => {
      let comparison = 0;
      if (sortField === "student_name") {
        comparison = a.student_name.localeCompare(b.student_name, "vi");
      } else if (sortField === "amount_vnd") {
        comparison = a.amount_vnd - b.amount_vnd;
      } else if (sortField === "choice_type") {
        comparison = a.choice_type.localeCompare(b.choice_type);
      } else if (sortField === "status") {
        const statusWeight: Record<string, number> = {
          pending: 1,
          completed: 2,
          rejected: 3,
        };
        comparison =
          (statusWeight[a.status] || 99) - (statusWeight[b.status] || 99);
      } else if (sortField === "created_at") {
        comparison =
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [filteredRequests, sortField, sortOrder]);

  // 6. Phân trang dữ liệu (Pagination)
  const totalPages = Math.ceil(sortedRequests.length / pageSize) || 1;

  const paginatedRequests = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedRequests.slice(start, start + pageSize);
  }, [sortedRequests, currentPage, pageSize]);

  // 7. Danh sách yêu cầu trong kỳ chốt sổ (để tính KPI)
  const periodRequests = useMemo(() => {
    return requests.filter(
      (r) => r.month === selectedMonth && r.year === selectedYear
    );
  }, [requests, selectedMonth, selectedYear]);

  // Đếm số lượng KPI
  const counts = useMemo(() => {
    return {
      all: periodRequests.length,
      pending: periodRequests.filter(
        (r) => r.status === ExchangeRequestStatus.PENDING
      ).length,
      completed: periodRequests.filter(
        (r) => r.status === ExchangeRequestStatus.COMPLETED
      ).length,
      rejected: periodRequests.filter(
        (r) => r.status === ExchangeRequestStatus.REJECTED
      ).length,
    };
  }, [periodRequests]);

  // Tổng xu và tổng tiền VNĐ trong kỳ
  const totalCoinsExchanged = useMemo(() => {
    return periodRequests.reduce((sum, r) => sum + r.coins_to_exchange, 0);
  }, [periodRequests]);

  const totalVndAmount = useMemo(() => {
    return periodRequests.reduce((sum, r) => sum + r.amount_vnd, 0);
  }, [periodRequests]);

  // Handler toggle sắp xếp
  const handleSortToggle = useCallback(
    (field: ExchangeSortField) => {
      if (sortField !== field) {
        setSortField(field);
        setSortOrder("asc");
      } else if (sortOrder === "asc") {
        setSortOrder("desc");
      } else {
        setSortField(undefined);
        setSortOrder("none");
      }
      setCurrentPageState(1);
    },
    [sortField, sortOrder]
  );

  return {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    choiceTypeFilter,
    setChoiceTypeFilter,
    viewMode,
    setViewMode,
    sortField,
    sortOrder,
    handleSortToggle,
    currentPage,
    setCurrentPage: setCurrentPageState,
    pageSize,
    setPageSize,
    totalPages,
    totalItems: sortedRequests.length,
    paginatedRequests,
    counts,
    totalCoinsExchanged,
    totalVndAmount,
    resetPage,
  };
}
