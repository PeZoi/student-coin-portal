"use client";

import { Button3D } from "@/components/ui/Button3D";
import { DashboardBackgroundDecor } from "@/features/dashboard/components/DashboardBackgroundDecor";
import { ArrowLeft } from "lucide-react";
import { MissionBook } from "./MissionBook";

export function MissionsView() {
  return (
    <div className="relative w-full h-full flex-1 flex flex-col items-center justify-start px-2 sm:px-4 pt-1 pb-[max(0.75rem,env(safe-area-inset-bottom))] min-h-0 overflow-hidden select-none">
      {/* Background Decor: Mây thực tế bồng bềnh và ánh sáng bầu trời */}
      <DashboardBackgroundDecor />

      {/* Nút 3D Desktop: Quay lại Trang chủ cố định góc trên bên trái */}
      <div className="hidden lg:flex items-center justify-start absolute top-3 left-6 z-30">
        <Button3D
          href="/student"
          variant="yellow"
          size="sm"
          className="gap-1.5 py-1.5 px-3.5 text-sm tracking-wide"
        >
          <ArrowLeft className="w-4 h-4 stroke-[3]" />
          <span>Quay lại Trang chủ</span>
        </Button3D>
      </div>

      {/* Nút 3D Mobile: Icon mũi tên gọn gàng (vùng chạm 44x44) nằm ở góc trên bên trái, tiết kiệm ~40px chiều cao */}
      <div className="lg:hidden absolute top-2 left-2 z-30">
        <Button3D
          href="/student"
          variant="yellow"
          size="sm"
          aria-label="Quay lại Trang chủ"
          className="w-11 h-11 p-0 rounded-full flex items-center justify-center shadow-md cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 stroke-[3]" />
        </Button3D>
      </div>

      {/* Khung cuốn sách thần kỳ: Tận dụng tối đa chiều cao màn hình */}
      <div className="relative z-10 w-full flex-1 flex flex-col items-center justify-center min-h-0 overflow-hidden">
        <MissionBook />
      </div>
    </div>
  );
}
