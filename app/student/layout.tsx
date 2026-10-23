import React from "react";
import { StudentNavbar } from "@/features/dashboard/components/StudentNavbar";

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

      {/* Main Content Area - Cho phép cuộn trang mượt mà khi layout xếp dọc hoặc màn hình nhỏ */}
      <div className="flex-1 w-full overflow-y-auto flex flex-col min-h-0">{children}</div>
    </div>
  );
}
