import { format } from "date-fns";
import { toValidDate, formatDate, parseDateTime } from "@/lib/date";
export { normalizeText, getInitials, onlyNumberKeyDown } from "@/lib/utils";
export { formatDate, parseDateTime };

/**
 * Kiểm tra xem bài tập đã qua hạn nộp (`due_at`) hay chưa
 */
export function isMissionExpired(dueAt: string): boolean {
  const date = toValidDate(dueAt);
  if (!date) return false;
  return date.getTime() < Date.now();
}

/**
 * Format hiển thị khoảng xu thưởng từ `min_reward_coins` đến `max_reward_coins`
 * - Nếu min === max: "+40"
 * - Nếu min < max: "+20 ~ 40"
 */
export function formatRewardCoinsLabel(
  minCoins: number,
  maxCoins: number
): string {
  if (minCoins === maxCoins || minCoins <= 0) {
    return `+${maxCoins.toLocaleString("vi-VN")}`;
  }
  return `+${minCoins.toLocaleString("vi-VN")} ~ ${maxCoins.toLocaleString("vi-VN")}`;
}

/**
 * Phân tích thông tin hạn nộp (`due_at`) để hiển thị nhãn thời gian và mức độ khẩn cấp
 */
export function getMissionDeadlineMeta(
  dueAt: string,
  isActive: boolean,
  isDeleted: boolean
): {
  formattedDate: string;
  formattedTime: string;
  relativeLabel: string;
  urgency: "normal" | "soon" | "expired" | "inactive";
} {
  const date = toValidDate(dueAt);
  if (!date) {
    return {
      formattedDate: "-",
      formattedTime: "--:--",
      relativeLabel: "Chưa đặt hạn",
      urgency: "inactive",
    };
  }

  const formattedDate = formatDate(date, "dd/MM/yyyy");
  const formattedTime = formatDate(date, "HH:mm");

  if (isDeleted || !isActive) {
    return {
      formattedDate,
      formattedTime,
      relativeLabel: isDeleted ? "Đã xóa" : "Đang tạm đóng",
      urgency: "inactive",
    };
  }

  const diffMs = date.getTime() - Date.now();
  if (diffMs < 0) {
    return {
      formattedDate,
      formattedTime,
      relativeLabel: "Đã qua hạn nộp",
      urgency: "expired",
    };
  }

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 24) {
    return {
      formattedDate,
      formattedTime,
      relativeLabel:
        diffHours <= 1 ? "Sắp hết hạn (<1h)" : `Còn ${diffHours} giờ`,
      urgency: "soon",
    };
  }

  const diffDays = Math.ceil(diffHours / 24);
  return {
    formattedDate,
    formattedTime,
    relativeLabel: `Còn ${diffDays} ngày`,
    urgency: "normal",
  };
}

/**
 * Chuyển đổi chuỗi ISO sang định dạng chuẩn của `<input type="datetime-local" />` (yyyy-MM-ddTHH:mm)
 */
export function toDatetimeLocalValue(isoString?: string | null): string {
  const date = isoString ? toValidDate(isoString) : null;
  if (!date) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(21, 0, 0, 0);
    return format(tomorrow, "yyyy-MM-dd'T'HH:mm");
  }
  return format(date, "yyyy-MM-dd'T'HH:mm");
}

import {
  TeacherMissionItem,
  MissionSubmissionItem,
  MissionStudentProgressItem,
} from "../types";

const VIETNAMESE_STUDENTS_POOL = [
  { name: "Nguyễn Gia Bảo", gender: "male", phone: "0901234567" },
  { name: "Trần Ngọc Bảo Hân", gender: "female", phone: "0912345678" },
  { name: "Lê Minh Khôi", gender: "male", phone: "0987654321" },
  { name: "Phạm Khánh Linh", gender: "female", phone: "0933445566" },
  { name: "Hoàng Tuấn Kiệt", gender: "male", phone: "0977889900" },
  { name: "Đỗ Hà My", gender: "female", phone: "0966554433" },
  { name: "Vũ Đức Anh", gender: "male", phone: "0911223344" },
  { name: "Nguyễn Thùy Chi", gender: "female", phone: "0988776655" },
  { name: "Đặng Quốc Tuấn", gender: "male", phone: "0909887766" },
  { name: "Bùi Phương Thảo", gender: "female", phone: "0934567890" },
  { name: "Lý Nhật Minh", gender: "male", phone: "0912889977" },
  { name: "Ngô Diệp Anh", gender: "female", phone: "0971239876" },
  { name: "Dương Hải Nam", gender: "male", phone: "0982345671" },
  { name: "Phan Ánh Nguyệt", gender: "female", phone: "0945678123" },
  { name: "Đinh Quang Huy", gender: "male", phone: "0967891234" },
  { name: "Trịnh Thảo Nguyên", gender: "female", phone: "0919876543" },
  { name: "Bùi Thiên Phú", gender: "male", phone: "0931234567" },
  { name: "Hoàng Lan Hương", gender: "female", phone: "0978901234" },
  { name: "Lâm Đình Khang", gender: "male", phone: "0989012345" },
  { name: "Võ Mai Trang", gender: "female", phone: "0903456781" },
  { name: "Phạm Hoàng Bách", gender: "male", phone: "0914567892" },
  { name: "Tô Cẩm Ly", gender: "female", phone: "0961234567" },
  { name: "Tạ Hữu Đạt", gender: "male", phone: "0972345678" },
  { name: "Lê Quỳnh Chi", gender: "female", phone: "0983456789" },
  { name: "Cao Thanh Tùng", gender: "male", phone: "0904567893" },
  { name: "Đoàn Thúy An", gender: "female", phone: "0915678904" },
  { name: "Trương Vĩnh Kỳ", gender: "male", phone: "0973456782" },
  { name: "Vương Ngọc Mai", gender: "female", phone: "0984567893" },
  { name: "Hồ Bá Đạt", gender: "male", phone: "0962345678" },
  { name: "Nguyễn Hải Yến", gender: "female", phone: "0905678912" },
  { name: "Lưu Chấn Hưng", gender: "male", phone: "0916789023" },
  { name: "Chu Minh Tâm", gender: "female", phone: "0974567891" },
  { name: "Mai Trọng Tấn", gender: "male", phone: "0985678924" },
  { name: "Phùng Mỹ Linh", gender: "female", phone: "0906789134" },
  { name: "Quách Đại Đồng", gender: "male", phone: "0917890245" },
  { name: "Hà Tường Vy", gender: "female", phone: "0975678932" },
  { name: "Đào Gia Khiêm", gender: "male", phone: "0986789345" },
  { name: "Lương Tú Uyên", gender: "female", phone: "0907891456" },
  { name: "Giang Quốc Bảo", gender: "male", phone: "0918902567" },
  { name: "Nghiêm Kim Ngân", gender: "female", phone: "0976789453" },
  { name: "Tạ Minh Trí", gender: "male", phone: "0987893567" },
  { name: "Vũ Ngọc Ánh", gender: "female", phone: "0908912567" },
  { name: "Tôn Thất Hiệp", gender: "male", phone: "0919013678" },
  { name: "Đồng Thảo Vy", gender: "female", phone: "0977894567" },
];

/**
 * Sinh danh sách tiến độ làm bài chi tiết của học sinh (ai đã nộp, ai chưa nộp)
 * - Khớp chính xác 100% với các số liệu `total_students`, `submitted_count`, `pending_review_count`, `approved_count`
 */
export function generateMissionStudentProgressList(
  mission: TeacherMissionItem,
  existingSubmissions: MissionSubmissionItem[] = []
): MissionStudentProgressItem[] {
  const result: MissionStudentProgressItem[] = [];
  const assignedClasses =
    mission.assigned_classes && mission.assigned_classes.length > 0
      ? mission.assigned_classes
      : [{ id: "cls-default", class_name: "Lớp học chung", student_count: mission.total_students }];

  // 1. Lấy danh sách các bài nộp sẵn có của bài tập này
  const missionExistingSubs = existingSubmissions.filter(
    (sub) => sub.mission_id === mission.id
  );

  const existingStudentIds = new Set<string>();

  missionExistingSubs.forEach((sub) => {
    existingStudentIds.add(sub.student_id);
    result.push({
      id: sub.student_id,
      student_name: sub.student_name,
      student_avatar: sub.student_avatar,
      student_phone: sub.student_phone,
      class_id: sub.class_id,
      class_name: sub.class_name,
      submission_status: "submitted",
      submission_id: sub.id,
      submitted_at: sub.created_at,
      is_late: sub.is_late,
      approval_status: sub.approval_status,
      ai_score: sub.ai_score,
      final_coins: sub.final_coins,
      ai_suggested_coins: sub.ai_suggested_coins,
      teacher_feedback: sub.teacher_feedback,
      proof_image_urls: sub.proof_image_urls,
    });
  });

  // 2. Nếu số lượng bài nộp mẫu ít hơn mission.submitted_count, tự sinh bổ sung cho đủ số lượng đã nộp
  const remainingSubmittedNeeded = Math.max(
    0,
    mission.submitted_count - result.length
  );

  let poolIdx = 0;
  let remainingPending = Math.max(
    0,
    mission.pending_review_count -
      result.filter((r) => r.approval_status === "pending_approval").length
  );
  let remainingLate = Math.max(
    0,
    mission.late_count - result.filter((r) => r.is_late).length
  );

  for (let i = 0; i < remainingSubmittedNeeded; i++) {
    const poolItem =
      VIETNAMESE_STUDENTS_POOL[
        (poolIdx + missionExistingSubs.length) % VIETNAMESE_STUDENTS_POOL.length
      ];
    poolIdx++;

    const studentId = `stu-gen-${i + 10}`;
    const targetClass = assignedClasses[i % assignedClasses.length];
    const isPending = remainingPending > 0;
    if (isPending) remainingPending--;

    const isLate = remainingLate > 0;
    if (isLate) remainingLate--;

    const avatarNum = ((i % 9) + 1).toString();
    const avatar =
      poolItem.gender === "female"
        ? `/avatar-chibi/female-${avatarNum}.webp`
        : `/avatar-chibi/male-${avatarNum}.webp`;

    result.push({
      id: studentId,
      student_name: poolItem.name,
      student_avatar: avatar,
      student_phone: poolItem.phone,
      class_id: targetClass.id,
      class_name: targetClass.class_name,
      submission_status: "submitted",
      submission_id: `sub-gen-${i + 10}`,
      submitted_at: new Date(Date.now() - (i + 1) * 3600 * 1000 * 4).toISOString(),
      is_late: isLate,
      approval_status: isPending ? "pending_approval" : "approved",
      ai_score: 8.5 + (i % 3) * 0.5,
      final_coins: isPending ? null : mission.max_reward_coins,
      ai_suggested_coins: mission.max_reward_coins,
      teacher_feedback: isPending
        ? null
        : "Bài làm rất tốt, chữ viết rõ ràng và nộp đúng tiến độ!",
      proof_image_urls: ["/book/book.svg"],
    });
  }

  // 3. Sinh danh sách các học sinh CHƯA NỘP BÀI (để tổng số = mission.total_students)
  const notSubmittedNeeded = Math.max(0, mission.total_students - result.length);

  for (let j = 0; j < notSubmittedNeeded; j++) {
    const poolItem =
      VIETNAMESE_STUDENTS_POOL[
        (poolIdx + mission.submitted_count + j) % VIETNAMESE_STUDENTS_POOL.length
      ];
    const studentId = `stu-unsub-${j + 1}`;
    const targetClass = assignedClasses[j % assignedClasses.length];

    const avatarNum = (((j + 4) % 9) + 1).toString();
    const avatar =
      poolItem.gender === "female"
        ? `/avatar-chibi/female-${avatarNum}.webp`
        : `/avatar-chibi/male-${avatarNum}.webp`;

    result.push({
      id: studentId,
      student_name: poolItem.name,
      student_avatar: avatar,
      student_phone: poolItem.phone,
      class_id: targetClass.id,
      class_name: targetClass.class_name,
      submission_status: "not_submitted",
    });
  }

  return result;
}

