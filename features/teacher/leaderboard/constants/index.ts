import {
  ComputedLeaderboardData,
  LeaderboardMonthOption,
  TeacherLeaderboardApiPayload,
} from "../types";

/**
 * Định dạng mã tháng chuẩn "YYYY-MM"
 */
export function formatMonthKey(month: number, year: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

/**
 * Phân tích mã tháng "YYYY-MM" về { month, year }
 */
export function parseMonthKey(
  monthKey: string
): { month: number; year: number } | null {
  const match = /^(\d{4})-(\d{2})$/.exec(monthKey.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (month < 1 || month > 12 || year < 2020 || year > 2100) return null;
  return { month, year };
}

/**
 * Tạo danh sách 6 tháng gần nhất tính từ tháng hiện tại (theo giờ Việt Nam)
 */
export function buildRecentMonthOptions(
  currentMonth: number,
  currentYear: number,
  count: number = 6
): LeaderboardMonthOption[] {
  const options: LeaderboardMonthOption[] = [];
  let m = currentMonth;
  let y = currentYear;

  for (let i = 0; i < count; i++) {
    const padded = String(m).padStart(2, "0");
    options.push({
      monthKey: formatMonthKey(m, y),
      month: m,
      year: y,
      label:
        i === 0 ? `Tháng ${padded}/${y} (Hiện tại)` : `Tháng ${padded}/${y}`,
    });
    m -= 1;
    if (m === 0) {
      m = 12;
      y -= 1;
    }
  }

  return options;
}

export const EMPTY_COMPUTED_LEADERBOARD: ComputedLeaderboardData = {
  hasPreviousMonthData: false,
  totalStudents: 0,
  totalEarnedCoins: 0,
  improvedStudentsCount: 0,
  leadersGroupCount: 0,
  risersGroupCount: 0,
  topCoinsBoard: [],
  progressLeadersBoard: [],
  progressRisersBoard: [],
};

export function createEmptyLeaderboardPayload(
  classId: string,
  month: number,
  year: number,
  availableMonths: LeaderboardMonthOption[]
): TeacherLeaderboardApiPayload {
  const padded = String(month).padStart(2, "0");
  return {
    classId,
    monthKey: formatMonthKey(month, year),
    month,
    year,
    monthLabel: `Tháng ${padded}/${year}`,
    previousMonthLabel: null,
    isClosed: false,
    closedAt: null,
    availableMonths,
    computed: EMPTY_COMPUTED_LEADERBOARD,
  };
}
