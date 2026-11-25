import { format } from "date-fns";
import { toValidDate, formatDate, parseDateTime } from "@/lib/date";
export { normalizeText, getInitials, onlyNumberKeyDown } from "@/lib/utils";
export { formatDate, parseDateTime };

/**
 * Kiểm tra xem bài tập đã quá hạn nộp (`due_at`) hay chưa
 */
export function isMissionExpired(dueAt: string): boolean {
  const date = toValidDate(dueAt);
  if (!date) return false;
  return date.getTime() < Date.now();
}

/**
 * Kiểm tra xem bài tập đã hết hạn quá 1 tuần (7 ngày) hay chưa
 */
export function isMissionExpiredOverOneWeek(dueAt: string): boolean {
  const date = toValidDate(dueAt);
  if (!date) return false;
  const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
  return Date.now() - date.getTime() > ONE_WEEK_MS;
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
      relativeLabel: "Đã quá hạn nộp",
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
 * Lấy hạn chót nộp bài mặc định: đúng 2 ngày kể từ hôm nay, giữ nguyên giờ phút hiện tại
 */
export function getDefaultMissionDueDate(): string {
  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() + 2);
  return format(defaultDate, "yyyy-MM-dd'T'HH:mm");
}

/**
 * Chuyển đổi chuỗi ISO sang định dạng chuẩn (yyyy-MM-ddTHH:mm).
 * Nếu không có giá trị (tạo bài mới), mặc định là 2 ngày kể từ hôm nay lúc giờ phút hiện tại.
 */
export function toDatetimeLocalValue(isoString?: string | null): string {
  const date = isoString ? toValidDate(isoString) : null;
  if (!date) {
    return getDefaultMissionDueDate();
  }
  return format(date, "yyyy-MM-dd'T'HH:mm");
}
