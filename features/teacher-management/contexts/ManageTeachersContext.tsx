"use client";

import { createContext, useContext, ReactNode } from "react";
import { useManageTeachers } from "../hooks/useManageTeachers";
import { TeacherStaffItem } from "@/features/teacher-management/types";

export type ManageTeachersContextType = ReturnType<typeof useManageTeachers>;

const ManageTeachersContext = createContext<ManageTeachersContextType | null>(null);

interface ManageTeachersProviderProps {
  children: ReactNode;
  initialTeachers?: TeacherStaffItem[];
  userRole?: string;
}

/**
 * Feature Provider cho module Quản lý giáo viên
 * - Quản lý tập trung State UI, Filter, Sorting và các Modals của trang
 * - Loại bỏ hoàn toàn Prop Drilling qua nhiều tầng component con (Quy tắc 10)
 */
export function ManageTeachersProvider({
  children,
  initialTeachers,
  userRole,
}: ManageTeachersProviderProps) {
  const value = useManageTeachers(initialTeachers, userRole);

  return (
    <ManageTeachersContext.Provider value={value}>
      {children}
    </ManageTeachersContext.Provider>
  );
}

/**
 * Hook truy xuất context quản lý giáo viên
 * - Bắt buộc phải sử dụng bên trong <ManageTeachersProvider>
 */
export function useManageTeachersContext(): ManageTeachersContextType {
  const context = useContext(ManageTeachersContext);
  if (!context) {
    throw new Error(
      "useManageTeachersContext phải được sử dụng bên trong ManageTeachersProvider"
    );
  }
  return context;
}

