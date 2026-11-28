/**
 * ==============================================================================
 * TYPES: TEACHER LEADERBOARD (3 BẢNG XẾP HẠNG THI ĐUA)
 * ==============================================================================
 */

export type LeaderboardBoardId =
  | "top_coins"
  | "progress_leaders"
  | "progress_risers";

export interface RawStudentMonthPerformance {
  studentId: string;
  fullName: string;
  avatarUrl: string;
  className: string;
  currentMonthCoins: number;
  prevMonthCoins: number;
  completedMissionsCount: number;
  totalMissionsCount: number;
}

export interface MonthlyLeaderboardDataset {
  monthKey: string;
  label: string;
  hasPreviousMonthData: boolean;
  previousMonthLabel: string | null;
  students: RawStudentMonthPerformance[];
}

export interface TopCoinsRankEntry {
  rank: number;
  studentId: string;
  fullName: string;
  avatarUrl: string;
  className: string;
  currentMonthCoins: number;
  prevMonthCoins: number | null;
  deltaCoins: number | null;
  completedMissionsCount: number;
  totalMissionsCount: number;
}

export interface ProgressRankEntry {
  rank: number;
  group: "leaders" | "risers";
  studentId: string;
  fullName: string;
  avatarUrl: string;
  className: string;
  prevMonthRank: number;
  prevMonthCoins: number;
  currentMonthCoins: number;
  deltaCoins: number;
  completedMissionsCount: number;
  totalMissionsCount: number;
  isImproved: boolean;
}

export interface ComputedLeaderboardData {
  hasPreviousMonthData: boolean;
  totalStudents: number;
  totalEarnedCoins: number;
  improvedStudentsCount: number;
  leadersGroupCount: number;
  risersGroupCount: number;
  topCoinsBoard: TopCoinsRankEntry[];
  progressLeadersBoard: ProgressRankEntry[];
  progressRisersBoard: ProgressRankEntry[];
}
