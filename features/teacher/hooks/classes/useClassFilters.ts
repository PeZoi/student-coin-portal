"use client";

import { useState, useMemo, useCallback, useDeferredValue } from "react";
import {
  TeacherClassItem,
  StatusFilter,
  SortField,
  SortDirection,
} from "../../components/classes/types";
import { normalizeText } from "@/lib/utils";
import { parseDate } from "@/lib/date";

interface UseClassFiltersProps {
  classesList: TeacherClassItem[];
  onFilterChange?: () => void;
}

/**
 * Micro-hook chuyên trách: Bộ lọc, Tìm kiếm (Debounced), Sắp xếp và Tính toán KPIs
 */
export function useClassFilters({ classesList, onFilterChange }: UseClassFiltersProps) {
  const [statusFilter, setStatusFilterState] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("none");

  // Đổi bộ lọc trạng thái và tự động gọi hook ngoài (xóa selection)
  const setStatusFilter = useCallback(
    (filter: StatusFilter) => {
      setStatusFilterState(filter);
      onFilterChange?.();
    },
    [onFilterChange]
  );

  // Tính toán KPI phái sinh (bỏ qua các lớp đã xóa trừ chỉ số deletedClasses)
  const {
    totalClasses,
    activeClasses,
    inactiveClasses,
    deletedClasses,
    totalStudents,
    totalTeachers,
  } = useMemo(() => {
    let total = 0;
    let active = 0;
    let inactive = 0;
    let deleted = 0;
    let students = 0;
    const teacherSet = new Set<string>();

    for (const c of classesList) {
      if (c.is_deleted) {
        deleted += 1;
      } else {
        total += 1;
        if (c.is_active) active += 1;
        else inactive += 1;
        students += c.student_count;
        for (const t of c.teachers) {
          teacherSet.add(t);
        }
      }
    }

    return {
      totalClasses: total,
      activeClasses: active,
      inactiveClasses: inactive,
      deletedClasses: deleted,
      totalStudents: students,
      totalTeachers: teacherSet.size,
    };
  }, [classesList]);

  // Toggle sắp xếp: asc -> desc -> none
  const handleSortToggle = useCallback(
    (field: SortField) => {
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

  // Lọc và sắp xếp danh sách lớp học
  const filteredClasses = useMemo(() => {
    const normalizedQuery = normalizeText(deferredSearchQuery);

    const list = classesList.filter((c) => {
      if (statusFilter === "deleted") {
        if (!c.is_deleted) return false;
      } else {
        if (c.is_deleted) return false;
        if (statusFilter === "active" && !c.is_active) return false;
        if (statusFilter === "inactive" && c.is_active) return false;
      }

      if (normalizedQuery) {
        const matchClassName = normalizeText(c.class_name).includes(normalizedQuery);
        const matchTeacher = c.teachers.some((t) => normalizeText(t).includes(normalizedQuery));
        if (!matchClassName && !matchTeacher) return false;
      }

      return true;
    });

    // Mặc định hoặc khi sort: Ưu tiên lớp đang hoạt động lên trên, tạm ẩn luôn ở cuối
    return [...list].sort((a, b) => {
      // 1. Luôn xếp lớp đang hoạt động trước, lớp tạm ẩn dưới cuối
      if (a.is_active !== b.is_active) {
        return a.is_active ? -1 : 1;
      }

      // 2. Nếu không chọn cột sắp xếp, giữ nguyên thứ tự (đã xếp theo ngày tạo từ server)
      if (!sortField || sortDirection === "none") {
        return 0;
      }

      // 3. Nếu cùng trạng thái, sắp xếp theo cột người dùng chọn
      let result = 0;

      if (sortField === "class_name") {
        result = a.class_name.localeCompare(b.class_name, "vi", { numeric: true });
      } else if (sortField === "student_count") {
        result = a.student_count - b.student_count;
      } else if (sortField === "total_coins") {
        result = (a.total_coins ?? 0) - (b.total_coins ?? 0);
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
  }, [classesList, statusFilter, deferredSearchQuery, sortField, sortDirection]);

  const handleResetFilter = useCallback(() => {
    setStatusFilter("all");
    setSearchQuery("");
    onFilterChange?.();
  }, [setStatusFilter, onFilterChange]);

  return {
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    sortField,
    sortDirection,
    handleSortToggle,
    totalClasses,
    activeClasses,
    inactiveClasses,
    deletedClasses,
    totalStudents,
    totalTeachers,
    filteredClasses,
    handleResetFilter,
  };
}
