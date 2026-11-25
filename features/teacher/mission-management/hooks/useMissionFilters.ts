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
import {
  isMissionExpired,
  isMissionExpiredOverOneWeek,
  normalizeText,
  parseDateTime,
} from "../utils";

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
  // Snapshot mốc thời gian bằng state để đảm bảo tính Idempotent thuần khiết (tránh gọi Date.now() trong render)
  const [currentSnapshotTime] = useState(() => Date.now());

  const [statusFilter, setStatusFilterState] =
    useState<MissionStatusFilter>("recent");
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
    setStatusFilterState("recent");
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

    let recentCount = 0;
    let archivedCount = 0;
    let activeCount = 0;
    let expiredCount = 0;
    let inactiveCount = 0;
    let pendingReviewTotal = 0;
    let totalCoinsAwardedAll = 0;
    let totalAssignedStudentsSum = 0;
    let totalSubmittedSum = 0;

    for (const m of nonDeleted) {
      const expired = isMissionExpired(m.due_at);
      const expiredOverOneWeek = isMissionExpiredOverOneWeek(m.due_at);

      if (expiredOverOneWeek) {
        archivedCount += 1;
      } else {
        recentCount += 1;
      }

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
      recentMissionsCount: recentCount,
      archivedMissionsCount: archivedCount,
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
        const expiredOverOneWeek = isMissionExpiredOverOneWeek(item.due_at);

        // 1. Hoạt động gần đây (Mặc định: ẩn bài tập hết hạn quá 1 tuần)
        if (statusFilter === "recent") {
          if (expiredOverOneWeek) return false;
        }

        // 2. Lưu trữ: Chỉ hiển thị bài tập đã hết hạn quá 1 tuần
        if (statusFilter === "archived") {
          if (!expiredOverOneWeek) return false;
        }
        // "all": Hiển thị tất cả bài tập từ trước đến nay (chỉ trừ bài đã xóa mềm)
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

    // Sắp xếp danh sách bài tập
    const factor = sortDirection === "desc" ? -1 : 1;

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
      if (sortField === "created_at") {
        return (
          (parseDateTime(a.created_at) - parseDateTime(b.created_at)) * factor
        );
      }

      // Sắp xếp theo Hạn nộp (mặc định hoặc khi sortField === "due_at"):
      // 1. Ưu tiên bài CÒN HẠN lên đầu, bài ĐÃ HẾT HẠN đưa xuống cuối
      // 2. Trong các bài CÒN HẠN: ưu tiên bài CÒN ÍT HẠN HƠN lên đầu (hạn nộp gần nhất)
      // 3. Trong các bài ĐÃ HẾT HẠN: bài mới quá hạn gần đây xếp trước bài quá hạn lâu hơn
      const aTime = parseDateTime(a.due_at);
      const bTime = parseDateTime(b.due_at);
      const aExpired = aTime < currentSnapshotTime;
      const bExpired = bTime < currentSnapshotTime;

      // Còn hạn vs Quá hạn
      if (!aExpired && bExpired) return -1;
      if (aExpired && !bExpired) return 1;

      // Cùng CÒN HẠN: asc thì aTime < bTime lên trước (còn ít hạn hơn lên trước)
      if (!aExpired && !bExpired) {
        return (aTime - bTime) * factor;
      }

      // Cùng ĐÃ QUÁ HẠN: asc thì bTime > aTime lên trước (mới quá hạn gần đây hơn lên trước)
      return (bTime - aTime) * factor;
    });
  }, [
    missionsList,
    statusFilter,
    typeFilter,
    selectedClassId,
    searchQuery,
    sortField,
    sortDirection,
    currentSnapshotTime,
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
