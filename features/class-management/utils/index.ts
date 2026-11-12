import { TEACHER_AVATAR_COLORS } from "@/features/class-management/constants";
export { normalizeText } from "@/lib/utils";
export { parseDate } from "@/lib/date";

/**
 * Lấy chữ cái đại diện từ tên giáo viên:
 * Lấy chữ cái đầu tiên của từ cuối cùng (bỏ phần ghi chú trong ngoặc đơn)
 * Ví dụ: "Cô Trần Thị Lan" -> "L", "Thầy Minh (Trợ giảng)" -> "M"
 */
export function getTeacherInitial(fullName: string): string {
  const cleaned = fullName.replace(/\(.*?\)/g, "").trim();
  if (!cleaned) return "G";
  const words = cleaned.split(/\s+/).filter(Boolean);
  const lastWord = words[words.length - 1] || cleaned;
  return lastWord.charAt(0).toUpperCase();
}

/**
 * Chọn bộ màu ổn định theo tên giáo viên
 */
export function getTeacherColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % TEACHER_AVATAR_COLORS.length;
  return TEACHER_AVATAR_COLORS[index];
}
