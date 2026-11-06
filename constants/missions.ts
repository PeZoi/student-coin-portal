/**
 * ==============================================================================
 * MISSIONS CONSTANTS
 * - Định nghĩa tập trung các hằng số, trạng thái và quy chuẩn nhiệm vụ
 * ==============================================================================
 */

export const MissionDifficulty = {
  EASY: "easy",
  MEDIUM: "medium",
  HARD: "hard",
} as const;

export type MissionDifficultyType =
  (typeof MissionDifficulty)[keyof typeof MissionDifficulty];

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
