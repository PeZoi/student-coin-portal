"use client";

import { useState, useEffect } from "react";
import { TeacherSidebar } from "./TeacherSidebar";
import { TeacherHeader } from "./TeacherHeader";

interface TeacherLayoutShellProps {
  children: React.ReactNode;
}

export function TeacherLayoutShell({ children }: TeacherLayoutShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Kích hoạt phong cách thanh cuộn chuyên nghiệp cho toàn bộ Góc Giáo Viên
  useEffect(() => {
    document.documentElement.setAttribute("data-portal", "teacher");
    return () => {
      document.documentElement.removeAttribute("data-portal");
    };
  }, []);

  return (
    <div className="teacher-portal min-h-screen bg-slate-50 text-slate-800 flex antialiased">
      {/* Sidebar Navigation */}
      <TeacherSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pt-16 lg:pl-64">
        {/* Top Header */}
        <TeacherHeader onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
