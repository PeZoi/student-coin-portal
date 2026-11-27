"use client";

import { createContext, useContext, ReactNode } from "react";
import { useAuditLogs, UseAuditLogsReturn } from "../hooks/useAuditLogs";
import { AuditLogsPagePayload } from "../types";

const AuditLogsContext = createContext<UseAuditLogsReturn | null>(null);

interface AuditLogsProviderProps {
  children: ReactNode;
  initialData?: AuditLogsPagePayload;
}

export function AuditLogsProvider({
  children,
  initialData,
}: AuditLogsProviderProps) {
  const value = useAuditLogs(initialData);
  return (
    <AuditLogsContext.Provider value={value}>
      {children}
    </AuditLogsContext.Provider>
  );
}

export function useAuditLogsContext(): UseAuditLogsReturn {
  const ctx = useContext(AuditLogsContext);
  if (!ctx) {
    throw new Error(
      "useAuditLogsContext phải được gọi bên trong AuditLogsProvider"
    );
  }
  return ctx;
}
