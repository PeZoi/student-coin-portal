"use client";

import { createContext, useContext, ReactNode } from "react";
import {
  useManageSubmissions,
  UseManageSubmissionsParams,
} from "../hooks/useManageSubmissions";

export type ManageSubmissionsContextType = ReturnType<
  typeof useManageSubmissions
>;

const ManageSubmissionsContext =
  createContext<ManageSubmissionsContextType | null>(null);

interface ManageSubmissionsProviderProps extends UseManageSubmissionsParams {
  children: ReactNode;
}

export function ManageSubmissionsProvider({
  children,
  ...params
}: ManageSubmissionsProviderProps) {
  const value = useManageSubmissions(params);

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
