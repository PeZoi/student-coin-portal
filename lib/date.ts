import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";

/**
 * Chuyển đổi an toàn chuỗi ISO hoặc Date thành đối tượng Date
 */
export function toValidDate(dateInput: string | Date): Date | null {
  if (!dateInput) return null;
  if (dateInput instanceof Date) return isNaN(dateInput.getTime()) ? null : dateInput;
  try {
    const parsed = parseISO(dateInput);
    return isNaN(parsed.getTime()) ? new Date(dateInput) : parsed;
  } catch {
    const fallback = new Date(dateInput);
    return isNaN(fallback.getTime()) ? null : fallback;
  }
}

/**
 * Format ngày giờ thành chuỗi ngắn gọn nhất có thể (ví dụ: "08:00 27/10" hoặc "27/10")
 * Đảm bảo tính nhất quán (deterministic) giữa Server SSR và Client Hydration,
 * tránh các lỗi Next.js unstable value (Date.now()) trong quá trình prerendering.
 */
export function formatShortDateTime(
  dateInput: string | Date,
  options?: { showTime?: boolean; fallback?: string }
): string {
  const { showTime = true, fallback = "Chưa rõ" } = options || {};
  const date = toValidDate(dateInput);
  if (!date) return fallback;

  if (!showTime) {
    return format(date, "dd/MM", { locale: vi });
  }

  return format(date, "HH:mm dd/MM", { locale: vi });
}

/**
 * Format chỉ ngày ngắn gọn: dd/MM
 */
export function formatShortDate(dateInput: string | Date, fallback = "Chưa rõ"): string {
  return formatShortDateTime(dateInput, { showTime: false, fallback });
}
