"use client";

import { createContext, useContext, ReactNode } from "react";
import { AuthSecurityConfig } from "@/types/systemConfig";
import { useStudentRoster } from "../hooks/useStudentRoster";
import { TeacherRosterStudent } from "../types";

export type StudentRosterContextType = ReturnType<typeof useStudentRoster>;

const StudentRosterContext = createContext<StudentRosterContextType | null>(null);

interface StudentRosterProviderProps {
  children: ReactNode;
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
 * Feature Provider cho module Danh sách & Hồ sơ học sinh theo lớp
 * - Tuân thủ Quy tắc 10 AGENTS.md: Feature Context Pattern
 * - Loại bỏ hoàn toàn Prop Drilling qua các tầng component con
 */
export function StudentRosterProvider({
  children,
  initialStudents,
  initialClasses,
  initialClassId,
  userRole,
  authSecurity,
}: StudentRosterProviderProps) {
  const value = useStudentRoster({
    initialStudents,
    initialClasses,
    initialClassId,
    userRole,
    authSecurity,
  });

  return (
    <StudentRosterContext.Provider value={value}>
      {children}
    </StudentRosterContext.Provider>
  );
}

/**
 * Hook truy xuất StudentRosterContext
 * - Bắt buộc phải được sử dụng bên trong <StudentRosterProvider>
 */
export function useStudentRosterContext(): StudentRosterContextType {
  const context = useContext(StudentRosterContext);
  if (!context) {
    throw new Error(
      "useStudentRosterContext phải được gọi bên trong StudentRosterProvider"
    );
  }
  return context;
}

/**
 * Hook truy xuất an toàn (dành cho standalone components có thể dùng ngoài Provider)
 */
export function useOptionalStudentRosterContext(): StudentRosterContextType | null {
  return useContext(StudentRosterContext);
}
