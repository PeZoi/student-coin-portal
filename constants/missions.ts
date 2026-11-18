/**
 * ==============================================================================
 * MISSIONS CONSTANTS & ENUMS
 * - Định nghĩa tập trung các hằng số, trạng thái và quy chuẩn nhiệm vụ
 * - Đồng bộ 100% với Postgres ENUM trong CSDL:
 *   + student_mission_status
 *   + submission_approval_status
 *   + mission_submission_type
 * - Tuyệt đối không hardcode chuỗi bừa bãi (Magic Strings)
 * ==============================================================================
 */

/**
 * 1. Trạng thái phân bổ & làm bài của từng học sinh (student_missions.status)
 */
export const StudentMissionStatus = {
  /** Đã giao bài (Học sinh chưa nộp bài, đang làm) */
  ASSIGNED: "assigned",
  /** Đã nộp bài (Đang chờ cô giáo hoặc AI chấm điểm) */
  SUBMITTED: "submitted",
  /** Đã hoàn thành (Cô giáo đã duyệt và cộng xu thưởng) */
  APPROVED: "approved",
  /** Cần làm lại / Từ chối (Bài nộp không đạt, yêu cầu chụp lại) */
  REJECTED: "rejected",
  /** Miễn làm bài (Học sinh vào lớp sau khi bài hết hạn hoặc có lý do đặc biệt) */
  EXEMPT: "exempt",
} as const;

export type StudentMissionStatusType =
  (typeof StudentMissionStatus)[keyof typeof StudentMissionStatus];
export type StudentMissionStatus = StudentMissionStatusType;

/** Mảng chứa toàn bộ 5 trạng thái hợp lệ của tiến độ bài tập học sinh */
export const ALL_STUDENT_MISSION_STATUSES: readonly StudentMissionStatusType[] = [
  StudentMissionStatus.ASSIGNED,
  StudentMissionStatus.SUBMITTED,
  StudentMissionStatus.APPROVED,
  StudentMissionStatus.REJECTED,
  StudentMissionStatus.EXEMPT,
] as const;

/**
 * Các trạng thái thể hiện học sinh ĐÃ LÀM BÀI
 * (Bao gồm: Đã nộp chờ chấm, Đã hoàn thành được duyệt, hoặc Bị yêu cầu sửa lại)
 */
export const DONE_OR_SUBMITTED_MISSION_STATUSES: readonly StudentMissionStatusType[] = [
  StudentMissionStatus.SUBMITTED,
  StudentMissionStatus.APPROVED,
  StudentMissionStatus.REJECTED,
] as const;

/**
 * Helper kiểm tra xem trạng thái của học sinh có được tính là ĐÃ LÀM BÀI hay không
 */
export function isMissionDoneOrSubmitted(status: string | null | undefined): boolean {
  if (!status) return false;
  return DONE_OR_SUBMITTED_MISSION_STATUSES.includes(status as StudentMissionStatusType);
}

/**
 * Helper kiểm tra học sinh có được miễn làm hay không
 */
export function isMissionExempt(status: string | null | undefined): boolean {
  return status === StudentMissionStatus.EXEMPT;
}

/**
 * Helper kiểm tra bài tập đã được duyệt hoàn thành nhận xu hay chưa
 */
export function isMissionApproved(status: string | null | undefined): boolean {
  return status === StudentMissionStatus.APPROVED;
}

/**
 * Helper kiểm tra bài tập có đang chờ chấm hay không
 */
export function isMissionSubmitted(status: string | null | undefined): boolean {
  return status === StudentMissionStatus.SUBMITTED;
}

/** Nhãn hiển thị tiếng Việt chính thức cho từng trạng thái tiến độ bài tập học sinh */
export const STUDENT_MISSION_STATUS_LABELS: Record<StudentMissionStatusType, string> = {
  [StudentMissionStatus.ASSIGNED]: "Chưa nộp bài",
  [StudentMissionStatus.SUBMITTED]: "Chờ cô chấm",
  [StudentMissionStatus.APPROVED]: "Đã hoàn thành",
  [StudentMissionStatus.REJECTED]: "Cần sửa lại",
  [StudentMissionStatus.EXEMPT]: "Miễn làm",
};

/**
 * 2. Trạng thái duyệt bài nộp của Giáo viên / Hệ thống (homework_submissions.approval_status)
 */
export const SubmissionApprovalStatus = {
  /** Chờ cô giáo duyệt bài */
  PENDING_APPROVAL: "pending_approval",
  /** Đã duyệt bài và cộng xu thưởng */
  APPROVED: "approved",
  /** Từ chối bài nộp (cần làm lại) */
  REJECTED: "rejected",
  /** Học sinh tự hủy bài nộp trước hạn để nộp lại */
  CANCELLED: "cancelled",
} as const;

export type SubmissionApprovalStatusType =
  (typeof SubmissionApprovalStatus)[keyof typeof SubmissionApprovalStatus];
export type SubmissionApprovalStatus = SubmissionApprovalStatusType;

/** Mảng chứa toàn bộ 4 trạng thái duyệt bài nộp */
export const ALL_SUBMISSION_APPROVAL_STATUSES: readonly SubmissionApprovalStatusType[] = [
  SubmissionApprovalStatus.PENDING_APPROVAL,
  SubmissionApprovalStatus.APPROVED,
  SubmissionApprovalStatus.REJECTED,
  SubmissionApprovalStatus.CANCELLED,
] as const;

/** Nhãn hiển thị tiếng Việt chính thức cho trạng thái duyệt bài */
export const SUBMISSION_APPROVAL_STATUS_LABELS: Record<SubmissionApprovalStatusType, string> = {
  [SubmissionApprovalStatus.PENDING_APPROVAL]: "Chờ cô duyệt",
  [SubmissionApprovalStatus.APPROVED]: "Đã duyệt bài",
  [SubmissionApprovalStatus.REJECTED]: "Cần làm lại",
  [SubmissionApprovalStatus.CANCELLED]: "Đã hủy bài",
};

/**
 * 3. Hình thức làm bài tập (missions.submission_type & homework_submissions.submission_type)
 */
export const MissionSubmissionType = {
  /** Chụp ảnh màn hình minh chứng hoàn thành trên ứng dụng (Olm, Duolingo, v.v.) */
  PLATFORM_PROOF: "platform_proof",
  /** Viết bài văn, đoạn văn tự luận hoặc giải toán chụp ảnh */
  SUBJECTIVE_WRITING: "subjective_writing",
} as const;

export type MissionSubmissionTypeValue =
  (typeof MissionSubmissionType)[keyof typeof MissionSubmissionType];
export type MissionSubmissionType = MissionSubmissionTypeValue;

export const ALL_MISSION_SUBMISSION_TYPES: readonly MissionSubmissionTypeValue[] = [
  MissionSubmissionType.PLATFORM_PROOF,
  MissionSubmissionType.SUBJECTIVE_WRITING,
] as const;

export const MISSION_SUBMISSION_TYPE_LABELS: Record<MissionSubmissionTypeValue, string> = {
  [MissionSubmissionType.PLATFORM_PROOF]: "Chụp ảnh màn hình ứng dụng",
  [MissionSubmissionType.SUBJECTIVE_WRITING]: "Viết bài tự luận",
};

/**
 * 4. Độ khó bài tập (Mission Difficulty)
 */
export const MissionDifficulty = {
  EASY: "easy",
  MEDIUM: "medium",
  HARD: "hard",
} as const;

export type MissionDifficultyType =
  (typeof MissionDifficulty)[keyof typeof MissionDifficulty];

/**
 * Trạng thái bài tập phía học sinh (Portal Client Filter Tabs)
 */
export const MissionStatus = {
  PENDING: "pending",
  COMPLETED: "completed",
  OVERDUE: "overdue",
} as const;

export type MissionStatusType =
  (typeof MissionStatus)[keyof typeof MissionStatus];

export const MissionFilterTab = {
  ALL: "all",
  PENDING: "pending",
  COMPLETED: "completed",
  OVERDUE: "overdue",
} as const;

export type MissionFilterTabType =
  (typeof MissionFilterTab)[keyof typeof MissionFilterTab];

/**
 * Cấu hình tải file bằng chứng nộp bài của học sinh
 */
export const MissionUploadConfig = {
  MAX_FILE_SIZE_MB: 5,
  MAX_FILE_SIZE_BYTES: 5 * 1024 * 1024,
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp"],
} as const;

/**
 * 5. Tiêu chí bắt lỗi của AI (ai_submission_errors.error_type & missions.grading_focus)
 */
export const AiGradingErrorType = {
  /** Lỗi chính tả (Chữ cái, thiếu nét, viết sai từ) */
  SPELLING: "spelling",
  /** Lỗi ngữ pháp (Chia thì, số ít/nhiều, cấu trúc câu) */
  GRAMMAR: "grammar",
  /** Lỗi từ vựng (Dùng sai ngữ cảnh hoặc chủ đề) */
  VOCAB: "vocab",
  /** Lỗi dấu câu & viết hoa (Chấm câu, viết hoa đầu câu, danh từ riêng) */
  PUNCTUATION: "punctuation",
  /** Đúng yêu cầu đề bài (Đủ số câu, đúng đề tài) */
  CONTENT: "content",
} as const;

export type AiGradingErrorType =
  (typeof AiGradingErrorType)[keyof typeof AiGradingErrorType];
export type AiGradingErrorTypeValue = AiGradingErrorType;

export const ALL_AI_GRADING_ERROR_TYPES: readonly AiGradingErrorType[] = [
  AiGradingErrorType.SPELLING,
  AiGradingErrorType.GRAMMAR,
  AiGradingErrorType.VOCAB,
  AiGradingErrorType.PUNCTUATION,
  AiGradingErrorType.CONTENT,
] as const;

/** Tiêu chí chấm lỗi mặc định khi tạo mới bài tập */
export const DEFAULT_GRADING_FOCUS: readonly AiGradingErrorType[] = [
  AiGradingErrorType.SPELLING,
  AiGradingErrorType.GRAMMAR,
] as const;

export const AI_GRADING_ERROR_TYPE_LABELS: Record<AiGradingErrorType, string> = {
  [AiGradingErrorType.SPELLING]: "Chính tả (Spelling)",
  [AiGradingErrorType.GRAMMAR]: "Ngữ pháp (Grammar)",
  [AiGradingErrorType.VOCAB]: "Từ vựng (Vocabulary)",
  [AiGradingErrorType.PUNCTUATION]: "Dấu câu & Viết hoa",
  [AiGradingErrorType.CONTENT]: "Đúng yêu cầu đề bài",
};

/**
 * 6. Mức độ nghiêm trọng của lỗi do AI chấm (ai_submission_errors.severity)
 */
export const AiGradingSeverity = {
  MINOR: "minor",
  MAJOR: "major",
} as const;

export type AiGradingSeverity =
  (typeof AiGradingSeverity)[keyof typeof AiGradingSeverity];
export type AiGradingSeverityValue = AiGradingSeverity;

export const ALL_AI_GRADING_SEVERITIES: readonly AiGradingSeverity[] = [
  AiGradingSeverity.MINOR,
  AiGradingSeverity.MAJOR,
] as const;

export const AI_GRADING_SEVERITY_LABELS: Record<AiGradingSeverity, string> = {
  [AiGradingSeverity.MINOR]: "Lỗi nhẹ",
  [AiGradingSeverity.MAJOR]: "Lỗi nghiêm trọng",
};

/**
 * 7. Cấu hình mặc định khi tạo mới bài tập
 */
export const DEFAULT_MISSION_FORM_VALUES = {
  MIN_REWARD_COINS: 20,
  MAX_REWARD_COINS: 40,
  ALLOW_LATE_SUBMISSION: true,
  IS_ACTIVE: true,
  SUBMISSION_TYPE: MissionSubmissionType.SUBJECTIVE_WRITING,
  DEFAULT_GRADING_FOCUS,
} as const;

