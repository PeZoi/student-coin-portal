"use client";

import { createContext, useContext, ReactNode } from "react";
import { useTeacherClasses } from "../hooks/useManageClasses";
import { TeacherClassItem } from "../components/classes/types";

export type TeacherClassesContextType = ReturnType<typeof useTeacherClasses>;

const TeacherClassesContext = createContext<TeacherClassesContextType | null>(null);

interface TeacherClassesProviderProps {
  children: ReactNode;
  initialClasses?: TeacherClassItem[];
  userRole?: string;
}

/**
 * Feature Provider cho module Quản lý lớp học
 * - Quản lý toàn bộ State, SWR cache, Filter, Sorting và Modals của trang
 * - Loại bỏ hoàn toàn Prop Drilling qua nhiều tầng component con
 */
export function TeacherClassesProvider({
  children,
  initialClasses,
  userRole,
}: TeacherClassesProviderProps) {
  const value = useTeacherClasses(initialClasses, userRole);

  return (
    <TeacherClassesContext.Provider value={value}>
      {children}
    </TeacherClassesContext.Provider>
  );
}

/**
 * Hook truy xuất context quản lý lớp học
 * - Bắt buộc phải sử dụng bên trong <TeacherClassesProvider>
 */
export function useTeacherClassesContext(): TeacherClassesContextType {
  const context = useContext(TeacherClassesContext);
  if (!context) {
    throw new Error("useTeacherClassesContext phải được sử dụng bên trong TeacherClassesProvider");
  }
  return context;
}
