import {
  differenceInCalendarDays,
  isSameDay,
  addDays,
  format,
} from "date-fns";
import { toValidDate } from "@/lib/date";

export type MissionUrgency = "overdue" | "urgent" | "soon" | "normal" | "done";

export interface DueLabelResult {
  text: string;
  urgency: MissionUrgency;
}

/**
 * Hằng số bảng màu và style thống nhất theo từng mức độ gấp gáp (urgency).
 * Không để mã màu rải rác trong component.
 */
export const URGENCY_STYLES: Record<
  MissionUrgency,
  {
    bg: string;
    text: string;
    border: string;
    hex: string;
  }
> = {
  overdue: {
    bg: "bg-rose-100",
    text: "text-rose-700",
    border: "border-rose-300",
    hex: "#DC2626", // Đỏ nổi bật khi quá hạn
  },
  urgent: {
    bg: "bg-orange-100",
    text: "text-orange-700",
    border: "border-orange-300",
    hex: "#EA580C", // Màu cam khi còn dưới 24h
  },
  soon: {
    bg: "bg-amber-100",
    text: "text-amber-800",
    border: "border-amber-300",
    hex: "#D97706", // Màu vàng hổ phách khi còn 2-7 ngày
  },
  normal: {
    bg: "bg-sky-100",
    text: "text-sky-700",
    border: "border-sky-300",
    hex: "#0284C7", // Màu xanh dương dịu khi còn > 7 ngày
  },
  done: {
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    border: "border-emerald-300",
    hex: "#16A34A", // Màu xanh lá khi đã hoàn thành
  },
};

/**
 * Tính toán nhãn hạn nộp thân thiện cho học sinh:
 * - "Hôm nay 21:00", "Ngày mai 22:00", "Còn 2 ngày" (≤ 7 ngày), còn lại "dd/MM".
 * - Quá hạn: "Quá hạn hôm qua", "Quá hạn 2 ngày", v.v.
 * - Hỗ trợ truyền tham số `now` để test và deterministic render.
 */
export function formatDueLabel(
  dueAt: string | Date,
  options?: {
    isCompleted?: boolean;
    status?: string;
    now?: Date | string | number;
  }
): DueLabelResult {
  const { isCompleted = false, status = "pending", now } = options || {};

  // 1. Đã hoàn thành
  if (isCompleted || status === "completed") {
    return {
      text: "Đã hoàn thành",
      urgency: "done",
    };
  }

  const dueDate = toValidDate(dueAt);
  if (!dueDate) {
    return {
      text: "Chưa rõ hạn",
      urgency: "normal",
    };
  }

  const nowDate = now ? (toValidDate(now as string | Date) || new Date()) : new Date();

  // 2. Kiểm tra quá hạn
  const isOverdueStatus = status === "overdue";
  const isPastDueTime = dueDate.getTime() < nowDate.getTime();

  if (isOverdueStatus || isPastDueTime) {
    const diffDays = differenceInCalendarDays(nowDate, dueDate);
    if (diffDays <= 0) {
      return {
        text: "Quá hạn hôm nay",
        urgency: "overdue",
      };
    }
    if (diffDays === 1) {
      return {
        text: "Quá hạn hôm qua",
        urgency: "overdue",
      };
    }
    return {
      text: `Quá hạn ${diffDays} ngày`,
      urgency: "overdue",
    };
  }

  // 3. Chưa quá hạn
  // a) Hạn trong ngày hôm nay
  if (isSameDay(dueDate, nowDate)) {
    return {
      text: `Hôm nay ${format(dueDate, "HH:mm")}`,
      urgency: "urgent",
    };
  }

  // b) Hạn vào ngày mai
  const tomorrow = addDays(nowDate, 1);
  if (isSameDay(dueDate, tomorrow)) {
    const diffHours = (dueDate.getTime() - nowDate.getTime()) / (1000 * 60 * 60);
    return {
      text: `Ngày mai ${format(dueDate, "HH:mm")}`,
      urgency: diffHours <= 24 ? "urgent" : "soon",
    };
  }

  // c) Còn trong vòng 7 ngày
  const remainingDays = differenceInCalendarDays(dueDate, nowDate);
  if (remainingDays >= 2 && remainingDays <= 7) {
    return {
      text: `Còn ${remainingDays} ngày`,
      urgency: "soon",
    };
  }

  // d) Xa hơn 7 ngày
  return {
    text: format(dueDate, "dd/MM"),
    urgency: "normal",
  };
}
