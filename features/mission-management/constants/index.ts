import {
  MissionQuickTemplate,
  MissionSubmissionType,
  AiGradingErrorType,
} from "../types";

export const DEFAULT_MISSION_PAGE_SIZE = 10;

/**
 * Hằng số đường dẫn hình ảnh icon theo hình thức nộp bài
 */
export const SUBMISSION_ICON_PATHS = {
  WRITE: "/submissions/write.webp",
  CAPTURE: "/submissions/capture.webp",
} as const;

export interface SubmissionTypeConfigItem {
  type: MissionSubmissionType;
  label: string;
  description: string;
  iconSrc: string;
  bgClass: string;
  borderClass: string;
}

/**
 * Cấu hình hiển thị theo hình thức nộp bài (`missions.submission_type`)
 */
export const SUBMISSION_TYPE_OPTIONS: SubmissionTypeConfigItem[] = [
  {
    type: "subjective_writing",
    label: "Vở viết tay (AI chấm)",
    description: "Học sinh viết vào vở ô ly, AI tự động quét lỗi & giáo viên duyệt",
    iconSrc: SUBMISSION_ICON_PATHS.WRITE,
    bgClass: "bg-purple-50",
    borderClass: "border-purple-200",
  },
  {
    type: "platform_proof",
    label: "Chụp ảnh minh chứng",
    description: "Ảnh chụp màn hình điểm số Quizizz, Wordwall, Azota, Kahoot...",
    iconSrc: SUBMISSION_ICON_PATHS.CAPTURE,
    bgClass: "bg-sky-50",
    borderClass: "border-sky-200",
  },
];

export const SUBMISSION_TYPE_CONFIG: Record<
  MissionSubmissionType,
  SubmissionTypeConfigItem
> = {
  subjective_writing: SUBMISSION_TYPE_OPTIONS[0],
  platform_proof: SUBMISSION_TYPE_OPTIONS[1],
};

/**
 * Các tiêu chí trọng tâm AI chấm lỗi (Khớp `ai_submission_errors.error_type`)
 */
export const AI_GRADING_FOCUS_OPTIONS: {
  id: AiGradingErrorType;
  label: string;
  desc: string;
}[] = [
  {
    id: "spelling",
    label: "Chính tả (Spelling)",
    desc: "Phát hiện viết sai chữ cái, thiếu nét, nhầm từ",
  },
  {
    id: "grammar",
    label: "Ngữ pháp (Grammar)",
    desc: "Chia động từ, số ít/số nhiều, cấu trúc câu",
  },
  {
    id: "vocab",
    label: "Từ vựng (Vocabulary)",
    desc: "Dùng từ đúng ngữ cảnh và chủ đề bài học",
  },
  {
    id: "punctuation",
    label: "Dấu câu & Viết hoa",
    desc: "Chấm câu, viết hoa đầu câu và tên riêng",
  },
  {
    id: "content",
    label: "Đúng yêu cầu đề bài",
    desc: "Đảm bảo đủ số câu và sát với đề bài cô giao",
  },
];

/**
 * Mẫu bài tập tạo nhanh (1-Click Quick Templates) dành cho Giáo viên
 */
export const MISSION_QUICK_TEMPLATES: MissionQuickTemplate[] = [
  {
    id: "tpl-quizizz",
    label: "Trắc nghiệm Quizizz / Wordwall",
    badge: "+20 ~ 40 xu",
    values: {
      title: "Hoàn thành bài tập Quizizz Unit 6 & chụp màn hình điểm",
      description:
        "Các con bấm vào link Quizizz cô gửi trong nhóm lớp, hoàn thành đủ 20 câu hỏi và chụp ảnh màn hình kết quả cuối cùng tải lên nhé!",
      submission_type: "platform_proof",
      min_reward_coins: 20,
      max_reward_coins: 40,
      grading_focus: ["content"],
      custom_ai_prompt:
        "Đọc chính xác tỷ lệ số câu đúng trên tổng số câu hiển thị trong ảnh chụp màn hình.",
      allow_late_submission: true,
      ai_prompt_template_id: null,
    },
  },
  {
    id: "tpl-writing",
    label: "Viết đoạn văn Tiếng Anh vào vở",
    badge: "+30 ~ 60 xu",
    values: {
      title: "Viết đoạn văn ngắn (5-7 câu) giới thiệu gia đình em",
      description:
        "Viết tay rõ ràng vào vở ô ly từ 5 đến 7 câu tiếng Anh giới thiệu các thành viên trong gia đình, sau đó chụp ảnh trang vở thật rõ nét để nộp bài.",
      submission_type: "subjective_writing",
      min_reward_coins: 30,
      max_reward_coins: 60,
      grading_focus: ["spelling", "grammar", "vocab", "punctuation"],
      custom_ai_prompt:
        "Chấm nhẹ tay với học sinh tiểu học, khen ngợi các câu có mở rộng ý và giải thích lỗi ngữ pháp bằng tiếng Việt thật dễ hiểu.",
      allow_late_submission: true,
      ai_prompt_template_id: null,
    },
  },
  {
    id: "tpl-trans-envi",
    label: "Học từ vựng & Dịch Anh ➔ Việt",
    badge: "+25 ~ 50 xu",
    values: {
      title: "Chép từ vựng Unit 6 & Dịch bài đọc Anh ➔ Việt",
      description:
        "Chép mỗi từ vựng mới 2 dòng vào vở và dịch đoạn hội thoại trang 42 từ tiếng Anh sang tiếng Việt.",
      submission_type: "subjective_writing",
      min_reward_coins: 25,
      max_reward_coins: 50,
      grading_focus: ["spelling", "vocab", "content"],
      custom_ai_prompt:
        "Kiểm tra xem học sinh có dịch đủ các câu trong bài hội thoại và viết đúng chính tả từ vựng tiếng Anh hay không.",
      allow_late_submission: true,
      ai_prompt_template_id: null,
    },
  },
  {
    id: "tpl-trans-vien",
    label: "Thử thách Dịch Việt ➔ Anh",
    badge: "+50 ~ 100 xu",
    values: {
      title: "Dịch 8 câu mẫu Việt ➔ Anh vận dụng thì Hiện tại tiếp diễn",
      description:
        "Các con đọc kỹ 8 câu tiếng Việt cô giao và dịch sang tiếng Anh vào vở, chú ý cấu trúc am/is/are + V-ing nhé!",
      submission_type: "subjective_writing",
      min_reward_coins: 50,
      max_reward_coins: 100,
      grading_focus: ["grammar", "spelling", "vocab", "punctuation"],
      custom_ai_prompt:
        "Tập trung bắt lỗi thiếu động từ to-be (am/is/are) hoặc chia sai đuôi -ing của động từ.",
      allow_late_submission: false,
      ai_prompt_template_id: null,
    },
  },
];
