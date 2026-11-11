"use client";

import { useCallback } from "react";
import useSWR, { mutate as globalMutate } from "swr";
import { toast } from "sonner";
import { TeacherClassItem } from "../components/classes/types";
import { teacherClassService } from "../services/teacherClassService";
import { useUserStore } from "@/stores/useUserStore";
import { UserRole } from "@/constants/auth";
import { CACHE_KEYS } from "@/constants";
import { useTableSelection } from "@/hooks/useTableSelection";

// Import 3 Micro-Hooks chuyên trách
import { useClassFilters } from "./classes/useClassFilters";
import { useClassModals } from "./classes/useClassModals";
import { useClassMutations } from "./classes/useClassMutations";

/**
 * Root Orchestrator Hook: Quản lý toàn bộ tính năng Lớp học
 * - Đóng vai trò "Nhạc trưởng" điều phối 4 Micro-Hooks chuyên biệt
 * - Rút gọn từ 555 dòng xuống chỉ còn ~75 dòng!
 * - Tương thích 100% với TeacherClassesContext
 */
export function useTeacherClasses(initialClasses?: TeacherClassItem[], userRole?: string) {
  const { student } = useUserStore();
  const currentRole = userRole || student?.role || UserRole.TEACHER;
  const isAdmin = currentRole === UserRole.ADMIN;
  const canSoftDelete =
    currentRole === UserRole.SUPER_TEACHER || currentRole === UserRole.ADMIN;

  // 1. Quản lý danh sách lớp học qua SWR (Quy tắc 9): Tự động cache, 0 dòng useEffect
  const {
    data: classesList = initialClasses ?? [],
    isLoading,
    isValidating: isRefreshing,
    error,
    mutate,
  } = useSWR(CACHE_KEYS.CLASSES.ALL, () => teacherClassService.getClasses(), {
    fallbackData: initialClasses,
    revalidateOnMount: initialClasses ? false : true,
    revalidateIfStale: !initialClasses,
    revalidateOnFocus: false,
    dedupingInterval: 30000,
  });

  // 2. Chọn checkbox hàng loạt (Batch Selection)
  const selection = useTableSelection<string>();

  // 3. Micro-hook: Bộ lọc, Tìm kiếm, Sắp xếp và KPIs
  const filters = useClassFilters({
    classesList,
    onFilterChange: selection.handleClearSelection,
  });

  // 4. Micro-hook: Quản lý đóng/mở & state của 5 Modals
  const modals = useClassModals(selection.selectedIds.length);

  // 5. Lazy-load giáo viên qua SWR: chỉ gọi API khi modal phân công được mở
  const { data: availableTeachers = [], isLoading: isLoadingTeachers } = useSWR(
    modals.isAssignModalOpen ? CACHE_KEYS.TEACHERS.AVAILABLE : null,
    () => teacherClassService.getAvailableTeachers(),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  // 6. Micro-hook: Tương tác API, Cập nhật Cache & Optimistic UI
  const mutations = useClassMutations({
    classesList,
    mutate,
    onMutateTeachers: () => globalMutate(CACHE_KEYS.TEACHERS.AVAILABLE),
    selectedIds: selection.selectedIds,
    setSelectedIds: selection.setSelectedIds,
    modals,
  });

  // 7. Làm mới dữ liệu lớp học khi bấm nút Refresh trên Toolbar
  const handleRefresh = useCallback(async () => {
    try {
      await Promise.all([mutate(), globalMutate(CACHE_KEYS.TEACHERS.AVAILABLE)]);
      toast.success("Đã làm mới danh sách lớp học!");
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error("Lỗi khi làm mới dữ liệu lớp học:", error.message);
      toast.error(error.message || "Không thể làm mới danh sách.");
    }
  }, [mutate]);

  return {
    isAdmin,
    canSoftDelete,
    classesList,
    availableTeachers,
    isLoading,
    isRefreshing,
    isError: Boolean(error),
    isLoadingTeachers,
    handleRefresh,

    // Gộp trực tiếp kết quả từ các Micro-Hooks (DRY tuyệt đối, không lặp lại khai báo)
    ...filters,
    ...selection,
    ...modals,
    ...mutations,
  };
}
