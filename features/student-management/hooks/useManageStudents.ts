"use client";

import useSWR from "swr";
import { toast } from "sonner";
import { useTableSelection } from "@/hooks/useTableSelection";
import { useUserStore } from "@/stores/useUserStore";
import { UserRole } from "@/constants/auth";
import { CACHE_KEYS } from "@/constants/cacheKeys";
import { StudentItem } from "@/features/student-management/types";
import { AvailableClassItem } from "@/features/teacher-management/types";
import { teacherStudentService } from "@/features/student-management/services/studentService";
import { teacherStaffService } from "@/features/teacher-management/services/teacherStaffService";

import { useStudentFilters } from "./useStudentFilters";
import { useStudentModals } from "./useStudentModals";
import { useStudentMutations } from "./useStudentMutations";

/**
 * Root Orchestrator Hook: Quản lý toàn bộ tính năng Học sinh Toàn trường
 * - Đóng vai trò "Nhạc trưởng" điều phối: useStudentFilters, useTableSelection, useStudentModals, useStudentMutations
 * - Tuân thủ Quy tắc 9 (Mô hình 2 tầng: Server Component + SWR) & Quy tắc 10 (Feature Context) & Quy tắc Micro-Hooks
 */
export function useManageStudents(
  initialStudents?: StudentItem[],
  userRole?: string
) {
  const { student } = useUserStore();
  const currentRole = userRole || student?.role || UserRole.TEACHER;
  const isAdmin = currentRole === UserRole.ADMIN;
  const canSoftDelete =
    currentRole === UserRole.SUPER_TEACHER || currentRole === UserRole.ADMIN;

  // 1. Quản lý danh sách học sinh qua SWR (Quy tắc 9): Tự động cache, 0ms mạng client
  const {
    data: studentsList = initialStudents ?? [],
    isLoading,
    isValidating: isRefreshing,
    error,
    mutate,
  } = useSWR(
    CACHE_KEYS.STUDENTS.MANAGE_ALL,
    () => teacherStudentService.getManageStudents(),
    {
      fallbackData: initialStudents,
      revalidateOnMount: initialStudents ? false : true,
      revalidateIfStale: !initialStudents,
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  );

  // 2. Lấy danh sách lớp học sẵn có từ CSDL qua SWR
  const { data: availableClasses = [] } = useSWR<AvailableClassItem[]>(
    CACHE_KEYS.TEACHERS.AVAILABLE_CLASSES,
    () => teacherStaffService.getAvailableClasses(),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  // 3. Hook chọn checkbox hàng loạt (Batch Selection) dùng chung
  const selection = useTableSelection<string>();

  // 4. Micro-hook: Bộ lọc, Tìm kiếm, Sắp xếp và KPIs
  const filters = useStudentFilters({
    studentsList,
    onFilterChange: selection.handleClearSelection,
  });

  // 5. Micro-hook: Quản lý đóng/mở & state của các Modals
  const modals = useStudentModals({ isAdmin });

  // 6. Micro-hook: Tương tác API, Cập nhật SWR Cache & Optimistic UI
  const mutations = useStudentMutations({
    isAdmin,
    studentsList,
    mutate,
    selectedIds: selection.selectedIds,
    handleClearSelection: selection.handleClearSelection,
    modals,
  });

  const handleRefresh = async () => {
    try {
      await mutate();
      toast.success("Đã làm mới danh sách học sinh!");
    } catch {
      toast.error("Không thể làm mới danh sách học sinh.");
    }
  };

  return {
    isAdmin,
    canSoftDelete,
    userRole: currentRole,
    studentsList,
    availableClasses,
    isLoading,
    isRefreshing,
    isError: Boolean(error),
    handleRefresh,

    // Gộp trực tiếp kết quả từ các Micro-Hooks
    ...filters,
    ...selection,
    ...modals,
    ...mutations,
  };
}

export type UseManageStudentsReturn = ReturnType<typeof useManageStudents>;
