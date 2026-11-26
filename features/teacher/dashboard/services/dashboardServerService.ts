import { supabase } from "@/lib/supabase/db";
import { AuthTokenPayload } from "@/lib/auth/jwt";
import { resolveAuthorizedClassIds } from "@/features/teacher/submission-management/services/submissionServerService";
import {
  ExchangeChoiceType,
  ExchangeChoiceTypeValue,
  ExchangeRequestStatus,
  ExchangeRequestStatusType,
  MissionSubmissionType,
  StudentMissionStatus,
  SubmissionApprovalStatus,
  UserRole,
} from "@/constants";
import { formatDate, getStartOfMonthVietnamISO } from "@/lib/date";
import {
  DashboardCoinBreakdownStats,
  DashboardCoinSourceItem,
  DashboardPendingRewardItem,
  DashboardRecentSubmissionItem,
  DashboardStudentAttentionItem,
  DashboardTopStudentItem,
  TeacherDashboardPayload,
} from "../types";
import {
  createEmptyDashboardPayload,
  DASHBOARD_ASSETS,
  DASHBOARD_COIN_SOURCES_META,
  DASHBOARD_LIMITS,
} from "../constants";

interface StudentRow {
  id: string;
  full_name: string;
  phone_zalo: string | null;
  avatar_url: string | null;
  class_id: string | null;
}

interface MissionRow {
  id: string;
  title: string;
  due_at: string;
  is_active: boolean | null;
  is_deleted: boolean;
}

interface SubmissionRow {
  id: string;
  mission_id: string;
  student_id: string;
  submission_type: MissionSubmissionType;
  proof_image_urls: unknown;
  readable: boolean;
  is_late: boolean;
  ai_score: number | null;
  correct_count: number | null;
  total_questions: number | null;
  ai_suggested_coins: number;
  approval_status: SubmissionApprovalStatus;
  created_at: string;
}

interface PendingRewardRow {
  id: string;
  month: number;
  year: number;
  student_id: string;
  choice_type: ExchangeChoiceTypeValue;
  coins_to_exchange: number;
  amount_vnd: number;
  shopee_product_url: string | null;
  shopee_note: string | null;
  status: ExchangeRequestStatusType;
  created_at: string;
}

interface MonthlyLeaderboardViewRow {
  student_id: string;
  student_name: string;
  avatar_url: string | null;
  class_id: string | null;
  class_name: string;
  month: number;
  year: number;
  missions_coins: number;
  wheel_coins: number;
  bonus_coins: number;
  monthly_coins_earned: number;
  completed_missions_count: number;
}

interface StudentMissionRow {
  id: string;
  student_id: string;
  mission_id: string;
  status: string;
}

function countProofImages(raw: unknown): number {
  if (!Array.isArray(raw)) return 0;
  return raw.filter((item) => typeof item === "string" && item.trim().length > 0)
    .length;
}

function resolveRewardItemName(row: PendingRewardRow): string {
  if (row.shopee_note && row.shopee_note.trim()) {
    return row.shopee_note.trim();
  }
  if (row.choice_type === ExchangeChoiceType.CASH) {
    return `Đổi tiền mặt ${row.amount_vnd.toLocaleString("vi-VN")}đ`;
  }
  if (row.choice_type === ExchangeChoiceType.SPIN_GIFT) {
    return "Quà tặng Vòng quay may mắn";
  }
  return "Quà tặng tự chọn Heo Đất";
}

function buildCoinBreakdown(
  leaderboardRows: MonthlyLeaderboardViewRow[],
  totalWheelSpins: number,
  completedExchanges: { amount_vnd: number }[]
): DashboardCoinBreakdownStats {
  let missionsCoins = 0;
  let wheelCoins = 0;
  let bonusCoins = 0;

  // Dữ liệu đã được PostgreSQL SUM sẵn theo từng học sinh trong View v_student_monthly_leaderboard
  for (const row of leaderboardRows) {
    missionsCoins += row.missions_coins || 0;
    wheelCoins += row.wheel_coins || 0;
    bonusCoins += row.bonus_coins || 0;
  }

  const totalCoinsAwarded = missionsCoins + wheelCoins + bonusCoins;
  const calcPercent = (value: number): number => {
    if (totalCoinsAwarded <= 0) return 0;
    return Math.round((value / totalCoinsAwarded) * 100);
  };

  const coinsBySource: Record<DashboardCoinSourceItem["id"], number> = {
    missions: missionsCoins,
    wheel: wheelCoins,
    bonus: bonusCoins,
  };

  const sources: DashboardCoinSourceItem[] = DASHBOARD_COIN_SOURCES_META.map(
    (meta) => {
      const coins = coinsBySource[meta.id];
      return {
        ...meta,
        coins,
        percent: calcPercent(coins),
      };
    }
  );

  const totalExchangedVnd = completedExchanges.reduce(
    (sum, item) => sum + (item.amount_vnd || 0),
    0
  );

  return {
    total_coins_awarded: totalCoinsAwarded,
    sources,
    total_wheel_spins: totalWheelSpins,
    total_exchanged_vnd: totalExchangedVnd,
    completed_rewards_count: completedExchanges.length,
  };
}

/**
 * Server Service tải toàn bộ dữ liệu trang Tổng quan Giáo viên trực tiếp từ Supabase
 * - Chạy trực tiếp trên Server Component (0ms HTTP round-trip) hoặc qua GET /api/teacher/dashboard
 * - Tự động kiểm tra phân quyền theo vai trò & lớp học được chọn trên Header Workspace
 * - Song song hóa tối đa các truy vấn độc lập bằng Promise.all để tối ưu TTFB
 */
export async function getTeacherDashboardServer(
  session: AuthTokenPayload,
  requestedClassId?: string | null
): Promise<TeacherDashboardPayload> {
  const emptyPayload = createEmptyDashboardPayload();

  try {
    const scope = await resolveAuthorizedClassIds(session, requestedClassId);
    if (!scope.authorized) {
      return emptyPayload;
    }

    const now = new Date();
    const { startOfMonthISO, month: currentMonth, year: currentYear } =
      getStartOfMonthVietnamISO(now);

    // Vòng 1: Tải song song danh sách lớp, học sinh và bài tập trong phạm vi lớp
    let studentsQuery = supabase
      .from("users")
      .select("id, full_name, phone_zalo, avatar_url, class_id")
      .eq("role", UserRole.STUDENT)
      .eq("is_deleted", false);

    if (scope.targetClassIds !== null) {
      studentsQuery = studentsQuery.in("class_id", scope.targetClassIds);
    }

    const missionIdsPromise =
      scope.targetClassIds !== null
        ? supabase
            .from("mission_classes")
            .select("mission_id")
            .in("class_id", scope.targetClassIds)
        : Promise.resolve({ data: null, error: null });

    const [classesRes, studentsRes, missionClassesRes] = await Promise.all([
      supabase.from("classes").select("id, class_name").eq("is_deleted", false),
      studentsQuery,
      missionIdsPromise,
    ]);

    const classMap = new Map<string, string>();
    for (const c of classesRes.data ?? []) {
      classMap.set(c.id, c.class_name);
    }

    const students = (studentsRes.data ?? []) as StudentRow[];
    const studentMap = new Map<string, StudentRow>();
    const studentIds: string[] = [];
    for (const st of students) {
      studentMap.set(st.id, st);
      studentIds.push(st.id);
    }

    // Lấy danh sách bài tập (missions) thuộc phạm vi lớp
    const missionsQuery = supabase
      .from("missions")
      .select("id, title, due_at, is_active, is_deleted")
      .eq("is_deleted", false);

    const scopedMissionIds = Array.from(
      new Set((missionClassesRes.data ?? []).map((row) => row.mission_id))
    );

    let missions: MissionRow[] = [];
    if (scope.targetClassIds !== null) {
      if (scopedMissionIds.length > 0) {
        const { data: missionsData } = await missionsQuery.in(
          "id",
          scopedMissionIds
        );
        missions = (missionsData ?? []) as MissionRow[];
      }
    } else {
      const { data: missionsData } = await missionsQuery;
      missions = (missionsData ?? []) as MissionRow[];
    }

    const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
    const missionMap = new Map<string, MissionRow>();
    let activeMissionsCount = 0;
    for (const m of missions) {
      missionMap.set(m.id, m);
      const dueTime = new Date(m.due_at).getTime();
      const isExpiredOverOneWeek =
        !isNaN(dueTime) && now.getTime() - dueTime > ONE_WEEK_MS;
      // Bài đang mở nhận bài: là bài đang kích hoạt và thuộc hoạt động gần đây (chưa hết hạn quá 1 tuần)
      if (m.is_active && !isExpiredOverOneWeek) {
        activeMissionsCount += 1;
      }
    }

    // Nếu lớp chưa có học sinh nào, trả về ngay với số bài tập đang mở
    if (studentIds.length === 0) {
      return {
        ...emptyPayload,
        kpis: {
          ...emptyPayload.kpis,
          active_missions_count: activeMissionsCount,
        },
      };
    }

    // Xây dựng truy vấn View v_student_monthly_leaderboard theo phạm vi lớp & tháng hiện tại (GMT+7)
    let leaderboardViewQuery = supabase
      .from("v_student_monthly_leaderboard")
      .select(
        "student_id, student_name, avatar_url, class_id, class_name, month, year, missions_coins, wheel_coins, bonus_coins, monthly_coins_earned, completed_missions_count"
      )
      .eq("month", currentMonth)
      .eq("year", currentYear)
      .order("monthly_coins_earned", { ascending: false });

    if (scope.targetClassIds !== null) {
      leaderboardViewQuery = leaderboardViewQuery.in(
        "class_id",
        scope.targetClassIds
      );
    }

    // Vòng 2: Truy vấn song song 6 nguồn dữ liệu của lớp (đã gộp thống kê xu + Top 3 vào View DB)
    const [
      pendingSubmissionsRes,
      pendingRewardsRes,
      monthlyLeaderboardRes,
      monthlyWheelSpinsRes,
      completedRewardsRes,
      attentionMissionsRes,
    ] = await Promise.all([
      // 1. Bài nộp đang chờ cô duyệt: đếm chính xác số lượng và chỉ tải đúng số dòng hiển thị
      supabase
        .from("homework_submissions")
        .select(
          "id, mission_id, student_id, submission_type, proof_image_urls, readable, is_late, ai_score, correct_count, total_questions, ai_suggested_coins, approval_status, created_at",
          { count: "exact" }
        )
        .eq("approval_status", SubmissionApprovalStatus.PENDING_APPROVAL)
        .in("student_id", studentIds)
        .order("created_at", { ascending: false })
        .limit(DASHBOARD_LIMITS.RECENT_SUBMISSIONS),

      // 2. Yêu cầu đổi quà đang chờ duyệt: đếm chính xác số lượng và chỉ tải đúng số dòng hiển thị
      supabase
        .from("monthly_exchange_requests")
        .select(
          "id, month, year, student_id, choice_type, coins_to_exchange, amount_vnd, shopee_product_url, shopee_note, status, created_at",
          { count: "exact" }
        )
        .eq("status", ExchangeRequestStatus.PENDING)
        .in("student_id", studentIds)
        .order("created_at", { ascending: false })
        .limit(DASHBOARD_LIMITS.PENDING_REWARDS),

      // 3. View tổng hợp xu kiếm được (theo 3 nguồn) & số bài hoàn thành trong tháng của từng học sinh
      leaderboardViewQuery,

      // 4. Tổng số lượt quay vòng quay may mắn trong tháng
      supabase
        .from("wheel_spins")
        .select("id", { count: "exact", head: true })
        .in("student_id", studentIds)
        .gte("created_at", startOfMonthISO),

      // 5. Các yêu cầu đổi quà đã hoàn tất trong tháng (tính tổng VNĐ đã quy đổi)
      supabase
        .from("monthly_exchange_requests")
        .select("amount_vnd")
        .eq("status", ExchangeRequestStatus.COMPLETED)
        .eq("month", currentMonth)
        .eq("year", currentYear)
        .in("student_id", studentIds),

      // 6. Học sinh chưa nộp bài hoặc có bài bị trả về cần sửa
      supabase
        .from("student_missions")
        .select("id, student_id, mission_id, status")
        .in("student_id", studentIds)
        .in("status", [
          StudentMissionStatus.ASSIGNED,
          StudentMissionStatus.REJECTED,
        ]),
    ]);

    // --- Xử lý 1: Recent Submissions ---
    const pendingSubsRaw = (pendingSubmissionsRes.data ?? []) as SubmissionRow[];
    const recentSubmissions: DashboardRecentSubmissionItem[] = pendingSubsRaw
      .slice(0, DASHBOARD_LIMITS.RECENT_SUBMISSIONS)
      .map((sub) => {
        const student = studentMap.get(sub.student_id);
        const mission = missionMap.get(sub.mission_id);
        const className = student?.class_id
          ? classMap.get(student.class_id) ?? ""
          : "";
        const incorrectCount =
          sub.total_questions !== null && sub.correct_count !== null
            ? Math.max(0, sub.total_questions - sub.correct_count)
            : null;

        return {
          id: sub.id,
          mission_id: sub.mission_id,
          mission_title: mission?.title ?? "Bài tập lớp học",
          student_id: sub.student_id,
          student_name: student?.full_name ?? "Học sinh",
          student_phone: student?.phone_zalo ?? undefined,
          student_avatar: student?.avatar_url || DASHBOARD_ASSETS.DEFAULT_STUDENT_AVATAR,
          class_id: student?.class_id ?? undefined,
          class_name: className,
          submission_type: sub.submission_type,
          proof_image_count: countProofImages(sub.proof_image_urls),
          readable: sub.readable,
          is_late: sub.is_late,
          submitted_at: sub.created_at,
          ai_score: sub.ai_score !== null ? Number(sub.ai_score) : null,
          correct_count: sub.correct_count,
          total_questions: sub.total_questions,
          incorrect_count: incorrectCount,
          ai_suggested_coins: sub.ai_suggested_coins ?? 0,
          approval_status: sub.approval_status,
          created_at: sub.created_at,
        };
      });

    // --- Xử lý 2: Pending Rewards ---
    const pendingRewardsRaw = (pendingRewardsRes.data ?? []) as PendingRewardRow[];
    const pendingRewards: DashboardPendingRewardItem[] = pendingRewardsRaw
      .slice(0, DASHBOARD_LIMITS.PENDING_REWARDS)
      .map((row) => {
        const student = studentMap.get(row.student_id);
        const className = student?.class_id
          ? classMap.get(student.class_id) ?? ""
          : "";

        return {
          id: row.id,
          month: row.month,
          year: row.year,
          student_id: row.student_id,
          student_name: student?.full_name ?? "Học sinh",
          student_avatar: student?.avatar_url || DASHBOARD_ASSETS.DEFAULT_STUDENT_AVATAR,
          student_phone: student?.phone_zalo ?? null,
          class_id: student?.class_id ?? undefined,
          class_name: className,
          choice_type: row.choice_type,
          item_name: resolveRewardItemName(row),
          coins_to_exchange: row.coins_to_exchange,
          amount_vnd: row.amount_vnd,
          shopee_product_url: row.shopee_product_url,
          shopee_note: row.shopee_note,
          created_at: row.created_at,
          status: row.status,
        };
      });

    // --- Xử lý 3: Coin Breakdown & Monthly Awarded Coins (từ View DB đã tổng hợp sẵn) ---
    const leaderboardRows = (monthlyLeaderboardRes.data ??
      []) as MonthlyLeaderboardViewRow[];
    const coinBreakdown = buildCoinBreakdown(
      leaderboardRows,
      monthlyWheelSpinsRes.count ?? 0,
      (completedRewardsRes.data ?? []) as { amount_vnd: number }[]
    );

    // --- Xử lý 4: Top 3 Học sinh nhận nhiều xu nhất tháng (đã được Postgres ORDER BY DESC sẵn) ---
    const topStudents: DashboardTopStudentItem[] = leaderboardRows
      .filter((row) => row.monthly_coins_earned > 0)
      .slice(0, DASHBOARD_LIMITS.TOP_STUDENTS)
      .map((row, idx) => ({
        rank: idx + 1,
        student_id: row.student_id,
        student_name: row.student_name || "Học sinh",
        avatar_url: row.avatar_url || DASHBOARD_ASSETS.DEFAULT_STUDENT_AVATAR,
        class_name: row.class_name || "",
        monthly_coins_earned: row.monthly_coins_earned,
        completed_missions_count: row.completed_missions_count ?? 0,
      }));

    // --- Xử lý 5: Học sinh cần nhắc nhở (bài bị trả về ưu tiên trước, rồi tới chưa nộp sắp/quá hạn) ---
    const attentionRaw = (attentionMissionsRes.data ?? []) as StudentMissionRow[];
    const attentionCandidates: {
      item: DashboardStudentAttentionItem;
      priority: number;
      dueTime: number;
    }[] = [];

    for (const row of attentionRaw) {
      const mission = missionMap.get(row.mission_id);
      const student = studentMap.get(row.student_id);
      if (!mission || !mission.is_active || !student) continue;

      const dueTime = new Date(mission.due_at).getTime();
      const isExpiredOverOneWeek =
        !isNaN(dueTime) && now.getTime() - dueTime > ONE_WEEK_MS;
      // Bỏ qua các bài tập đã lưu trữ (> 1 tuần): đã đóng nhận bài hoàn toàn, không cần nhắc nhở
      if (isExpiredOverOneWeek) continue;

      const isOverdue = dueTime < now.getTime();
      const isRevision = row.status === StudentMissionStatus.REJECTED;
      const className = student.class_id
        ? classMap.get(student.class_id) ?? ""
        : "";

      const dueFormatted = formatDate(mission.due_at, "HH:mm - dd/MM");
      const dueLabel = isOverdue
        ? `Quá hạn (${dueFormatted})`
        : `Hạn chót: ${dueFormatted}`;

      attentionCandidates.push({
        priority: isRevision ? 0 : isOverdue ? 1 : 2,
        dueTime,
        item: {
          id: row.id,
          student_id: row.student_id,
          student_name: student.full_name,
          student_phone: student.phone_zalo ?? undefined,
          student_avatar: student.avatar_url || DASHBOARD_ASSETS.DEFAULT_STUDENT_AVATAR,
          class_id: student.class_id ?? undefined,
          class_name: className,
          attention_type: isRevision ? "needs_revision" : "unsubmitted",
          reason_badge: isRevision
            ? "Bài bị trả về"
            : isOverdue
              ? "Quá hạn nộp"
              : "Chưa nộp bài",
          mission_id: row.mission_id,
          mission_title: mission.title,
          due_label: dueLabel,
          is_overdue: isOverdue,
        },
      });
    }

    const attentionStudents = attentionCandidates
      .sort((a, b) => a.priority - b.priority || a.dueTime - b.dueTime)
      .slice(0, DASHBOARD_LIMITS.ATTENTION_STUDENTS)
      .map((entry) => entry.item);

    return {
      kpis: {
        pending_submissions_count:
          pendingSubmissionsRes.count ?? pendingSubsRaw.length,
        active_missions_count: activeMissionsCount,
        pending_rewards_count:
          pendingRewardsRes.count ?? pendingRewardsRaw.length,
        monthly_awarded_coins: coinBreakdown.total_coins_awarded,
      },
      recentSubmissions,
      attentionStudents,
      topStudents,
      pendingRewards,
      coinBreakdown,
    };
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error(
      "Lỗi máy chủ tại getTeacherDashboardServer:",
      error.message
    );
    return emptyPayload;
  }
}
