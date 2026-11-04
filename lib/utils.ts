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

