import {
  TeacherGradingSubmissionItem,
  SubmissionMissionFilterOption,
  AiGradingErrorType,
} from "../types";

/**
 * Cấu hình nhãn & màu sắc cho từng loại lỗi AI phát hiện (`ai_submission_errors.error_type`)
 */
export const AI_ERROR_TYPE_META: Record<
  AiGradingErrorType,
  { label: string; badgeClass: string }
> = {
  grammar: {
    label: "Ngữ pháp",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
  },
  spelling: {
    label: "Chính tả",
    badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
  },
  vocab: {
    label: "Từ vựng",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
  },
  punctuation: {
    label: "Dấu câu",
    badgeClass: "bg-sky-50 text-sky-700 border-sky-200",
  },
  content: {
    label: "Nội dung",
    badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
};

/**
 * Gợi ý nhận xét nhanh 1-click dành cho Giáo viên khi duyệt bài
 */
export const QUICK_TEACHER_FEEDBACKS: string[] = [
  "Chữ viết rất nắn nót, trình bày vở sạch đẹp! Cô khen con nhé 🌟",
  "Bài làm đúng yêu cầu, con chú ý ôn lại các lỗi ngữ pháp AI đã gạch chân nhé.",
  "Vốn từ vựng phong phú, đặt câu tự nhiên và sáng tạo!",
  "Hoàn thành xuất sắc 100% câu hỏi, tiếp tục phát huy nhé con!",
];

/**
 * Gợi ý lý do yêu cầu học sinh làm lại / chụp lại bài (`rejected`)
 */
export const QUICK_REJECT_REASONS: string[] = [
  "Ảnh chụp bị mờ và thiếu ánh sáng, con chụp lại rõ nét dưới ánh đèn nhé!",
  "Con chụp thiếu trang vở bài làm, vui lòng chụp đủ các trang và nộp lại.",
  "Ảnh chụp bị ngược/nghiêng mất góc chữ, con chụp thẳng trang vở giúp cô nhé.",
  "Bài làm chưa đúng yêu cầu đề bài, con đọc kỹ hướng dẫn rồi viết lại nhé.",
];

/**
 * Danh sách Bài tập dùng cho bộ lọc trên thanh Toolbar Studio
 */
export const MOCK_SUBMISSION_MISSIONS_FILTER: SubmissionMissionFilterOption[] = [
  {
    id: "msn-001",
    title: "Viết đoạn văn ngắn (5-7 câu) miêu tả hoạt động cuối tuần",
    pending_count: 3,
    total_submitted: 5,
  },
  {
    id: "msn-002",
    title: "Hoàn thành bài Quizizz Unit 7: My Favorite Food (20 câu)",
    pending_count: 1,
    total_submitted: 2,
  },
  {
    id: "msn-003",
    title: "Dịch Việt → Anh: 10 câu giao tiếp chủ đề School Things",
    pending_count: 1,
    total_submitted: 1,
  },
];

/**
 * Danh sách bài nộp mẫu với từ 1 đến 4 tấm ảnh minh chứng trên mỗi học sinh
 * - Khớp 100% cấu trúc bảng `public.homework_submissions` & `public.ai_submission_errors`
 */
export const MOCK_GRADING_SUBMISSIONS: TeacherGradingSubmissionItem[] = [
  {
    id: "sub-101",
    mission_id: "msn-001",
    student_id: "stu-01",
    student_name: "Nguyễn Gia Bảo",
    student_avatar: "/avatar-chibi/male-1.webp",
    student_phone: "0901234567",
    submission_type: "subjective_writing",
    is_late: false,
    proof_image_urls: [
      "/submissions/notebook-page-1.svg",
      "/submissions/notebook-page-2.svg",
      "/submissions/notebook-page-3.svg",
    ],
    readable: true,
    unreadable_reason: null,
    ai_raw_response: {
      ocr_transcript:
        "Topic: My Weekend with Family. On Saturday morning, I always wake up at seven o'clock. My father play badminton with me in the yard. In the afternoon, I help my mother cook dinner. We eat delicious food and watch cartoons together. On Sunday, I visit my grandparents in the countryside.",
      summary_comment:
        "Bài viết đủ 3 trang vở, chữ viết rõ ràng dễ đọc. Đủ số câu theo yêu cầu, bố cục mạch lạc, chỉ mắc 1 lỗi chia động từ ngôi thứ 3 số ít ở trang 1.",
      strengths: [
        "Viết đủ đoạn văn và phần từ vựng mở rộng (3 trang ảnh)",
        "Cấu trúc câu rõ ràng, sử dụng tốt trạng từ chỉ tần suất",
      ],
      improvements: [
        "Cần lưu ý chia động từ thêm -s/-es với chủ ngữ ngôi thứ 3 số ít (My father)",
      ],
      confidence_score: 0.96,
    },
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
    mission_title: "Viết đoạn văn ngắn (5-7 câu) miêu tả hoạt động cuối tuần",
    mission_description:
      "Các con viết tay vào vở ô ly đoạn văn từ 5 đến 7 câu tiếng Anh kể về các hoạt động của con và gia đình vào dịp cuối tuần.",
    mission_icon_type: "write",
    min_reward_coins: 30,
    max_reward_coins: 60,
    mission_due_at: "2026-11-15T21:30:00+07:00",
    errors: [
      {
        id: "err-01",
        submission_id: "sub-101",
        page_index: 1,
        line_number: 3,
        student_text: "My father play badminton with me in the yard.",
        correction_text: "My father plays badminton with me in the yard.",
        error_type: "grammar",
        severity: "major",
        explanation:
          "Chủ ngữ 'My father' là ngôi thứ 3 số ít ở thì hiện tại đơn nên động từ 'play' phải thêm '-s' thành 'plays'.",
      },
    ],
  },
  {
    id: "sub-103",
    mission_id: "msn-001",
    student_id: "stu-03",
    student_name: "Lê Minh Khôi",
    student_avatar: "/avatar-chibi/male-3.webp",
    student_phone: "0987654321",
    submission_type: "subjective_writing",
    is_late: false,
    proof_image_urls: [
      "/submissions/notebook-page-1.svg",
      "/submissions/notebook-page-2.svg",
    ],
    readable: true,
    unreadable_reason: null,
    ai_raw_response: {
      ocr_transcript:
        "On weekend, my family have a picnic. We goes to the park in Saturday morning. My mom prepares delicous food and fruit juice. I fly a kite with my sister.",
      summary_comment:
        "Học sinh nộp 2 trang ảnh vở viết tay. Nội dung sinh động nhưng còn nhầm lẫn giới từ chỉ thời gian và lỗi chính tả từ 'delicious'.",
      strengths: ["Ý tưởng bài viết tốt, trình bày 2 trang vở sạch sẽ"],
      improvements: [
        "Dùng giới từ 'on' trước các thứ trong tuần (on Saturday)",
        "Chú ý chính tả từ 'delicious'",
      ],
      confidence_score: 0.94,
    },
    ai_score: 8.5,
    correct_count: null,
    total_questions: null,
    ai_suggested_coins: 48,
    final_coins: null,
    teacher_feedback: null,
    approval_status: "pending_approval",
    reviewed_by: null,
    reviewed_at: null,
    created_at: "2026-11-15T12:30:00+07:00",
    mission_title: "Viết đoạn văn ngắn (5-7 câu) miêu tả hoạt động cuối tuần",
    mission_description:
      "Các con viết tay vào vở ô ly đoạn văn từ 5 đến 7 câu tiếng Anh kể về các hoạt động của con và gia đình vào dịp cuối tuần.",
    mission_icon_type: "write",
    min_reward_coins: 30,
    max_reward_coins: 60,
    mission_due_at: "2026-11-15T21:30:00+07:00",
    errors: [
      {
        id: "err-02",
        submission_id: "sub-103",
        page_index: 1,
        line_number: 2,
        student_text: "We goes to the park in Saturday morning.",
        correction_text: "We go to the park on Saturday morning.",
        error_type: "grammar",
        severity: "major",
        explanation:
          "Chủ ngữ 'We' là số nhiều nên dùng 'go' nguyên mẫu, và dùng giới từ 'on' trước thứ trong tuần.",
      },
      {
        id: "err-03",
        submission_id: "sub-103",
        page_index: 2,
        line_number: 8,
        student_text: "delicous food",
        correction_text: "delicious food",
        error_type: "spelling",
        severity: "minor",
        explanation: "Từ 'delicious' viết thiếu chữ 'i' sau chữ 'c'.",
      },
    ],
  },
  {
    id: "sub-105",
    mission_id: "msn-001",
    student_id: "stu-07",
    student_name: "Vũ Hoàng Bảo Trâm",
    student_avatar: "/avatar-chibi/female-5.webp",
    student_phone: "0944556677",
    submission_type: "subjective_writing",
    is_late: true,
    proof_image_urls: [
      "/submissions/blurry-page-1.svg",
      "/submissions/notebook-page-2.svg",
    ],
    readable: false,
    unreadable_reason:
      "Trang 1 bị rung mờ và thiếu ánh sáng ở nửa dưới trang vở, AI OCR không đọc được trọn vẹn câu 3 - 5.",
    ai_raw_response: {
      summary_comment:
        "Ảnh trang 1 bị mờ nhòe do rung tay khi chụp. Đề xuất giáo viên yêu cầu học sinh chụp lại ảnh trang 1 dưới ánh đèn sáng.",
      confidence_score: 0.42,
    },
    ai_score: null,
    correct_count: null,
    total_questions: null,
    ai_suggested_coins: 0,
    final_coins: null,
    teacher_feedback: null,
    approval_status: "pending_approval",
    reviewed_by: null,
    reviewed_at: null,
    created_at: "2026-11-15T13:10:00+07:00",
    mission_title: "Viết đoạn văn ngắn (5-7 câu) miêu tả hoạt động cuối tuần",
    mission_description:
      "Các con viết tay vào vở ô ly đoạn văn từ 5 đến 7 câu tiếng Anh kể về các hoạt động của con và gia đình vào dịp cuối tuần.",
    mission_icon_type: "write",
    min_reward_coins: 30,
    max_reward_coins: 60,
    mission_due_at: "2026-11-15T21:30:00+07:00",
    errors: [],
  },
  {
    id: "sub-201",
    mission_id: "msn-002",
    student_id: "stu-05",
    student_name: "Hoàng Tuấn Kiệt",
    student_avatar: "/avatar-chibi/male-5.webp",
    student_phone: "0977889900",
    submission_type: "platform_proof",
    is_late: false,
    proof_image_urls: [
      "/submissions/quizizz-proof-1.svg",
      "/submissions/notebook-page-2.svg",
    ],
    readable: true,
    unreadable_reason: null,
    ai_raw_response: {
      summary_comment:
        "Ảnh chụp màn hình kết quả Quizizz hợp lệ: Đạt 20/20 câu đúng (100%), kèm 1 trang vở ghi chép từ vựng.",
      strengths: [
        "Hoàn thành 20/20 câu trắc nghiệm chính xác 100%",
        "Có chụp kèm trang vở ghi chép từ vựng cẩn thận",
      ],
      confidence_score: 0.99,
    },
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
    mission_title: "Hoàn thành bài Quizizz Unit 7: My Favorite Food (20 câu)",
    mission_description:
      "Truy cập link bài tập Quizizz cô đã ghim, làm hết 20 câu hỏi và chụp ảnh màn hình kết quả nộp lên.",
    mission_icon_type: "capture",
    min_reward_coins: 20,
    max_reward_coins: 40,
    mission_due_at: "2026-11-16T21:00:00+07:00",
    errors: [],
  },
  {
    id: "sub-301",
    mission_id: "msn-003",
    student_id: "stu-08",
    student_name: "Đặng Minh Phương",
    student_avatar: "/avatar-chibi/female-7.webp",
    student_phone: "0922334455",
    submission_type: "subjective_writing",
    is_late: false,
    proof_image_urls: [
      "/submissions/notebook-page-1.svg",
      "/submissions/notebook-page-2.svg",
      "/submissions/notebook-page-3.svg",
      "/submissions/quizizz-proof-1.svg",
    ],
    readable: true,
    unreadable_reason: null,
    ai_raw_response: {
      ocr_transcript:
        "1. This is my new school bag. 2. How many pencils do you have? 3. I have three rulers and two erasers in my pencil case.",
      summary_comment:
        "Học sinh nộp đầy đủ 4 tấm ảnh minh chứng: 3 trang vở dịch câu và 1 ảnh điểm luyện tập. Dịch đúng 9/10 câu.",
      strengths: ["Đầy đủ 4 ảnh chụp rõ góc, chữ viết đều đẹp"],
      improvements: ["Ôn lại cách dùng danh từ số nhiều sau 'How many'"],
      confidence_score: 0.95,
    },
    ai_score: 9.5,
    correct_count: null,
    total_questions: null,
    ai_suggested_coins: 75,
    final_coins: null,
    teacher_feedback: null,
    approval_status: "pending_approval",
    reviewed_by: null,
    reviewed_at: null,
    created_at: "2026-11-15T14:05:00+07:00",
    mission_title: "Dịch Việt → Anh: 10 câu giao tiếp chủ đề School Things",
    mission_description:
      "Các con chép đề 10 câu tiếng Việt trong phiếu bài tập và dịch sang tiếng Anh vào vở ô ly.",
    mission_icon_type: "write",
    min_reward_coins: 40,
    max_reward_coins: 80,
    mission_due_at: "2026-11-17T22:00:00+07:00",
    errors: [
      {
        id: "err-301",
        submission_id: "sub-301",
        page_index: 2,
        line_number: 9,
        student_text: "two box of crayons",
        correction_text: "two boxes of crayons",
        error_type: "grammar",
        severity: "minor",
        explanation:
          "Danh từ 'box' kết thúc bằng '-x' nên khi chuyển sang số nhiều (2 hộp) cần thêm '-es' thành 'boxes'.",
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
    submission_type: "subjective_writing",
    is_late: false,
    proof_image_urls: [
      "/submissions/notebook-page-1.svg",
      "/submissions/notebook-page-2.svg",
    ],
    readable: true,
    unreadable_reason: null,
    ai_raw_response: {
      summary_comment:
        "Bài viết hoàn hảo, không phát hiện lỗi ngữ pháp hay chính tả.",
      strengths: ["Chữ viết đẹp, đúng ngữ pháp 100%"],
      confidence_score: 0.98,
    },
    ai_score: 10.0,
    correct_count: null,
    total_questions: null,
    ai_suggested_coins: 60,
    final_coins: 60,
    teacher_feedback:
      "Chữ viết rất nắn nót, cấu trúc câu sáng tạo! Cô thưởng tối đa 60 xu nhé 🌟",
    approval_status: "approved",
    reviewed_by: "usr-teacher-01",
    reviewed_at: "2026-11-15T12:00:00+07:00",
    created_at: "2026-11-15T09:45:00+07:00",
    mission_title: "Viết đoạn văn ngắn (5-7 câu) miêu tả hoạt động cuối tuần",
    mission_description:
      "Các con viết tay vào vở ô ly đoạn văn từ 5 đến 7 câu tiếng Anh kể về các hoạt động của con và gia đình vào dịp cuối tuần.",
    mission_icon_type: "write",
    min_reward_coins: 30,
    max_reward_coins: 60,
    mission_due_at: "2026-11-15T21:30:00+07:00",
    errors: [],
  },
  {
    id: "sub-104",
    mission_id: "msn-001",
    student_id: "stu-04",
    student_name: "Phạm Khánh Linh",
    student_avatar: "/avatar-chibi/female-4.webp",
    student_phone: "0933445566",
    submission_type: "subjective_writing",
    is_late: true,
    proof_image_urls: ["/submissions/blurry-page-1.svg"],
    readable: false,
    unreadable_reason: "Ảnh chụp bị rung mờ và thiếu ánh sáng ở nửa trang dưới.",
    ai_raw_response: {
      summary_comment: "Ảnh chụp mờ không đủ điều kiện chấm tự động.",
      confidence_score: 0.35,
    },
    ai_score: null,
    correct_count: null,
    total_questions: null,
    ai_suggested_coins: 0,
    final_coins: 0,
    teacher_feedback:
      "Ảnh hơi mờ cô chưa đọc được dòng cuối, con chụp lại dưới ánh đèn sáng nhé!",
    approval_status: "rejected",
    reviewed_by: "usr-teacher-01",
    reviewed_at: "2026-11-15T12:10:00+07:00",
    created_at: "2026-11-15T11:50:00+07:00",
    mission_title: "Viết đoạn văn ngắn (5-7 câu) miêu tả hoạt động cuối tuần",
    mission_description:
      "Các con viết tay vào vở ô ly đoạn văn từ 5 đến 7 câu tiếng Anh kể về các hoạt động của con và gia đình vào dịp cuối tuần.",
    mission_icon_type: "write",
    min_reward_coins: 30,
    max_reward_coins: 60,
    mission_due_at: "2026-11-15T21:30:00+07:00",
    errors: [],
  },
];
