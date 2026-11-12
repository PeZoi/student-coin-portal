"use client";

import { useState, useMemo, useCallback, useDeferredValue } from "react";
import {
  TeacherStaffItem,
  TeacherStatusFilter,
  TeacherSortField,
  SortDirection,
} from "@/features/teacher-management/types";
import { normalizeText } from "@/lib/utils";
import { parseDate, parseDateTime } from "@/lib/date";
import { UserRole } from "@/constants/auth";

interface UseTeacherFiltersProps {
  teachersList: TeacherStaffItem[];
  onFilterChange?: () => void;
}

/**
 * Micro-hook chuyên trách: Bộ lọc, Tìm kiếm, Sắp xếp và Tính toán KPIs Giáo viên
 */
export function useTeacherFilters({
  teachersList,
  onFilterChange,
}: UseTeacherFiltersProps) {
  const [statusFilter, setStatusFilterState] =
    useState<TeacherStatusFilter>("all");
  const [searchQuery, setSearchQueryState] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [sortField, setSortField] = useState<TeacherSortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("none");

  // State phân trang (Pagination)
  const [currentPage, setCurrentPageState] = useState<number>(1);
  const [pageSize, setPageSizeState] = useState<number>(10);

  // Đổi bộ lọc trạng thái và tự động gọi hook ngoài (xóa selection) & reset về trang 1
  const setStatusFilter = useCallback(
    (filter: TeacherStatusFilter) => {
      setStatusFilterState(filter);
      setCurrentPageState(1);
      onFilterChange?.();
    },
    [onFilterChange]
  );

  const setSearchQuery = useCallback(
    (query: string) => {
      setSearchQueryState(query);
      setCurrentPageState(1);
      onFilterChange?.();
    },
    [onFilterChange]
  );

  // Tính toán chỉ số KPI hiển thị trên thẻ thống kê (bỏ qua các tài khoản đã xóa mềm trừ deletedTeachers)
  const {
    totalTeachers,
    activeTeachers,
    inactiveTeachers,
    deletedTeachers,
    assignedTeachersCount,
    unassignedTeachersCount,
  } = useMemo(() => {
    let total = 0;
    let active = 0;
    let inactive = 0;
    let deleted = 0;
    let assignedCount = 0;

    for (const item of teachersList) {
      // Ẩn hoàn toàn tài khoản Quản trị viên (Admin) khỏi danh sách giáo viên
      if (item.role === UserRole.ADMIN) {
        continue;
      }

      if (item.is_deleted) {
        deleted += 1;
      } else {
        total += 1;
        if (item.is_active) active += 1;
        else inactive += 1;
        if (item.assigned_classes.length > 0) {
          assignedCount += 1;
        }
      }
    }

    return {
      totalTeachers: total,
      activeTeachers: active,
      inactiveTeachers: inactive,
      deletedTeachers: deleted,
      assignedTeachersCount: assignedCount,
      unassignedTeachersCount: total - assignedCount,
    };
  }, [teachersList]);

  // Chuyển trạng thái sắp xếp cột: asc -> desc -> none & reset về trang 1
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
      setCurrentPageState(1);
    },
    [sortField, sortDirection]
  );

  // Lọc và sắp xếp danh sách giáo viên
  const filteredTeachers = useMemo(() => {
    const normalizedQuery = normalizeText(deferredSearchQuery);

    const list = teachersList.filter((item) => {
      // Ẩn hoàn toàn tài khoản Quản trị viên (Admin) khỏi danh sách giáo viên
      if (item.role === UserRole.ADMIN) {
        return false;
      }

      if (statusFilter === "deleted") {
        if (!item.is_deleted) return false;
      } else {
        if (item.is_deleted) return false;
        if (statusFilter === "active" && !item.is_active) return false;
        if (statusFilter === "inactive" && item.is_active) return false;
      }

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

    // Mặc định hoặc khi sort: Ưu tiên tài khoản đang hoạt động lên trên, tạm khóa luôn ở cuối
    return [...list].sort((a, b) => {
      // 1. Luôn xếp tài khoản đang hoạt động trước, tạm khóa dưới cuối
      if (a.is_active !== b.is_active) {
        return a.is_active ? -1 : 1;
      }

      // 2. Nếu không chọn cột sắp xếp, giữ nguyên thứ tự
      if (!sortField || sortDirection === "none") {
        return 0;
      }

      // 3. Sắp xếp theo cột người dùng chọn
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

  // Phân trang dữ liệu nhân sự giáo viên
  const totalPages = Math.max(1, Math.ceil(filteredTeachers.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedTeachers = useMemo(() => {
    const startIndex = (safePage - 1) * pageSize;
    return filteredTeachers.slice(startIndex, startIndex + pageSize);
  }, [filteredTeachers, safePage, pageSize]);

  const setCurrentPage = useCallback(
    (page: number) => {
      setCurrentPageState(Math.max(1, page));
      onFilterChange?.();
    },
    [onFilterChange]
  );

  const setPageSize = useCallback(
    (size: number) => {
      setPageSizeState(size);
      setCurrentPageState(1);
      onFilterChange?.();
    },
    [onFilterChange]
  );

  const handleResetFilter = useCallback(() => {
    setStatusFilter("all");
    setSearchQueryState("");
    setCurrentPageState(1);
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
    totalTeachers,
    activeTeachers,
    inactiveTeachers,
    deletedTeachers,
    assignedTeachersCount,
    unassignedTeachersCount,
    filteredTeachers,

    // Phân trang
    paginatedTeachers,
    currentPage: safePage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    totalItems: filteredTeachers.length,

    handleResetFilter,
  };
}
