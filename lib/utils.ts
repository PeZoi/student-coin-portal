import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Chặn hoàn toàn phím chữ cái / ký tự chuỗi, chỉ cho phép nhập chữ số (0-9) và các phím điều hướng
 */
export function onlyNumberKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
  if (
    [
      "Backspace",
      "Delete",
      "Tab",
      "Escape",
      "Enter",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Home",
      "End",
    ].includes(e.key) ||
    e.ctrlKey ||
    e.metaKey
  ) {
    return;
  }
  // Nếu không phải phím số 0-9 thì chặn ngay lập tức
  if (!/^[0-9]$/.test(e.key)) {
    e.preventDefault();
  }
}

/**
 * Trích xuất tên gọi ngắn gọn từ họ và tên đầy đủ của học sinh
 * - Ví dụ: "Phạm Ngọc Viễn Đông" -> "Đông"
 * - "Nguyễn Văn A" -> "A"
 * - Nếu không có tên hoặc rỗng, trả về "Học sinh"
 */
export function getDisplayName(fullName?: string | null): string {
  if (!fullName || typeof fullName !== "string") return "Học sinh";
  const trimmed = fullName.trim();
  if (!trimmed) return "Học sinh";
  const words = trimmed.split(/\s+/);
  return words[words.length - 1] || "Học sinh";
}

/**
 * Trích xuất 1-2 chữ cái viết tắt đại diện làm avatar (ví dụ: "Phúc Lét" -> "PL", "Nam" -> "NA", rỗng -> "?")
 */
export function getInitials(fullName?: string | null, fallback = "?"): string {
  if (!fullName || typeof fullName !== "string") return fallback;
  const trimmed = fullName.trim();
  if (!trimmed) return fallback;
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length === 0) return fallback;
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

/**
 * Escape các ký tự đại diện đặc biệt (wildcards % và _) trong câu truy vấn LIKE / ILIKE của SQL
 * - Tránh trường hợp tên như "10_A" bị khớp nhầm với "10XA" khi so sánh
 */
export function escapeSqlWildcards(str: string): string {
  return str.replace(/([%_\\])/g, "\\$1");
}

/**
 * Chuẩn hóa chuỗi văn bản: xóa dấu tiếng Việt, chuyển chữ thường, loại bỏ khoảng trắng thừa
 * Phục vụ tìm kiếm không dấu trên toàn hệ thống
 */
export function normalizeText(str?: string | null): string {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}




