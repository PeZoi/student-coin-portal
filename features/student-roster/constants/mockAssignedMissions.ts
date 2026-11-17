import { TeacherRosterStudent, RosterAssignedMissionItem } from "../types";

/**
 * Mẫu bài tập phong phú đa dạng các môn học và hình thức nộp bài
 */
const BASE_MISSION_TEMPLATES = [
  {
    title: "Luyện đọc bài 12: Đôi bạn tốt và trả lời câu hỏi",
    description: "Em hãy đọc to diễn cảm bài tập đọc trang 45 SGK Tiếng Việt và trả lời 3 câu hỏi cuối bài vào vở.",
    submission_type: "subjective_writing" as const,
    reward_coins: 50,
    proof_images: ["https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=60"],
    feedback_good: "Chữ viết nắn nót, trả lời tròn câu và câu 3 rất sâu sắc. Cô cộng tối đa 50 xu!",
  },
  {
    title: "Phiếu bài tập Toán tuần 24: Phép nhân và phép chia 2 chữ số",
    description: "Hoàn thiện 10 bài toán trắc nghiệm và 2 bài toán đố có lời văn trên giấy kiểm tra.",
    submission_type: "platform_proof" as const,
    reward_coins: 40,
    proof_images: ["https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=60"],
    feedback_good: "Bài làm xuất sắc! Đúng 10/10 câu trắc nghiệm trên Azota.",
  },
  {
    title: "Tiếng Anh Unit 7: Từ vựng chủ đề Sở thú (At the Zoo)",
    description: "Học thuộc 8 từ mới và chụp màn hình hoàn thành xuất sắc 100% bài kiểm tra trên Quizizz.",
    submission_type: "platform_proof" as const,
    reward_coins: 30,
    proof_images: ["https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&auto=format&fit=crop&q=60"],
    feedback_good: "Đạt 100% điểm Quizizz chỉ trong 4 phút, rất đáng khen ngợi!",
  },
  {
    title: "Viết đoạn văn 5-7 câu tả một con vật nuôi mà em yêu quý",
    description: "Miêu tả hình dáng, hoạt động và tình cảm của em đối với chú cún hoặc chú mèo nhà mình.",
    submission_type: "subjective_writing" as const,
    reward_coins: 60,
    proof_images: ["https://images.unsplash.com/photo-1517842645767-c639042777db?w=800&auto=format&fit=crop&q=60"],
    feedback_good: "Đoạn văn giàu cảm xúc, có dùng biện pháp so sánh rất sinh động.",
  },
  {
    title: "Chính tả nghe viết: Bài thơ 'Hạt gạo làng ta'",
    description: "Nghe bố mẹ hoặc cô giáo đọc và chép lại 3 khổ thơ đầu vào vở chính tả, không sai dấu câu.",
    submission_type: "subjective_writing" as const,
    reward_coins: 40,
    proof_images: ["https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=60"],
    feedback_good: "Vở sạch chữ đẹp, trình bày thẳng hàng đúng lề vở ô ly.",
  },
  {
    title: "Toán tư duy: Giải bài toán tìm hai số khi biết Tổng và Hiệu",
    description: "Giải bài tập số 4 và 5 trong phiếu phát đầu tuần. Trình bày lời giải và phép tính rõ ràng.",
    submission_type: "subjective_writing" as const,
    reward_coins: 50,
    proof_images: ["https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=800&auto=format&fit=crop&q=60"],
    feedback_good: "Vẽ sơ đồ đoạn thẳng chuẩn, đáp số chính xác.",
  },
  {
    title: "Khoa học & Tự nhiên: Vẽ sơ đồ vòng tuần hoàn của nước",
    description: "Vẽ và tô màu sơ đồ bốc hơi, ngưng tụ, tạo mây và mưa vào khổ giấy A4.",
    submission_type: "platform_proof" as const,
    reward_coins: 50,
    proof_images: ["https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=60"],
    feedback_good: "Tranh vẽ nhiều màu sắc, chú thích chi tiết các hiện tượng tự nhiên.",
  },
  {
    title: "Lịch sử: Tóm tắt chiến thắng Bạch Đằng năm 938",
    description: "Ghi nhớ công lao của người anh hùng Ngô Quyền và kế đóng cọc gỗ trên sông Bạch Đằng.",
    submission_type: "subjective_writing" as const,
    reward_coins: 30,
    proof_images: ["https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=800&auto=format&fit=crop&q=60"],
    feedback_good: "Nắm vững mốc thời gian và ý nghĩa lịch sử vẻ vang của dân tộc.",
  },
  {
    title: "Tiếng Anh Unit 8: Ngữ pháp Thì hiện tại tiếp diễn (Present Continuous)",
    description: "Hoàn thiện 15 câu bài tập chia động từ trong ngoặc theo cấu trúc S + am/is/are + V-ing.",
    submission_type: "platform_proof" as const,
    reward_coins: 40,
    proof_images: ["https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop&q=60"],
    feedback_good: "Làm đúng 14/15 câu, chú ý động từ tận cùng bằng chữ e nhé.",
  },
  {
    title: "Bài tập rèn luyện cuối tuần: 20 phép tính nhân chia nhẩm",
    description: "Chụp ảnh kết quả hoàn thành bảng cửu chương 7, 8, 9 trên ứng dụng ôn tập.",
    submission_type: "platform_proof" as const,
    reward_coins: 35,
    proof_images: ["https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60"],
    feedback_good: "Tốc độ tính nhẩm rất nhanh, đạt chuẩn ghi nhận thưởng xu.",
  },
  {
    title: "Thực hành Đạo đức: Kể 1 việc tốt em đã giúp đỡ người lớn ở nhà",
    description: "Viết ngắn 4-5 dòng chia sẻ về việc em quét nhà, gấp quần áo hoặc giúp đỡ ông bà.",
    submission_type: "subjective_writing" as const,
    reward_coins: 40,
    proof_images: ["https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=60"],
    feedback_good: "Hành động rất hiếu thảo và đáng khen ngợi. Tiếp tục phát huy em nhé!",
  },
  {
    title: "Tin học cơ bản: Luyện gõ phím 10 ngón với phần mềm Typing",
    description: "Đạt tốc độ tối thiểu 25 WPM và độ chính xác trên 95% trong bài kiểm tra 5 phút.",
    submission_type: "platform_proof" as const,
    reward_coins: 45,
    proof_images: ["https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=60"],
    feedback_good: "Tốc độ gõ phím đạt 28 WPM, vượt chuẩn bài giao.",
  },
];

/**
 * Sinh danh sách bài tập đã giao phong phú cho học sinh
 * Khớp đúng số lượng `total_missions_count` và `completed_missions_count`
 */
export function getMockAssignedMissions(
  student: TeacherRosterStudent
): RosterAssignedMissionItem[] {
  const total = Math.max(1, student.total_missions_count || 45);
  const completed = Math.min(total, student.completed_missions_count || 0);

  // Số lượng bài chờ duyệt đồng bộ chính xác với số hiển thị ở bảng danh sách
  const pendingCount = Math.min(
    Math.max(0, total - completed),
    student.pending_missions_count ?? 3
  );
  const rejectedCount = 0;
  const assignedCount = Math.max(0, total - completed - pendingCount - rejectedCount);

  const missions: RosterAssignedMissionItem[] = [];
  const now = new Date("2026-11-17T13:30:00Z").getTime();

  let itemIndex = 0;

  // 1. Các bài đang chờ cô duyệt (submitted) - Mới nhất
  for (let i = 0; i < pendingCount; i++) {
    itemIndex++;
    const tpl = BASE_MISSION_TEMPLATES[(itemIndex - 1) % BASE_MISSION_TEMPLATES.length];
    const assignedTime = new Date(now - (i + 1) * 86400000).toISOString();
    const submittedTime = new Date(now - (i * 12 + 2) * 3600000).toISOString();
    const deadline = new Date(now + 86400000 * 2).toISOString();

    missions.push({
      id: `sm-${student.id}-${itemIndex}`,
      mission_id: `m-template-${itemIndex}`,
      student_id: student.id,
      class_id: student.class_id,
      title: tpl.title,
      description: tpl.description,
      submission_type: tpl.submission_type,
      reward_coins: tpl.reward_coins,
      status: "submitted",
      is_late: false,
      assigned_at: assignedTime,
      deadline,
      submitted_at: submittedTime,
      completed_at: null,
      earned_coins: 0,
      teacher_feedback: null,
      proof_image_urls: tpl.proof_images,
      attempt_number: 1,
    });
  }

  // 2. Bài cần làm lại / Từ chối (rejected)
  for (let i = 0; i < rejectedCount; i++) {
    itemIndex++;
    const tpl = BASE_MISSION_TEMPLATES[(itemIndex - 1) % BASE_MISSION_TEMPLATES.length];
    const assignedTime = new Date(now - 3 * 86400000).toISOString();
    const submittedTime = new Date(now - 2 * 86400000).toISOString();
    const deadline = new Date(now + 86400000).toISOString();

    missions.push({
      id: `sm-${student.id}-${itemIndex}`,
      mission_id: `m-template-${itemIndex}`,
      student_id: student.id,
      class_id: student.class_id,
      title: tpl.title,
      description: tpl.description,
      submission_type: tpl.submission_type,
      reward_coins: tpl.reward_coins,
      status: "rejected",
      is_late: false,
      assigned_at: assignedTime,
      deadline,
      submitted_at: submittedTime,
      completed_at: null,
      earned_coins: 0,
      teacher_feedback: "Ảnh chụp bài làm bị mờ và lóa sáng, cô chưa nhìn rõ đáp án câu 4 và 5. Em vui lòng chụp lại rõ nét nhé!",
      proof_image_urls: tpl.proof_images,
      attempt_number: 1,
    });
  }

  // 3. Các bài chưa làm (assigned)
  for (let i = 0; i < assignedCount; i++) {
    itemIndex++;
    const tpl = BASE_MISSION_TEMPLATES[(itemIndex - 1) % BASE_MISSION_TEMPLATES.length];
    const assignedTime = new Date(now - 1 * 86400000).toISOString();
    const deadline = new Date(now + (i + 1) * 86400000 * 2).toISOString();

    missions.push({
      id: `sm-${student.id}-${itemIndex}`,
      mission_id: `m-template-${itemIndex}`,
      student_id: student.id,
      class_id: student.class_id,
      title: tpl.title,
      description: tpl.description,
      submission_type: tpl.submission_type,
      reward_coins: tpl.reward_coins,
      status: "assigned",
      is_late: false,
      assigned_at: assignedTime,
      deadline,
      submitted_at: null,
      completed_at: null,
      earned_coins: 0,
      teacher_feedback: null,
      proof_image_urls: [],
      attempt_number: 0,
    });
  }

  // 4. Các bài đã hoàn thành (approved)
  for (let i = 0; i < completed; i++) {
    itemIndex++;
    const tpl = BASE_MISSION_TEMPLATES[(itemIndex - 1) % BASE_MISSION_TEMPLATES.length];
    const daysAgo = 2 + Math.floor(i * 0.8);
    const assignedTime = new Date(now - (daysAgo + 2) * 86400000).toISOString();
    const submittedTime = new Date(now - (daysAgo + 0.5) * 86400000).toISOString();
    const completedTime = new Date(now - daysAgo * 86400000).toISOString();
    const deadline = new Date(now - (daysAgo - 1) * 86400000).toISOString();

    missions.push({
      id: `sm-${student.id}-${itemIndex}`,
      mission_id: `m-template-${itemIndex}`,
      student_id: student.id,
      class_id: student.class_id,
      title: tpl.title,
      description: tpl.description,
      submission_type: tpl.submission_type,
      reward_coins: tpl.reward_coins,
      status: "approved",
      is_late: false,
      assigned_at: assignedTime,
      deadline,
      submitted_at: submittedTime,
      completed_at: completedTime,
      earned_coins: tpl.reward_coins,
      teacher_feedback: tpl.feedback_good,
      proof_image_urls: tpl.proof_images,
      attempt_number: 1,
      ai_score: 9.5,
    });
  }

  return missions;
}
