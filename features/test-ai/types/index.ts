export interface AiConfig {
  apiUrl: string;
  apiKey: string;
  model: string;
  sendFormat: "formData" | "base64";
  prompt: string;
  useMockFallback: boolean;
  thinkingMode?: "off" | "low" | "high";
}

export interface CompressionStats {
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  originalWidth: number;
  originalHeight: number;
  compressedWidth: number;
  compressedHeight: number;
  qualityUsed: number;
  timeTakenMs: number;
}

export interface SubmissionImageItem {
  id: string;
  originalFile: File;
  compressedFile: File;
  previewUrl: string;
  stats: CompressionStats;
  isCompressing?: boolean;
}

export type CoinRewardMode = "platform_proof" | "subjective_writing";

export interface PlatformProofCoinPolicy {
  fullScoreCoins: number; // Xu nếu đúng hết (ví dụ: 50 xu cho 20/20)
  partialScoreCoins: number; // Xu nếu có câu sai (ví dụ: 20 xu cho 16/20)
}

export interface SubjectiveWritingCoinPolicy {
  minCoins: number; // Xu tối thiểu đề xuất (ví dụ: 30 xu)
  maxCoins: number; // Xu tối đa đề xuất (ví dụ: 80 xu)
  requireTeacherReview: boolean; // Cần giáo viên double-check
}

export interface HomeworkSubmissionData {
  homeworkTitle: string;
  subject: string; // Mặc định: "Tiếng Anh"
  teacherAssignment: string; // Đề bài / Yêu cầu cô giáo giao
  studentNote: string;
  images: SubmissionImageItem[];

  // Cấu hình của cô giáo:
  coinRewardMode: CoinRewardMode;
  platformProofCoins: PlatformProofCoinPolicy;
  subjectiveCoins: SubjectiveWritingCoinPolicy;
  gradingFocus: string[]; // Mục đích chấm bài (ngữ pháp, chính tả, từ vựng...)
  gradingFocusCustom?: string;

  // Hỗ trợ tương thích nếu cần
  originalFile?: File | null;
  compressedFile?: File | null;
  previewUrl?: string | null;
}

export interface AiGradingDetail {
  questionNumber: string;
  status: "correct" | "partially_correct" | "incorrect";
  studentAnswer?: string;
  correctAnswer?: string;
  feedback: string;
}

export interface AiGradingErrorItem {
  line: number;
  studentText: string;
  correction: string;
  type: "spelling" | "grammar" | "punctuation" | "vocab" | "content";
  severity: "minor" | "major";
  explanation: string;
}

export interface AiGradingResult {
  score: number; // Thang điểm 10 (tính bằng computeScore từ errors)
  totalQuestions: number;
  correctCount: number;
  coinReward: number; // Xu thưởng đạt được (tính bằng computeCoin)
  coinRewardMode?: CoinRewardMode;
  needsTeacherReview?: boolean; // Cần cô giáo duyệt lại (với bài tự luận/đoạn văn)
  coinSuggestionRange?: string; // Ví dụ: "30 - 80 xu"

  // Chuẩn định dạng chấm bài mới:
  readable?: boolean;
  unreadableReason?: string | null;
  transcribedText?: string;
  uncertainties?: string[];
  errors?: AiGradingErrorItem[];

  // Phiên bản viết lại chuẩn mực, sửa lỗi và nâng cấp câu
  suggestedRevision?: string;

  overallComment: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  detailedReviews: AiGradingDetail[];
  gradedAt: string;
  _meta?: {
    attempt?: number;
    ms?: number;
    usage?: any;
    model?: string;
  };
}

