import { MissionSubmissionType, SubmissionApprovalStatus } from "@/constants";

/**
 * ==============================================================================
 * TEACHER DASHBOARD TYPES (BÀN LÀM VIỆC GIÁO VIÊN & QUẢN TRỊ)
 * ==============================================================================
 * Khớp 1-1 với cấu trúc Cơ sở dữ liệu Supabase & Studio Duyệt Bài Tập:
 * - `homework_submissions` JOIN `missions`, `users`, `classes`
 * - `monthly_exchange_requests` JOIN `users`, `classes`
 * - `missions` JOIN `mission_classes`
 * ==============================================================================
 */

/**
 * Chỉ số KPI tổng quan trên Dashboard của Giáo viên
 */
export interface TeacherDashboardKpiStats {
  pending_submissions_count: number;
  pending_submissions_new_today: number;
  submission_rate_percent: number;
  submitted_count_sum: number;
  assigned_students_sum: number;
  pending_rewards_count: number;
  monthly_awarded_coins: number;
  monthly_awarded_growth: number;
  active_missions_count: number;
  total_students_count: number;
}

/**
 * Bản ghi bài nộp chờ duyệt gần nhất (Đồng bộ 100% với StudentRosterItem trong Studio Duyệt Bài Tập)
 */
export interface DashboardRecentSubmissionItem {
  id: string; // UUID bài nộp
  mission_id: string;
  mission_title: string;
  student_id: string;
  student_name: string;
  student_phone?: string; // Số điện thoại liên hệ phụ huynh (ví dụ: 0901234513)
  student_avatar: string; // Avatar chibi
  class_id?: string;
  class_name: string;
  submission_type: MissionSubmissionType;
  proof_image_count: number; // Số lượng ảnh minh chứng bài làm (vd: 1 ảnh)
  readable: boolean;
  is_late: boolean; // Đúng hạn hay Nộp muộn
  submitted_at: string; // Thời gian nộp bài
  ai_score: number | null; // Điểm số AI (thang 10, vd: 9.5 hoặc 9/10)
  correct_count: number | null; // Số câu đúng (vd: 18)
  total_questions: number | null; // Tổng số câu (vd: 20)
  incorrect_count: number; // Số câu sai (vd: 2)
  ai_suggested_coins: number; // Mức xu AI đề xuất (vd: 45 xu)
  final_coins: number | null;
  final_score: number | null;
  approval_status: SubmissionApprovalStatus;
  created_at: string;
}

/**
 * Top 5 học sinh tích lũy nhiều xu nhất trong tháng này (Bảng vàng thi đua lớp)
 */
export interface DashboardTopStudentItem {
  rank: number;
  student_id: string;
  student_name: string;
  student_code: string;
  avatar_url: string;
  class_name: string;
  monthly_coins_earned: number;
  completed_missions_count: number;
  streak_days: number;
}

/**
 * Hoạt động lớp học gần nhất (Live Class Activity Stream)
 */
export interface DashboardClassActivityItem {
  id: string;
  type: "submission" | "reward_exchange" | "coin_awarded" | "wheel_spin";
  student_name: string;
  student_avatar: string;
  class_name: string;
  description: string;
  time_ago: string;
  coins_delta: number;
}

/**
 * Yêu cầu đổi quà Heo Đất chờ trao tại lớp
 */
export interface DashboardPendingRewardItem {
  id: string;
  student_id: string;
  student_name: string;
  student_avatar: string;
  class_id?: string;
  class_name: string;
  choice_type: "gift" | "cash" | "spin_gift";
  item_name: string;
  item_image_url?: string;
  coins_to_exchange: number;
  amount_vnd: number;
  shopee_product_url?: string | null;
  created_at: string;
  status: "pending" | "completed" | "rejected";
}

/**
 * Bài tập đang hoạt động cần theo dõi tiến độ (Đồng bộ với MissionOverviewCard trong Studio Duyệt Bài Tập)
 */
export interface DashboardActiveMissionItem {
  id: string;
  title: string;
  submission_type: MissionSubmissionType;
  min_reward_coins: number;
  max_reward_coins: number;
  due_at: string;
  assigned_class_names: string[];
  total_students: number;
  submitted_count: number;
  pending_count: number; // Số bài chờ duyệt (vd: 14)
  approved_count: number; // Số bài đã duyệt (vd: 4)
  rejected_count: number; // Số bài cần sửa (vd: 0)
  unsubmitted_count: number; // Số em chưa nộp (vd: 2)
  is_active: boolean;
  is_expired?: boolean;
}

/**
 * Thông tin học sinh để chọn nhanh khi Thưởng nóng xu tại lớp
 */
export interface DashboardStudentQuickAwardItem {
  id: string;
  full_name: string;
  student_code: string;
  class_id?: string;
  class_name: string;
  avatar_url: string;
  current_coins: number;
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
