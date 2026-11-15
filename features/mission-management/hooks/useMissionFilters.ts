"use client";

import { useState, useMemo, useCallback } from "react";
import {
  TeacherMissionItem,
  MissionStatusFilter,
  MissionTypeFilter,
  MissionViewMode,
  MissionSortField,
  SortDirection,
} from "../types";
import { DEFAULT_MISSION_PAGE_SIZE } from "../constants";
import { isMissionExpired, normalizeText, parseDateTime } from "../utils";

interface UseMissionFiltersParams {
  missionsList: TeacherMissionItem[];
  onFilterChange?: () => void;
}

/**
 * Micro-Hook 1: Chuyên trách Bộ lọc, Tìm kiếm, Sắp xếp, Phân trang và Tính toán KPIs Bài tập
 */
export function useMissionFilters({
  missionsList,
  onFilterChange,
}: UseMissionFiltersParams) {
  const [statusFilter, setStatusFilterState] =
    useState<MissionStatusFilter>("all");
  const [typeFilter, setTypeFilterState] = useState<MissionTypeFilter>("all");
  const [selectedClassId, setSelectedClassIdState] = useState<string>("all");
  const [searchQuery, setSearchQueryState] = useState<string>("");
  const [viewMode, setViewMode] = useState<MissionViewMode>("table");
  const [sortField, setSortField] = useState<MissionSortField | null>("due_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSizeState] = useState<number>(
    DEFAULT_MISSION_PAGE_SIZE
  );

  // Handlers tự động reset trang về 1 và xóa chọn checkbox khi đổi bộ lọc
  const setStatusFilter = useCallback(
    (filter: MissionStatusFilter) => {
      setStatusFilterState(filter);
      setCurrentPage(1);
      onFilterChange?.();
    },
    [onFilterChange]
  );

  const setTypeFilter = useCallback(
    (type: MissionTypeFilter) => {
      setTypeFilterState(type);
      setCurrentPage(1);
      onFilterChange?.();
    },
    [onFilterChange]
  );

  const setSelectedClassId = useCallback(
    (classId: string) => {
      setSelectedClassIdState(classId);
      setCurrentPage(1);
      onFilterChange?.();
    },
    [onFilterChange]
  );

  const setSearchQuery = useCallback(
    (query: string) => {
      setSearchQueryState(query);
      setCurrentPage(1);
      onFilterChange?.();
    },
    [onFilterChange]
  );

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size);
    setCurrentPage(1);
  }, []);

  const handleResetFilter = useCallback(() => {
    setStatusFilterState("all");
    setTypeFilterState("all");
    setSelectedClassIdState("all");
    setSearchQueryState("");
    setCurrentPage(1);
    onFilterChange?.();
  }, [onFilterChange]);

  const handleSortToggle = useCallback(
    (field: MissionSortField) => {
      if (sortField !== field) {
        setSortField(field);
        setSortDirection("asc");
      } else if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortField(null);
        setSortDirection("none");
      } else {
        setSortDirection("asc");
      }
    },
    [sortField, sortDirection]
  );

  // 1. Tính toán các chỉ số thống kê KPIs tổng quan
  const kpiStats = useMemo(() => {
    const nonDeleted = missionsList.filter((m) => !m.is_deleted);
    const deletedCount = missionsList.filter((m) => m.is_deleted).length;

    let activeCount = 0;
    let expiredCount = 0;
    let inactiveCount = 0;
    let pendingReviewTotal = 0;
    let totalCoinsAwardedAll = 0;
    let totalAssignedStudentsSum = 0;
    let totalSubmittedSum = 0;

    for (const m of nonDeleted) {
      const expired = isMissionExpired(m.due_at);
      if (!m.is_active) {
        inactiveCount += 1;
      } else if (expired) {
        expiredCount += 1;
      } else {
        activeCount += 1;
      }

      pendingReviewTotal += m.pending_review_count || 0;
      totalCoinsAwardedAll += m.total_coins_awarded || 0;

      if (m.is_active) {
        totalAssignedStudentsSum += m.total_students || 0;
        totalSubmittedSum += m.submitted_count || 0;
      }
    }

    const averageCompletionPercent =
      totalAssignedStudentsSum > 0
        ? Math.round((totalSubmittedSum / totalAssignedStudentsSum) * 100)
        : 0;

    return {
      totalMissions: nonDeleted.length,
      activeMissionsCount: activeCount,
      expiredMissionsCount: expiredCount,
      inactiveMissionsCount: inactiveCount,
      deletedMissionsCount: deletedCount,
      pendingReviewTotal,
      totalCoinsAwardedAll,
      averageCompletionPercent,
      totalSubmittedSum,
      totalAssignedStudentsSum,
    };
  }, [missionsList]);

  // 2. Lọc và Sắp xếp danh sách bài tập
  const filteredMissions = useMemo(() => {
    const normalizedQuery = normalizeText(searchQuery);

    const filtered = missionsList.filter((item) => {
      // Lọc theo trạng thái xóa mềm (Thùng rác vs Bình thường)
      if (statusFilter === "deleted") {
        if (!item.is_deleted) return false;
      } else {
        if (item.is_deleted) return false;
        const expired = isMissionExpired(item.due_at);

        if (statusFilter === "active" && (!item.is_active || expired)) {
          return false;
        }
        if (statusFilter === "expired" && (!item.is_active || !expired)) {
          return false;
        }
        if (statusFilter === "inactive" && item.is_active) {
          return false;
        }
      }

      // Lọc theo hình thức nộp bài
      if (typeFilter !== "all" && item.submission_type !== typeFilter) {
        return false;
      }

      // Lọc theo lớp học được giao (`mission_classes`)
      if (
        selectedClassId !== "all" &&
        !item.assigned_class_ids.includes(selectedClassId)
      ) {
        return false;
      }

      // Lọc theo từ khóa tìm kiếm
      if (normalizedQuery) {
        const matchTitle = normalizeText(item.title).includes(normalizedQuery);
        const matchDesc = normalizeText(item.description).includes(
          normalizedQuery
        );
        const matchCreator = normalizeText(item.creator_name).includes(
          normalizedQuery
        );
        const matchClass = item.assigned_classes.some((c) =>
          normalizeText(c.class_name).includes(normalizedQuery)
        );
        return matchTitle || matchDesc || matchCreator || matchClass;
      }

      return true;
    });

    // Sắp xếp
    if (!sortField || sortDirection === "none") {
      return filtered;
    }

    const factor = sortDirection === "asc" ? 1 : -1;

    return [...filtered].sort((a, b) => {
      if (sortField === "title") {
        return a.title.localeCompare(b.title, "vi") * factor;
      }
      if (sortField === "max_reward_coins") {
        return (a.max_reward_coins - b.max_reward_coins) * factor;
      }
      if (sortField === "submission_rate") {
        const rateA =
          a.total_students > 0 ? a.submitted_count / a.total_students : 0;
        const rateB =
          b.total_students > 0 ? b.submitted_count / b.total_students : 0;
        return (rateA - rateB) * factor;
      }
      if (sortField === "due_at") {
        return (parseDateTime(a.due_at) - parseDateTime(b.due_at)) * factor;
      }
      if (sortField === "created_at") {
        return (
          (parseDateTime(a.created_at) - parseDateTime(b.created_at)) * factor
        );
      }
      return 0;
    });
  }, [
    missionsList,
    statusFilter,
    typeFilter,
    selectedClassId,
    searchQuery,
    sortField,
    sortDirection,
  ]);

  // 3. Phân trang
  const totalItems = filteredMissions.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedMissions = useMemo(() => {
    const startIndex = (safePage - 1) * pageSize;
    return filteredMissions.slice(startIndex, startIndex + pageSize);
  }, [filteredMissions, safePage, pageSize]);

  return {
    ...kpiStats,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    selectedClassId,
    setSelectedClassId,
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    sortField,
    sortDirection,
    handleSortToggle,
    handleResetFilter,
    filteredMissions,
    paginatedMissions,
    currentPage: safePage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    totalItems,
  };
}
