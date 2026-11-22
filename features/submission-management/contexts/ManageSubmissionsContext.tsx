"use client";

import { createContext, useContext, ReactNode } from "react";
import {
  TeacherGradingSubmissionItem,
  MissionDetailViewMode,
} from "../types";
import { useManageSubmissions } from "../hooks/useManageSubmissions";

export type ManageSubmissionsContextType = ReturnType<
  typeof useManageSubmissions
>;

const ManageSubmissionsContext =
  createContext<ManageSubmissionsContextType | null>(null);

interface ManageSubmissionsProviderProps {
  children: ReactNode;
  initialSubmissions?: TeacherGradingSubmissionItem[];
  initialMissionId?: string;
  initialViewMode?: MissionDetailViewMode;
}

export function ManageSubmissionsProvider({
  children,
  initialSubmissions,
  initialMissionId,
  initialViewMode,
}: ManageSubmissionsProviderProps) {
  const value = useManageSubmissions(
    initialSubmissions,
    initialMissionId,
    initialViewMode
  );

  return (
    <ManageSubmissionsContext.Provider value={value}>
      {children}
    </ManageSubmissionsContext.Provider>
  );
}

export function useManageSubmissionsContext(): ManageSubmissionsContextType {
  const context = useContext(ManageSubmissionsContext);
  if (!context) {
    throw new Error(
      "useManageSubmissionsContext phải được sử dụng bên trong <ManageSubmissionsProvider />"
    );
  }
  return context;
}
