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
 * Format ngày an toàn (mặc định: "dd/MM/yyyy", ví dụ: "06/11/2026")
 * - Nếu chuỗi đã là dạng dd/MM/yyyy thì trả về ngay
 * - Nếu là Date hoặc ISO string thì format theo pattern
 * - Nếu null, undefined hoặc không hợp lệ thì trả về fallback (mặc định: "-")
 */
export function formatDate(
  dateInput?: string | Date | null,
  pattern = "dd/MM/yyyy",
  fallback = "-"
): string {
  if (!dateInput) return fallback;
  if (typeof dateInput === "string" && /^\d{2}\/\d{2}\/\d{4}$/.test(dateInput.trim())) {
    return dateInput.trim();
  }
  const date = toValidDate(dateInput);
  if (!date) return fallback;
  try {
    return format(date, pattern, { locale: vi });
  } catch {
    return fallback;
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

/**
 * Phân tích chuỗi ngày tháng định dạng "dd/MM/yyyy" hoặc ISO sang timestamp mili-giây để sắp xếp
 * Trả về -1 nếu không phân tích được
 */
export function parseDate(dateStr?: string | null): number {
  if (!dateStr) return -1;
  const trimmed = dateStr.trim();
  const parts = trimmed.split("/");
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) return d.getTime();
  }
  const iso = new Date(trimmed);
  if (!isNaN(iso.getTime())) return iso.getTime();
  return -1;
}

/**
 * Phân tích chuỗi ngày giờ định dạng "HH:mm dd/MM/yyyy", "dd/MM/yyyy" hoặc ISO sang timestamp mili-giây để sắp xếp
 */
export function parseDateTime(dateTimeStr?: string | null): number {
  if (!dateTimeStr) return -1;
  const trimmed = dateTimeStr.trim();
  const spaceParts = trimmed.split(/\s+/);
  if (spaceParts.length === 2) {
    const [timePart, datePart] = spaceParts;
    const [hourStr, minStr] = timePart.split(":");
    const dateParts = datePart.split("/");
    if (dateParts.length === 3) {
      const day = parseInt(dateParts[0], 10);
      const month = parseInt(dateParts[1], 10) - 1;
      const year = parseInt(dateParts[2], 10);
      const hour = parseInt(hourStr || "0", 10);
      const minute = parseInt(minStr || "0", 10);
      const d = new Date(year, month, day, hour, minute);
      if (!isNaN(d.getTime())) return d.getTime();
    }
  }
  return parseDate(trimmed);
}

