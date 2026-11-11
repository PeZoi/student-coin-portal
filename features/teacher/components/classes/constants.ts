/**
 * Bảng màu chuẩn dùng cho giao diện Quản lý lớp học
 */
export const CLASSES_PALETTE = {
  pageBg: "#F3F6FB",
  cardBg: "#FFFFFF",
  cardBorder: "#E2E8F0",
  textPrimary: "#0F172A",
  textSecondary: "#475569",
  textPlaceholder: "#64748B",
  brand: "#0A62D6",
  brandHover: "#0850B0",
  brandLight: "#EAF2FF",
  brandBorder: "#CFE1FB",
  brandRing: "rgba(10, 98, 214, 0.25)",
  statusActive: {
    dot: "#22C55E",
    bg: "#ECFDF3",
    text: "#15803D",
  },
  statusInactive: {
    dot: "#94A3B8",
    bg: "#F1F5F9",
    text: "#475569",
  },
  rowIconBox: {
    bg: "#F1F5F9",
    icon: "#64748B",
  },
} as const;

/**
 * 6 cặp pastel (nền/chữ) dành cho avatar giáo viên
 */
export const TEACHER_AVATAR_COLORS = [
  { bg: "#DBEAFE", text: "#1E40AF" },
  { bg: "#CCFBF1", text: "#115E59" },
  { bg: "#FEF3C7", text: "#92400E" },
  { bg: "#FFE4E6", text: "#9F1239" },
  { bg: "#EDE9FE", text: "#5B21B6" },
  { bg: "#DCFCE7", text: "#166534" },
] as const;
