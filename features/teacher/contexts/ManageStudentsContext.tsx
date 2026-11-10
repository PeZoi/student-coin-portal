"use client";

import { createContext, useContext, ReactNode } from "react";
import { useManageStudents } from "../hooks/useManageStudents";
import { StudentItem } from "../components/students/types";

export type ManageStudentsContextType = ReturnType<typeof useManageStudents>;

const ManageStudentsContext = createContext<ManageStudentsContextType | null>(null);

interface ManageStudentsProviderProps {
  children: ReactNode;
  initialStudents?: StudentItem[];
  userRole?: string;
}

/**
 * Feature Provider cho module Quản lý học sinh
 * - Quản lý tập trung State UI, Filter, Sorting, Selection và các Modals của trang
 * - Loại bỏ hoàn toàn Prop Drilling qua nhiều tầng component con (Quy tắc 10)
 */
export function ManageStudentsProvider({
  children,
  initialStudents,
  userRole,
}: ManageStudentsProviderProps) {
  const value = useManageStudents(initialStudents, userRole);

  return (
    <ManageStudentsContext.Provider value={value}>
      {children}
    </ManageStudentsContext.Provider>
  );
}

/**
 * Hook truy xuất context quản lý học sinh
 * - Bắt buộc phải sử dụng bên trong <ManageStudentsProvider>
 */
export function useManageStudentsContext(): ManageStudentsContextType {
  const context = useContext(ManageStudentsContext);
  if (!context) {
    throw new Error(
      "useManageStudentsContext phải được sử dụng bên trong ManageStudentsProvider"
    );
  }
  return context;
}

