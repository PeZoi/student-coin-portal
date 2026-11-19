"use client";

import { createContext, useContext, ReactNode } from "react";
import {
  useRewardManagement,
  UseRewardManagementProps,
} from "../hooks/useRewardManagement";

export type TeacherRewardsContextType = ReturnType<typeof useRewardManagement>;

const TeacherRewardsContext = createContext<TeacherRewardsContextType | null>(
  null
);

export interface TeacherRewardsProviderProps extends UseRewardManagementProps {
  children: ReactNode;
}

/**
 * Feature Provider cho module Quản lý đổi quà & Heo Đất (Góc giáo viên)
 * - Quản lý tập trung State UI, Filter, Sorting, Pagination, SWR Cache, và các Modals
 * - Loại bỏ hoàn toàn Prop Drilling qua nhiều tầng component con (Tuân thủ Quy tắc 10 AGENTS.md)
 */
export function TeacherRewardsProvider({
  children,
  initialRequests,
  initialMonth,
  initialYear,
  initialClassId,
}: TeacherRewardsProviderProps) {
  const value = useRewardManagement({
    initialRequests,
    initialMonth,
    initialYear,
    initialClassId,
  });

  return (
    <TeacherRewardsContext.Provider value={value}>
      {children}
    </TeacherRewardsContext.Provider>
  );
}

/**
 * Hook truy xuất Context an toàn (trả về null nếu nằm ngoài Provider)
 * - Dùng cho các Component hoặc Modal hỗ trợ tái sử dụng độc lập (standalone) bằng props
 */
export function useOptionalTeacherRewardsContext(): TeacherRewardsContextType | null {
  return useContext(TeacherRewardsContext);
}

/**
 * Hook truy xuất Context bắt buộc (ném Exception rõ ràng nếu quên bọc Provider)
 */
export function useTeacherRewardsContext(): TeacherRewardsContextType {
  const context = useContext(TeacherRewardsContext);
  if (!context) {
    throw new Error(
      "useTeacherRewardsContext phải được sử dụng bên trong <TeacherRewardsProvider>"
    );
  }
  return context;
}
