"use client";

import { useState, useCallback, useMemo } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { useUserStore } from "@/stores/useUserStore";
import { useTeacherWorkspaceStore } from "@/stores/useTeacherWorkspaceStore";
import { UserRole } from "@/constants/auth";
import { CACHE_KEYS } from "@/constants";
import { useTableSelection } from "@/hooks/useTableSelection";
import { TeacherMissionItem, MissionAvailableClass } from "../types";
import { missionService } from "../services/missionService";
import { useMissionFilters } from "./useMissionFilters";
import { useMissionModals } from "./useMissionModals";
import { useMissionMutations } from "./useMissionMutations";

/**
 * Root Orchestrator Hook: Quản lý toàn bộ tính năng Giao bài tập (Mission Management)
 * - Tích hợp SWR Cache 2 tầng chuẩn Quy tắc 9 AGENTS.md (0ms delay khi tải lại)
 * - Tự động đồng bộ theo không gian làm việc (Workspace Class)
 * - Áp dụng kiến trúc Micro-Hooks (Quy tắc 12): Tách biệt Filters, Modals, Mutations và Selection
 */
export function useManageMissions(
  initialMissions?: TeacherMissionItem[],
  initialClasses?: MissionAvailableClass[],
  userRole?: string,
  initialClassId?: string
) {
  const { student } = useUserStore();
  const currentRole = userRole || student?.role || UserRole.TEACHER;
  const isAdmin = currentRole === UserRole.ADMIN;
  const canSoftDelete = true;

  // Lấy lớp đang chọn từ Header Workspace (ưu tiên initialClassId từ máy chủ khi chưa hydrate)
  const selectedWorkspaceClass = useTeacherWorkspaceStore((state) =>
    state.getSelectedClass()
  );
  const workspaceClasses = useTeacherWorkspaceStore((state) => state.classes);
  const workspaceClassId =
    selectedWorkspaceClass?.id ?? initialClassId ?? null;

  // 1. SWR Cache Data Fetching (Tự động chuyển đổi theo Workspace Class)
  const isMatchingInitialClass =
    !workspaceClassId || workspaceClassId === initialClassId;

  const {
    data: missionsList = isMatchingInitialClass ? (initialMissions ?? []) : [],
    mutate: mutateMissions,
    isLoading,
    isValidating,
  } = useSWR(
    CACHE_KEYS.MISSIONS.ALL(workspaceClassId),
    () =>
      missionService.getMissions({
        classId: workspaceClassId ?? undefined,
      }),
    {
      fallbackData: isMatchingInitialClass ? initialMissions : undefined,
      revalidateOnMount: isMatchingInitialClass && initialMissions ? false : true,
      revalidateIfStale: !(isMatchingInitialClass && initialMissions),
      revalidateOnFocus: false,
    }
  );

  // 2. Danh sách lớp học khả dụng
  const availableClasses: MissionAvailableClass[] = useMemo(() => {
    if (workspaceClasses && workspaceClasses.length > 0) {
      return workspaceClasses.map((c) => ({
        id: c.id,
        class_name: c.class_name,
        student_count: c.student_count ?? 0,
        is_active: true,
      }));
    }
    return initialClasses ?? [];
  }, [workspaceClasses, initialClasses]);

  const [isRefreshing, setIsRefreshing] = useState(false);

  // 3. Chọn checkbox hàng loạt (Batch Selection)
  const selection = useTableSelection<string>();

  // 4. Micro-Hook 1: Bộ lọc, Tìm kiếm, Sắp xếp, Phân trang và KPIs
  const filters = useMissionFilters({
    missionsList,
    onFilterChange: selection.handleClearSelection,
  });

  // 5. Micro-Hook 2: Quản lý đóng/mở Modals
  const modals = useMissionModals(selection.selectedIds.length);

  // 6. Micro-Hook 3: Các thao tác thêm/sửa/xóa/phân công gọi API thực tế
  const mutations = useMissionMutations({
    missionsList,
    mutateMissions,
    selectedIds: selection.selectedIds,
    handleClearSelection: selection.handleClearSelection,
    modals,
    creatorName: student?.full_name || "Giáo viên",
  });

  // 7. Làm mới danh sách bài tập từ database
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await mutateMissions();
      toast.success("Đã làm mới danh sách bài tập!");
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error("Lỗi khi làm mới dữ liệu bài tập:", error.message);
      toast.error(error.message || "Không thể làm mới danh sách bài tập.");
    } finally {
      setIsRefreshing(false);
    }
  }, [mutateMissions]);

  return {
    isAdmin,
    canSoftDelete,
    userRole: currentRole,
    missionsList,
    availableClasses,
    isLoading,
    isRefreshing: isRefreshing || isValidating,
    isError: false,
    handleRefresh,

    // Gộp trực tiếp kết quả từ các Micro-Hooks
    ...filters,
    ...selection,
    ...modals,
    ...mutations,
  };
}
