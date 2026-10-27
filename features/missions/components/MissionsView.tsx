"use client";

import { Button3D } from "@/components/ui/Button3D";
import { DashboardBackgroundDecor } from "@/features/dashboard/components/DashboardBackgroundDecor";
import { ArrowLeft } from "lucide-react";
import { MissionBook } from "./MissionBook";

export function MissionsView() {
  return (
    <div className="relative w-full h-full flex-1 flex flex-col items-center justify-start px-2 sm:px-4 pt-1.5 pb-3.5 sm:pb-4 pb-[max(1rem,env(safe-area-inset-bottom))] min-h-0 overflow-hidden select-none gap-2.5 lg:gap-0">
      {/* Background Decor: Mây thực tế bồng bềnh và ánh sáng bầu trời */}
      <DashboardBackgroundDecor />

      {/* Nút 3D: Quay lại Trang chủ - Desktop cố định góc trên, Mobile là hàng riêng phía trên sách */}
      <div className="w-full max-w-md lg:max-w-none flex items-center justify-start lg:absolute lg:top-3 lg:left-6 z-30 flex-shrink-0 px-0.5">
        <Button3D
          href="/student"
          variant="yellow"
          size="sm"
          className="gap-1.5 py-1 px-3 sm:py-1.5 sm:px-3.5 text-xs sm:text-sm tracking-wide"
        >
          <ArrowLeft className="w-4 h-4 stroke-[3]" />
          <span>Quay lại Trang chủ</span>
        </Button3D>
      </div>

      {/* Khung cuốn sách thần kỳ: Tự động vừa vặn trọn vẹn 1 trang màn hình */}
      <div className="relative z-10 w-full flex-1 flex flex-col items-center justify-start lg:justify-center min-h-0 overflow-hidden">
        <MissionBook />
      </div>
    </div>
  );
}
