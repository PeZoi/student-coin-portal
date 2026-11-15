import {
  MissionSubmissionType,
  MissionIconType,
  SubmissionApprovalStatus,
  AiGradingErrorType,
} from "@/features/mission-management/types";

export type {
  MissionSubmissionType,
  MissionIconType,
  SubmissionApprovalStatus,
  AiGradingErrorType,
};

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
  mission_icon_type: MissionIconType | null;
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
 * Bộ lọc trạng thái duyệt bài trên Studio Toolbar
 */
export type SubmissionStatusFilter =
  | "pending_approval"
  | "approved"
  | "rejected"
  | "all";
