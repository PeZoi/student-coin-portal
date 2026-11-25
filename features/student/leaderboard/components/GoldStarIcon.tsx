import React from "react";

export function GoldStarIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none">
      <defs>
        {/* Gradient Ngôi sao vàng 3D */}
        <linearGradient id="goldStar3D" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF9C4" />
          <stop offset="35%" stopColor="#FFD54F" />
          <stop offset="70%" stopColor="#FFB300" />
          <stop offset="100%" stopColor="#FF8F00" />
        </linearGradient>
        {/* Viền bóng cam đậm */}
        <linearGradient id="goldStarStroke" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFA000" />
          <stop offset="100%" stopColor="#D84315" />
        </linearGradient>
      </defs>

      {/* Bóng đổ */}
      <circle cx="16" cy="18" r="10" fill="#FFA000" opacity="0.2" filter="blur(2px)" />

      {/* Ngôi sao 5 cánh chuẩn Game UI */}
      <path
        d="M 16 3 
           L 19.8 11.2 
           L 28.8 12.3 
           L 22.1 18.5 
           L 24 27.5 
           L 16 23 
           L 8 27.5 
           L 9.9 18.5 
           L 3.2 12.3 
           L 12.2 11.2 Z"
        fill="url(#goldStar3D)"
        stroke="url(#goldStarStroke)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Tâm sáng bóng 3D */}
      <path
        d="M 16 6 L 18.5 12 L 24.5 13 L 20 17.5 L 21 23 L 16 20 Z"
        fill="#FFFFFF"
        opacity="0.35"
      />
      <circle cx="16" cy="15" r="2" fill="#FFFFFF" opacity="0.6" />
    </svg>
  );
}

