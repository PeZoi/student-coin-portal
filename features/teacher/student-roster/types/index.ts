import {
  StudentMissionStatusType,
  MissionSubmissionTypeValue,
  ExchangeRequestStatusType,
  ExchangeChoiceTypeValue,
} from "@/constants";

export type StudentRosterStatusFilter = "all" | "active" | "locked";

export type StudentRosterSortField =
  | "full_name"
  | "current_coins"
  | "completed_missions_count"
  | "redeemed_rewards_count";

export type SortOrder = "asc" | "desc" | "none";

/**
 * Hình thức đổi quà khớp 100% với cột `choice_type` trong DB `monthly_exchange_requests`
 */
export type ExchangeChoiceType = ExchangeChoiceTypeValue | "save_piggy";

/**
 * Trạng thái yêu cầu đổi quà khớp cột `status` trong DB `monthly_exchange_requests`
 */
export type ExchangeRequestStatus = ExchangeRequestStatusType;

/**
 * Chi tiết phiếu đổi quà khớp 100% cấu trúc bảng `monthly_exchange_requests`
 */
export interface MonthlyExchangeRequestItem {
  id: string;
  month: number;
  year: number;
  student_id: string;
  choice_type: ExchangeChoiceType;
  coins_to_exchange: number;
  amount_vnd: number;
  shopee_product_url?: string | null;
  shopee_note?: string | null;
  status: ExchangeRequestStatus;
  processed_by?: string | null;
  processed_at?: string | null;
  created_at: string;
}

/**
 * Thực thể Học sinh trong danh sách Roster theo lớp
 * Đồng bộ 100% với các trường trong database (bảng users, classes, student_missions, monthly_exchange_requests)
 */
export interface TeacherRosterStudent {
  id: string; // users.id
  full_name: string; // users.full_name
  avatar_url: string; // users.avatar_url
  phone_zalo?: string; // users.phone_zalo
  class_id?: string; // users.class_id
  class_name?: string; // classes.class_name
  current_coins: number; // users.current_coins
  total_earned_coins: number; // users.total_earned_coins
  redeemed_rewards_count: number; // Đếm số yêu cầu đổi quà đã hoàn thành
  exchange_requests?: MonthlyExchangeRequestItem[]; // Quan hệ monthly_exchange_requests
  completed_missions_count: number; // Đếm số bài đã duyệt từ student_missions
  total_missions_count: number; // Tổng số bài được giao từ student_missions
  pending_missions_count?: number; // Số bài đã nộp đang chờ giáo viên chấm duyệt
  exempt_missions_count?: number; // Số bài tập được miễn làm (ngoại lệ)
  late_missions_count?: number; // Số bài tập nộp trễ hạn
  last_login_at: string; // users.last_login_at
  pin_status: "ok" | "locked" | "failed_attempts"; // Trạng thái PIN
  failed_login_attempts: number; // users.failed_login_attempts
  locked_until?: string | null; // users.locked_until
  is_active: boolean; // users.is_active
  is_deleted: boolean; // users.is_deleted
}

/**
 * Giao dịch sổ cái biến động xu Heo Đất
 * Đồng bộ 100% với bảng DB `coin_transactions`
 */
export interface RosterCoinTransactionItem {
  id: string;
  user_id: string;
  amount: number;
  balance_before: number;
  balance_after: number;
  tx_type: string;
  reference_type: string;
  reference_id: string | null;
  description: string;
  created_at: string;
  created_by: string | null;
  creator_name: string | null;
  creator_role: string | null;
}

/**
 * Trạng thái tiến độ bài tập của học sinh
 * Khớp 100% với Postgres ENUM `student_mission_status`
 */
export type RosterMissionProgressStatus = StudentMissionStatusType;

/**
 * Hình thức nộp bài minh chứng
 * Khớp Postgres ENUM `mission_submission_type`
 */
export type RosterSubmissionType = MissionSubmissionTypeValue;

/**
 * Chi tiết bài tập đã giao cho học sinh
 * Kết hợp thông tin từ `student_missions`, `missions` và `homework_submissions`
 */
export interface RosterAssignedMissionItem {
  id: string; // student_missions.id
  mission_id: string; // missions.id
  student_id: string; // users.id
  class_id?: string; // classes.id
  title: string; // missions.title
  description: string; // missions.description
  submission_type: RosterSubmissionType;
  reward_coins: number; // missions.max_reward_coins
  min_reward_coins?: number; // missions.min_reward_coins
  max_reward_coins?: number; // missions.max_reward_coins
  status: RosterMissionProgressStatus;
  is_late: boolean; // student_missions.is_late
  assigned_at: string; // student_missions.assigned_at
  deadline: string; // missions.due_at
  submitted_at?: string | null; // student_missions.submitted_at
  completed_at?: string | null; // student_missions.completed_at
  earned_coins?: number; // homework_submissions.final_coins
  teacher_feedback?: string | null; // homework_submissions.teacher_feedback
  proof_image_urls?: string[]; // homework_submissions.proof_image_urls
  ai_score?: number | null; // homework_submissions.ai_score
  correct_count?: number | null; // homework_submissions.correct_count
  total_questions?: number | null; // homework_submissions.total_questions
  attempt_number?: number; // homework_submissions.attempt_number
}
