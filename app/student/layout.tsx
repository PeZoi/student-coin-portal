import React, { Suspense } from "react";
import { connection } from "next/server";
import { StudentNavbar } from "@/features/student/dashboard/components/StudentNavbar";
import { StudentMaintenanceView } from "@/features/student/dashboard/components/StudentMaintenanceView";
import { getMaintenanceSettingConfig } from "@/lib/system/serverConfig";

/**
 * Server Overlay kiểm tra chế độ bảo trì cổng học sinh (0ms từ RAM cache server)
 * - Đặt song song với {children} để Next.js 16 giữ trọn Instant Navigation (không drop segment)
 * - Khi bật bảo trì: phủ kín toàn màn hình với thông báo thân thiện
 * - Cổng giáo viên (/teacher/*) hoàn toàn không bị ảnh hưởng
 */
async function StudentMaintenanceOverlay() {
  await connection();
  const maintenance = await getMaintenanceSettingConfig();

  if (!maintenance.is_maintenance_mode) {
    return null;
  }

  return <StudentMaintenanceView message={maintenance.maintenance_message} />;
}

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="h-dvh w-full flex flex-col antialiased selection:bg-yellow-300 selection:text-blue-900 bg-[#1672EA] overflow-hidden"
      style={{
        backgroundImage: `
          radial-gradient(ellipse 130% 70% at 50% 105%, rgba(225, 248, 255, 0.92) 0%, rgba(140, 218, 255, 0.55) 30%, rgba(55, 165, 252, 0.2) 60%, transparent 80%),
          linear-gradient(180deg, #0C5FD6 0%, #1573EB 32%, #268DFF 68%, #4DB0FF 100%)
        `,
        backgroundAttachment: "fixed",
      }}
    >
      {/* Student Top Header / Navbar */}
      <div className="w-full flex-shrink-0 bg-[#0A66D3]/95 backdrop-blur-md border-b border-sky-300/20 shadow-[0_4px_20px_rgba(0,0,0,0.22)] z-30">
        <StudentNavbar />
      </div>

      {/* Main Content Area - Hỗ trợ scroll dọc mượt mà cho Dashboard và các trang dài, ngăn hoàn toàn scroll ngang */}
      <div className="flex-1 w-full overflow-y-auto overflow-x-hidden flex flex-col min-h-0 [scrollbar-width:thin]">
        {children}
      </div>

      {/* Lớp phủ bảo trì cổng học sinh (chỉ render khi Admin bật chế độ bảo trì) */}
      <Suspense fallback={null}>
        <StudentMaintenanceOverlay />
      </Suspense>
    </div>
  );
}
