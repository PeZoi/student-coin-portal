import {
  DashboardCoinSourceItem,
  TeacherDashboardPayload,
} from "./types";

/**
 * ==============================================================================
 * TEACHER DASHBOARD CONSTANTS (Single Source of Truth)
 * - Tập trung toàn bộ giới hạn hiển thị, đường dẫn tài nguyên, cấu hình nguồn xu
 *   và factory tạo payload rỗng dùng chung giữa Server Service và Client Hooks.
 * ==============================================================================
 */

export const DASHBOARD_LIMITS = {
  RECENT_SUBMISSIONS: 5,
  ATTENTION_STUDENTS: 5,
  TOP_STUDENTS: 3,
  PENDING_REWARDS: 5,
} as const;

export const DASHBOARD_ASSETS = {
  DEFAULT_STUDENT_AVATAR: "/avatar-chibi/male-1.webp",
  COIN_ICON: "/wheel/coin.webp",
} as const;

export const DEFAULT_DASHBOARD_REJECT_REASON =
  "Giáo viên từ chối yêu cầu đổi quà, học sinh vui lòng chọn lại món quà phù hợp.";

export interface DashboardCoinSourceMeta {
  id: DashboardCoinSourceItem["id"];
  label: string;
  barColorClass: string;
  dotColorClass: string;
}

export const DASHBOARD_COIN_SOURCES_META: readonly DashboardCoinSourceMeta[] = [
  {
    id: "missions",
    label: "Bài tập & Nhiệm vụ",
    barColorClass: "bg-blue-500",
    dotColorClass: "bg-blue-500",
  },
  {
    id: "wheel",
    label: "Vòng quay may mắn",
    barColorClass: "bg-purple-500",
    dotColorClass: "bg-purple-500",
  },
  {
    id: "bonus",
    label: "Thưởng nóng & BXH",
    barColorClass: "bg-amber-400",
    dotColorClass: "bg-amber-400",
  },
] as const;

/**
 * Tạo payload rỗng chuẩn xác cho Dashboard (dùng chung cho cả Server và Client fallback)
 */
export function createEmptyDashboardPayload(): TeacherDashboardPayload {
  return {
    kpis: {
      pending_submissions_count: 0,
      active_missions_count: 0,
      pending_rewards_count: 0,
      monthly_awarded_coins: 0,
    },
    recentSubmissions: [],
    attentionStudents: [],
    topStudents: [],
    pendingRewards: [],
    coinBreakdown: {
      total_coins_awarded: 0,
      sources: DASHBOARD_COIN_SOURCES_META.map((meta) => ({
        ...meta,
        coins: 0,
        percent: 0,
      })),
      total_wheel_spins: 0,
      total_exchanged_vnd: 0,
      completed_rewards_count: 0,
    },
  };
}

export const EMPTY_DASHBOARD_PAYLOAD: TeacherDashboardPayload =
  createEmptyDashboardPayload();
