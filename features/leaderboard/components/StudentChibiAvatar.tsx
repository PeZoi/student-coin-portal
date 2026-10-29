"use client";

import React from "react";
import Image from "next/image";

interface StudentChibiAvatarProps {
  avatarId: string;
  name: string;
  hasCrown?: boolean;
  className?: string;
  imageSrc?: string;
}

export function StudentChibiAvatar({
  avatarId,
  name,
  hasCrown = false,
  className = "w-12 h-12 sm:w-13 sm:h-13",
  imageSrc,
}: StudentChibiAvatarProps) {
  // Nếu có ảnh thật (ví dụ avatar.jpg) và là avatarId tương ứng
  if (imageSrc) {
    return (
      <div className={`relative flex-shrink-0 ${className}`}>
        {hasCrown && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none select-none drop-shadow-md animate-bounce-slow">
            <CrownSticker />
          </div>
        )}
        <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-white shadow-sm bg-amber-50">
          <Image
            src={imageSrc}
            alt={name}
            fill
            sizes="48px"
            unoptimized
            className="object-cover"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`relative flex-shrink-0 select-none ${className}`}>
      {/* Vương miện nhỏ xinh cho Top 1 */}
      {hasCrown && (
        <div className="absolute -top-3 sm:-top-3.5 left-1/2 -translate-x-1/2 z-20 pointer-events-none drop-shadow-md">
          <CrownSticker />
        </div>
      )}

      {/* Vòng tròn Avatar Chibi Vector sắc nét */}
      <div className="w-full h-full rounded-full overflow-hidden border-2 border-white/90 shadow-[0_2px_6px_rgba(0,0,0,0.12)] bg-[#FFF5E6] flex items-center justify-center relative">
        <ChibiFace avatarId={avatarId} />
      </div>
    </div>
  );
}

function CrownSticker() {
  return (
    <svg viewBox="0 0 24 18" className="w-5 h-4 sm:w-6 sm:h-4.5 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)]">
      <defs>
        <linearGradient id="crownGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFF176" />
          <stop offset="50%" stopColor="#FFD54F" />
          <stop offset="100%" stopColor="#FFA000" />
        </linearGradient>
      </defs>
      {/* Crown base */}
      <path
        d="M 2 15 L 22 15 L 20 5 L 14 11 L 12 3 L 10 11 L 4 5 Z"
        fill="url(#crownGrad)"
        stroke="#E65100"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <circle cx="2" cy="5" r="1.5" fill="#FFE082" stroke="#E65100" strokeWidth="0.8" />
      <circle cx="12" cy="3" r="1.8" fill="#FFF9C4" stroke="#E65100" strokeWidth="0.8" />
      <circle cx="22" cy="5" r="1.5" fill="#FFE082" stroke="#E65100" strokeWidth="0.8" />
      <rect x="3" y="14" width="18" height="2" rx="1" fill="#FF8F00" />
    </svg>
  );
}

function ChibiFace({ avatarId }: { avatarId: string }) {
  switch (avatarId) {
    case "vu-huy":
      // Vũ Huy: Tóc đen rẽ ngôi, mắt kính tròn, áo xanh dương, nụ cười sáng
      return (
        <svg viewBox="0 0 80 80" className="w-full h-full">
          <circle cx="40" cy="40" r="38" fill="#FFF2DE" />
          {/* Hair back */}
          <path d="M 20 40 Q 20 12 40 12 Q 60 12 60 40 Z" fill="#2D2A32" />
          {/* Face */}
          <circle cx="40" cy="43" r="23" fill="#FFE3CC" />
          {/* Ears */}
          <circle cx="18" cy="44" r="5" fill="#FFE3CC" stroke="#F5CBA7" strokeWidth="1" />
          <circle cx="62" cy="44" r="5" fill="#FFE3CC" stroke="#F5CBA7" strokeWidth="1" />
          {/* Hair front bangs */}
          <path d="M 22 30 Q 32 18 42 28 Q 52 18 60 30 Q 50 20 38 20 Q 28 20 22 30 Z" fill="#2D2A32" />
          {/* Glasses */}
          <circle cx="33" cy="42" r="7" fill="none" stroke="#5D4037" strokeWidth="2.2" />
          <circle cx="47" cy="42" r="7" fill="none" stroke="#5D4037" strokeWidth="2.2" />
          <line x1="40" y1="42" x2="40" y2="42" stroke="#5D4037" strokeWidth="2.5" />
          {/* Eyes */}
          <circle cx="33" cy="42" r="2.5" fill="#212121" />
          <circle cx="34" cy="41" r="0.8" fill="#FFFFFF" />
          <circle cx="47" cy="42" r="2.5" fill="#212121" />
          <circle cx="48" cy="41" r="0.8" fill="#FFFFFF" />
          {/* Blush */}
          <circle cx="26" cy="47" r="3" fill="#FF8A80" opacity="0.6" />
          <circle cx="54" cy="47" r="3" fill="#FF8A80" opacity="0.6" />
          {/* Smile */}
          <path d="M 36 50 Q 40 54 44 50" fill="none" stroke="#D84315" strokeWidth="1.8" strokeLinecap="round" />
          {/* Clothes */}
          <path d="M 22 66 Q 40 58 58 66 L 62 80 L 18 80 Z" fill="#42A5F5" />
          <path d="M 35 62 L 40 68 L 45 62" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case "lan-anh":
      // Lan Anh: Tóc nâu buộc đuôi ngựa cao lệch, nơ đỏ, áo hồng
      return (
        <svg viewBox="0 0 80 80" className="w-full h-full">
          <circle cx="40" cy="40" r="38" fill="#FFF0F5" />
          {/* High Ponytail */}
          <path d="M 50 18 Q 72 15 68 35 Q 60 30 52 24 Z" fill="#5D4037" />
          <circle cx="53" cy="22" r="4" fill="#E53935" />
          {/* Face */}
          <circle cx="40" cy="43" r="23" fill="#FFE3CC" />
          {/* Ears */}
          <circle cx="18" cy="44" r="5" fill="#FFE3CC" stroke="#F5CBA7" strokeWidth="1" />
          <circle cx="62" cy="44" r="5" fill="#FFE3CC" stroke="#F5CBA7" strokeWidth="1" />
          {/* Hair */}
          <path d="M 20 38 Q 20 18 40 18 Q 58 18 60 38 Q 50 24 40 25 Q 28 24 20 38 Z" fill="#5D4037" />
          {/* Cute side bangs */}
          <path d="M 22 36 Q 28 42 26 50 Q 24 44 20 38 Z" fill="#5D4037" />
          <path d="M 58 36 Q 52 42 54 50 Q 56 44 60 38 Z" fill="#5D4037" />
          {/* Eyes */}
          <circle cx="33" cy="42" r="3" fill="#3E2723" />
          <circle cx="34.5" cy="40.5" r="1.2" fill="#FFFFFF" />
          <circle cx="47" cy="42" r="3" fill="#3E2723" />
          <circle cx="48.5" cy="40.5" r="1.2" fill="#FFFFFF" />
          {/* Blush */}
          <circle cx="26" cy="47" r="3.5" fill="#FF80AB" opacity="0.65" />
          <circle cx="54" cy="47" r="3.5" fill="#FF80AB" opacity="0.65" />
          {/* Smile */}
          <path d="M 36 50 Q 40 55 44 50" fill="none" stroke="#D81B60" strokeWidth="2" strokeLinecap="round" />
          {/* Clothes */}
          <path d="M 22 66 Q 40 58 58 66 L 62 80 L 18 80 Z" fill="#F06292" />
          <path d="M 36 62 L 40 67 L 44 62" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case "gia-bao":
      // Gia Bảo: Tóc nâu bồng bềnh, áo vàng viền cổ cam, nụ cười vui vẻ (User Profile)
      return (
        <svg viewBox="0 0 80 80" className="w-full h-full">
          <circle cx="40" cy="40" r="38" fill="#FFF9C4" />
          {/* Hair back */}
          <path d="M 20 40 Q 20 14 40 14 Q 60 14 60 40 Z" fill="#4E342E" />
          {/* Face */}
          <circle cx="40" cy="43" r="23" fill="#FFE3CC" />
          {/* Ears */}
          <circle cx="18" cy="44" r="5" fill="#FFE3CC" stroke="#F5CBA7" strokeWidth="1" />
          <circle cx="62" cy="44" r="5" fill="#FFE3CC" stroke="#F5CBA7" strokeWidth="1" />
          {/* Hair bangs */}
          <path d="M 22 34 Q 32 20 42 30 Q 52 20 58 34 Q 48 24 38 24 Q 28 24 22 34 Z" fill="#4E342E" />
          {/* Eyes with sparkle */}
          <ellipse cx="33" cy="42" rx="3.2" ry="3.5" fill="#2E1B10" />
          <circle cx="34.5" cy="40.5" r="1.3" fill="#FFFFFF" />
          <ellipse cx="47" cy="42" rx="3.2" ry="3.5" fill="#2E1B10" />
          <circle cx="48.5" cy="40.5" r="1.3" fill="#FFFFFF" />
          {/* Cheerful Blush */}
          <circle cx="26" cy="47" r="3.5" fill="#FF8A80" opacity="0.65" />
          <circle cx="54" cy="47" r="3.5" fill="#FF8A80" opacity="0.65" />
          {/* Wide Smile */}
          <path d="M 35 49 Q 40 56 45 49 Z" fill="#D84315" />
          {/* Clothes */}
          <path d="M 22 66 Q 40 58 58 66 L 62 80 L 18 80 Z" fill="#FFB300" />
          <path d="M 35 62 L 40 68 L 45 62" fill="none" stroke="#FF6F00" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    case "minh-khang":
      // Minh Khang: Đội mũ lưỡi trai vàng - xanh dương quay ngang/ngược, áo cam
      return (
        <svg viewBox="0 0 80 80" className="w-full h-full">
          <circle cx="40" cy="40" r="38" fill="#FFF3E0" />
          {/* Face */}
          <circle cx="40" cy="44" r="23" fill="#FFE3CC" />
          {/* Ears */}
          <circle cx="18" cy="45" r="5" fill="#FFE3CC" stroke="#F5CBA7" strokeWidth="1" />
          <circle cx="62" cy="45" r="5" fill="#FFE3CC" stroke="#F5CBA7" strokeWidth="1" />
          {/* Baseball Cap */}
          {/* Cap Crown (blue) */}
          <path d="M 20 36 Q 20 14 40 14 Q 60 14 60 36 Z" fill="#1E88E5" />
          {/* Cap Visor (yellow) turned sideways */}
          <path d="M 16 36 C 14 36, 12 30, 20 28 L 56 28 C 64 30, 62 36, 60 36 Z" fill="#FDD835" stroke="#FBC02D" strokeWidth="1" />
          <circle cx="40" cy="14" r="2.5" fill="#FDD835" />
          {/* Little hair under cap */}
          <path d="M 22 38 Q 28 34 34 38" fill="none" stroke="#3E2723" strokeWidth="3" strokeLinecap="round" />
          {/* Eyes */}
          <circle cx="33" cy="43" r="3" fill="#212121" />
          <circle cx="34.5" cy="41.5" r="1.2" fill="#FFFFFF" />
          <circle cx="47" cy="43" r="3" fill="#212121" />
          <circle cx="48.5" cy="41.5" r="1.2" fill="#FFFFFF" />
          {/* Blush */}
          <circle cx="26" cy="48" r="3.2" fill="#FF8A80" opacity="0.6" />
          <circle cx="54" cy="48" r="3.2" fill="#FF8A80" opacity="0.6" />
          {/* Big happy grin */}
          <path d="M 35 50 Q 40 56 45 50" fill="none" stroke="#D84315" strokeWidth="2.2" strokeLinecap="round" />
          {/* Clothes */}
          <path d="M 22 66 Q 40 58 58 66 L 62 80 L 18 80 Z" fill="#FB8C00" />
        </svg>
      );

    case "bao-an":
      // Bảo An: Mái ngố, kính tròn, tóc bob ngắn, áo tím nhạt
      return (
        <svg viewBox="0 0 80 80" className="w-full h-full">
          <circle cx="40" cy="40" r="38" fill="#F3E5F5" />
          {/* Bob hair back */}
          <path d="M 18 42 Q 18 16 40 16 Q 62 16 62 42 Q 62 56 56 58 Q 50 50 40 50 Q 30 50 24 58 Q 18 56 18 42 Z" fill="#4E342E" />
          {/* Face */}
          <circle cx="40" cy="42" r="22" fill="#FFE3CC" />
          {/* Bangs */}
          <path d="M 20 32 Q 40 28 60 32 Q 54 22 40 22 Q 26 22 20 32 Z" fill="#4E342E" />
          {/* Glasses */}
          <circle cx="33" cy="42" r="7.5" fill="none" stroke="#795548" strokeWidth="2" />
          <circle cx="47" cy="42" r="7.5" fill="none" stroke="#795548" strokeWidth="2" />
          <line x1="40" y1="42" x2="40" y2="42" stroke="#795548" strokeWidth="2.5" />
          {/* Eyes */}
          <circle cx="33" cy="42" r="2.5" fill="#212121" />
          <circle cx="34" cy="41" r="0.8" fill="#FFFFFF" />
          <circle cx="47" cy="42" r="2.5" fill="#212121" />
          <circle cx="48" cy="41" r="0.8" fill="#FFFFFF" />
          {/* Cute pink blush */}
          <circle cx="25" cy="46" r="3.2" fill="#F48FB1" opacity="0.7" />
          <circle cx="55" cy="46" r="3.2" fill="#F48FB1" opacity="0.7" />
          {/* Smile */}
          <path d="M 37 49 Q 40 53 43 49" fill="none" stroke="#C2185B" strokeWidth="1.8" strokeLinecap="round" />
          {/* Clothes */}
          <path d="M 22 66 Q 40 58 58 66 L 62 80 L 18 80 Z" fill="#BA68C8" />
        </svg>
      );

    case "thao-vy":
      // Thảo Vy: 2 bím tóc thắt nơ hồng hai bên, áo hồng
      return (
        <svg viewBox="0 0 80 80" className="w-full h-full">
          <circle cx="40" cy="40" r="38" fill="#FCE4EC" />
          {/* Braids left & right */}
          <path d="M 20 36 C 12 40, 10 52, 16 58 C 18 50, 22 46, 24 40 Z" fill="#5D4037" />
          <circle cx="16" cy="54" r="3" fill="#FF4081" />
          <path d="M 60 36 C 68 40, 70 52, 64 58 C 62 50, 58 46, 56 40 Z" fill="#5D4037" />
          <circle cx="64" cy="54" r="3" fill="#FF4081" />
          {/* Face */}
          <circle cx="40" cy="42" r="22" fill="#FFE3CC" />
          {/* Hair top & bangs */}
          <path d="M 20 36 Q 22 18 40 18 Q 58 18 60 36 Q 50 24 40 25 Q 30 24 20 36 Z" fill="#5D4037" />
          {/* Eyes */}
          <ellipse cx="33" cy="41" rx="2.8" ry="3.2" fill="#3E2723" />
          <circle cx="34.2" cy="39.8" r="1.1" fill="#FFFFFF" />
          <ellipse cx="47" cy="41" rx="2.8" ry="3.2" fill="#3E2723" />
          <circle cx="48.2" cy="39.8" r="1.1" fill="#FFFFFF" />
          {/* Blush */}
          <circle cx="26" cy="46" r="3.2" fill="#FF80AB" opacity="0.75" />
          <circle cx="54" cy="46" r="3.2" fill="#FF80AB" opacity="0.75" />
          {/* Sweet smile */}
          <path d="M 37 49 Q 40 53 43 49" fill="none" stroke="#D81B60" strokeWidth="2" strokeLinecap="round" />
          {/* Clothes */}
          <path d="M 22 66 Q 40 58 58 66 L 62 80 L 18 80 Z" fill="#EC407A" />
        </svg>
      );

    case "tien-dat":
      // Tiến Đạt: Tóc nâu vuốt nhẹ, áo xanh lá
      return (
        <svg viewBox="0 0 80 80" className="w-full h-full">
          <circle cx="40" cy="40" r="38" fill="#E8F5E9" />
          {/* Face */}
          <circle cx="40" cy="43" r="23" fill="#FFE3CC" />
          {/* Ears */}
          <circle cx="18" cy="44" r="5" fill="#FFE3CC" />
          <circle cx="62" cy="44" r="5" fill="#FFE3CC" />
          {/* Hair */}
          <path d="M 20 38 Q 22 15 38 14 Q 46 12 58 24 Q 60 38 60 38 Q 50 22 38 24 Q 28 22 20 38 Z" fill="#4E342E" />
          {/* Eyes */}
          <circle cx="33" cy="42" r="2.8" fill="#212121" />
          <circle cx="34.2" cy="40.8" r="1" fill="#FFFFFF" />
          <circle cx="47" cy="42" r="2.8" fill="#212121" />
          <circle cx="48.2" cy="40.8" r="1" fill="#FFFFFF" />
          {/* Blush */}
          <circle cx="26" cy="47" r="3" fill="#FF8A80" opacity="0.6" />
          <circle cx="54" cy="47" r="3" fill="#FF8A80" opacity="0.6" />
          {/* Smile */}
          <path d="M 36 50 Q 40 55 44 50" fill="none" stroke="#D84315" strokeWidth="2" strokeLinecap="round" />
          {/* Clothes */}
          <path d="M 22 66 Q 40 58 58 66 L 62 80 L 18 80 Z" fill="#43A047" />
        </svg>
      );

    default:
      // Avatar thân thiện mặc định
      return (
        <svg viewBox="0 0 80 80" className="w-full h-full">
          <circle cx="40" cy="40" r="38" fill="#FFF3E0" />
          <circle cx="40" cy="43" r="23" fill="#FFE3CC" />
          <path d="M 20 38 Q 20 16 40 16 Q 60 16 60 38 Q 50 22 40 22 Q 28 22 20 38 Z" fill="#37474F" />
          <circle cx="33" cy="42" r="2.8" fill="#212121" />
          <circle cx="34.2" cy="40.8" r="1" fill="#FFFFFF" />
          <circle cx="47" cy="42" r="2.8" fill="#212121" />
          <circle cx="48.2" cy="40.8" r="1" fill="#FFFFFF" />
          <circle cx="26" cy="47" r="3" fill="#FF8A80" opacity="0.6" />
          <circle cx="54" cy="47" r="3" fill="#FF8A80" opacity="0.6" />
          <path d="M 36 50 Q 40 55 44 50" fill="none" stroke="#D84315" strokeWidth="2" strokeLinecap="round" />
          <path d="M 22 66 Q 40 58 58 66 L 62 80 L 18 80 Z" fill="#5C6BC0" />
        </svg>
      );
  }
}

