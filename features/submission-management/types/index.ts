import {
  MissionSubmissionType,
  SubmissionApprovalStatus,
  AiGradingErrorType,
} from "@/features/mission-management/types";

export type {
  MissionSubmissionType,
  SubmissionApprovalStatus,
  AiGradingErrorType,
};

/**
 * Chi tiết lỗi sai do AI phát hiện (Khớp 100% bảng `public.ai_submission_errors`)
 */
export interface GradingSubmissionErrorItem {
  id: string;
  submission_id: string;
  line_number: number | null;
  student_text: string;
  correction_text: string;
  error_type: AiGradingErrorType;
  severity: "minor" | "major";
  explanation: string | null;
}

/**
 * Chi tiết từng câu hỏi do AI nhận diện (trong `ai_raw_response.detailed_reviews`)
 */
export interface AiDetailedReviewItem {
  question_number: string;
  status: "correct" | "partially_correct" | "incorrect";
  student_answer?: string;
  correct_answer?: string;
  feedback: string;
}

/**
 * Cấu trúc JSON phản hồi từ AI (`homework_submissions.ai_raw_response`)
 * - Đồng bộ 100% theo API AI chấm bài thật nhưng chuẩn hóa tên trường sang snake_case
 */
export interface AiRawResponseData {
  readable?: boolean;
  unreadable_reason?: string | null;
  transcribed_text?: string;
  uncertainties?: string[];
  suggested_revision?: string;
  overall_comment?: string;
  strengths?: string[];
  weaknesses?: string[];
  suggestions?: string[];
  detailed_reviews?: AiDetailedReviewItem[];
}

/**
 * Bản ghi Bài nộp đầy đủ trong Studio Duyệt Bài Tập
 * - Kết hợp `public.homework_submissions` + `users` (học sinh & người duyệt) + `missions` (bài tập) + `ai_submission_errors`
 */
export interface TeacherGradingSubmissionItem {
  // --- Cột gốc `public.homework_submissions` ---
  id: string;
  attempt_number: number;
  mission_id: string;
  student_id: string;
  submission_type: MissionSubmissionType;
  is_late: boolean;
  proof_image_urls: string[]; // Từ 1 đến 5 tấm ảnh minh chứng
  readable: boolean;
  unreadable_reason: string | null;
  ai_raw_response: AiRawResponseData | null;
  ai_score: number | null;
  correct_count: number | null;
  total_questions: number | null;
  ai_suggested_coins: number;
  final_coins: number | null;
  final_score: number | null;
  teacher_feedback: string | null;
  approval_status: SubmissionApprovalStatus;
  reviewed_by: string | null;
  reviewed_by_name?: string | null;
  reviewed_at: string | null;
  cancelled_at?: string | null;
  is_media_purged: boolean;
  media_purged_at: string | null;
  created_at: string;

  // --- Thông tin Học sinh (JOIN `public.users`) ---
  student_name: string;
  student_avatar: string | null;
  student_phone: string | null;

  // --- Thông tin Bài tập (JOIN `public.missions`) ---
  mission_title: string;
  mission_description: string | null;
  min_reward_coins: number;
  max_reward_coins: number;
  mission_due_at: string;
  allow_late_submission: boolean;
  grading_focus: AiGradingErrorType[] | null;

  // --- Danh sách lỗi AI bóc tách (`public.ai_submission_errors`) ---
  errors: GradingSubmissionErrorItem[];
}

/**
 * Thông tin tổng hợp một Bài tập trên Màn hình Tổng quan Duyệt bài (Assignment Overview Hub)
 * - Khớp trực tiếp bảng `missions` + thống kê từ `student_missions` & `homework_submissions`
 */
export interface MissionSubmissionSummary {
  id: string;
  title: string;
  description: string | null;
  due_at: string;
  min_reward_coins: number;
  max_reward_coins: number;
  submission_type: MissionSubmissionType;
  allow_late_submission: boolean;
  grading_focus: AiGradingErrorType[] | null;
  total_students: number;
  submitted_count: number;
  pending_count: number;
  approved_count: number;
  rejected_count: number;
  exempt_count?: number;
  is_expired?: boolean;
}

/**
 * Từng học sinh trong danh sách Học sinh của Bài tập (Bao gồm cả Đã nộp và Chưa nộp)
 * - Nguồn dữ liệu: `student_missions` (bỏ qua `exempt`) LEFT JOIN lần nộp mới nhất (không `cancelled`) của `homework_submissions`
 */
export interface StudentRosterItem {
  id: string;
  student_id: string;
  student_name: string;
  student_avatar: string | null;
  student_phone: string | null;
  submission_id: string | null;
  attempt_number: number;
  has_submitted: boolean;
  submitted_at: string | null;
  is_late: boolean;
  proof_image_count: number;
  correct_count?: number | null;
  total_questions?: number | null;
  error_count?: number;
  ai_score: number | null;
  approval_status: SubmissionApprovalStatus | "unsubmitted";
  ai_suggested_coins?: number | null;
  final_coins: number | null;
  final_score: number | null;
  readable: boolean;
  teacher_feedback?: string | null;
  reviewed_by?: string | null;
  reviewed_by_name?: string | null;
  reviewed_at?: string | null;
}

/**
 * Chế độ hiển thị trong màn hình Chi tiết Bài tập
 * - `studio`: Không gian chấm bài tập trung của một học sinh (Soi ảnh - AI & Form cô giáo)
 * - `roster`: Danh sách tổng hợp toàn bộ học sinh lớp đối với bài tập này
 */
export type MissionDetailViewMode = "studio" | "roster";

/**
 * Bộ lọc trạng thái duyệt bài trên Student Roster
 */
export type SubmissionStatusFilter =
  | SubmissionApprovalStatus
  | "all"
  | "unsubmitted";
