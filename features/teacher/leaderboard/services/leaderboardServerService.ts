import { supabase } from "@/lib/supabase/db";
import { AuthTokenPayload } from "@/lib/auth/jwt";
import { getCurrentVietnamMonthYear } from "@/lib/date";
import { UserRole } from "@/constants/auth";
import { StudentMissionStatus } from "@/constants";
import { getMyAssignedClassesServer } from "@/features/teacher/class-management/services/classServerService";
import {
  buildRecentMonthOptions,
  createEmptyLeaderboardPayload,
  formatMonthKey,
} from "../constants";
import {
  ComputedLeaderboardData,
  MonthlyLeaderboardDataset,
  ProgressRankEntry,
  RawStudentMonthPerformance,
  TeacherLeaderboardApiPayload,
  TopCoinsRankEntry,
} from "../types";
import { computeThreeLeaderboards } from "../utils/rankingCalculator";

export interface GetTeacherLeaderboardServerOptions {
  classId?: string | null;
  month?: number;
  year?: number;
  /** Bỏ qua snapshot để tính lại real-time (chỉ dùng nội bộ khi bấm Chốt sổ) */
  forceLiveCompute?: boolean;
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
  delta_coins: number;
  progress_group: "leaders" | "risers" | null;
  rank_progress: number | null;
  prev_month_coins: number;
  prev_month_rank: number | null;
  completed_missions_count: number;
  total_missions_count: number;
  closed_at: string | null;
}

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

/**
 * Dựng dữ liệu 3 bảng xếp hạng từ Snapshot đã chốt trong bảng `monthly_leaderboard`
 */
async function buildPayloadFromSnapshot(
  rows: LeaderboardSnapshotRow[],
  requestedClassId: string,
  targetMonth: number,
  targetYear: number,
  monthLabel: string,
  previousMonthLabel: string,
  availableMonths: TeacherLeaderboardApiPayload["availableMonths"]
): Promise<TeacherLeaderboardApiPayload> {
  const studentIds = Array.from(new Set(rows.map((r) => r.student_id)));
  const classIds = Array.from(new Set(rows.map((r) => r.class_id)));

  const [usersRes, classesRes] = await Promise.all([
    studentIds.length > 0
      ? supabase
          .from("users")
          .select("id, full_name, avatar_url")
          .in("id", studentIds)
      : Promise.resolve({
          data: [] as { id: string; full_name: string; avatar_url: string | null }[],
        }),
    classIds.length > 0
      ? supabase.from("classes").select("id, class_name").in("id", classIds)
      : Promise.resolve({ data: [] as { id: string; class_name: string }[] }),
  ]);

  const userMap = new Map<
    string,
    { full_name: string; avatar_url: string | null }
  >();
  for (const u of (usersRes.data ?? []) as {
    id: string;
    full_name: string;
    avatar_url: string | null;
  }[]) {
    userMap.set(u.id, { full_name: u.full_name, avatar_url: u.avatar_url });
  }

  const classMap = new Map<string, string>();
  for (const c of (classesRes.data ?? []) as {
    id: string;
    class_name: string;
  }[]) {
    classMap.set(c.id, c.class_name);
  }

  const hasPreviousMonthData = rows.some((r) => r.progress_group !== null);

  const sortedTopCoins = [...rows].sort((a, b) => {
    const rankA = a.rank_coins ?? Number.MAX_SAFE_INTEGER;
    const rankB = b.rank_coins ?? Number.MAX_SAFE_INTEGER;
    if (rankA !== rankB) return rankA - rankB;
    return b.monthly_earned_coins - a.monthly_earned_coins;
  });

  const topCoinsBoard: TopCoinsRankEntry[] = sortedTopCoins.map((r, idx) => {
    const user = userMap.get(r.student_id);
    return {
      rank: r.rank_coins ?? idx + 1,
      studentId: r.student_id,
      fullName: user?.full_name || "Học sinh",
      avatarUrl: user?.avatar_url || "/avatar-chibi/male-1.webp",
      className: classMap.get(r.class_id) || "Lớp học",
      currentMonthCoins: r.monthly_earned_coins,
      prevMonthCoins: hasPreviousMonthData ? r.prev_month_coins : null,
      deltaCoins: hasPreviousMonthData ? r.delta_coins : null,
      completedMissionsCount: r.completed_missions_count,
      totalMissionsCount: r.total_missions_count,
    };
  });

  const toProgressEntry = (
    r: LeaderboardSnapshotRow,
    idx: number,
    group: "leaders" | "risers"
  ): ProgressRankEntry => {
    const user = userMap.get(r.student_id);
    return {
      rank: r.rank_progress ?? idx + 1,
      group,
      studentId: r.student_id,
      fullName: user?.full_name || "Học sinh",
      avatarUrl: user?.avatar_url || "/avatar-chibi/male-1.webp",
      className: classMap.get(r.class_id) || "Lớp học",
      prevMonthRank: r.prev_month_rank ?? 0,
      prevMonthCoins: r.prev_month_coins,
      currentMonthCoins: r.monthly_earned_coins,
      deltaCoins: r.delta_coins,
      completedMissionsCount: r.completed_missions_count,
      totalMissionsCount: r.total_missions_count,
      isImproved: r.delta_coins > 0,
    };
  };

  const progressLeadersBoard = rows
    .filter((r) => r.progress_group === "leaders")
    .sort((a, b) => (a.rank_progress ?? 999) - (b.rank_progress ?? 999))
    .map((r, idx) => toProgressEntry(r, idx, "leaders"));

  const progressRisersBoard = rows
    .filter((r) => r.progress_group === "risers")
    .sort((a, b) => (a.rank_progress ?? 999) - (b.rank_progress ?? 999))
    .map((r, idx) => toProgressEntry(r, idx, "risers"));

  const totalEarnedCoins = rows.reduce(
    (sum, r) => sum + r.monthly_earned_coins,
    0
  );
  const improvedStudentsCount = hasPreviousMonthData
    ? rows.filter((r) => r.delta_coins > 0).length
    : 0;

  let latestClosedAt: string | null = null;
  for (const r of rows) {
    if (r.closed_at && (!latestClosedAt || r.closed_at > latestClosedAt)) {
      latestClosedAt = r.closed_at;
    }
  }

  const computed: ComputedLeaderboardData = {
    hasPreviousMonthData,
    totalStudents: rows.length,
    totalEarnedCoins,
    improvedStudentsCount,
    leadersGroupCount: progressLeadersBoard.length,
    risersGroupCount: progressRisersBoard.length,
    topCoinsBoard,
    progressLeadersBoard,
    progressRisersBoard,
  };

  return {
    classId: requestedClassId,
    monthKey: formatMonthKey(targetMonth, targetYear),
    month: targetMonth,
    year: targetYear,
    monthLabel,
    previousMonthLabel: hasPreviousMonthData ? previousMonthLabel : null,
    isClosed: true,
    closedAt: latestClosedAt,
    availableMonths,
    computed,
  };
}

/**
 * Server Service: Tính toán / đọc snapshot 3 Bảng xếp hạng trực tiếp trên Server
 * - Nếu tháng & lớp đã được chốt sổ trong `monthly_leaderboard`: đọc thẳng snapshot bất biến
 * - Nếu chưa chốt sổ: tính real-time từ `coin_transactions` & `student_missions` (lọc `created_at < nextMonthStartISO`)
 */
export async function getTeacherLeaderboardServer(
  session: AuthTokenPayload,
  options?: GetTeacherLeaderboardServerOptions
): Promise<TeacherLeaderboardApiPayload> {
  const currentVN = getCurrentVietnamMonthYear();
  const targetMonth = options?.month ?? currentVN.month;
  const targetYear = options?.year ?? currentVN.year;
  const availableMonths = buildRecentMonthOptions(
    currentVN.month,
    currentVN.year,
    6
  );
  const requestedClassId =
    options?.classId && options.classId.trim() ? options.classId.trim() : "all";

  const paddedMonth = String(targetMonth).padStart(2, "0");
  const prev = getPreviousMonthYear(targetMonth, targetYear);
  const next = getNextMonthYear(targetMonth, targetYear);
  const paddedPrevMonth = String(prev.month).padStart(2, "0");
  const monthLabel =
    targetMonth === currentVN.month && targetYear === currentVN.year
      ? `Tháng ${paddedMonth}/${targetYear} (Hiện tại)`
      : `Tháng ${paddedMonth}/${targetYear}`;
  const previousMonthLabel = `Tháng ${paddedPrevMonth}/${prev.year}`;

  try {
    if (
      !session ||
      (session.role !== UserRole.TEACHER &&
        session.role !== UserRole.SUPER_TEACHER &&
        session.role !== UserRole.ADMIN)
    ) {
      return createEmptyLeaderboardPayload(
        requestedClassId,
        targetMonth,
        targetYear,
        availableMonths
      );
    }

    // 1. Xác định phạm vi lớp hợp lệ theo vai trò
    const isHighPrivilege =
      session.role === UserRole.ADMIN ||
      session.role === UserRole.SUPER_TEACHER;

    let allowedClassIds: string[] | null = null;
    if (!isHighPrivilege) {
      const assignedClasses = await getMyAssignedClassesServer(session);
      allowedClassIds = assignedClasses.map((c) => c.id);
      if (allowedClassIds.length === 0) {
        return createEmptyLeaderboardPayload(
          requestedClassId,
          targetMonth,
          targetYear,
          availableMonths
        );
      }
    }

    if (
      requestedClassId !== "all" &&
      allowedClassIds !== null &&
      !allowedClassIds.includes(requestedClassId)
    ) {
      return createEmptyLeaderboardPayload(
        requestedClassId,
        targetMonth,
        targetYear,
        availableMonths
      );
    }

    // 2. Ưu tiên đọc Snapshot nếu lớp & tháng này đã được Chốt sổ trong `monthly_leaderboard`
    if (!options?.forceLiveCompute && requestedClassId !== "all") {
      const { data: snapshotRows, error: snapshotError } = await supabase
        .from("monthly_leaderboard")
        .select(
          "student_id, class_id, monthly_earned_coins, rank_coins, delta_coins, progress_group, rank_progress, prev_month_coins, prev_month_rank, completed_missions_count, total_missions_count, closed_at"
        )
        .eq("month", targetMonth)
        .eq("year", targetYear)
        .eq("class_id", requestedClassId);

      if (!snapshotError && snapshotRows && snapshotRows.length > 0) {
        return buildPayloadFromSnapshot(
          snapshotRows as LeaderboardSnapshotRow[],
          requestedClassId,
          targetMonth,
          targetYear,
          monthLabel,
          previousMonthLabel,
          availableMonths
        );
      }
    }

    // 3. Nếu chưa chốt sổ: đọc tổng hợp trực tiếp từ View `v_student_monthly_leaderboard`
    // (đã GROUP BY sẵn trong Postgres -> chỉ trả về 1 dòng/học sinh/tháng, không bao giờ dính giới hạn 1.000 dòng)
    const currMonthStartISO = getMonthStartVietnamISO(targetMonth, targetYear);
    const nextMonthStartISO = getMonthStartVietnamISO(next.month, next.year);

    let studentsQuery = supabase
      .from("users")
      .select("id, full_name, avatar_url, class_id, created_at")
      .eq("role", UserRole.STUDENT)
      .eq("is_deleted", false)
      .eq("is_active", true)
      .lt("created_at", nextMonthStartISO);

    if (requestedClassId !== "all") {
      studentsQuery = studentsQuery.eq("class_id", requestedClassId);
    } else if (allowedClassIds !== null) {
      studentsQuery = studentsQuery.in("class_id", allowedClassIds);
    }

    const { data: studentsData, error: studentsError } = await studentsQuery;

    if (studentsError || !studentsData || studentsData.length === 0) {
      if (studentsError) {
        console.error(
          "[LeaderboardServer] Lỗi tải học sinh:",
          studentsError.message
        );
      }
      return createEmptyLeaderboardPayload(
        requestedClassId,
        targetMonth,
        targetYear,
        availableMonths
      );
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

    const currCoinsMap = new Map<string, number>();
    const currCompletedFromViewMap = new Map<string, number>();
    for (const row of (currViewRes.data ?? []) as LeaderboardViewRow[]) {
      // Bảng xếp hạng thi đua chỉ tính hành vi học tập & nỗ lực (bài tập + thưởng phát biểu/khen thưởng)
      // Loại trừ wheel_coins (vòng quay may mắn mang tính giải trí ngẫu nhiên)
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
      // Đối chiếu tháng trước cũng áp dụng cùng tiêu chí xu học tập (missions_coins + bonus_coins)
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
      // Số bài hoàn thành lấy trực tiếp từ v_student_monthly_leaderboard (hoặc kết hợp bài tập được giao)
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
      label: monthLabel,
      hasPreviousMonthData,
      previousMonthLabel: hasPreviousMonthData ? previousMonthLabel : null,
      students: rawPerformances,
    };

    const computed = computeThreeLeaderboards(dataset);

    return {
      classId: requestedClassId,
      monthKey: dataset.monthKey,
      month: targetMonth,
      year: targetYear,
      monthLabel,
      previousMonthLabel: dataset.previousMonthLabel,
      isClosed: false,
      closedAt: null,
      availableMonths,
      computed,
    };
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error(
      "[LeaderboardServer] Lỗi ngoại lệ getTeacherLeaderboardServer:",
      error.message
    );
    return createEmptyLeaderboardPayload(
      requestedClassId,
      targetMonth,
      targetYear,
      availableMonths
    );
  }
}

/**
 * Chốt sổ bảng xếp hạng tháng cho một lớp cụ thể và lưu snapshot vào `public.monthly_leaderboard`
 */
export async function closeMonthlyLeaderboardServer(
  session: AuthTokenPayload,
  params: { classId: string; month: number; year: number }
): Promise<TeacherLeaderboardApiPayload> {
  const { classId, month, year } = params;
  if (!classId || classId === "all") {
    throw new Error("Vui lòng chọn một lớp học cụ thể trên thanh tiêu đề để chốt sổ.");
  }

  // Tính kết quả real-time mới nhất của lớp trong tháng đó
  const livePayload = await getTeacherLeaderboardServer(session, {
    classId,
    month,
    year,
    forceLiveCompute: true,
  });

  if (livePayload.computed.topCoinsBoard.length === 0) {
    throw new Error("Lớp học này chưa có học sinh nào để chốt sổ bảng xếp hạng.");
  }

  const progressMap = new Map<string, ProgressRankEntry>();
  for (const item of livePayload.computed.progressLeadersBoard) {
    progressMap.set(item.studentId, item);
  }
  for (const item of livePayload.computed.progressRisersBoard) {
    progressMap.set(item.studentId, item);
  }

  const nowIso = new Date().toISOString();
  const rowsToUpsert = livePayload.computed.topCoinsBoard.map((topEntry) => {
    const prog = progressMap.get(topEntry.studentId);
    return {
      month,
      year,
      class_id: classId,
      student_id: topEntry.studentId,
      monthly_earned_coins: topEntry.currentMonthCoins,
      rank_coins: topEntry.rank,
      delta_coins: prog ? prog.deltaCoins : 0,
      progress_group: prog ? prog.group : null,
      rank_progress: prog ? prog.rank : null,
      prev_month_coins: prog ? prog.prevMonthCoins : 0,
      prev_month_rank: prog ? prog.prevMonthRank : null,
      completed_missions_count: topEntry.completedMissionsCount,
      total_missions_count: topEntry.totalMissionsCount,
      closed_at: nowIso,
      updated_by: session.userId,
      updated_at: nowIso,
    };
  });

  const { error } = await supabase
    .from("monthly_leaderboard")
    .upsert(rowsToUpsert, {
      onConflict: "month,year,class_id,student_id",
    });

  if (error) {
    throw new Error(`Không thể chốt sổ bảng xếp hạng: ${error.message}`);
  }

  return getTeacherLeaderboardServer(session, { classId, month, year });
}
