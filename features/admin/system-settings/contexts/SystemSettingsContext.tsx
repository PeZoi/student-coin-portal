"use client";

import { createContext, ReactNode, useContext } from "react";
import { SystemSettingsPayload } from "../types";
import { useSystemSettings } from "../hooks/useSystemSettings";

export type SystemSettingsContextType = ReturnType<typeof useSystemSettings>;

const SystemSettingsContext = createContext<SystemSettingsContextType | null>(
  null
);

interface SystemSettingsProviderProps {
  children: ReactNode;
  initialData?: SystemSettingsPayload;
}

export function SystemSettingsProvider({
  children,
  initialData,
}: SystemSettingsProviderProps) {
  const value = useSystemSettings(initialData);

  return (
    <SystemSettingsContext.Provider value={value}>
      {children}
    </SystemSettingsContext.Provider>
  );
}

export function useSystemSettingsContext(): SystemSettingsContextType {
  const context = useContext(SystemSettingsContext);
  if (!context) {
    throw new Error(
      "useSystemSettingsContext phải được gọi bên trong SystemSettingsProvider"
    );
  }
  return context;
}
