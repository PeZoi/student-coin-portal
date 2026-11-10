"use client";

import { useState } from "react";
import {
  TeacherStaffItem,
  AvailableClassItem,
} from "../components/teachers/types";
import {
  INITIAL_MOCK_TEACHERS,
  INITIAL_AVAILABLE_CLASSES,
} from "../components/teachers/constants";

import { useTeacherFilters } from "./teachers/useTeacherFilters";
import { useTeacherModals } from "./teachers/useTeacherModals";
import { useTeacherOperations } from "./teachers/useTeacherOperations";

/**
 * Root Orchestrator Hook: Quản lý toàn bộ tính năng Giáo viên
 * - Đóng vai trò "Nhạc trưởng" điều phối 3 Micro-Hooks: useTeacherFilters, useTeacherModals, useTeacherOperations
 * - Rút gọn từ 365 dòng xuống chỉ còn ~80 dòng!
 * - Tương thích 100% với ManageTeachersContext
 */
export function useManageTeachers(initialTeachers?: TeacherStaffItem[]) {
  const [teachersList] = useState<TeacherStaffItem[]>(
    initialTeachers ?? INITIAL_MOCK_TEACHERS
  );
  const [availableClasses] = useState<AvailableClassItem[]>(INITIAL_AVAILABLE_CLASSES);

  const [isLoading] = useState(false);
  const [isRefreshing] = useState(false);
  const [isError] = useState(false);
  const [isSubmitting] = useState(false);
  const [isLoadingClasses] = useState(false);

  // 1. Micro-hook: Bộ lọc, Tìm kiếm, Sắp xếp và KPIs
  const filters = useTeacherFilters({ teachersList });

  // 2. Micro-hook: Quản lý trạng thái 4 Modals
  const modals = useTeacherModals();

  // 3. Micro-hook: Tương tác nghiệp vụ & thao tác
  const operations = useTeacherOperations({ modals });

  return {
    teachersList,
    availableClasses,
    isLoading,
    isRefreshing,
    isError,
    isSubmitting,
    isLoadingClasses,

    // Gộp trực tiếp kết quả từ các Micro-Hooks
    ...filters,
    ...modals,
    ...operations,
  };
}
