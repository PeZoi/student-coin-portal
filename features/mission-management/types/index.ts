/**
 * ==============================================================================
 * MISSION MANAGEMENT TYPES (QUẢN LÝ & GIAO BÀI TẬP CHO HỌC SINH)
 * ==============================================================================
 * Ánh xạ chuẩn 1-1 với thiết kế Cơ sở dữ liệu:
 * - Bảng `public.missions` (Thông tin bài tập, cơ chế nộp, khoảng xu min~max, hạn nộp)
 * - Bảng `public.mission_classes` (Quan hệ N-N phân công bài tập cho nhiều lớp học)
 * - Bảng `public.homework_submissions` (Bài nộp học sinh, điểm AI, trạng thái duyệt)
 * - Bảng `public.ai_submission_errors` (Chi tiết lỗi chính tả/ngữ pháp AI bóc tách)
 *
 * Kèm theo các trường mở rộng sáng tạo (Đề xuất cho DB) để tối ưu hóa AI chấm bài
 * và đồng bộ hiển thị với Sách Bài Tập của Học sinh.
 * ==============================================================================
 */

/**
 * Cơ chế nộp bài & chấm điểm (Cột `missions.submission_type` trong DB):
 * - `platform_proof`: Minh chứng nền tảng khác (Chụp ảnh điểm số Quizizz, Wordwall, Azota, Kahoot...)
 * - `subjective_writing`: Đoạn văn / Tự luận viết tay (Chụp vở viết tay, AI OCR & chấm lỗi, giáo viên duyệt)
 */
export type MissionSubmissionType = "platform_proof" | "subjective_writing";

/**
 * Biểu tượng bài tập theo hình thức nộp bài (Cột `missions.icon_type` trong DB)
 * - `write`: Vở viết tay (/submissions/write.webp) -> Dành cho subjective_writing (AI chấm)
 * - `capture`: Chụp ảnh minh chứng (/submissions/capture.webp) -> Dành cho platform_proof (Quizizz, Wordwall...)
 */
export type MissionIconType =
  | "write"
  | "capture"
  | "notebook"
  | "book-pen"
  | "flags-en-vi"
  | "flags-vi-en";

/**
 * [Đề xuất DB] Độ khó của bài tập (Đồng bộ với giao diện Sách Bài Tập học sinh)
 */
export type MissionDifficulty = "easy" | "medium" | "hard";

/**
 * [Đề xuất DB] Màu chủ đề của thẻ bài tập trên giao diện học sinh
 */
export type MissionThemeColor = "blue" | "purple" | "green" | "orange";

/**
 * [Đề xuất DB] Phân loại nhóm bài tập / môn học giúp giáo viên lọc nhanh
 */
export type MissionCategory =
  | "homework"
  | "vocabulary"
  | "writing"
  | "reading"
  | "habit";

/**
 * Tiêu chí trọng tâm để AI chấm lỗi (Khớp với `ai_submission_errors.error_type` trong DB)
 */
export type AiGradingErrorType =
  | "spelling"
  | "grammar"
  | "vocab"
  | "punctuation"
  | "content";

/**
 * Thông tin lớp học rút gọn được gán cho bài tập (JOIN từ `mission_classes` + `classes`)
 */
export interface MissionAssignedClass {
  id: string;
  class_name: string;
  student_count: number;
}

/**
 * Thực thể Bài tập Quản trị (TeacherMissionItem)
 * Kết hợp dữ liệu gốc từ bảng `public.missions` + thống kê từ `mission_classes` và `homework_submissions`
 */
export interface TeacherMissionItem {
  // --- 1. CÁC CỘT GỐC TRONG BẢNG `public.missions` ---
  id: string;
  title: string;
  description: string;
  submission_type: MissionSubmissionType;
  min_reward_coins: number;
  max_reward_coins: number;
  due_at: string; // ISO 8601 DateTime (TIMESTAMP WITH TIME ZONE)
  created_by: string; // UUID giáo viên tạo
  is_active: boolean;
  is_deleted: boolean;
  deleted_at: string | null;
  deleted_by: string | null;
  updated_by: string | null;
  updated_at: string | null;
  created_at: string;
  grading_focus: AiGradingErrorType[]; // Tiêu chí AI tập trung bắt lỗi (spelling, grammar...)
  allow_late_submission: boolean; // Cho phép nộp sau hạn due_at hay khóa nộp bài
  ai_prompt_template_id: string | null; // Liên kết tới bảng ai_prompt_templates
  custom_ai_prompt: string | null; // Lời dặn / chỉ dẫn riêng của giáo viên dành cho AI khi chấm bài này

  // --- 2. DỮ LIỆU QUAN HỆ & THỐNG KÊ TỔNG HỢP (JOIN / AGGREGATE) ---
  creator_name: string; // JOIN từ `users.full_name`
  assigned_class_ids: string[]; // Từ bảng `mission_classes.class_id`
  assigned_classes: MissionAssignedClass[]; // Chi tiết lớp được giao
  total_students: number; // Tổng sĩ số học sinh thuộc các lớp được giao
  submitted_count: number; // Số học sinh đã nộp (pending_approval + approved)
  pending_review_count: number; // Số bài đang chờ cô giáo duyệt (`approval_status = 'pending_approval'`)
  approved_count: number; // Số bài đã duyệt cộng xu (`approval_status = 'approved'`)
  rejected_count: number; // Số bài yêu cầu làm lại (`approval_status = 'rejected'`)
  late_count: number; // Số bài nộp muộn (`is_late = true`)
  total_coins_awarded: number; // Tổng số xu thực tế đã phát thưởng (`SUM(final_coins)`)
  avg_ai_score: number | null; // Điểm AI chấm trung bình thang 10 (`AVG(ai_score)`)
}

/**
 * Trạng thái duyệt bài nộp (Khớp 100% CHECK constraint `homework_submissions.approval_status`)
 */
export type SubmissionApprovalStatus =
  | "pending_approval"
  | "approved"
  | "rejected"
  | "cancelled";

/**
 * Chi tiết lỗi sai do AI phát hiện (Khớp 100% bảng `public.ai_submission_errors`)
 */
export interface MissionSubmissionErrorItem {
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
 * Bản ghi Bài nộp của Học sinh trong một Bài tập (Khớp 100% bảng `public.homework_submissions`)
 */
export interface MissionSubmissionItem {
  id: string;
  mission_id: string;
  student_id: string;
  student_name: string;
  student_avatar: string | null;
  student_phone: string | null;
  class_id: string;
  class_name: string;
  submission_type: MissionSubmissionType;
  is_late: boolean;
  proof_image_urls: string[];
  readable: boolean;
  unreadable_reason: string | null;
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
  errors?: MissionSubmissionErrorItem[];
}

/**
 * Dữ liệu lớp học khả dụng để phân công bài tập
 */
export interface MissionAvailableClass {
  id: string;
  class_name: string;
  student_count: number;
  is_active: boolean;
}

/**
 * Dữ liệu Form tạo / chỉnh sửa bài tập
 */
export interface MissionFormValues {
  title: string;
  description: string;
  submission_type: MissionSubmissionType;
  min_reward_coins: number;
  max_reward_coins: number;
  due_at: string;
  is_active: boolean;
  assigned_class_ids: string[];
  grading_focus: AiGradingErrorType[];
  custom_ai_prompt: string;
  allow_late_submission: boolean;
  ai_prompt_template_id?: string | null;
}

/**
 * Bộ lọc trạng thái bài tập trên Toolbar
 * - `all`: Tất cả bài tập (trừ thùng rác)
 * - `active`: Đang mở & Còn hạn nộp
 * - `expired`: Đang mở nhưng Đã qua hạn nộp (`due_at < now`)
 * - `inactive`: Đang tạm ẩn / Đóng nhận bài (`is_active = false`)
 * - `deleted`: Trong thùng rác (`is_deleted = true`)
 */
export type MissionStatusFilter =
  | "all"
  | "active"
  | "expired"
  | "inactive"
  | "deleted";

/**
 * Bộ lọc hình thức nộp bài
 */
export type MissionTypeFilter = "all" | MissionSubmissionType;

/**
 * Chế độ hiển thị danh sách bài tập: Bảng (Table) hoặc Thẻ Lưới (Grid)
 */
export type MissionViewMode = "table" | "grid";

/**
 * Trường sắp xếp trong bảng bài tập
 */
export type MissionSortField =
  | "title"
  | "max_reward_coins"
  | "submission_rate"
  | "due_at"
  | "created_at";

export type SortDirection = "asc" | "desc" | "none";

/**
 * Mẫu bài tập gợi ý nhanh (Quick Template) giúp giáo viên tạo bài trong 5 giây
 */
export interface MissionQuickTemplate {
  id: string;
  label: string;
  badge: string;
  values: Omit<MissionFormValues, "due_at" | "assigned_class_ids" | "is_active">;
}

/**
 * Tab lọc trạng thái làm bài trong Modal Tiến độ làm bài
 */
export type MissionProgressFilterTab = "all" | "submitted" | "not_submitted";

/**
 * Bản ghi chi tiết tiến độ làm bài của từng học sinh (ai làm rồi, ai chưa làm)
 */
export interface MissionStudentProgressItem {
  id: string; // ID học sinh
  student_name: string;
  student_avatar: string | null;
  student_phone: string | null;
  class_id: string;
  class_name: string;

  // Trạng thái nộp bài: Đã nộp hoặc Chưa nộp
  submission_status: "submitted" | "not_submitted";

  // Thông tin bài nộp (nếu submission_status === "submitted")
  submission_id?: string;
  submitted_at?: string;
  is_late?: boolean;
  approval_status?: SubmissionApprovalStatus;
  ai_score?: number | null;
  final_coins?: number | null;
  ai_suggested_coins?: number;
  teacher_feedback?: string | null;
  proof_image_urls?: string[];
}

