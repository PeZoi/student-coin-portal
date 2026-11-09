import { TEACHER_AVATAR_COLORS } from "./constants";

/**
 * Chuẩn hóa chuỗi văn bản: xóa dấu tiếng Việt, chuyển chữ thường, loại bỏ khoảng trắng thừa
 */
export const normalizeText = (s: string): string => {
  if (!s) return "";
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
};

/**
 * Phân tích ngày tháng hỗ trợ định dạng dd/MM/yyyy và chuỗi ISO
 * Trả về timestamp mili-giây, hoặc -1 nếu không phân tích được
 */
export function parseDate(dateStr: string): number {
  if (!dateStr) return -1;
  const parts = dateStr.trim().split("/");
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) return d.getTime();
  }
  const iso = new Date(dateStr);
  if (!isNaN(iso.getTime())) return iso.getTime();
  return -1;
}

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
