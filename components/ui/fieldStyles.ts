export type FieldSize = "sm" | "md" | "lg";
export type FieldVariant = "default" | "cream" | "white";
export type FieldIconStyle = "tile" | "plain";

/**
 * Cấu hình kích thước và padding dùng chung cho Input và Select
 * - Cỡ chữ giá trị cố định 16px (text-base) ở md và sm để ngăn chặn hiện tượng iOS Safari tự động zoom
 * - Chiều cao tối thiểu cố định: sm: 40px, md: 48px, lg: 56px
 */
export const FIELD_SIZES: Record<
  FieldSize,
  {
    container: string;
    text: string;
    tileIcon: string;
    plainIcon: string;
    item: string;
  }
> = {
  sm: {
    container: "min-h-10 pl-2 pr-3 rounded-xl",
    text: "text-base",
    tileIcon: "w-7 h-7 text-base rounded-md mr-2",
    plainIcon: "w-5 h-5 text-base mr-1.5",
    item: "min-h-10 px-3 py-2 text-base",
  },
  md: {
    container: "min-h-12 pl-2 pr-3 rounded-2xl",
    text: "text-base",
    tileIcon: "w-8 h-8 text-lg rounded-lg mr-2.5",
    plainIcon: "w-6 h-6 text-lg mr-2",
    item: "min-h-11 px-3 py-2.5 text-base",
  },
  lg: {
    container: "min-h-14 pl-2.5 pr-3.5 rounded-2xl",
    text: "text-lg",
    tileIcon: "w-9 h-9 text-xl rounded-lg mr-3",
    plainIcon: "w-7 h-7 text-xl mr-2.5",
    item: "min-h-12 px-3.5 py-3 text-lg",
  },
};

/**
 * Biến thể màu nền
 */
export const FIELD_VARIANTS: Record<FieldVariant, string> = {
  default: "bg-white",
  white: "bg-white",
  cream: "bg-[#FFF8E6]",
};

/**
 * Các lớp style trạng thái khung viền và tương tác
 * - Viền thường #B08A52 (tương phản >= 3:1 với nền trắng)
 * - Hover #9A7440
 * - Focus #D97706 + ring hổ phách
 * - Error #DC2626 + nền #FFF5F5 + ring đỏ
 */
export const FIELD_BASE_BORDER =
  "border-2 border-[#B08A52] hover:border-[#9A7440] shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]";

export const FIELD_FOCUS_RING =
  "focus-within:border-[#D97706] focus-within:ring-4 focus-within:ring-amber-500/30";

export const FIELD_ERROR_BORDER =
  "border-2 border-[#DC2626] bg-[#FFF5F5] focus-within:border-[#DC2626] focus-within:ring-4 focus-within:ring-red-500/20";

export const FIELD_DISABLED =
  "opacity-60 bg-stone-100 cursor-not-allowed hover:border-[#B08A52]";

/**
 * Style văn bản giá trị & placeholder
 * - Dùng font-heading (Baloo 2) bo tròn hoạt hình, đồng bộ hoàn hảo với toàn bộ style form 3D
 * - Placeholder màu nâu kem ấm #A68A70 với font-semibold tròn trĩnh, không còn bị mỏng hay thô cứng
 */
export const FIELD_VALUE_TEXT =
  "font-heading font-bold text-[#3B1902] placeholder:text-[#A68A70] placeholder:font-heading placeholder:font-semibold";

/**
 * Style nhãn (Label)
 */
export const FIELD_LABEL =
  "block font-heading font-extrabold text-[13px] sm:text-sm text-[#4A2307] mb-1 select-none";

/**
 * Style ô Icon Tile (ô vuông bo tròn màu vàng kem)
 */
export const FIELD_TILE_ICON =
  "flex-shrink-0 flex items-center justify-center bg-[#FFF0D1] border border-[#F0DCB8] select-none leading-none shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),0_1px_2px_rgba(0,0,0,0.04)]";

/**
 * Style ô Icon Plain (icon trực tiếp không có khung nền)
 */
export const FIELD_PLAIN_ICON =
  "flex-shrink-0 flex items-center justify-center select-none leading-none";

