import { AiGradingErrorType } from "@/constants";

/**
 * ==============================================================================
 * CẤU HÌNH TẬP TRUNG PHÂN HỆ DUYỆT BÀI TẬP (ZERO HARDCODE)
 * - Mọi ngưỡng điểm, giới hạn xu, câu nhận xét mặc định và đường dẫn ảnh đều quản lý tại đây
 * ==============================================================================
 */
export const SUBMISSION_GRADING_CONFIG = {
  /** Chỉ hiển thị các bài tập còn hạn hoặc đã quá hạn trong vòng N ngày trên trang Tổng quan */
  OVERVIEW_EXPIRED_WINDOW_DAYS: 7,
  /** Ngưỡng điểm AI tối thiểu để đủ điều kiện "Duyệt nhanh bài hợp lệ" */
  VALID_AI_BATCH_APPROVE_MIN_SCORE: 8.0,
  /** Điểm tối thiểu / tối đa thang 10 */
  MIN_SCORE: 0,
  MAX_SCORE: 10,
  SCORE_STEP: 0.1,
  /** Các mức điểm chọn nhanh trong bảng chấm bài */
  SCORE_PRESETS: [10, 9.5, 9, 8.5] as readonly number[],
  /** Giới hạn xu thưởng thủ công */
  MIN_COINS: 0,
  MAX_MANUAL_COINS: 500,
  /** Bước cộng thêm xu khích lệ & mức vượt trần tối đa cho phép */
  BONUS_STEP_COINS: 5,
  MAX_BONUS_OVER_CAP: 10,
  /** Số câu hỏi tối đa cho input chỉnh sửa số câu đúng/tổng số câu */
  MAX_QUESTION_COUNT: 999,
  /** Nhãn mặc định khi không có tên giáo viên duyệt */
  DEFAULT_REVIEWER_NAME: "Giáo viên",
  /** Lời phê mặc định khi duyệt 1 bài nếu cô không nhập */
  DEFAULT_APPROVE_FEEDBACK:
    "Cô đã kiểm tra bài làm, con hoàn thành rất tốt! 🌟",
  /** Lý do mặc định khi yêu cầu học sinh nộp lại nếu cô không nhập */
  DEFAULT_REJECT_FEEDBACK:
    "Ảnh bài làm chưa rõ hoặc chưa đủ yêu cầu, con kiểm tra và nộp lại giúp cô nhé!",
  /** Lời phê mặc định khi duyệt nhanh hàng loạt */
  DEFAULT_BATCH_APPROVE_FEEDBACK:
    "Bài làm đạt chuẩn, cô duyệt thưởng xu theo đề xuất của AI! 🌟",
} as const;

/**
 * Đường dẫn tài nguyên hình ảnh dùng trong phân hệ Duyệt bài tập
 */
export const SUBMISSION_MEDIA_PATHS = {
  PLATFORM_PROOF_THUMBNAIL: "/submissions/capture.webp",
  SUBJECTIVE_WRITING_THUMBNAIL: "/submissions/write.webp",
  COIN_ICON: "/coin.webp",
  FALLBACK_PROOF_IMAGE: "/book/book.svg",
} as const;

/**
 * Cấu hình nhãn & màu sắc cho từng loại lỗi AI phát hiện (`ai_submission_errors.error_type`)
 */
export const AI_ERROR_TYPE_META: Record<
  AiGradingErrorType,
  { label: string; badgeClass: string }
> = {
  [AiGradingErrorType.GRAMMAR]: {
    label: "Ngữ pháp",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
  },
  [AiGradingErrorType.SPELLING]: {
    label: "Chính tả",
    badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
  },
  [AiGradingErrorType.VOCAB]: {
    label: "Từ vựng",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
  },
  [AiGradingErrorType.PUNCTUATION]: {
    label: "Dấu câu",
    badgeClass: "bg-sky-50 text-sky-700 border-sky-200",
  },
  [AiGradingErrorType.CONTENT]: {
    label: "Nội dung",
    badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
};

/**
 * Gợi ý nhận xét nhanh 1-click dành cho Giáo viên khi duyệt bài
 */
export const QUICK_TEACHER_FEEDBACKS: readonly string[] = [
  "Chữ viết rất nắn nót, trình bày vở sạch đẹp! Cô khen con nhé 🌟",
  "Bài làm đúng yêu cầu, con chú ý ôn lại các lỗi ngữ pháp AI đã gạch chân nhé.",
  "Vốn từ vựng phong phú, đặt câu tự nhiên và sáng tạo!",
  "Hoàn thành xuất sắc 100% câu hỏi, tiếp tục phát huy nhé con!",
];

/**
 * Gợi ý lý do yêu cầu học sinh làm lại / chụp lại bài (`rejected`)
 */
export const QUICK_REJECT_REASONS: readonly string[] = [
  "Ảnh chụp bị mờ và thiếu ánh sáng, con chụp lại rõ nét dưới ánh đèn nhé!",
  "Con chụp thiếu trang vở bài làm, vui lòng chụp đủ các trang và nộp lại.",
  "Ảnh chụp bị ngược/nghiêng mất góc chữ, con chụp thẳng trang vở giúp cô nhé.",
  "Bài làm chưa đúng yêu cầu đề bài, con đọc kỹ hướng dẫn rồi viết lại nhé.",
];
