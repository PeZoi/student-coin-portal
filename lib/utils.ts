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


