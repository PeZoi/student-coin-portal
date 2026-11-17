"use client";

import { useState, useMemo, useCallback } from "react";
import {
  SortOrder,
  StudentRosterSortField,
  StudentRosterStatusFilter,
  TeacherRosterStudent,
} from "../types";

interface UseStudentRosterFiltersProps {
  students: TeacherRosterStudent[];
  onFilterChange?: () => void;
}

/**
 * Micro-Hook 1: Quản lý Tìm kiếm, Lọc trạng thái, Sắp xếp cột, Phân trang và Thống kê KPIs
 */
export function useStudentRosterFilters({
  students,
  onFilterChange,
}: UseStudentRosterFiltersProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<StudentRosterStatusFilter>("all");
  const [sortField, setSortField] =
    useState<StudentRosterSortField>("current_coins");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // State phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 1. Thống kê KPI tổng quan
  const kpiData = useMemo(() => {
    const totalStudents = students.length;
    const totalCoins = students.reduce((sum, s) => sum + s.current_coins, 0);
    const lockedPinCount = students.filter(
      (s) => s.pin_status === "locked" || s.pin_status === "failed_attempts"
    ).length;

    const totalMissionsAll = students.reduce(
      (sum, s) => sum + s.total_missions_count,
      0
    );
    const completedMissionsAll = students.reduce(
      (sum, s) => sum + s.completed_missions_count,
      0
    );

    const completionRate =
      totalMissionsAll > 0
        ? Math.round((completedMissionsAll / totalMissionsAll) * 1000) / 10
        : 0;

    return {
      totalStudents,
      totalCoins,
      lockedPinCount,
      completionRate,
    };
  }, [students]);

  // 2. Lọc và Sắp xếp danh sách học sinh
  const filteredStudents = useMemo(() => {
    let result = [...students];

    // Tìm kiếm họ tên hoặc số điện thoại
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (s) =>
          s.full_name.toLowerCase().includes(q) ||
          (s.phone_zalo && s.phone_zalo.includes(q))
      );
    }

    // Lọc trạng thái mã PIN
    if (statusFilter === "active") {
      result = result.filter((s) => s.pin_status === "ok");
    } else if (statusFilter === "locked") {
      result = result.filter(
        (s) => s.pin_status === "locked" || s.pin_status === "failed_attempts"
      );
    }

    // Sắp xếp
    if (sortOrder !== "none") {
      result.sort((a, b) => {
        let diff = 0;
        if (sortField === "full_name") {
          diff = a.full_name.localeCompare(b.full_name, "vi");
        } else if (sortField === "current_coins") {
          diff = a.current_coins - b.current_coins;
        } else if (sortField === "redeemed_rewards_count") {
          diff = a.redeemed_rewards_count - b.redeemed_rewards_count;
        } else if (sortField === "completed_missions_count") {
          diff = a.completed_missions_count - b.completed_missions_count;
        }
        return sortOrder === "asc" ? diff : -diff;
      });
    }

    return result;
  }, [students, searchQuery, statusFilter, sortField, sortOrder]);

  // 3. Phân trang
  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1;
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, currentPage, pageSize]);

  // Xử lý chuyển đổi sort
  const handleSortToggle = useCallback(
    (field: StudentRosterSortField) => {
      if (sortField !== field) {
        setSortField(field);
        setSortOrder("asc");
      } else {
        if (sortOrder === "asc") setSortOrder("desc");
        else if (sortOrder === "desc") setSortOrder("none");
        else setSortOrder("asc");
      }
    },
    [sortField, sortOrder]
  );

  // Setters bọc callback reset selection
  const handleSearchQueryChange = useCallback(
    (q: string) => {
      setSearchQuery(q);
      setCurrentPage(1);
      onFilterChange?.();
    },
    [onFilterChange]
  );

  const handleStatusFilterChange = useCallback(
    (f: StudentRosterStatusFilter) => {
      setStatusFilter(f);
      setCurrentPage(1);
      onFilterChange?.();
    },
    [onFilterChange]
  );

  // Reset toàn bộ bộ lọc
  const handleResetFilters = useCallback(() => {
    setSearchQuery("");
    setStatusFilter("all");
    setSortField("current_coins");
    setSortOrder("desc");
    setCurrentPage(1);
    onFilterChange?.();
  }, [onFilterChange]);

  const hasActiveFilters =
    searchQuery.trim().length > 0 || statusFilter !== "all";

  return {
    searchQuery,
    setSearchQuery: handleSearchQueryChange,
    statusFilter,
    setStatusFilter: handleStatusFilterChange,
    sortField,
    sortOrder,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    kpiData,
    filteredStudents,
    paginatedStudents,
    handleSortToggle,
    handleResetFilters,
    hasActiveFilters,
  };
}
