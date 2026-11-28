export type PeriodType = "current_month" | "previous_month";

export type StudentLeaderboardBoardId =
  | "top_coins"
  | "progress_leaders"
  | "progress_risers";

export interface StudentClassOption {
  id: string;
  label: string;
}

export interface TopCoinStudent {
  id: string;
  rank: number;
  name: string;
  avatarId: string;
  coins: number;
  prevMonthCoins: number | null;
  deltaCoins: number | null;
  completedMissionsCount: number;
  totalMissionsCount: number;
  bonusCoins?: number;
  isCurrentUser?: boolean;
  classGroup: string;
}

export interface TopProgressStudent {
  id: string;
  rank: number;
  group: "leaders" | "risers";
  name: string;
  avatarId: string;
  prevMonthRank: number;
  prevMonthCoins: number;
  currentMonthCoins: number;
  deltaCoins: number;
  completedMissionsCount: number;
  totalMissionsCount: number;
  isImproved: boolean;
  isNewStudent?: boolean;
  bonusCoins?: number;
  isCurrentUser?: boolean;
  classGroup: string;
}

export interface StudentLeaderboardPayload {
  period: PeriodType;
  periodLabel: string;
  month: number;
  year: number;
  previousMonthLabel: string | null;
  hasPreviousMonthData: boolean;
  isClosed: boolean;
  cutoffTime: string;
  footerNote: string;
  /** True khi là ADMIN / SUPER_TEACHER / TEACHER -> hiện dropdown chọn lớp & badge lớp */
  canSelectClass: boolean;
  selectedClassId: string;
  selectedClassLabel: string;
  availableClasses: StudentClassOption[];
  topCoins: TopCoinStudent[];
  progressLeaders: TopProgressStudent[];
  progressRisers: TopProgressStudent[];
  rewardConfig: {
    top1BonusCoins: number;
    top2BonusCoins: number;
    top3BonusCoins: number;
  };
}
