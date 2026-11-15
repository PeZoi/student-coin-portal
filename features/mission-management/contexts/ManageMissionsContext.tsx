"use client";

import { createContext, useContext, ReactNode } from "react";
import { TeacherMissionItem } from "../types";
import { useManageMissions } from "../hooks/useManageMissions";

export type ManageMissionsContextType = ReturnType<typeof useManageMissions>;

const ManageMissionsContext = createContext<ManageMissionsContextType | null>(
  null
);

interface ManageMissionsProviderProps {
  children: ReactNode;
  initialMissions?: TeacherMissionItem[];
  userRole?: string;
}

export function ManageMissionsProvider({
  children,
  initialMissions,
  userRole,
}: ManageMissionsProviderProps) {
  const value = useManageMissions(initialMissions, userRole);

  return (
    <ManageMissionsContext.Provider value={value}>
      {children}
    </ManageMissionsContext.Provider>
  );
}

export function useManageMissionsContext(): ManageMissionsContextType {
  const context = useContext(ManageMissionsContext);
  if (!context) {
    throw new Error(
      "useManageMissionsContext phải được gọi bên trong ManageMissionsProvider"
    );
  }
  return context;
}
