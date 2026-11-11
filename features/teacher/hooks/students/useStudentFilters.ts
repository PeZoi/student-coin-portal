"use client";

import { useState, useMemo, useCallback } from "react";
import {
  StudentItem,
  StudentStatusFilter,
  StudentSortField,
  SortDirection,
} from "../../components/students/types";
import { calculateLockRemainingText } from "../../components/students/StudentBadges";
import { useMinuteTicker } from "../../components/students/useMinuteTicker";

function parseDateTime(dateTimeStr: string | null | undefined): number {
  if (!dateTimeStr) return -1;
  const trimmed = dateTimeStr.trim();
  const spaceParts = trimmed.split(/\s+/);
  if (spaceParts.length === 2) {
    const [timePart, datePart] = spaceParts;
    const [hourStr, minStr] = timePart.split(":");
    const dateParts = datePart.split("/");
    if (dateParts.length === 3) {
      const day = parseInt(dateParts[0], 10);
      const month = parseInt(dateParts[1], 10) - 1;
      const year = parseInt(dateParts[2], 10);
      const hour = parseInt(hourStr || "0", 10);
      const minute = parseInt(minStr || "0", 10);
      const d = new Date(year, month, day, hour, minute);
      if (!isNaN(d.getTime())) return d.getTime();
    }
  }
  const iso = new Date(trimmed);
  if (!isNaN(iso.getTime())) return iso.getTime();
  return -1;
}

interface UseStudentFiltersProps {
  studentsList: StudentItem[];
  onFilterChange?: () => void;
}

/**
 * Micro-hook chuyên trách: Bộ lọc, Tìm kiếm, Sắp xếp và Tính toán KPIs Học sinh
 */
export function useStudentFilters({
  studentsList,
  onFilterChange,
}: UseStudentFiltersProps) {
  const [statusFilter, setStatusFilterState] =
    useState<StudentStatusFilter>("all");
  const [selectedClassId, setSelectedClassIdState] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortField, setSortField] = useState<StudentSortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("none");

  // Đổi bộ lọc và tự động xóa checkbox chọn hàng loạt
  const setStatusFilter = useCallback(
    (filter: StudentStatusFilter) => {
      setStatusFilterState(filter);
      onFilterChange?.();
    },
    [onFilterChange]
  );

  const setSelectedClassId = useCallback(
    (classId: string) => {
      setSelectedClassIdState(classId);
      onFilterChange?.();
    },
    [onFilterChange]
  );

  // Minute ticker store: Tự động cập nhật nhãn đếm ngược khóa PIN mỗi phút
  const currentMinute = useMinuteTicker();

  // 1. Tính toán KPIs tổng quan
  const {
    totalStudents,
    activeStudents,
    lockedPinStudents,
    inactiveStudents,
    deletedStudents,
    totalCoins,
  } = useMemo(() => {
    let total = 0;
    let active = 0;
    let locked = 0;
    let inactive = 0;
    let deleted = 0;
    let coins = 0;

    for (const st of studentsList) {
      if (st.is_deleted) {
        deleted++;
      } else {
        total++;
        if (st.is_active) {
          active++;
        } else {
          inactive++;
        }
        const isLocked =
          Boolean(st.locked_until) || (st.failed_login_attempts ?? 0) >= 5;
        if (isLocked) {
          locked++;
        }
        coins += st.current_coins;
      }
    }

    return {
      totalStudents: total,
      activeStudents: active,
      lockedPinStudents: locked,
      inactiveStudents: inactive,
      deletedStudents: deleted,
      totalCoins: coins,
    };
  }, [studentsList]);

  // 2. Lọc và Sắp xếp danh sách học sinh
  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const result = studentsList.filter((item) => {
      // a. Lọc theo trạng thái
      if (statusFilter === "deleted") {
        if (!item.is_deleted) return false;
      } else {
        if (item.is_deleted) return false;

        if (statusFilter === "active" && !item.is_active) return false;
        if (statusFilter === "inactive" && item.is_active) return false;
        if (statusFilter === "locked") {
          const isLocked =
            Boolean(item.locked_until) ||
            (item.failed_login_attempts ?? 0) >= 5;
          if (!isLocked) return false;
        }
      }

      // b. Lọc theo lớp học
      if (selectedClassId !== "all") {
        if (selectedClassId === "unassigned") {
          if (item.class_id) return false;
        } else if (item.class_id !== selectedClassId) {
          return false;
        }
      }

      // c. Tìm kiếm từ khóa
      if (q) {
        const nameMatch = item.full_name.toLowerCase().includes(q);
        const phoneMatch = item.phone_zalo.toLowerCase().includes(q);
        const classMatch = item.class_name.toLowerCase().includes(q);
        if (!nameMatch && !phoneMatch && !classMatch) return false;
      }

      return true;
    });

    // d. Cập nhật nhãn đếm ngược khóa PIN thời gian thực
    const listWithRemaining = result.map((item) => {
      const dynamicRemaining = calculateLockRemainingText(
        item.locked_until,
        currentMinute
      );
      return {
        ...item,
        lock_remaining_text: dynamicRemaining,
      };
    });

    // e. Sắp xếp
    if (!sortField || sortDirection === "none") {
      return listWithRemaining;
    }

    return [...listWithRemaining].sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "full_name":
          cmp = a.full_name.localeCompare(b.full_name, "vi");
          break;
        case "class_name":
          cmp = a.class_name.localeCompare(b.class_name, "vi");
          break;
        case "current_coins":
          cmp = a.current_coins - b.current_coins;
          break;
        case "pin_status":
          cmp = (a.failed_login_attempts ?? 0) - (b.failed_login_attempts ?? 0);
          break;
        case "created_at": {
          const timeA = parseDateTime(a.created_at);
          const timeB = parseDateTime(b.created_at);
          cmp = timeA - timeB;
          break;
        }
        case "last_login_at": {
          const timeA = parseDateTime(a.last_login_at);
          const timeB = parseDateTime(b.last_login_at);
          cmp = timeA - timeB;
          break;
        }
      }
      return sortDirection === "asc" ? cmp : -cmp;
    });
  }, [
    studentsList,
    statusFilter,
    selectedClassId,
    searchQuery,
    sortField,
    sortDirection,
    currentMinute,
  ]);

  // 3. Handlers
  const handleSortToggle = useCallback(
    (field: StudentSortField) => {
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

  const handleResetFilter = useCallback(() => {
    setStatusFilterState("all");
    setSelectedClassIdState("all");
    setSearchQuery("");
    setSortField(null);
    setSortDirection("none");
    onFilterChange?.();
  }, [onFilterChange]);

  return {
    statusFilter,
    setStatusFilter,
    selectedClassId,
    setSelectedClassId,
    searchQuery,
    setSearchQuery,
    sortField,
    sortDirection,
    handleSortToggle,
    handleResetFilter,
    filteredStudents,

    // KPIs
    totalStudents,
    activeStudents,
    lockedPinStudents,
    inactiveStudents,
    deletedStudents,
    totalCoins,
  };
}

export type UseStudentFiltersReturn = ReturnType<typeof useStudentFilters>;
