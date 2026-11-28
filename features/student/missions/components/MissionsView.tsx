"use client";

import { Button3D } from "@/components/ui/Button3D";
import { DashboardBackgroundDecor } from "@/features/student/dashboard/components/DashboardBackgroundDecor";
import { ArrowLeft } from "lucide-react";
import { MissionBook } from "./MissionBook";

export function MissionsView() {
  return (
    <div className="relative w-full h-full flex-1 flex flex-col items-center justify-start px-2 sm:px-4 pt-1 pb-[max(0.75rem,env(safe-area-inset-bottom))] min-h-0 overflow-hidden select-none">
      {/* Background Decor: Mây thực tế bồng bềnh và ánh sáng bầu trời */}
      <DashboardBackgroundDecor />

      {/* Thanh đỉnh: Nút Quay lại (Trái) - Đồng bộ 100% với trang Vòng quay & Đổi quà */}
      <div className="relative z-30 w-full max-w-5xl flex items-center justify-between gap-2 mb-1 sm:mb-2 flex-shrink-0 pt-0.5 px-1 sm:px-2">
        <Button3D
          href="/student"
          variant="yellow"
          size="sm"
          className="h-8 sm:h-9 gap-1 sm:gap-1.5 px-3 sm:px-3.5 text-xs sm:text-sm tracking-wide flex-shrink-0 inline-flex items-center justify-center"
        >
          <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
          <span>Quay lại</span>
        </Button3D>
      </div>

      {/* Khung cuốn sách thần kỳ: Tận dụng tối đa chiều cao màn hình */}
      <div className="relative z-10 w-full flex-1 flex flex-col items-center justify-center min-h-0 overflow-hidden">
        <MissionBook />
      </div>
    </div>
  );
}
