"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { LogOut, RefreshCw, Wrench } from "lucide-react";
import { Button3D } from "@/components/ui/Button3D";
import { DashboardBackgroundDecor } from "@/features/student/dashboard/components/DashboardBackgroundDecor";
import { useUserStore } from "@/stores/useUserStore";
import { AppRoutes } from "@/constants";

interface StudentMaintenanceViewProps {
  message: string;
}

/**
 * Màn hình thông báo tạm nghỉ bảo trì dành riêng cho Cổng học sinh
 * - Hiển thị lời nhắn thân thiện do Quản trị viên cấu hình
 * - Cho phép học sinh tải lại để kiểm tra hoặc đăng xuất quay về trang đăng nhập
 */
export function StudentMaintenanceView({
  message,
}: StudentMaintenanceViewProps) {
  const router = useRouter();
  const logout = useUserStore((state) => state.logout);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleRetry = () => {
    setIsRefreshing(true);
    router.refresh();
    window.setTimeout(() => {
      window.location.reload();
    }, 150);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      router.replace(AppRoutes.LOGIN);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] w-full h-dvh flex flex-col items-center justify-center px-4 py-8 overflow-y-auto overflow-x-hidden select-none bg-[#1672EA]"
      style={{
        backgroundImage: `
          radial-gradient(ellipse 130% 70% at 50% 105%, rgba(225, 248, 255, 0.92) 0%, rgba(140, 218, 255, 0.55) 30%, rgba(55, 165, 252, 0.2) 60%, transparent 80%),
          linear-gradient(180deg, #0C5FD6 0%, #1573EB 32%, #268DFF 68%, #4DB0FF 100%)
        `,
      }}
    >
      <DashboardBackgroundDecor />

      <div className="relative z-10 w-full max-w-lg rounded-[32px] p-[3px] bg-gradient-to-b from-white/75 via-amber-100/50 to-white/25 shadow-[0_24px_60px_rgba(0,30,90,0.35)]">
        <div className="w-full rounded-[29px] bg-gradient-to-b from-[#FFFFFF] via-[#FFFDF8] to-[#FFF5E4] px-6 py-7 sm:px-8 sm:py-8 text-center flex flex-col items-center">
          {/* Hình chú Heo Đất kèm huy hiệu bảo trì */}
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 mb-4">
            <Image
              src="/pig.webp"
              alt="Heo Đất đang nghỉ ngơi"
              fill
              sizes="128px"
              priority
              className="object-contain drop-shadow-[0_10px_18px_rgba(180,83,9,0.2)]"
            />
            <div className="absolute -bottom-1 -right-1 w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 border-[3px] border-white text-white flex items-center justify-center shadow-md">
              <Wrench className="w-5 h-5" />
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300/80 text-xs font-heading font-extrabold uppercase tracking-wider mb-3">
            Cổng học sinh đang bảo trì
          </span>

          <h1 className="font-heading font-black text-2xl sm:text-[26px] text-[#3D1A04] leading-snug mb-3">
            Heo Đất đang nghỉ ngơi một chút nhé!
          </h1>

          <div className="w-full rounded-2xl bg-amber-50/90 border border-amber-200/90 px-4 py-3.5 mb-6 text-left sm:text-center">
            <p className="text-sm sm:text-[15px] font-heading font-semibold text-[#5A2A08] leading-relaxed whitespace-pre-line">
              {message}
            </p>
          </div>

          <div className="w-full flex flex-col sm:flex-row items-center gap-3">
            <Button3D
              type="button"
              variant="blue"
              size="md"
              fullWidth
              onClick={handleRetry}
              disabled={isRefreshing || isLoggingOut}
              className="gap-2"
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              <span>{isRefreshing ? "ĐANG KIỂM TRA..." : "THỬ VÀO LẠI"}</span>
            </Button3D>

            <Button3D
              type="button"
              variant="slate"
              size="md"
              fullWidth
              onClick={handleLogout}
              disabled={isRefreshing || isLoggingOut}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>{isLoggingOut ? "ĐANG THOÁT..." : "ĐĂNG XUẤT"}</span>
            </Button3D>
          </div>
        </div>
      </div>
    </div>
  );
}
