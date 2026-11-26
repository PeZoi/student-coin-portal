"use client";

import { createContext, useContext, ReactNode } from "react";
import {
  useTeacherDashboard,
  UseTeacherDashboardProps,
} from "../hooks/useTeacherDashboard";

export type TeacherDashboardContextType = ReturnType<typeof useTeacherDashboard>;

const TeacherDashboardContext =
  createContext<TeacherDashboardContextType | null>(null);

export interface TeacherDashboardProviderProps extends UseTeacherDashboardProps {
  children: ReactNode;
}

/**
 * Feature Provider cho trang Tổng quan Giáo viên (Teacher Dashboard)
 * - Quản lý tập trung toàn bộ dữ liệu SWR, Modal & Mutations theo lớp đang chọn
 * - Loại bỏ hoàn toàn Prop Drilling qua các widget con (Tuân thủ Quy tắc 10 AGENTS.md)
 */
export function TeacherDashboardProvider({
  children,
  initialData,
  initialClassId,
}: TeacherDashboardProviderProps) {
  const value = useTeacherDashboard({
    initialData,
    initialClassId,
  });

  return (
    <TeacherDashboardContext.Provider value={value}>
      {children}
    </TeacherDashboardContext.Provider>
  );
}

/**
 * Hook truy xuất Context bắt buộc (ném lỗi rõ ràng nếu quên bọc Provider)
 */
export function useTeacherDashboardContext(): TeacherDashboardContextType {
  const context = useContext(TeacherDashboardContext);
  if (!context) {
    throw new Error(
      "useTeacherDashboardContext phải được sử dụng bên trong <TeacherDashboardProvider>"
    );
  }
  return context;
}
