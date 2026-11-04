"use client";

import { Suspense } from "react";
import Image from "next/image";
import { DashboardBackgroundDecor } from "@/features/dashboard/components/DashboardBackgroundDecor";
import { AuthCard } from "./AuthCard";
import { AuthMode, UserRole } from "../types";

interface AuthViewProps {
  initialRole?: UserRole;
  initialMode?: AuthMode;
}

export function AuthView({ initialRole = "student", initialMode = "login" }: AuthViewProps) {
  return (
    <div className="relative min-h-dvh w-full flex flex-col items-center justify-center px-4 py-8 sm:py-12 antialiased selection:bg-yellow-300 selection:text-blue-900 bg-[#1672EA] overflow-x-hidden">
      {/* Nền Gradient cố định an toàn cho iOS Safari (tránh lỗi giật lag của backgroundAttachment: fixed) */}
      <div
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 130% 70% at 50% 105%, rgba(225, 248, 255, 0.92) 0%, rgba(140, 218, 255, 0.55) 30%, rgba(55, 165, 252, 0.2) 60%, transparent 80%),
            linear-gradient(180deg, #0C5FD6 0%, #1573EB 32%, #268DFF 68%, #4DB0FF 100%)
          `,
        }}
      />

      {/* Background Decor chuẩn hệ thống (mây bồng bềnh 3D, sao vàng & confetti) */}
      <DashboardBackgroundDecor />

      {/* Main Content Area */}
      <main className="relative z-10 w-full max-w-lg flex flex-col items-center my-auto">
        {/* Brand Logo tĩnh */}
        <div className="mb-3 sm:mb-4 drop-shadow-[0_10px_25px_rgba(0,35,100,0.4)] select-none">
          <div className="relative h-16 sm:h-20 md:h-24 aspect-[897/482]">
            <Image
              src="/logo.png"
              alt="Spark the Present Logo"
              fill
              sizes="(max-width: 640px) 180px, (max-width: 1024px) 220px, 260px"
              priority
              unoptimized
              className="object-contain"
            />
          </div>
        </div>

        {/* Khung Bảng Gỗ Thẻ Bài Đăng Nhập / Đăng Ký */}
        <Suspense
          fallback={
            <div className="w-full max-w-[440px] min-h-[500px] rounded-[36px] bg-[#663311]/40 animate-pulse" />
          }
        >
          <AuthCard initialRole={initialRole} initialMode={initialMode} />
        </Suspense>
      </main>
    </div>
  );
}
