"use client";

import useSWR from "swr";
import {
  TeacherStaffItem,
  AvailableClassItem,
} from "@/features/teacher-management/types";
import { teacherStaffService } from "@/features/teacher-management/services/teacherStaffService";
import { useUserStore } from "@/stores/useUserStore";
import { UserRole } from "@/constants/auth";
import { CACHE_KEYS } from "@/constants/cacheKeys";
import { useTableSelection } from "@/hooks/useTableSelection";

import { useTeacherFilters } from "./useTeacherFilters";
import { useTeacherModals } from "./useTeacherModals";
import { useTeacherMutations } from "./useTeacherMutations";

/**
 * Root Orchestrator Hook: Quản lý toàn bộ tính năng Nhân sự Giáo viên
 * - Đóng vai trò "Nhạc trưởng" điều phối: useTeacherFilters, useTableSelection, useTeacherModals, useTeacherMutations
 * - Tuân thủ Quy tắc 9 (Data Fetching 2 tầng SWR + Server Component) & Quy tắc 10 (Feature Context)
 */
export function useManageTeachers(
  initialTeachers?: TeacherStaffItem[],
  userRole?: string
) {
  const { student } = useUserStore();
  const currentRole = userRole || student?.role || UserRole.TEACHER;
  const isAdmin = currentRole === UserRole.ADMIN;
  const canSoftDelete =
    currentRole === UserRole.SUPER_TEACHER || currentRole === UserRole.ADMIN;

  // 1. Quản lý danh sách giáo viên qua SWR (Quy tắc 9): Tự động cache, 0 dòng useEffect
  const {
    data: teachersList = initialTeachers ?? [],
    isLoading,
    isValidating: isRefreshing,
    error,
    mutate,
  } = useSWR(
    CACHE_KEYS.TEACHERS.MANAGE_ALL,
    () => teacherStaffService.getManageTeachers(),
    {
      fallbackData: initialTeachers,
      revalidateOnMount: initialTeachers ? false : true,
      revalidateIfStale: !initialTeachers,
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  );

  // 2. Hook chọn checkbox hàng loạt (Batch Selection) dùng chung
  const selection = useTableSelection<string>();

  // 3. Micro-hook: Bộ lọc, Tìm kiếm, Sắp xếp và KPIs
  const filters = useTeacherFilters({
    teachersList,
    onFilterChange: selection.handleClearSelection,
  });

  // 4. Micro-hook: Quản lý đóng/mở & state của 5 Modals
  const modals = useTeacherModals();

  // 5. Lazy-load danh sách lớp học khả dụng qua SWR: chỉ gọi API khi modal gán lớp được mở
  const {
    data: availableClasses = [],
    isLoading: isLoadingClasses,
    mutate: mutateClasses,
  } = useSWR<AvailableClassItem[]>(
    modals.isAssignModalOpen ? CACHE_KEYS.TEACHERS.AVAILABLE_CLASSES : null,
    () => teacherStaffService.getAvailableClasses(),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  // 6. Micro-hook: Tương tác API, Cập nhật Cache & Optimistic UI
  const mutations = useTeacherMutations({
    teachersList,
    mutate,
    onMutateClasses: () => mutateClasses(),
    selectedIds: selection.selectedIds,
    setSelectedIds: selection.setSelectedIds,
    modals,
  });

  return {
    isAdmin,
    canSoftDelete,
    userRole: currentRole,
    teachersList,
    availableClasses,
    isLoading,
    isRefreshing,
    isError: Boolean(error),
    isLoadingClasses,

    // Gộp trực tiếp kết quả từ các Micro-Hooks
    ...filters,
    ...selection,
    ...modals,
    ...mutations,
  };
}
