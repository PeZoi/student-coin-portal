"use client";

import React from "react";
import { ArrowLeft } from "lucide-react";
import { Button3D } from "@/components/ui/Button3D";
import { MissionBook } from "./MissionBook";
import { DashboardBackgroundDecor } from "@/features/dashboard/components/DashboardBackgroundDecor";

export function MissionsView() {
  return (
    <div className="relative w-full flex-1 flex flex-col justify-center items-center px-2 sm:px-4 py-1 min-h-0 overflow-hidden select-none">
      {/* Background Decor: Mây thực tế bồng bềnh và ánh sáng bầu trời */}
      <DashboardBackgroundDecor />

      {/* Nút 3D: Quay lại Trang chủ */}
      <div className="absolute top-2.5 left-3 sm:top-3 sm:left-6 z-30">
        <Button3D
          href="/student"
          variant="yellow"
          size="sm"
          className="gap-1.5 py-1.5 px-3.5 text-xs sm:text-sm tracking-wide"
        >
          <ArrowLeft className="w-4 h-4 stroke-[3]" />
          <span>Quay lại Trang chủ</span>
        </Button3D>
      </div>

      {/* Khung cuốn sách thần kỳ mở đôi chiếm trọn tỷ lệ 1 trang */}
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        <MissionBook />
      </div>
    </div>
  );
}
