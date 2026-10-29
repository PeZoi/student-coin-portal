import React from "react";

export function GiftBoxIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 36" className={className} fill="none">
      <defs>
        {/* Hộp quà đỏ cam tươi 3D */}
        <linearGradient id="giftBoxBody" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FF4D4D" />
          <stop offset="60%" stopColor="#E61E2A" />
          <stop offset="100%" stopColor="#B30E18" />
        </linearGradient>
        {/* Nắp hộp quà */}
        <linearGradient id="giftLid" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FF6B6B" />
          <stop offset="100%" stopColor="#D91424" />
        </linearGradient>
        {/* Ruy băng vàng kim loại 3D */}
        <linearGradient id="giftRibbon" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF176" />
          <stop offset="45%" stopColor="#FFD54F" />
          <stop offset="100%" stopColor="#FF8F00" />
        </linearGradient>
      </defs>

      {/* Bóng dưới đáy hộp */}
      <ellipse cx="18" cy="33" rx="13" ry="2.5" fill="#000000" opacity="0.15" />

      {/* Thân hộp quà */}
      <rect x="6" y="15" width="24" height="17" rx="3.5" fill="url(#giftBoxBody)" stroke="#8A000A" strokeWidth="1" />

      {/* Ruy băng dọc thân hộp */}
      <rect x="15" y="15" width="6" height="17" fill="url(#giftRibbon)" stroke="#B26A00" strokeWidth="0.8" />

      {/* Nắp hộp quà */}
      <rect x="4" y="11" width="28" height="6.5" rx="2.5" fill="url(#giftLid)" stroke="#8A000A" strokeWidth="1" />

      {/* Ruy băng dọc nắp hộp */}
      <rect x="15" y="11" width="6" height="6.5" fill="url(#giftRibbon)" stroke="#B26A00" strokeWidth="0.8" />

      {/* Vệt sáng bóng kính trên nắp */}
      <rect x="5.5" y="12" width="25" height="1.8" rx="0.9" fill="#FFFFFF" opacity="0.4" />

      {/* Nơ ruy băng uốn cong trên đỉnh hộp */}
      {/* Cánh nơ trái */}
      <path
        d="M 18 11 C 13 4, 7 5, 10 10 C 13 12, 17 11.5, 18 11 Z"
        fill="url(#giftRibbon)"
        stroke="#B26A00"
        strokeWidth="0.8"
      />
      {/* Cánh nơ phải */}
      <path
        d="M 18 11 C 23 4, 29 5, 26 10 C 23 12, 19 11.5, 18 11 Z"
        fill="url(#giftRibbon)"
        stroke="#B26A00"
        strokeWidth="0.8"
      />
      {/* Tâm nơ tròn */}
      <circle cx="18" cy="11" r="2.2" fill="#FFE082" stroke="#B26A00" strokeWidth="0.8" />
    </svg>
  );
}

