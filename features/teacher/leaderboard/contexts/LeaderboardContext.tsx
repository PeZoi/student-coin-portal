"use client";

import { createContext, useContext, ReactNode } from "react";
import {
  useTeacherLeaderboard,
  UseTeacherLeaderboardReturn,
} from "../hooks/useTeacherLeaderboard";

const LeaderboardContext = createContext<UseTeacherLeaderboardReturn | null>(
  null
);

export function LeaderboardProvider({ children }: { children: ReactNode }) {
  const value = useTeacherLeaderboard();
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
