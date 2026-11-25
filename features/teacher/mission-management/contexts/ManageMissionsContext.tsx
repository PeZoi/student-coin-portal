"use client";

import { createContext, useContext, ReactNode } from "react";
import { TeacherMissionItem, MissionAvailableClass } from "../types";
import { useManageMissions } from "../hooks/useManageMissions";

export type ManageMissionsContextType = ReturnType<typeof useManageMissions>;

const ManageMissionsContext = createContext<ManageMissionsContextType | null>(
  null
);

interface ManageMissionsProviderProps {
  children: ReactNode;
  initialMissions?: TeacherMissionItem[];
  initialClasses?: MissionAvailableClass[];
  userRole?: string;
  initialClassId?: string;
}

export function ManageMissionsProvider({
  children,
  initialMissions,
  initialClasses,
  userRole,
  initialClassId,
}: ManageMissionsProviderProps) {
  const value = useManageMissions(
    initialMissions,
    initialClasses,
    userRole,
    initialClassId
  );

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
