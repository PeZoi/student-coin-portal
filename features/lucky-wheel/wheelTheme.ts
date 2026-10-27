/**
 * Hệ thống màu chuẩn cho Vòng Quay May Mắn (Lucky Wheel Design Tokens)
 * Đồng bộ màu sắc giữa viền, đèn, múi quạt, chip chữ, nút bấm và kim chỉ.
 */
export const WHEEL_THEME = {
  rim: {
    from: "#FFF0B3",
    mid: "#FFC93C",
    to: "#E39A0B",
    edge: "#9A5B00",
  },
  ring: {
    from: "#16337A",
    to: "#0B2058",
  },
  bulb: {
    on: "#FFF7C2",
    glow: "#FFC93C",
    off: "#C9962E",
  },
  slices: [
    { from: "#FFE680", to: "#FFC93C", text: "#7A4300" }, // Miếng chẵn: vàng kem
    { from: "#3E9BFF", to: "#1B66E0", text: "#0C3A8C" }, // Miếng lẻ: xanh dương
  ],
  divider: "rgba(255,255,255,0.85)",
  special: {
    from: "#A78BFA",
    to: "#7C3AED",
  },
  action: {
    from: "#FF6B81",
    to: "#E0194B",
    ring: "#FFD45A",
    shadow: "#8F0F2E",
  },
} as const;

/**
 * Lấy theme màu cho múi thứ i (xen kẽ chẵn/lẻ)
 */
export const getSliceTheme = (i: number) => WHEEL_THEME.slices[i % 2];
