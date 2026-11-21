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
 * Mã môn học để phân loại và gắn màu sắc nhận diện
 */
export type SubmissionSubjectCode =
  | "math"
  | "vietnamese"
  | "english"
  | "skills"
  | "science"
  | "other";

/**
 * Metadata hiển thị cho từng môn học
 */
export interface SubmissionSubjectMeta {
  code: SubmissionSubjectCode;
  label: string;
  badgeClass: string;
  bgLightClass: string;
  textClass: string;
  borderClass: string;
}

/**
 * Chi tiết lỗi sai do AI phát hiện (Khớp bảng `public.ai_submission_errors`)
 * - Bổ sung `page_index` (thứ tự trang ảnh từ 1..5) để giáo viên bấm vào lỗi là nhảy tới đúng tấm ảnh đó
 */
export interface GradingSubmissionErrorItem {
  id: string;
  submission_id: string;
  page_index: number; // Trang ảnh số mấy (1 - 5)
  line_number: number | null;
  student_text: string;
  correction_text: string;
  error_type: AiGradingErrorType;
  severity: "minor" | "major";
  explanation: string | null;
}

/**
 * Cấu trúc JSON phản hồi từ AI (`homework_submissions.ai_raw_response`)
 */
export interface AiRawResponseData {
  ocr_transcript?: string;
  summary_comment?: string;
  strengths?: string[];
  improvements?: string[];
  confidence_score?: number;
}

/**
 * Bản ghi Bài nộp đầy đủ trong Studio Duyệt Bài Tập
 * - Kết hợp `public.homework_submissions` + `users` (học sinh) + `missions` (bài tập) + `ai_submission_errors`
 */
export interface TeacherGradingSubmissionItem {
  // --- Cột gốc `public.homework_submissions` ---
  id: string;
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
  teacher_feedback: string | null;
  approval_status: SubmissionApprovalStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;

  // --- Thông tin Học sinh (JOIN `public.users`) ---
  student_name: string;
  student_avatar: string | null;
  student_phone: string | null;

  // --- Thông tin Bài tập (JOIN `public.missions`) ---
  mission_title: string;
  mission_description: string;
  min_reward_coins: number;
  max_reward_coins: number;
  mission_due_at: string;

  // --- Danh sách lỗi AI bóc tách (`public.ai_submission_errors`) ---
  errors: GradingSubmissionErrorItem[];
}

/**
 * Bài tập rút gọn dùng cho bộ lọc Dropdown trên thanh công cụ Duyệt bài
 */
export interface SubmissionMissionFilterOption {
  id: string;
  title: string;
  pending_count: number;
  total_submitted: number;
}

/**
 * Thông tin tổng hợp một Bài tập trên Màn hình Tổng quan Duyệt bài (Assignment Overview Hub)
 * - Tập trung các chỉ số học sinh liên quan đến bài tập đó
 */
export interface MissionSubmissionSummary {
  id: string;
  title: string;
  description: string;
  subject: string;
  subject_code: SubmissionSubjectCode;
  class_name: string;
  due_at: string;
  min_reward_coins: number;
  max_reward_coins: number;
  submission_type: MissionSubmissionType;
  total_students: number;
  submitted_count: number;
  pending_count: number;
  approved_count: number;
  rejected_count: number;
  ai_average_score: number | null;
  ai_high_confidence_count: number;
  has_unreadable_warning: boolean;
  is_expired?: boolean;
  recent_students: {
    student_id: string;
    student_name: string;
    student_avatar: string | null;
    status: SubmissionApprovalStatus;
  }[];
}

/**
 * Từng học sinh trong danh sách Học sinh của Bài tập (Bao gồm cả Đã nộp và Chưa nộp)
 */
export interface StudentRosterItem {
  id: string;
  student_id: string;
  student_name: string;
  student_avatar: string | null;
  student_phone: string | null;
  class_name: string;
  submission_id: string | null;
  has_submitted: boolean;
  submitted_at: string | null;
  is_late: boolean;
  proof_image_count: number;
  ai_score: number | null;
  ai_summary: string | null;
  approval_status: SubmissionApprovalStatus | "unsubmitted";
  final_coins: number | null;
  readable: boolean;
}

/**
 * Chế độ hiển thị trong màn hình Chi tiết Bài tập
 * - `studio`: Không gian 3 cột chấm nhanh liên tục (Danh sách học sinh - Soi ảnh - AI & Chấm điểm)
 * - `roster`: Danh sách tổng hợp toàn bộ học sinh lớp đối với bài tập này
 */
export type MissionDetailViewMode = "studio" | "roster";

/**
 * Bộ lọc trạng thái duyệt bài trên Studio Toolbar & Roster
 */
export type SubmissionStatusFilter =
  | SubmissionApprovalStatus
  | "all"
  | "unsubmitted";
