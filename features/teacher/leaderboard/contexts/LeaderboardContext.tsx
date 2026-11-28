"use client";

import { createContext, useContext, ReactNode } from "react";
import {
  useTeacherLeaderboard,
  UseTeacherLeaderboardReturn,
} from "../hooks/useTeacherLeaderboard";
import { TeacherLeaderboardApiPayload } from "../types";

const LeaderboardContext = createContext<UseTeacherLeaderboardReturn | null>(
  null
);

interface LeaderboardProviderProps {
  children: ReactNode;
  initialData?: TeacherLeaderboardApiPayload;
  initialClassId?: string;
}

export function LeaderboardProvider({
  children,
  initialData,
  initialClassId,
}: LeaderboardProviderProps) {
  const value = useTeacherLeaderboard({ initialData, initialClassId });
  return (
    <LeaderboardContext.Provider value={value}>
      {children}
    </LeaderboardContext.Provider>
  );
}

export function useLeaderboardContext(): UseTeacherLeaderboardReturn {
  const ctx = useContext(LeaderboardContext);
  if (!ctx) {
    throw new Error(
      "useLeaderboardContext phải được gọi bên trong LeaderboardProvider"
    );
  }
  return ctx;
}
