"use client";

import { useState, useMemo, useCallback, useDeferredValue } from "react";
import {
  TeacherStaffItem,
  TeacherStatusFilter,
  TeacherSortField,
  SortDirection,
} from "../../components/teachers/types";
import { normalizeText, parseDate } from "../../components/classes/utils";

/**
 * Hỗ trợ phân tích chuỗi ngày giờ "HH:mm dd/MM/yyyy" hoặc "dd/MM/yyyy" sang timestamp để sắp xếp
 */
function parseDateTime(dateTimeStr: string | null): number {
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
  return parseDate(trimmed);
}

interface UseTeacherFiltersProps {
  teachersList: TeacherStaffItem[];
}

/**
 * Micro-hook chuyên trách: Bộ lọc, Tìm kiếm, Sắp xếp và Tính toán KPIs Giáo viên
 */
export function useTeacherFilters({ teachersList }: UseTeacherFiltersProps) {
  const [statusFilter, setStatusFilter] = useState<TeacherStatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [sortField, setSortField] = useState<TeacherSortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("none");

  // Tính toán chỉ số KPI hiển thị trên thẻ thống kê
  const {
    totalTeachers,
    activeTeachers,
    inactiveTeachers,
    assignedTeachersCount,
    unassignedTeachersCount,
  } = useMemo(() => {
    const total = teachersList.length;
    let active = 0;
    let assignedCount = 0;

    for (const item of teachersList) {
      if (item.is_active) active += 1;
      if (item.assigned_classes.length > 0) {
        assignedCount += 1;
      }
    }

    return {
      totalTeachers: total,
      activeTeachers: active,
      inactiveTeachers: total - active,
      assignedTeachersCount: assignedCount,
      unassignedTeachersCount: total - assignedCount,
    };
  }, [teachersList]);

  // Chuyển trạng thái sắp xếp cột: asc -> desc -> none
  const handleSortToggle = useCallback(
    (field: TeacherSortField) => {
      if (sortField !== field) {
        setSortField(field);
        setSortDirection("asc");
      } else if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortDirection("none");
        setSortField(null);
      } else {
        setSortDirection("asc");
      }
    },
    [sortField, sortDirection]
  );

  // Lọc và sắp xếp danh sách giáo viên
  const filteredTeachers = useMemo(() => {
    const normalizedQuery = normalizeText(deferredSearchQuery);

    const list = teachersList.filter((item) => {
      if (statusFilter === "active" && !item.is_active) return false;
      if (statusFilter === "inactive" && item.is_active) return false;

      if (normalizedQuery) {
        const matchFullName = normalizeText(item.full_name).includes(normalizedQuery);
        const matchUsername = normalizeText(item.username).includes(normalizedQuery);
        const matchPhone = item.phone_zalo
          ? normalizeText(item.phone_zalo).includes(normalizedQuery)
          : false;
        const matchEmail = item.email
          ? normalizeText(item.email).includes(normalizedQuery)
          : false;
        const matchClass = item.assigned_classes.some((cls) =>
          normalizeText(cls).includes(normalizedQuery)
        );

        if (
          !matchFullName &&
          !matchUsername &&
          !matchPhone &&
          !matchEmail &&
          !matchClass
        ) {
          return false;
        }
      }

      return true;
    });

    if (!sortField || sortDirection === "none") {
      return list;
    }

    return [...list].sort((a, b) => {
      let result = 0;

      if (sortField === "full_name") {
        result = a.full_name.localeCompare(b.full_name, "vi", { numeric: true });
      } else if (sortField === "assigned_classes") {
        result = a.assigned_classes.length - b.assigned_classes.length;
      } else if (sortField === "last_login_at") {
        const timeA = parseDateTime(a.last_login_at);
        const timeB = parseDateTime(b.last_login_at);

        if (timeA === -1 && timeB === -1) result = 0;
        else if (timeA === -1) return 1;
        else if (timeB === -1) return -1;
        else result = timeA - timeB;
      } else if (sortField === "created_at") {
        const timeA = parseDate(a.created_at);
        const timeB = parseDate(b.created_at);

        if (timeA === -1 && timeB === -1) result = 0;
        else if (timeA === -1) return 1;
        else if (timeB === -1) return -1;
        else result = timeA - timeB;
      }

      return sortDirection === "desc" ? -result : result;
    });
  }, [teachersList, statusFilter, deferredSearchQuery, sortField, sortDirection]);

  const handleResetFilter = useCallback(() => {
    setStatusFilter("all");
    setSearchQuery("");
  }, []);

  return {
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    sortField,
    sortDirection,
    handleSortToggle,
    totalTeachers,
    activeTeachers,
    inactiveTeachers,
    assignedTeachersCount,
    unassignedTeachersCount,
    filteredTeachers,
    handleResetFilter,
  };
}
