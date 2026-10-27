import React from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface WheelBannerProps {
  className?: string;
}

/**
 * Banner tiêu đề "VÒNG QUAY MAY MẮN" phong cách Biển Gỗ Hoàng Kim 3D (Golden Wood Plaque).
 * Đồng bộ hoàn hảo với phong cách gỗ nâu hổ phách, viền vàng kim loại và đinh tán đồng của hệ thống.
 */
export function WheelBanner({ className }: WheelBannerProps) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center select-none z-20 w-full max-w-[240px] sm:max-w-[270px] lg:max-w-[290px] mx-auto filter drop-shadow-[0_6px_14px_rgba(0,0,0,0.28)]",
        className
      )}
    >
      <svg
        viewBox="0 0 320 54"
        className="w-full h-auto overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradient gỗ hổ phách 3D cao cấp */}
          <linearGradient id="wheelWoodGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#C87528" />
            <stop offset="25%" stopColor="#A85718" />
            <stop offset="75%" stopColor="#7E3707" />
            <stop offset="100%" stopColor="#552102" />
          </linearGradient>

          {/* Gradient viền vàng kim loại lấp lánh */}
          <linearGradient id="wheelGoldRim" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFF2A3" />
            <stop offset="35%" stopColor="#FBBF24" />
            <stop offset="75%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>

          {/* Viền sáng mảnh dập nổi bên trong */}
          <linearGradient id="wheelInnerLine" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.45)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0.08)" />
          </linearGradient>
        </defs>

        {/* Khối đáy bóng gỗ 3D dày 5px */}
        <rect x="8" y="9" width="304" height="41" rx="16" fill="#351401" />

        {/* Mặt chính bảng gỗ hổ phách */}
        <rect
          x="8"
          y="4"
          width="304"
          height="41"
          rx="16"
          fill="url(#wheelWoodGrad)"
          stroke="url(#wheelGoldRim)"
          strokeWidth="3"
          strokeLinejoin="round"
        />

        {/* Viền dập nổi bên trong */}
        <rect
          x="12"
          y="8"
          width="296"
          height="33"
          rx="12"
          stroke="url(#wheelInnerLine)"
          strokeWidth="1.2"
        />

        {/* Vệt sáng phản quang ở viền trên */}
        <path
          d="M 28 8.5 L 292 8.5"
          stroke="rgba(255, 255, 255, 0.55)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Chốt đinh tán vàng kim bên trái */}
        <circle cx="23" cy="24.5" r="3.8" fill="#FDE047" stroke="#78350F" strokeWidth="1.2" />
        <circle cx="21.8" cy="23.3" r="1.2" fill="#FFFFFF" />

        {/* Chốt đinh tán vàng kim bên phải */}
        <circle cx="297" cy="24.5" r="3.8" fill="#FDE047" stroke="#78350F" strokeWidth="1.2" />
        <circle cx="295.8" cy="23.3" r="1.2" fill="#FFFFFF" />
      </svg>

      {/* Chữ tiêu đề 3D sắc nét trên mặt gỗ */}
      <div className="absolute inset-0 flex items-center justify-center gap-1.5 sm:gap-2 px-6 pt-0.5 pb-1">
        <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-200 fill-amber-300 drop-shadow-sm flex-shrink-0 animate-pulse" />

        <h2 className="font-heading font-black text-xs sm:text-[13px] lg:text-sm uppercase tracking-wider text-[#FFFDF0] drop-shadow-[0_1.5px_0_#451A03] [text-shadow:_0_1.5px_0_#381400,_0_2.5px_0_#260D00,_0_4px_6px_rgba(0,0,0,0.5)] whitespace-nowrap">
          VÒNG QUAY MAY MẮN
        </h2>

        <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-200 fill-amber-300 drop-shadow-sm flex-shrink-0 animate-pulse" />
      </div>
    </div>
  );
}
