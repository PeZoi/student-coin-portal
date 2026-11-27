"use client";

import useSWR from "swr";
import { useTeacherWorkspaceStore } from "@/stores/useTeacherWorkspaceStore";
import { useTableSelection } from "@/hooks/useTableSelection";
import { CACHE_KEYS, DEFAULT_AUTH_SECURITY_CONFIG } from "@/constants";
import { AuthSecurityConfig } from "@/types/systemConfig";
import { TeacherRosterStudent } from "../types";
import { studentRosterService } from "../services/studentRosterService";
import { useStudentRosterFilters } from "./useStudentRosterFilters";
import { useStudentRosterModals } from "./useStudentRosterModals";
import { useStudentRosterMutations } from "./useStudentRosterMutations";

interface UseStudentRosterProps {
  initialStudents?: TeacherRosterStudent[];
  initialClasses?: Array<{
    id: string;
    class_name: string;
    student_count: number;
    is_active: boolean;
  }>;
  initialClassId?: string;
  userRole?: string;
  authSecurity?: AuthSecurityConfig;
}

/**
 * Root Orchestrator Hook: Quản lý toàn bộ tính năng Danh sách học sinh theo lớp
 * - Tuân thủ Quy tắc 9 AGENTS.md: Mô hình Data Fetching 2 tầng SWR Cache
 * - Tự động đồng bộ theo không gian làm việc (Workspace Class)
 * - Tuân thủ Quy tắc 12 AGENTS.md: Kiến trúc Micro-Hooks (Filters, Modals, Mutations, Selection)
 * - Độ dài luôn giữ dưới 90 dòng code
 */
export function useStudentRoster({
  initialStudents = [],
  initialClasses = [],
  initialClassId,
  userRole,
  authSecurity = DEFAULT_AUTH_SECURITY_CONFIG,
}: UseStudentRosterProps = {}) {
  const maxFailedAttempts =
    authSecurity.max_failed_attempts ??
    DEFAULT_AUTH_SECURITY_CONFIG.max_failed_attempts;
  // 1. Xác định lớp học đang chọn từ Header Workspace
  const selectedWorkspaceClassId = useTeacherWorkspaceStore(
    (state) => state.selectedClassId
  );
  const activeClassId = selectedWorkspaceClassId ?? initialClassId ?? null;

  const workspaceClasses = useTeacherWorkspaceStore((state) => state.classes);
  const availableClasses =
    workspaceClasses.length > 0 ? workspaceClasses : initialClasses;
  const isTeacherWithNoClasses =
    userRole !== "admin" && availableClasses.length === 0;

  // 2. Data Fetching 2 tầng qua SWR (Mô hình Server Component + SWR Cache - Quy tắc 9)
  // Chỉ khớp initialStudents từ máy chủ khi lớp hiện tại trùng đúng lớp ban đầu
  const isMatchingInitialClass = Boolean(
    activeClassId && initialClassId && activeClassId === initialClassId
  );

  const {
    data: students = isMatchingInitialClass ? initialStudents : [],
    mutate,
    isLoading,
  } = useSWR(
    CACHE_KEYS.ROSTER.STUDENTS(activeClassId),
    () => studentRosterService.getRosterStudents(activeClassId ?? undefined),
    {
      fallbackData: isMatchingInitialClass ? initialStudents : undefined,
      revalidateOnMount: !(isMatchingInitialClass && initialStudents.length > 0),
      revalidateIfStale: !(isMatchingInitialClass && initialStudents.length > 0),
      revalidateOnFocus: false,
      keepPreviousData: true,
    }
  );

  // 3. Selection checkbox hàng loạt
  const selection = useTableSelection<string>();

  // 4. Micro-Hook 1: Bộ lọc, Tìm kiếm, Sắp xếp, Phân trang và Thống kê KPIs
  const filters = useStudentRosterFilters({
    students,
    onFilterChange: selection.handleClearSelection,
  });

  // 5. Micro-Hook 2: Quản lý 5 Modals
  const modals = useStudentRosterModals();

  const currentClassName =
    availableClasses.find((c) => c.id === activeClassId)?.class_name ||
    students[0]?.class_name ||
    "Lớp học";

  // 6. Micro-Hook 3: Các thao tác API Mutations & Xuất Excel
  const mutations = useStudentRosterMutations({
    mutate,
    modals,
    selectedIds: selection.selectedIds,
    handleClearSelection: selection.handleClearSelection,
    students,
    filteredStudents: filters.filteredStudents,
    currentClassName,
  });

  return {
    activeClassId,
    initialClassId,
    isTeacherWithNoClasses,
    maxFailedAttempts,
    students,
    isLoading,
    mutate,
    ...filters,
    ...selection,
    ...modals,
    ...mutations,
  };
}
