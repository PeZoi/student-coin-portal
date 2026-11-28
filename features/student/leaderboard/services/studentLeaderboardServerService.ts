import { supabase } from "@/lib/supabase/db";
import { AuthTokenPayload } from "@/lib/auth/jwt";
import { getCurrentVietnamMonthYear } from "@/lib/date";
import { getSystemSetting } from "@/lib/system/serverConfig";
import { UserRole } from "@/constants/auth";
import { StudentMissionStatus } from "@/constants";
import { MonthlyRewardSettingConfig } from "@/types/systemConfig";
import { getMyAssignedClassesServer } from "@/features/teacher/class-management/services/classServerService";
import { computeThreeLeaderboards } from "@/features/teacher/leaderboard/utils/rankingCalculator";
import { formatMonthKey } from "@/features/teacher/leaderboard/constants";
import {
  MonthlyLeaderboardDataset,
  RawStudentMonthPerformance,
} from "@/features/teacher/leaderboard/types";
import {
  PeriodType,
  StudentClassOption,
  StudentLeaderboardPayload,
  TopCoinStudent,
  TopProgressStudent,
} from "../types";

export interface GetStudentLeaderboardServerOptions {
  period?: PeriodType;
  /** Chỉ có tác dụng khi session.role === ADMIN */
  classId?: string | null;
}

interface StudentRow {
  id: string;
  full_name: string;
  avatar_url: string | null;
  class_id: string | null;
  created_at: string | null;
}

interface LeaderboardViewRow {
  student_id: string;
  month: number;
  year: number;
  missions_coins?: number;
  bonus_coins?: number;
  wheel_coins?: number;
  monthly_coins_earned: number;
  completed_missions_count: number;
}

interface StudentMissionRow {
  student_id: string;
  status: string;
}

interface LeaderboardSnapshotRow {
  student_id: string;
  class_id: string;
  monthly_earned_coins: number;
  rank_coins: number | null;
  bonus_rank_coins: number;
  delta_coins: number;
  progress_group: "leaders" | "risers" | null;
  rank_progress: number | null;
  bonus_progress_coins: number;
  prev_month_coins: number;
  prev_month_rank: number | null;
  completed_missions_count: number;
  total_missions_count: number;
  closed_at: string | null;
}

const DEFAULT_REWARD_CONFIG = {
  top1BonusCoins: 150,
  top2BonusCoins: 100,
  top3BonusCoins: 50,
};

function getMonthStartVietnamISO(month: number, year: number): string {
  const utcMillis =
    Date.UTC(year, month - 1, 1, 0, 0, 0, 0) - 7 * 60 * 60 * 1000;
  return new Date(utcMillis).toISOString();
}

function getPreviousMonthYear(
  month: number,
  year: number
): { month: number; year: number } {
  if (month === 1) return { month: 12, year: year - 1 };
  return { month: month - 1, year };
}

function getNextMonthYear(
  month: number,
  year: number
): { month: number; year: number } {
  if (month === 12) return { month: 1, year: year + 1 };
  return { month: month + 1, year };
}

function formatCutoffTime(month: number, year: number): string {
  const lastDay = new Date(year, month, 0).getDate();
  const dd = String(lastDay).padStart(2, "0");
  const mm = String(month).padStart(2, "0");
  return `23:59 ngày ${dd}/${mm}/${year}`;
}

function resolveRankBonus(
  rank: number,
  rewardConfig: {
    top1BonusCoins: number;
    top2BonusCoins: number;
    top3BonusCoins: number;
  }
): number | undefined {
  if (rank === 1 && rewardConfig.top1BonusCoins > 0) {
    return rewardConfig.top1BonusCoins;
  }
  if (rank === 2 && rewardConfig.top2BonusCoins > 0) {
    return rewardConfig.top2BonusCoins;
  }
  if (rank === 3 && rewardConfig.top3BonusCoins > 0) {
    return rewardConfig.top3BonusCoins;
  }
  return undefined;
}

function buildEmptyStudentPayload(params: {
  period: PeriodType;
  targetMonth: number;
  targetYear: number;
  canSelectClass: boolean;
  selectedClassId: string;
  selectedClassLabel: string;
  availableClasses: StudentClassOption[];
  rewardConfig: typeof DEFAULT_REWARD_CONFIG;
}): StudentLeaderboardPayload {
  const {
    period,
    targetMonth,
    targetYear,
    canSelectClass,
    selectedClassId,
    selectedClassLabel,
    availableClasses,
    rewardConfig,
  } = params;
  const paddedMonth = String(targetMonth).padStart(2, "0");
  const cutoffTime = formatCutoffTime(targetMonth, targetYear);
  const isClosed = period === "previous_month";

  return {
    period,
    periodLabel:
      period === "current_month"
        ? `Tháng ${paddedMonth}/${targetYear}`
        : `Tháng ${paddedMonth}/${targetYear}`,
    month: targetMonth,
    year: targetYear,
    previousMonthLabel: null,
    hasPreviousMonthData: false,
    isClosed,
    cutoffTime,
    footerNote: isClosed
      ? `Kỳ xếp hạng tháng ${paddedMonth}/${targetYear} đã kết thúc lúc ${cutoffTime}.`
      : `BXH sẽ chốt top vào lúc ${cutoffTime}!`,
    canSelectClass,
    selectedClassId,
    selectedClassLabel,
    availableClasses,
    topCoins: [],
    progressLeaders: [],
    progressRisers: [],
    rewardConfig,
  };
}

/**
 * Server Service: Nạp dữ liệu 3 Bảng xếp hạng thi đua cho Cổng Học Sinh
 * - Học sinh: Luôn xem đúng lớp mình đang theo học (`users.class_id`), không thể đổi lớp.
 * - Admin: Được cấp danh sách lớp và chọn lớp bất kỳ để test UI.
 * - Tái sử dụng 100% tiêu chí tính xu học tập (`missions_coins + bonus_coins`, loại trừ `wheel_coins`)
 *   và thuật toán chia 3 bảng xếp hạng từ `computeThreeLeaderboards`.
 */
export async function getStudentLeaderboardServer(
  session: AuthTokenPayload,
  options?: GetStudentLeaderboardServerOptions
): Promise<StudentLeaderboardPayload> {
  const period: PeriodType =
    options?.period === "previous_month" ? "previous_month" : "current_month";
  const currentVN = getCurrentVietnamMonthYear();
  const target =
    period === "previous_month"
      ? getPreviousMonthYear(currentVN.month, currentVN.year)
      : currentVN;

  const targetMonth = target.month;
  const targetYear = target.year;
  const prev = getPreviousMonthYear(targetMonth, targetYear);
  const next = getNextMonthYear(targetMonth, targetYear);
  const paddedMonth = String(targetMonth).padStart(2, "0");
  const paddedPrevMonth = String(prev.month).padStart(2, "0");
  const previousMonthLabel = `Tháng ${paddedPrevMonth}/${prev.year}`;
  const cutoffTime = formatCutoffTime(targetMonth, targetYear);

  const isHighPrivilege =
    session.role === UserRole.ADMIN ||
    session.role === UserRole.SUPER_TEACHER;
  const canSelectClass =
    isHighPrivilege || session.role === UserRole.TEACHER;

  // Đọc cấu hình mức thưởng Top 1/2/3 từ RAM cache server (0ms)
  const rawRewardSetting = await getSystemSetting<
    Partial<MonthlyRewardSettingConfig>
  >("monthly_reward_setting");
  const rewardConfig = {
    top1BonusCoins:
      typeof rawRewardSetting?.top1_bonus_coins === "number"
        ? rawRewardSetting.top1_bonus_coins
        : DEFAULT_REWARD_CONFIG.top1BonusCoins,
    top2BonusCoins:
      typeof rawRewardSetting?.top2_bonus_coins === "number"
        ? rawRewardSetting.top2_bonus_coins
        : DEFAULT_REWARD_CONFIG.top2BonusCoins,
    top3BonusCoins:
      typeof rawRewardSetting?.top3_bonus_coins === "number"
        ? rawRewardSetting.top3_bonus_coins
        : DEFAULT_REWARD_CONFIG.top3BonusCoins,
  };

  let availableClasses: StudentClassOption[] = [];
  let targetClassId = "";
  let selectedClassLabel = "Lớp của bạn";

  try {
    // 1. Xác định phạm vi lớp theo đúng quyền của tài khoản đang đăng nhập
    if (isHighPrivilege) {
      const { data: classesData } = await supabase
        .from("classes")
        .select("id, class_name")
        .eq("is_deleted", false)
        .order("class_name", { ascending: true });

      const classList = (classesData ?? []) as {
        id: string;
        class_name: string;
      }[];

      availableClasses = [
        { id: "all", label: "Tất cả các lớp" },
        ...classList.map((c) => ({ id: c.id, label: c.class_name })),
      ];

      const requested = options?.classId?.trim();
      if (
        requested === "all" ||
        (requested && classList.some((c) => c.id === requested))
      ) {
        targetClassId = requested;
      } else if (classList.length > 0) {
        targetClassId = classList[0].id;
      } else {
        targetClassId = "all";
      }

      selectedClassLabel =
        availableClasses.find((c) => c.id === targetClassId)?.label ??
        "Tất cả các lớp";
    } else if (session.role === UserRole.TEACHER) {
      const assignedClasses = await getMyAssignedClassesServer(session);
      if (assignedClasses.length === 0) {
        return buildEmptyStudentPayload({
          period,
          targetMonth,
          targetYear,
          canSelectClass: true,
          selectedClassId: "",
          selectedClassLabel: "Chưa có lớp",
          availableClasses: [],
          rewardConfig,
        });
      }

      availableClasses = assignedClasses.map((c) => ({
        id: c.id,
        label: c.class_name,
      }));

      const requested = options?.classId?.trim();
      if (requested && assignedClasses.some((c) => c.id === requested)) {
        targetClassId = requested;
      } else {
        targetClassId = assignedClasses[0].id;
      }

      selectedClassLabel =
        availableClasses.find((c) => c.id === targetClassId)?.label ??
        assignedClasses[0].class_name;
    } else {
      // Học sinh: chỉ xem đúng lớp của mình, ẩn select lớp và badge lớp
      const { data: studentUser } = await supabase
        .from("users")
        .select("class_id")
        .eq("id", session.userId)
        .maybeSingle();

      const studentClassId = (studentUser as { class_id: string | null } | null)
        ?.class_id;

      if (!studentClassId) {
        return buildEmptyStudentPayload({
          period,
          targetMonth,
          targetYear,
          canSelectClass: false,
          selectedClassId: "",
          selectedClassLabel: "Chưa xếp lớp",
          availableClasses: [],
          rewardConfig,
        });
      }

      targetClassId = studentClassId;

      const { data: classInfo } = await supabase
        .from("classes")
        .select("class_name")
        .eq("id", studentClassId)
        .maybeSingle();

      selectedClassLabel =
        (classInfo as { class_name: string } | null)?.class_name ||
        "Lớp của bạn";
    }

    // 2. Ưu tiên đọc Snapshot bất biến nếu lớp & tháng này đã được chốt sổ trong `monthly_leaderboard`
    if (targetClassId && targetClassId !== "all") {
      const { data: snapshotRows, error: snapshotError } = await supabase
        .from("monthly_leaderboard")
        .select(
          "student_id, class_id, monthly_earned_coins, rank_coins, bonus_rank_coins, delta_coins, progress_group, rank_progress, bonus_progress_coins, prev_month_coins, prev_month_rank, completed_missions_count, total_missions_count, closed_at"
        )
        .eq("month", targetMonth)
        .eq("year", targetYear)
        .eq("class_id", targetClassId);

      if (!snapshotError && snapshotRows && snapshotRows.length > 0) {
        const rows = snapshotRows as LeaderboardSnapshotRow[];
        const studentIds = Array.from(new Set(rows.map((r) => r.student_id)));

        const { data: usersData } = await supabase
          .from("users")
          .select("id, full_name, avatar_url")
          .in("id", studentIds);

        const userMap = new Map<
          string,
          { full_name: string; avatar_url: string | null }
        >();
        for (const u of (usersData ?? []) as {
          id: string;
          full_name: string;
          avatar_url: string | null;
        }[]) {
          userMap.set(u.id, {
            full_name: u.full_name,
            avatar_url: u.avatar_url,
          });
        }

        const hasPreviousMonthData = rows.some(
          (r) => r.progress_group !== null
        );

        const sortedCoins = [...rows].sort((a, b) => {
          const rankA = a.rank_coins ?? Number.MAX_SAFE_INTEGER;
          const rankB = b.rank_coins ?? Number.MAX_SAFE_INTEGER;
          if (rankA !== rankB) return rankA - rankB;
          return b.monthly_earned_coins - a.monthly_earned_coins;
        });

        const topCoins: TopCoinStudent[] = sortedCoins.map((r, idx) => {
          const rank = r.rank_coins ?? idx + 1;
          const user = userMap.get(r.student_id);
          const bonus =
            r.bonus_rank_coins > 0
              ? r.bonus_rank_coins
              : r.monthly_earned_coins > 0
                ? resolveRankBonus(rank, rewardConfig)
                : undefined;

          return {
            id: r.student_id,
            rank,
            name: user?.full_name || "Học sinh",
            avatarId: user?.avatar_url || "/avatar-chibi/male-1.webp",
            coins: r.monthly_earned_coins,
            prevMonthCoins: hasPreviousMonthData ? r.prev_month_coins : null,
            deltaCoins: hasPreviousMonthData ? r.delta_coins : null,
            completedMissionsCount: r.completed_missions_count,
            totalMissionsCount: r.total_missions_count,
            bonusCoins: bonus,
            isCurrentUser: r.student_id === session.userId,
            classGroup: selectedClassLabel,
          };
        });

        const mapProgressRow = (
          r: LeaderboardSnapshotRow,
          idx: number,
          group: "leaders" | "risers"
        ): TopProgressStudent => {
          const rank = r.rank_progress ?? idx + 1;
          const user = userMap.get(r.student_id);
          const isNewStudent = r.prev_month_rank === 0 || r.prev_month_rank === null;
          const isImproved = !isNewStudent && r.delta_coins > 0;
          const bonus =
            r.bonus_progress_coins > 0
              ? r.bonus_progress_coins
              : isImproved
                ? resolveRankBonus(rank, rewardConfig)
                : undefined;

          return {
            id: r.student_id,
            rank,
            group,
            name: user?.full_name || "Học sinh",
            avatarId: user?.avatar_url || "/avatar-chibi/male-1.webp",
            prevMonthRank: r.prev_month_rank ?? 0,
            prevMonthCoins: r.prev_month_coins,
            currentMonthCoins: r.monthly_earned_coins,
            deltaCoins: r.delta_coins,
            completedMissionsCount: r.completed_missions_count,
            totalMissionsCount: r.total_missions_count,
            isImproved,
            isNewStudent,
            bonusCoins: bonus,
            isCurrentUser: r.student_id === session.userId,
            classGroup: selectedClassLabel,
          };
        };

        const progressLeaders = rows
          .filter((r) => r.progress_group === "leaders")
          .sort((a, b) => (a.rank_progress ?? 999) - (b.rank_progress ?? 999))
          .map((r, idx) => mapProgressRow(r, idx, "leaders"));

        const progressRisers = rows
          .filter((r) => r.progress_group === "risers")
          .sort((a, b) => (a.rank_progress ?? 999) - (b.rank_progress ?? 999))
          .map((r, idx) => mapProgressRow(r, idx, "risers"));

        return {
          period,
          periodLabel: `Tháng ${paddedMonth}/${targetYear}`,
          month: targetMonth,
          year: targetYear,
          previousMonthLabel: hasPreviousMonthData ? previousMonthLabel : null,
          hasPreviousMonthData,
          isClosed: true,
          cutoffTime,
          footerNote: `Đã chốt top vào lúc ${cutoffTime}. Thưởng xu đã được tổng kết cho các bạn xuất sắc!`,
          canSelectClass,
          selectedClassId: targetClassId,
          selectedClassLabel,
          availableClasses,
          topCoins,
          progressLeaders,
          progressRisers,
          rewardConfig,
        };
      }
    }

    // 3. Nếu chưa chốt sổ: đọc real-time từ View `v_student_monthly_leaderboard`
    const currMonthStartISO = getMonthStartVietnamISO(targetMonth, targetYear);
    const nextMonthStartISO = getMonthStartVietnamISO(next.month, next.year);

    let studentsQuery = supabase
      .from("users")
      .select("id, full_name, avatar_url, class_id, created_at")
      .eq("role", UserRole.STUDENT)
      .eq("is_deleted", false)
      .eq("is_active", true)
      .lt("created_at", nextMonthStartISO);

    if (targetClassId && targetClassId !== "all") {
      studentsQuery = studentsQuery.eq("class_id", targetClassId);
    }

    const { data: studentsData, error: studentsError } = await studentsQuery;

    if (studentsError || !studentsData || studentsData.length === 0) {
      return buildEmptyStudentPayload({
        period,
        targetMonth,
        targetYear,
        canSelectClass,
        selectedClassId: targetClassId,
        selectedClassLabel,
        availableClasses,
        rewardConfig,
      });
    }

    const students = studentsData as StudentRow[];
    const studentIds = students.map((s) => s.id);
    const uniqueClassIds = Array.from(
      new Set(
        students
          .map((s) => s.class_id)
          .filter((id): id is string => Boolean(id))
      )
    );

    const [currViewRes, prevViewRes, missionsRes, classesRes] =
      await Promise.all([
        supabase
          .from("v_student_monthly_leaderboard")
          .select(
            "student_id, month, year, missions_coins, bonus_coins, wheel_coins, monthly_coins_earned, completed_missions_count"
          )
          .eq("month", targetMonth)
          .eq("year", targetYear)
          .in("student_id", studentIds),

        supabase
          .from("v_student_monthly_leaderboard")
          .select(
            "student_id, month, year, missions_coins, bonus_coins, wheel_coins, monthly_coins_earned, completed_missions_count"
          )
          .eq("month", prev.month)
          .eq("year", prev.year)
          .in("student_id", studentIds),

        supabase
          .from("student_missions")
          .select("student_id, status")
          .in("student_id", studentIds)
          .gte("assigned_at", currMonthStartISO)
          .lt("assigned_at", nextMonthStartISO),

        uniqueClassIds.length > 0
          ? supabase
            .from("classes")
            .select("id, class_name")
            .in("id", uniqueClassIds)
          : Promise.resolve({
            data: [] as { id: string; class_name: string }[],
          }),
      ]);

    const classNameMap = new Map<string, string>();
    for (const c of (classesRes.data ?? []) as {
      id: string;
      class_name: string;
    }[]) {
      classNameMap.set(c.id, c.class_name);
    }

    // Chỉ tính xu học tập = missions_coins + bonus_coins (loại trừ wheel_coins may rủi)
    const currCoinsMap = new Map<string, number>();
    const currCompletedFromViewMap = new Map<string, number>();
    for (const row of (currViewRes.data ?? []) as LeaderboardViewRow[]) {
      const academicCoins =
        (Number(row.missions_coins) || 0) + (Number(row.bonus_coins) || 0);
      currCoinsMap.set(row.student_id, academicCoins);
      currCompletedFromViewMap.set(
        row.student_id,
        Number(row.completed_missions_count) || 0
      );
    }

    const prevCoinsMap = new Map<string, number>();
    let totalPrevMonthCoins = 0;
    for (const row of (prevViewRes.data ?? []) as LeaderboardViewRow[]) {
      const prevAcademicCoins =
        (Number(row.missions_coins) || 0) + (Number(row.bonus_coins) || 0);
      prevCoinsMap.set(row.student_id, prevAcademicCoins);
      totalPrevMonthCoins += prevAcademicCoins;
    }

    const missionStatsMap = new Map<
      string,
      { total: number; completed: number }
    >();
    for (const row of (missionsRes.data ?? []) as StudentMissionRow[]) {
      const stat = missionStatsMap.get(row.student_id) ?? {
        total: 0,
        completed: 0,
      };
      stat.total += 1;
      if (row.status === StudentMissionStatus.APPROVED) {
        stat.completed += 1;
      }
      missionStatsMap.set(row.student_id, stat);
    }

    const currMonthStartMs = new Date(currMonthStartISO).getTime();
    const hasPreviousMonthData = totalPrevMonthCoins > 0;
    const rawPerformances: RawStudentMonthPerformance[] = students.map((s) => {
      const mStat = missionStatsMap.get(s.id) ?? { total: 0, completed: 0 };
      const completedFromView = currCompletedFromViewMap.get(s.id) ?? 0;
      const completedCount =
        mStat.total > 0
          ? Math.max(mStat.completed, completedFromView)
          : completedFromView;
      const isNewStudent = Boolean(
        s.created_at && new Date(s.created_at).getTime() >= currMonthStartMs
      );

      return {
        studentId: s.id,
        fullName: s.full_name,
        avatarUrl: s.avatar_url || "/avatar-chibi/male-1.webp",
        className:
          (s.class_id ? classNameMap.get(s.class_id) : undefined) || "Lớp học",
        currentMonthCoins: currCoinsMap.get(s.id) ?? 0,
        prevMonthCoins: prevCoinsMap.get(s.id) ?? 0,
        completedMissionsCount: completedCount,
        totalMissionsCount: Math.max(mStat.total, completedCount),
        isNewStudent,
      };
    });

    const dataset: MonthlyLeaderboardDataset = {
      monthKey: formatMonthKey(targetMonth, targetYear),
      label: `Tháng ${paddedMonth}/${targetYear}`,
      hasPreviousMonthData,
      previousMonthLabel: hasPreviousMonthData ? previousMonthLabel : null,
      students: rawPerformances,
    };

    const computed = computeThreeLeaderboards(dataset);

    const topCoins: TopCoinStudent[] = computed.topCoinsBoard.map((item) => ({
      id: item.studentId,
      rank: item.rank,
      name: item.fullName,
      avatarId: item.avatarUrl,
      coins: item.currentMonthCoins,
      prevMonthCoins: item.prevMonthCoins,
      deltaCoins: item.deltaCoins,
      completedMissionsCount: item.completedMissionsCount,
      totalMissionsCount: item.totalMissionsCount,
      bonusCoins:
        item.currentMonthCoins > 0
          ? resolveRankBonus(item.rank, rewardConfig)
          : undefined,
      isCurrentUser: item.studentId === session.userId,
      classGroup: item.className,
    }));

    const mapComputedProgress = (
      item: (typeof computed.progressLeadersBoard)[number]
    ): TopProgressStudent => ({
      id: item.studentId,
      rank: item.rank,
      group: item.group,
      name: item.fullName,
      avatarId: item.avatarUrl,
      prevMonthRank: item.prevMonthRank,
      prevMonthCoins: item.prevMonthCoins,
      currentMonthCoins: item.currentMonthCoins,
      deltaCoins: item.deltaCoins,
      completedMissionsCount: item.completedMissionsCount,
      totalMissionsCount: item.totalMissionsCount,
      isImproved: item.isImproved,
      isNewStudent: item.isNewStudent,
      bonusCoins:
        item.isImproved && !item.isNewStudent
          ? resolveRankBonus(item.rank, rewardConfig)
          : undefined,
      isCurrentUser: item.studentId === session.userId,
      classGroup: item.className,
    });

    const isClosed = period === "previous_month";

    return {
      period,
      periodLabel: `Tháng ${paddedMonth}/${targetYear}`,
      month: targetMonth,
      year: targetYear,
      previousMonthLabel: computed.hasPreviousMonthData
        ? previousMonthLabel
        : null,
      hasPreviousMonthData: computed.hasPreviousMonthData,
      isClosed,
      cutoffTime,
      footerNote: isClosed
        ? `Kết quả kỳ xếp hạng tháng ${paddedMonth}/${targetYear} (chốt lúc ${cutoffTime}).`
        : `BXH sẽ chốt top vào lúc ${cutoffTime}!`,
      canSelectClass,
      selectedClassId: targetClassId,
      selectedClassLabel,
      availableClasses,
      topCoins,
      progressLeaders: computed.progressLeadersBoard.map(mapComputedProgress),
      progressRisers: computed.progressRisersBoard.map(mapComputedProgress),
      rewardConfig,
    };
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error(
      "[StudentLeaderboardServer] Lỗi ngoại lệ getStudentLeaderboardServer:",
      error.message
    );
    return buildEmptyStudentPayload({
      period,
      targetMonth,
      targetYear,
      canSelectClass,
      selectedClassId: targetClassId,
      selectedClassLabel,
      availableClasses,
      rewardConfig,
    });
  }
}
