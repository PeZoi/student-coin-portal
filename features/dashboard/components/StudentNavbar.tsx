"use client";

import { useUserStore } from "@/stores/useUserStore";
import { Settings } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function StudentNavbar() {
  const { student } = useUserStore();

  return (
    <header className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-2 sm:py-2.5 flex items-center justify-between select-none">
      {/* Brand Logo: main-icon.png */}
      <Link href="/student" className="flex items-center transition-transform hover:scale-105">
        <div className="relative w-36 sm:w-48 h-11 sm:h-13 flex-shrink-0">
          <Image
            src="/main-icon.png"
            alt="Học Chăm Tích Xu"
            fill
            sizes="(max-width: 640px) 144px, 192px"
            priority
            unoptimized
            className="object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
          />
        </div>
      </Link>

      {/* Navigation links */}
      <nav className="hidden md:flex items-center gap-4 lg:gap-6">
        <Link
          href="/student"
          className="relative text-white font-heading font-black text-sm sm:text-base tracking-wide px-4 py-1.5 rounded-full bg-[#003E8A] border border-sky-300/40 shadow-[inset_0_1px_2px_rgba(255,255,255,0.25)] whitespace-nowrap transition-all"
        >
          Trang chủ
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-1 bg-yellow-300 rounded-full shadow-sm" />
        </Link>
        <Link
          href="#missions"
          className="text-sky-100 hover:text-white font-heading font-bold text-sm sm:text-base tracking-wide px-3 py-1.5 rounded-full hover:bg-white/15 whitespace-nowrap transition-all hover:scale-105"
        >
          Nhiệm vụ
        </Link>
        <Link
          href="#wheel"
          className="text-sky-100 hover:text-white font-heading font-bold text-sm sm:text-base tracking-wide px-3 py-1.5 rounded-full hover:bg-white/15 whitespace-nowrap transition-all hover:scale-105"
        >
          Vòng quay may mắn
        </Link>
        <Link
          href="#rewards"
          className="text-sky-100 hover:text-white font-heading font-bold text-sm sm:text-base tracking-wide px-3 py-1.5 rounded-full hover:bg-white/15 whitespace-nowrap transition-all hover:scale-105"
        >
          Đổi quà
        </Link>
        <Link
          href="#leaderboard"
          className="text-sky-100 hover:text-white font-heading font-bold text-sm sm:text-base tracking-wide px-3 py-1.5 rounded-full hover:bg-white/15 whitespace-nowrap transition-all hover:scale-105"
        >
          Bảng xếp hạng
        </Link>
      </nav>

      {/* User Profile Pill */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-2 sm:gap-2.5 bg-[#003E8A] hover:bg-[#004C9E] pl-1.5 pr-3 sm:pr-4 py-1 rounded-full border border-sky-300/35 shadow-md transition-all cursor-pointer">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border-2 border-yellow-300 relative shadow-sm flex-shrink-0">
            <Image
              src={student.avatarUrl || "/avatar.jpg"}
              alt={student.name}
              fill
              sizes="36px"
              unoptimized
              className="object-cover"
            />
          </div>
          <span className="text-white font-heading font-bold text-xs sm:text-sm tracking-wide drop-shadow-sm whitespace-nowrap">
            {student.name} - {student.classGroup}
          </span>
        </div>

        {/* Settings button */}
        <button
          aria-label="Cài đặt"
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#003E8A] hover:bg-[#004C9E] border border-sky-300/35 flex items-center justify-center text-white shadow-md active:translate-y-0.5 transition-all cursor-pointer flex-shrink-0"
        >
          <Settings className="w-4 h-4 sm:w-5 sm:h-5 drop-shadow" />
        </button>
      </div>
    </header>
  );
}
