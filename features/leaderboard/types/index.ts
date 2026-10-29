export type PeriodType = "current_month" | "previous_month";

export interface TopCoinStudent {
  id: string;
  rank: number;
  name: string;
  avatarId: string;
  coins: number;
  bonusCoins?: number;
  isCurrentUser?: boolean;
  classGroup: string;
}

export interface TopProgressStudent {
  id: string;
  rank: number;
  name: string;
  avatarId: string;
  increasePercent: number;
  bonusPoints?: number;
  isCurrentUser?: boolean;
  classGroup: string;
}

export interface MonthlyLeaderboardData {
  period: PeriodType;
  periodLabel: string;
  topCoins: TopCoinStudent[];
  topProgress: TopProgressStudent[];
  footerNote: string;
}

