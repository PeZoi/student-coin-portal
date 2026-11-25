
import { useId } from "react";

interface MissionWoodBannerProps {
  title: string;
}

export function MissionWoodBanner({ title }: MissionWoodBannerProps) {
  const uniqueId = useId();
  const plateGradId = `woodPlateGrad-${uniqueId}`;
  const borderGradId = `woodBorderGrad-${uniqueId}`;

  return (
    <div className="relative inline-flex items-center justify-center select-none w-full max-w-[175px] sm:max-w-[210px] lg:max-w-[250px] xl:max-w-[270px] mx-auto filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.2)]">
      <svg viewBox="0 0 280 50" className="w-full h-auto" fill="none">
        <defs>
          {/* Gradient gỗ 3D ấm áp */}
          <linearGradient id={plateGradId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#C47327" />
            <stop offset="30%" stopColor="#A85718" />
            <stop offset="100%" stopColor="#783707" />
          </linearGradient>

          {/* Gradient viền gỗ vàng mật ong */}
          <linearGradient id={borderGradId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFE082" />
            <stop offset="50%" stopColor="#E69530" />
            <stop offset="100%" stopColor="#8D3F04" />
          </linearGradient>
        </defs>

        {/* Khối đáy bóng gỗ 3D dày 4px */}
        <rect x="6" y="8" width="268" height="38" rx="14" fill="#451B03" />

        {/* Mặt chính bảng gỗ */}
        <rect
          x="6"
          y="4"
          width="268"
          height="38"
          rx="14"
          fill={`url(#${plateGradId})`}
          stroke={`url(#${borderGradId})`}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Vân sáng nhẹ ở viền trên tấm gỗ */}
        <path
          d="M 22 8 L 258 8"
          stroke="rgba(255, 255, 255, 0.45)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Hai chốt đinh tán đồng ở 2 đầu bảng gỗ */}
        <circle cx="18" cy="23" r="2.5" fill="#FFE57F" stroke="#783707" strokeWidth="1" />
        <circle cx="262" cy="23" r="2.5" fill="#FFE57F" stroke="#783707" strokeWidth="1" />
      </svg>

      {/* Chữ tiêu đề 3D sắc nét trên mặt gỗ */}
      <div className="absolute inset-0 flex items-center justify-center gap-1.5 pt-0.5 pb-0.5 px-3">
        <span className="font-heading font-black text-xs sm:text-[13px] lg:text-sm uppercase tracking-wide text-white drop-shadow-[0_1.5px_0_#4A1D00] [text-shadow:_0_1.5px_0_#381500,_0_2px_4px_rgba(0,0,0,0.5)] flex items-center gap-1.5 truncate">
          <span>{title}</span>
        </span>
      </div>
    </div>
  );
}
