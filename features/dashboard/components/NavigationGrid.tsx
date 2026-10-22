"use client";

import { navigationCards } from "../data/navigationData";
import { NavigationCard } from "./NavigationCard";

export function NavigationGrid() {
  return (
    /* Khung ngoài tạo viền gradient mờ dần từ trên xuống dưới (white/40 -> white/18 -> white/10) */
    <div className="relative w-full h-full rounded-[28px] sm:rounded-[32px] p-[2px] bg-gradient-to-b from-white/40 via-white/18 to-white/10 shadow-[0_16px_36px_rgba(0,35,90,0.22)] overflow-visible">
      {/* Pháo hoa rực rỡ nghệ thuật góc trên bên trái (Curved Spark Trails + Confetti + Diamond Stars) */}
      <div className="absolute -top-6 -left-6 sm:-top-7 sm:-left-7 w-20 h-20 sm:w-24 sm:h-24 pointer-events-none select-none z-20">
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_4px_12px_rgba(0,0,0,0.35)]">
          <defs>
            <linearGradient id="goldStarLeftGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF9C4" />
              <stop offset="35%" stopColor="#FFD54F" />
              <stop offset="70%" stopColor="#FFA000" />
              <stop offset="100%" stopColor="#FF6F00" />
            </linearGradient>
            <radialGradient id="haloLeft" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFEB3B" stopOpacity="0.4" />
              <stop offset="60%" stopColor="#00E5FF" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#004DA3" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Vầng sáng hào quang mềm mại */}
          <circle cx="58" cy="58" r="32" fill="url(#haloLeft)" />

          {/* Dải tia pháo hoa uốn lượn tự nhiên có đứt đoạn lấp lánh (không phải que thẳng) */}
          <path d="M58,58 Q42,42 18,30" stroke="#FFD700" strokeWidth="2.2" strokeLinecap="round" strokeDasharray="6 3.5" fill="none" opacity="0.95" />
          <path d="M58,58 Q48,28 32,6" stroke="#FF2E93" strokeWidth="2.2" strokeLinecap="round" strokeDasharray="5 3" fill="none" opacity="0.95" />
          <path d="M58,58 Q66,28 60,2" stroke="#00E5FF" strokeWidth="2.2" strokeLinecap="round" strokeDasharray="6 3.5" fill="none" opacity="0.95" />
          <path d="M58,58 Q34,52 6,52" stroke="#00E676" strokeWidth="2.2" strokeLinecap="round" strokeDasharray="5 3" fill="none" opacity="0.9" />
          <path d="M58,58 Q38,74 16,90" stroke="#FF9100" strokeWidth="2" strokeLinecap="round" strokeDasharray="5 3" fill="none" opacity="0.9" />
          <path d="M58,58 Q74,32 80,12" stroke="#C084FC" strokeWidth="1.8" strokeLinecap="round" strokeDasharray="4 3" fill="none" opacity="0.85" />

          {/* Ngôi sao 4 cánh kim cương lấp lánh (✦) uốn cong tinh xảo */}
          {/* Sao vàng to */}
          <path d="M 24 10 C 24 19 23 20 14 20 C 23 20 24 21 24 30 C 24 21 25 20 34 20 C 25 20 24 19 24 10 Z" fill="#FFF176" />
          <circle cx="24" cy="20" r="1.5" fill="white" />

          {/* Sao xanh cyan */}
          <path d="M 48 3 C 48 8 47 9 42 9 C 47 9 48 10 48 15 C 48 10 49 9 54 9 C 49 9 48 8 48 3 Z" fill="#67E8F9" />
          <circle cx="48" cy="9" r="1.2" fill="white" />

          {/* Sao hồng cánh sen */}
          <path d="M 10 36 C 10 41 9 42 4 42 C 9 42 10 43 10 48 C 10 43 11 42 16 42 C 11 42 10 41 10 36 Z" fill="#F472B6" />

          {/* Sao tím nhỏ */}
          <path d="M 72 7 C 72 11 71 12 67 12 C 71 12 72 13 72 17 C 72 13 73 12 77 12 C 73 12 72 11 72 7 Z" fill="#E9D5FF" />

          {/* Mảnh pháo giấy kim tuyến confetti bay lượn sinh động */}
          <rect x="32" y="34" width="5.5" height="2.8" rx="1" fill="#FFD54F" transform="rotate(35 32 34)" />
          <rect x="18" y="68" width="5" height="2.5" rx="1" fill="#FF4081" transform="rotate(-25 18 68)" />
          <rect x="54" y="20" width="4.5" height="2.2" rx="0.8" fill="#00E5FF" transform="rotate(45 54 20)" />
          <rect x="36" y="16" width="4" height="2" rx="0.8" fill="#69F0AE" transform="rotate(-35 36 16)" />
          <rect x="8" y="24" width="4" height="2" rx="0.8" fill="#FFA726" transform="rotate(20 8 24)" />

          {/* Hạt bụi sáng stardust li ti */}
          <circle cx="34" cy="48" r="1.8" fill="#FFF" opacity="0.9" />
          <circle cx="50" cy="32" r="1.5" fill="#FDE047" opacity="0.9" />
          <circle cx="18" cy="56" r="1.2" fill="#67E8F9" opacity="0.85" />
          <circle cx="66" cy="40" r="1.2" fill="#F472B6" opacity="0.8" />

          {/* Ngôi sao vàng 3D sắc sảo ở góc card */}
          <path
            d="M 58 46 L 61 54 L 69.5 54.5 L 63 60 L 65.5 68 L 58 63 L 50.5 68 L 53 60 L 46.5 54.5 L 55 54 Z"
            fill="url(#goldStarLeftGrad)"
            stroke="#B45309"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          <circle cx="58" cy="50" r="1.3" fill="white" opacity="0.85" />
        </svg>
      </div>

      {/* Pháo hoa rực rỡ nghệ thuật góc trên bên phải */}
      <div className="absolute -top-6 -right-6 sm:-top-7 sm:-right-7 w-20 h-20 sm:w-24 sm:h-24 pointer-events-none select-none z-20">
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_4px_12px_rgba(0,0,0,0.35)]">
          <defs>
            <linearGradient id="goldStarRightGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF9C4" />
              <stop offset="35%" stopColor="#FFD54F" />
              <stop offset="70%" stopColor="#FFA000" />
              <stop offset="100%" stopColor="#FF6F00" />
            </linearGradient>
            <radialGradient id="haloRight" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFEB3B" stopOpacity="0.4" />
              <stop offset="60%" stopColor="#00E5FF" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#004DA3" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Vầng sáng hào quang mềm mại */}
          <circle cx="42" cy="58" r="32" fill="url(#haloRight)" />

          {/* Dải tia pháo hoa uốn lượn tự nhiên */}
          <path d="M42,58 Q58,42 82,30" stroke="#00E5FF" strokeWidth="2.2" strokeLinecap="round" strokeDasharray="6 3.5" fill="none" opacity="0.95" />
          <path d="M42,58 Q52,28 68,6" stroke="#FF2E93" strokeWidth="2.2" strokeLinecap="round" strokeDasharray="5 3" fill="none" opacity="0.95" />
          <path d="M42,58 Q34,28 40,2" stroke="#FFD700" strokeWidth="2.2" strokeLinecap="round" strokeDasharray="6 3.5" fill="none" opacity="0.95" />
          <path d="M42,58 Q66,52 94,52" stroke="#00E676" strokeWidth="2.2" strokeLinecap="round" strokeDasharray="5 3" fill="none" opacity="0.9" />
          <path d="M42,58 Q62,74 84,90" stroke="#FF9100" strokeWidth="2" strokeLinecap="round" strokeDasharray="5 3" fill="none" opacity="0.9" />
          <path d="M42,58 Q26,32 20,12" stroke="#C084FC" strokeWidth="1.8" strokeLinecap="round" strokeDasharray="4 3" fill="none" opacity="0.85" />

          {/* Ngôi sao 4 cánh kim cương lấp lánh (✦) */}
          <path d="M 76 10 C 76 19 77 20 86 20 C 77 20 76 21 76 30 C 76 21 75 20 66 20 C 75 20 76 19 76 10 Z" fill="#FFF176" />
          <circle cx="76" cy="20" r="1.5" fill="white" />

          <path d="M 52 3 C 52 8 53 9 58 9 C 53 9 52 10 52 15 C 52 10 51 9 46 9 C 51 9 52 8 52 3 Z" fill="#67E8F9" />
          <circle cx="52" cy="9" r="1.2" fill="white" />

          <path d="M 90 36 C 90 41 91 42 96 42 C 91 42 90 43 90 48 C 90 43 89 42 84 42 C 89 42 90 41 90 36 Z" fill="#F472B6" />

          <path d="M 28 7 C 28 11 29 12 33 12 C 29 12 28 13 28 17 C 28 13 27 12 23 12 C 27 12 28 11 28 7 Z" fill="#E9D5FF" />

          {/* Mảnh pháo giấy kim tuyến confetti bay lượn sinh động */}
          <rect x="68" y="34" width="5.5" height="2.8" rx="1" fill="#FFD54F" transform="rotate(-35 68 34)" />
          <rect x="82" y="68" width="5" height="2.5" rx="1" fill="#FF4081" transform="rotate(25 82 68)" />
          <rect x="46" y="20" width="4.5" height="2.2" rx="0.8" fill="#00E5FF" transform="rotate(-45 46 20)" />
          <rect x="64" y="16" width="4" height="2" rx="0.8" fill="#69F0AE" transform="rotate(35 64 16)" />
          <rect x="92" y="24" width="4" height="2" rx="0.8" fill="#FFA726" transform="rotate(-20 92 24)" />

          {/* Hạt bụi sáng stardust li ti */}
          <circle cx="66" cy="48" r="1.8" fill="#FFF" opacity="0.9" />
          <circle cx="50" cy="32" r="1.5" fill="#FDE047" opacity="0.9" />
          <circle cx="82" cy="56" r="1.2" fill="#67E8F9" opacity="0.85" />
          <circle cx="34" cy="40" r="1.2" fill="#F472B6" opacity="0.8" />

          {/* Ngôi sao vàng 3D sắc sảo ở góc card */}
          <path
            d="M 42 46 L 45 54 L 53.5 54.5 L 47 60 L 49.5 68 L 42 63 L 34.5 68 L 37 60 L 30.5 54.5 L 39 54 Z"
            fill="url(#goldStarRightGrad)"
            stroke="#B45309"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          <circle cx="42" cy="50" r="1.3" fill="white" opacity="0.85" />
        </svg>
      </div>

      {/* Thân card bên trong với background mờ dần từ trên xuống dưới (90% -> 45% -> 18%) */}
      <div className="w-full h-full rounded-[26px] sm:rounded-[30px] p-3.5 sm:p-4.5 lg:p-5 pt-3 sm:pt-3.5 bg-gradient-to-b from-[#004DA3]/90 via-[#005ABF]/45 to-[#003B7A]/18 flex flex-col justify-between overflow-visible">
        {/* Section Header with 3D text */}
        <div className="relative flex items-center justify-center gap-2 mb-2 sm:mb-2.5 select-none">
          <h2 className="text-2xl sm:text-3xl font-heading font-black uppercase tracking-wider text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] [text-shadow:_0_2px_0_#003E8A,_0_4px_6px_rgba(0,0,0,0.3)] flex items-center gap-2.5">
            <span>TÍNH NĂNG NỔI BẬT</span>
            <span className="text-2xl sm:text-3xl select-none filter drop-shadow">✨</span>
          </h2>
        </div>

        {/* 2x2 Navigation Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5 w-full">
          {navigationCards.map((item) => (
            <NavigationCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
