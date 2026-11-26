import {
  ExchangeChoiceTypeValue,
  ExchangeRequestStatusType,
  MissionSubmissionType,
  SubmissionApprovalStatus,
} from "@/constants";

/**
 * ==============================================================================
 * TEACHER DASHBOARD TYPES (BÀN LÀM VIỆC GIÁO VIÊN & QUẢN TRỊ)
 * ==============================================================================
 * Khớp 1-1 với cấu trúc Cơ sở dữ liệu Supabase:
 * - `homework_submissions` JOIN `missions`, `users`, `classes`
 * - `monthly_exchange_requests` JOIN `users`, `classes`
 * - `student_missions` JOIN `missions`, `users`
 * - `coin_transactions`, `wheel_spins`
 * ==============================================================================
 */

/**
 * 4 chỉ số KPI cốt lõi trên Dashboard của Giáo viên
 */
export interface TeacherDashboardKpiStats {
  pending_submissions_count: number;
  active_missions_count: number;
  pending_rewards_count: number;
  monthly_awarded_coins: number;
}

/**
 * Bản ghi bài nộp chờ duyệt gần nhất
 */
export interface DashboardRecentSubmissionItem {
  id: string;
  mission_id: string;
  mission_title: string;
  student_id: string;
  student_name: string;
  student_phone?: string;
  student_avatar: string;
  class_id?: string;
  class_name: string;
  submission_type: MissionSubmissionType;
  proof_image_count: number;
  readable: boolean;
  is_late: boolean;
  submitted_at: string;
  ai_score: number | null;
  correct_count: number | null;
  total_questions: number | null;
  incorrect_count: number | null;
  ai_suggested_coins: number;
  approval_status: SubmissionApprovalStatus;
  created_at: string;
}

/**
 * Top 3 học sinh tích lũy nhiều xu nhất trong tháng này
 */
export interface DashboardTopStudentItem {
  rank: number;
  student_id: string;
  student_name: string;
  avatar_url: string;
  class_name: string;
  monthly_coins_earned: number;
  completed_missions_count: number;
}

/**
 * Yêu cầu đổi quà Heo Đất chờ duyệt tại lớp
 */
export interface DashboardPendingRewardItem {
  id: string;
  month: number;
  year: number;
  student_id: string;
  student_name: string;
  student_avatar: string;
  student_phone?: string | null;
  class_id?: string;
  class_name: string;
  choice_type: ExchangeChoiceTypeValue;
  item_name: string;
  coins_to_exchange: number;
  amount_vnd: number;
  shopee_product_url?: string | null;
  shopee_note?: string | null;
  created_at: string;
  status: ExchangeRequestStatusType;
}

/**
 * Học sinh cần nhắc nhở & theo dõi học tập (Chưa nộp bài hoặc bài bị trả về cần sửa)
 */
export interface DashboardStudentAttentionItem {
  id: string;
  student_id: string;
  student_name: string;
  student_phone?: string;
  student_avatar: string;
  class_id?: string;
  class_name: string;
  attention_type: "unsubmitted" | "needs_revision";
  reason_badge: string;
  mission_id: string;
  mission_title: string;
  due_label: string;
  is_overdue: boolean;
}

/**
 * Nguồn phân bổ xu thưởng trong tháng
 */
export interface DashboardCoinSourceItem {
  id: "missions" | "wheel" | "bonus";
  label: string;
  coins: number;
  percent: number;
  barColorClass: string;
  dotColorClass: string;
}

/**
 * Thống kê cơ cấu nguồn xu & quỹ đổi thưởng trong tháng
 */
export interface DashboardCoinBreakdownStats {
  total_coins_awarded: number;
  sources: DashboardCoinSourceItem[];
  total_wheel_spins: number;
  total_exchanged_vnd: number;
  completed_rewards_count: number;
}

/**
 * Toàn bộ Payload trả về từ Server Service / API GET /api/teacher/dashboard
 */
export interface TeacherDashboardPayload {
  kpis: TeacherDashboardKpiStats;
  recentSubmissions: DashboardRecentSubmissionItem[];
  attentionStudents: DashboardStudentAttentionItem[];
  topStudents: DashboardTopStudentItem[];
  pendingRewards: DashboardPendingRewardItem[];
  coinBreakdown: DashboardCoinBreakdownStats;
}
