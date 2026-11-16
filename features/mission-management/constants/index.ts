import {
  TeacherMissionItem,
  MissionAvailableClass,
  MissionSubmissionItem,
  MissionQuickTemplate,
  MissionSubmissionType,
  MissionCategory,
  MissionDifficulty,
  MissionThemeColor,
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
 * Danh sách phân nhóm bài tập (Category)
 */
export const MISSION_CATEGORY_CONFIG: Record<
  MissionCategory,
  { label: string; badgeClass: string }
> = {
  homework: {
    label: "Bài tập về nhà",
    badgeClass: "bg-blue-50 text-[#0A62D6] border-blue-200/80",
  },
  vocabulary: {
    label: "Từ vựng & Dịch",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
  },
  writing: {
    label: "Viết đoạn văn",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200/80",
  },
  reading: {
    label: "Đọc sách",
    badgeClass: "bg-amber-50 text-amber-800 border-amber-200/80",
  },
  habit: {
    label: "Thói quen tốt",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200/80",
  },
};

/**
 * Cấu hình Độ khó bài tập (Difficulty)
 */
export const MISSION_DIFFICULTY_CONFIG: Record<
  MissionDifficulty,
  { label: string; badgeClass: string; dotClass: string }
> = {
  easy: {
    label: "Cơ bản",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    dotClass: "bg-emerald-500",
  },
  medium: {
    label: "Vừa sức",
    badgeClass: "bg-sky-50 text-sky-700 border-sky-200/80",
    dotClass: "bg-sky-500",
  },
  hard: {
    label: "Thử thách",
    badgeClass: "bg-orange-50 text-orange-700 border-orange-200/80",
    dotClass: "bg-orange-500",
  },
};

/**
 * Cấu hình Màu sắc thẻ hiển thị bên trang Học sinh
 */
export const MISSION_THEME_COLOR_CONFIG: Record<
  MissionThemeColor,
  {
    label: string;
    headerBg: string;
    bodyBg: string;
    borderColor: string;
    swatchClass: string;
  }
> = {
  blue: {
    label: "Xanh đại dương",
    headerBg: "bg-[#0091FF]",
    bodyBg: "bg-[#EBF6FF]",
    borderColor: "border-[#0091FF]",
    swatchClass: "bg-[#0091FF]",
  },
  purple: {
    label: "Tím sáng tạo",
    headerBg: "bg-[#9B51E0]",
    bodyBg: "bg-[#F7F0FD]",
    borderColor: "border-[#9B51E0]",
    swatchClass: "bg-[#9B51E0]",
  },
  green: {
    label: "Xanh ngọc lục",
    headerBg: "bg-[#00B074]",
    bodyBg: "bg-[#EAF8F2]",
    borderColor: "border-[#00B074]",
    swatchClass: "bg-[#00B074]",
  },
  orange: {
    label: "Cam năng lượng",
    headerBg: "bg-[#FF5E36]",
    bodyBg: "bg-[#FFF1EB]",
    borderColor: "border-[#FF5E36]",
    swatchClass: "bg-[#FF5E36]",
  },
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
      custom_ai_prompt: "Đọc chính xác tỷ lệ số câu đúng trên tổng số câu hiển thị trong ảnh chụp màn hình.",
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
      custom_ai_prompt: "Chấm nhẹ tay với học sinh tiểu học, khen ngợi các câu có mở rộng ý và giải thích lỗi ngữ pháp bằng tiếng Việt thật dễ hiểu.",
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
      custom_ai_prompt: "Kiểm tra xem học sinh có dịch đủ các câu trong bài hội thoại và viết đúng chính tả từ vựng tiếng Anh hay không.",
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
      custom_ai_prompt: "Tập trung bắt lỗi thiếu động từ to-be (am/is/are) hoặc chia sai đuôi -ing của động từ.",
      allow_late_submission: false,
      ai_prompt_template_id: null,
    },
  },
];

/**
 * Danh sách lớp học mẫu (Khớp bảng `public.classes`)
 */
export const MOCK_AVAILABLE_CLASSES: MissionAvailableClass[] = [
  {
    id: "cls-5a",
    class_name: "Lớp 5A - Ca T2-T4-T6 (17:30)",
    student_count: 24,
    is_active: true,
  },
  {
    id: "cls-5b",
    class_name: "Lớp 5B - Ca T3-T5-T7 (17:30)",
    student_count: 20,
    is_active: true,
  },
  {
    id: "cls-4a",
    class_name: "Lớp 4A - Tiếng Anh Tăng Cường",
    student_count: 18,
    is_active: true,
  },
  {
    id: "cls-3a",
    class_name: "Lớp 3A - Mầm Non Ngữ Pháp",
    student_count: 22,
    is_active: true,
  },
];

/**
 * Danh sách bài tập mẫu (Khớp 100% bảng `public.missions` + `mission_classes` + thống kê `homework_submissions`)
 */
export const MOCK_TEACHER_MISSIONS: TeacherMissionItem[] = [
  {
    id: "msn-001",
    title: "Viết đoạn văn ngắn (5-7 câu) miêu tả hoạt động cuối tuần",
    description:
      "Các con viết tay vào vở ô ly đoạn văn từ 5 đến 7 câu tiếng Anh kể về các hoạt động của con và gia đình vào dịp cuối tuần. Chụp ảnh trang vở rõ nét, đủ 4 góc để AI trợ giảng và cô chấm nhé!",
    submission_type: "subjective_writing",
    min_reward_coins: 30,
    max_reward_coins: 60,
    due_at: "2026-11-15T21:30:00+07:00",
    created_by: "usr-teacher-01",
    creator_name: "Cô Mai Anh",
    is_active: true,
    is_deleted: false,
    deleted_at: null,
    deleted_by: null,
    updated_by: "usr-teacher-01",
    updated_at: "2026-11-15T08:15:00+07:00",
    created_at: "2026-11-14T08:00:00+07:00",
    assigned_class_ids: ["cls-5a", "cls-5b"],
    assigned_classes: [
      { id: "cls-5a", class_name: "Lớp 5A - Ca T2-T4-T6 (17:30)", student_count: 24 },
      { id: "cls-5b", class_name: "Lớp 5B - Ca T3-T5-T7 (17:30)", student_count: 20 },
    ],
    total_students: 44,
    submitted_count: 36,
    pending_review_count: 8,
    approved_count: 28,
    rejected_count: 2,
    late_count: 1,
    total_coins_awarded: 1420,
    avg_ai_score: 8.8,
    grading_focus: ["grammar", "spelling", "vocab", "punctuation"],
    custom_ai_prompt: "Chú ý lỗi chia động từ ngôi thứ 3 số ít (s/es) và lỗi viết hoa đầu câu. Giải thích ngắn gọn, khích lệ học sinh.",
    allow_late_submission: true,
    ai_prompt_template_id: null,
  },
  {
    id: "msn-002",
    title: "Hoàn thành bài Quizizz Unit 7: My Favorite Food (20 câu)",
    description:
      "Truy cập link bài tập Quizizz cô đã ghim ở nhóm Zalo lớp, làm hết 20 câu hỏi trắc nghiệm từ vựng đồ ăn & thức uống. Chụp màn hình bảng điểm tổng kết cuối bài để nhận xu tự động!",
    submission_type: "platform_proof",
    min_reward_coins: 20,
    max_reward_coins: 40,
    due_at: "2026-11-16T21:00:00+07:00",
    created_by: "usr-teacher-01",
    creator_name: "Cô Mai Anh",
    is_active: true,
    is_deleted: false,
    deleted_at: null,
    deleted_by: null,
    updated_by: null,
    updated_at: "2026-11-14T14:00:00+07:00",
    created_at: "2026-11-14T14:00:00+07:00",
    assigned_class_ids: ["cls-4a", "cls-3a"],
    assigned_classes: [
      { id: "cls-4a", class_name: "Lớp 4A - Tiếng Anh Tăng Cường", student_count: 18 },
      { id: "cls-3a", class_name: "Lớp 3A - Mầm Non Ngữ Pháp", student_count: 22 },
    ],
    total_students: 40,
    submitted_count: 31,
    pending_review_count: 5,
    approved_count: 26,
    rejected_count: 0,
    late_count: 0,
    total_coins_awarded: 960,
    avg_ai_score: 9.4,
    grading_focus: ["content"],
    custom_ai_prompt: "Bóc tách chính xác số câu đúng (correct_count) và tổng số câu (total_questions) từ ảnh chụp màn hình Quizizz.",
    allow_late_submission: true,
    ai_prompt_template_id: null,
  },
  {
    id: "msn-003",
    title: "Dịch Việt ➔ Anh: 10 câu giao tiếp chủ đề School Things",
    description:
      "Các con chép đề 10 câu tiếng Việt trong phiếu bài tập cô phát trên lớp và dịch sang tiếng Anh vào vở. Nhớ kiểm tra kỹ danh từ số ít (a/an) và danh từ số nhiều (s/es) trước khi chụp nộp nhé.",
    submission_type: "subjective_writing",
    min_reward_coins: 40,
    max_reward_coins: 80,
    due_at: "2026-11-17T22:00:00+07:00",
    created_by: "usr-teacher-02",
    creator_name: "Thầy Hoàng Nam",
    is_active: true,
    is_deleted: false,
    deleted_at: null,
    deleted_by: null,
    updated_by: null,
    updated_at: "2026-11-15T09:00:00+07:00",
    created_at: "2026-11-15T09:00:00+07:00",
    assigned_class_ids: ["cls-5a"],
    assigned_classes: [
      { id: "cls-5a", class_name: "Lớp 5A - Ca T2-T4-T6 (17:30)", student_count: 24 },
    ],
    total_students: 24,
    submitted_count: 14,
    pending_review_count: 6,
    approved_count: 8,
    rejected_count: 1,
    late_count: 0,
    total_coins_awarded: 580,
    avg_ai_score: 8.5,
    grading_focus: ["grammar", "vocab", "spelling", "punctuation", "content"],
    custom_ai_prompt: "Đối chiếu từng câu dịch từ 1 đến 10. Trừ 0.5 điểm cho lỗi chính tả nhỏ, 1.0 điểm nếu sai cấu trúc ngữ pháp this/that/these/those.",
    allow_late_submission: false,
    ai_prompt_template_id: null,
  },
  {
    id: "msn-004",
    title: "Học thuộc & Dịch Anh ➔ Việt bài đọc 'A Day at the Zoo'",
    description:
      "Đọc kỹ bài đọc 'A Day at the Zoo' trang 50 SGK, gạch chân các động từ chỉ hoạt động của các con vật và viết bản dịch tiếng Việt hoàn chỉnh vào vở bài tập.",
    submission_type: "subjective_writing",
    min_reward_coins: 25,
    max_reward_coins: 50,
    due_at: "2026-11-13T21:00:00+07:00", // Đã qua hạn nộp
    created_by: "usr-teacher-01",
    creator_name: "Cô Mai Anh",
    is_active: true,
    is_deleted: false,
    deleted_at: null,
    deleted_by: null,
    updated_by: null,
    updated_at: "2026-11-11T10:00:00+07:00",
    created_at: "2026-11-11T10:00:00+07:00",
    assigned_class_ids: ["cls-4a"],
    assigned_classes: [
      { id: "cls-4a", class_name: "Lớp 4A - Tiếng Anh Tăng Cường", student_count: 18 },
    ],
    total_students: 18,
    submitted_count: 18,
    pending_review_count: 3,
    approved_count: 15,
    rejected_count: 0,
    late_count: 3,
    total_coins_awarded: 820,
    avg_ai_score: 9.1,
    grading_focus: ["vocab", "content"],
    custom_ai_prompt: "Kiểm tra độ chính xác của bản dịch tiếng Việt và khen ngợi cách diễn đạt tự nhiên.",
    allow_late_submission: true,
    ai_prompt_template_id: null,
  },
  {
    id: "msn-005",
    title: "Thử thách Wordwall: Ghép cặp 30 Động từ bất quy tắc",
    description:
      "Hoàn thành trò chơi lật thẻ ghép cặp 30 động từ bất quy tắc trên Wordwall trong thời gian dưới 3 phút. Chụp ảnh màn hình kết quả gửi lên hệ thống.",
    submission_type: "platform_proof",
    min_reward_coins: 30,
    max_reward_coins: 30, // Mức xu cố định (min = max)
    due_at: "2026-11-20T21:00:00+07:00",
    created_by: "usr-teacher-02",
    creator_name: "Thầy Hoàng Nam",
    is_active: false, // Đang tạm ẩn (Bản nháp chuẩn bị mở cho tuần tới)
    is_deleted: false,
    deleted_at: null,
    deleted_by: null,
    updated_by: null,
    updated_at: "2026-11-15T10:30:00+07:00",
    created_at: "2026-11-15T10:30:00+07:00",
    assigned_class_ids: ["cls-5a", "cls-5b"],
    assigned_classes: [
      { id: "cls-5a", class_name: "Lớp 5A - Ca T2-T4-T6 (17:30)", student_count: 24 },
      { id: "cls-5b", class_name: "Lớp 5B - Ca T3-T5-T7 (17:30)", student_count: 20 },
    ],
    total_students: 44,
    submitted_count: 0,
    pending_review_count: 0,
    approved_count: 0,
    rejected_count: 0,
    late_count: 0,
    total_coins_awarded: 0,
    avg_ai_score: null,
    grading_focus: ["content"],
    custom_ai_prompt: "Bóc tách số điểm đạt được trong trò chơi lật thẻ ghép từ.",
    allow_late_submission: true,
    ai_prompt_template_id: null,
  },
  {
    id: "msn-006",
    title: "[Nháp cũ] Bài tập ôn tập Giữa Học Kỳ I - Đề số 1",
    description:
      "Làm đề ôn tập số 1 trong bộ đề cương Giữa kỳ I và chụp ảnh kết quả nộp lên.",
    submission_type: "platform_proof",
    min_reward_coins: 20,
    max_reward_coins: 40,
    due_at: "2026-10-30T21:00:00+07:00",
    created_by: "usr-teacher-01",
    creator_name: "Cô Mai Anh",
    is_active: false,
    is_deleted: true, // Nằm trong thùng rác
    deleted_at: "2026-11-02T16:20:00+07:00",
    deleted_by: "usr-teacher-01",
    updated_by: "usr-teacher-01",
    updated_at: "2026-11-02T16:20:00+07:00",
    created_at: "2026-10-25T08:00:00+07:00",
    assigned_class_ids: ["cls-5a"],
    assigned_classes: [
      { id: "cls-5a", class_name: "Lớp 5A - Ca T2-T4-T6 (17:30)", student_count: 24 },
    ],
    total_students: 24,
    submitted_count: 22,
    pending_review_count: 0,
    approved_count: 22,
    rejected_count: 0,
    late_count: 2,
    total_coins_awarded: 780,
    avg_ai_score: 8.9,
    grading_focus: ["content"],
    custom_ai_prompt: "Đề ôn tập giữa kỳ I - 25 câu trắc nghiệm.",
    allow_late_submission: true,
    ai_prompt_template_id: null,
  },
];

/**
 * Dữ liệu bài nộp mẫu của học sinh theo từng bài tập (Khớp bảng `homework_submissions` & `ai_submission_errors`)
 */
export const MOCK_MISSION_SUBMISSIONS: Record<string, MissionSubmissionItem[]> = {
  "msn-001": [
    {
      id: "sub-101",
      mission_id: "msn-001",
      student_id: "stu-01",
      student_name: "Nguyễn Gia Bảo",
      student_avatar: "/avatar-chibi/male-1.webp",
      student_phone: "0901234567",
      class_id: "cls-5a",
      class_name: "Lớp 5A - Ca T2-T4-T6 (17:30)",
      submission_type: "subjective_writing",
      is_late: false,
      proof_image_urls: ["/book/book.svg"],
      readable: true,
      unreadable_reason: null,
      ai_score: 9.0,
      correct_count: null,
      total_questions: null,
      ai_suggested_coins: 55,
      final_coins: null,
      teacher_feedback: null,
      approval_status: "pending_approval",
      reviewed_by: null,
      reviewed_at: null,
      created_at: "2026-11-15T11:20:00+07:00",
      errors: [
        {
          id: "err-01",
          submission_id: "sub-101",
          line_number: 3,
          student_text: "My father play badminton with me on Sunday.",
          correction_text: "My father plays badminton with me on Sunday.",
          error_type: "grammar",
          severity: "major",
          explanation:
            "Chủ ngữ 'My father' là ngôi thứ 3 số ít nên động từ 'play' cần thêm '-s' thành 'plays'.",
        },
      ],
    },
    {
      id: "sub-102",
      mission_id: "msn-001",
      student_id: "stu-02",
      student_name: "Trần Ngọc Bảo Hân",
      student_avatar: "/avatar-chibi/female-2.webp",
      student_phone: "0912345678",
      class_id: "cls-5a",
      class_name: "Lớp 5A - Ca T2-T4-T6 (17:30)",
      submission_type: "subjective_writing",
      is_late: false,
      proof_image_urls: ["/book/book.svg"],
      readable: true,
      unreadable_reason: null,
      ai_score: 10.0,
      correct_count: null,
      total_questions: null,
      ai_suggested_coins: 60,
      final_coins: 60,
      teacher_feedback: "Chữ viết rất nắn nót, cấu trúc câu sáng tạo! Cô thưởng tối đa 60 xu nhé.",
      approval_status: "approved",
      reviewed_by: "usr-teacher-01",
      reviewed_at: "2026-11-15T12:00:00+07:00",
      created_at: "2026-11-15T09:45:00+07:00",
      errors: [],
    },
    {
      id: "sub-103",
      mission_id: "msn-001",
      student_id: "stu-03",
      student_name: "Lê Minh Khôi",
      student_avatar: "/avatar-chibi/male-3.webp",
      student_phone: "0987654321",
      class_id: "cls-5b",
      class_name: "Lớp 5B - Ca T3-T5-T7 (17:30)",
      submission_type: "subjective_writing",
      is_late: false,
      proof_image_urls: ["/book/book.svg"],
      readable: true,
      unreadable_reason: null,
      ai_score: 8.5,
      correct_count: null,
      total_questions: null,
      ai_suggested_coins: 45,
      final_coins: null,
      teacher_feedback: null,
      approval_status: "pending_approval",
      reviewed_by: null,
      reviewed_at: null,
      created_at: "2026-11-15T12:30:00+07:00",
      errors: [
        {
          id: "err-02",
          submission_id: "sub-103",
          line_number: 2,
          student_text: "We goes to the park in Saturday morning.",
          correction_text: "We go to the park on Saturday morning.",
          error_type: "grammar",
          severity: "major",
          explanation: "Chủ ngữ 'We' đi với động từ nguyên mẫu 'go', và dùng giới từ 'on' trước thứ trong tuần.",
        },
        {
          id: "err-03",
          submission_id: "sub-103",
          line_number: 5,
          student_text: "delicous food",
          correction_text: "delicious food",
          error_type: "spelling",
          severity: "minor",
          explanation: "Từ 'delicious' bị thiếu chữ 'i' sau chữ 'c'.",
        },
      ],
    },
    {
      id: "sub-104",
      mission_id: "msn-001",
      student_id: "stu-04",
      student_name: "Phạm Khánh Linh",
      student_avatar: "/avatar-chibi/female-4.webp",
      student_phone: "0933445566",
      class_id: "cls-5b",
      class_name: "Lớp 5B - Ca T3-T5-T7 (17:30)",
      submission_type: "subjective_writing",
      is_late: true,
      proof_image_urls: ["/book/book.svg"],
      readable: false,
      unreadable_reason: "Ảnh chụp bị rung mờ và thiếu ánh sáng ở nửa trang dưới.",
      ai_score: null,
      correct_count: null,
      total_questions: null,
      ai_suggested_coins: 0,
      final_coins: 0,
      teacher_feedback: "Ảnh hơi mờ cô chưa đọc được dòng cuối, con chụp lại dưới ánh đèn sáng nhé!",
      approval_status: "rejected",
      reviewed_by: "usr-teacher-01",
      reviewed_at: "2026-11-15T12:10:00+07:00",
      created_at: "2026-11-15T11:50:00+07:00",
      errors: [],
    },
  ],
  "msn-002": [
    {
      id: "sub-201",
      mission_id: "msn-002",
      student_id: "stu-05",
      student_name: "Hoàng Tuấn Kiệt",
      student_avatar: "/avatar-chibi/male-5.webp",
      student_phone: "0977889900",
      class_id: "cls-4a",
      class_name: "Lớp 4A - Tiếng Anh Tăng Cường",
      submission_type: "platform_proof",
      is_late: false,
      proof_image_urls: ["/book/book.svg"],
      readable: true,
      unreadable_reason: null,
      ai_score: 10.0,
      correct_count: 20,
      total_questions: 20,
      ai_suggested_coins: 40,
      final_coins: null,
      teacher_feedback: null,
      approval_status: "pending_approval",
      reviewed_by: null,
      reviewed_at: null,
      created_at: "2026-11-15T10:15:00+07:00",
      errors: [],
    },
    {
      id: "sub-202",
      mission_id: "msn-002",
      student_id: "stu-06",
      student_name: "Đỗ Hà My",
      student_avatar: "/avatar-chibi/female-6.webp",
      student_phone: "0966554433",
      class_id: "cls-3a",
      class_name: "Lớp 3A - Mầm Non Ngữ Pháp",
      submission_type: "platform_proof",
      is_late: false,
      proof_image_urls: ["/book/book.svg"],
      readable: true,
      unreadable_reason: null,
      ai_score: 8.5,
      correct_count: 17,
      total_questions: 20,
      ai_suggested_coins: 20,
      final_coins: 20,
      teacher_feedback: "Làm tốt lắm con! Ôn lại 3 từ vựng bị nhầm nhé.",
      approval_status: "approved",
      reviewed_by: "usr-teacher-01",
      reviewed_at: "2026-11-15T11:00:00+07:00",
      created_at: "2026-11-15T08:40:00+07:00",
      errors: [],
    },
  ],
};
