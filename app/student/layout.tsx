import React from "react";
import { StudentNavbar } from "@/features/dashboard/components/StudentNavbar";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-[radial-gradient(ellipse_100%_80%_at_50%_0%,_#38CFFF_0%,_#00A3FF_50%,_#007DF0_100%)] flex flex-col antialiased selection:bg-yellow-300 selection:text-blue-900">
      {/* Student Top Header / Navbar with Bright Rich Ocean Blue background */}
      <div className="w-full bg-[#0052B3] border-b border-sky-300/30 shadow-[0_4px_20px_rgba(0,0,0,0.18)]">
        <StudentNavbar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">{children}</div>
    </div>
  );
}
