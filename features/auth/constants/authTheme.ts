/**
 * Theme màu bảng gỗ hoạt hình và ruột thẻ giấy kem của Module Auth
 * - Đảm bảo độ tương phản cao, tông màu ấm áp và sinh động
 */
export const AUTH_THEME = {
  // Khung bảng gỗ hoạt hình 3D (The Wooden Game Board)
  board: {
    gradient: "bg-gradient-to-b from-[#B5661F] via-[#8C4A14] to-[#6E380C]",
    border: "border-4 border-[#4A2208]",
    shadow:
      "shadow-[0_22px_50px_rgba(2,12,35,0.55),inset_0_2px_4px_rgba(255,214,150,0.5),inset_0_-4px_6px_rgba(0,0,0,0.4)]",
    rounded: "rounded-[32px] sm:rounded-[36px]",
  },

  // Tab chuyển đổi vai trò (Học sinh vs Giáo viên)
  roleTab: {
    active:
      "bg-gradient-to-b from-[#FFAE33] to-[#F59300] text-[#3B1700] border-2 border-[#FFE885] shadow-[inset_0_2px_0_rgba(255,255,255,0.7),0_4px_8px_rgba(0,0,0,0.25)] scale-[1.02]",
    inactive:
      "bg-[#6B3510] text-[#FFE9CC] hover:bg-[#7D3E13] border-2 border-[#4A2208] shadow-inner",
  },

  // Ruột thẻ giấy kem vàng (Inner Vanilla Card - Gradient kem ấm áp có chiều sâu 3D)
  card: {
    bg: "bg-gradient-to-b from-[#FFFDF8] via-[#FFF8E7] to-[#FFF0D4]",
    border: "border-[3px] border-[#E8D2A8]",
    shadow:
      "shadow-[inset_0_2px_4px_rgba(0,0,0,0.06),0_6px_12px_rgba(0,0,0,0.15)]",
    rounded: "rounded-[24px]",
  },

  // Thanh chuyển đổi Đăng nhập / Đăng ký dành riêng cho Học sinh
  modeTab: {
    wrapper: "bg-[#EAD6BD] border border-[#D5BEA0] rounded-full p-1",
    active:
      "bg-white text-[#421D05] shadow-[0_2px_4px_rgba(0,0,0,0.12)] scale-[1.02]",
    inactive: "text-[#7A4E26] hover:text-[#421D05]",
  },

  // Dòng chữ chào đầu ruột thẻ
  greeting: "font-heading font-black text-sm sm:text-base text-[#5A2A08] mb-2 text-center",
} as const;

