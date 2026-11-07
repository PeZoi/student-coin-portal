"use client";

import Link from "next/link";
import { AppRoutes } from "@/constants/routes";
import { useUserStore } from "@/stores/useUserStore";
import {
  Menu,
  Coins,
  ExternalLink,
  LogOut,
  ChevronDown,
  Bell,
} from "lucide-react";

interface TeacherHeaderProps {
  onToggleSidebar: () => void;
}

export function TeacherHeader({ onToggleSidebar }: TeacherHeaderProps) {
  const { student, logout } = useUserStore();
  const isAdmin = student?.role === "admin";
  const isSuperTeacher = student?.role === "super_teacher";

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile Toggle & Class Selector */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          aria-label="Mở thanh điều hướng"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Class Selector Dropdown (Symbolic) */}
        <div className="relative inline-flex items-center">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200 text-xs font-bold text-slate-800 transition-colors cursor-pointer select-none">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-semibold text-slate-500 hidden sm:inline">
              {isSuperTeacher || isAdmin ? "Xem lớp:" : "Lớp phụ trách:"}
            </span>
            <span>Lớp 3A1</span>
            <span className="hidden sm:inline-block text-[11px] font-normal text-slate-500">
              {isSuperTeacher || isAdmin ? "(Toàn trường)" : "(32 học sinh)"}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Reward Action Button (Symbolic) */}
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white transition-all shadow-xs cursor-pointer active:scale-98"
          title="Thưởng nóng xu cho học sinh"
        >
          <Coins className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">+ Thưởng nhanh</span>
          <span className="sm:hidden">+ Thưởng</span>
        </button>

        {/* Link to Student Portal */}
        <Link
          href={AppRoutes.STUDENT.DASHBOARD}
          className="hidden md:inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
        >
          <span>Góc học sinh</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
        </Link>

        {/* Notification Bell (Symbolic) */}
        <button
          type="button"
          className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          aria-label="Thông báo"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        <div className="h-5 w-px bg-slate-200 mx-0.5 hidden sm:block" />

        {/* Teacher Avatar & Info */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 font-black text-xs flex items-center justify-center">
            {student?.full_name ? student.full_name.charAt(0).toUpperCase() : "T"}
          </div>
          <div className="hidden xl:block text-left leading-tight">
            <div className="text-xs font-bold text-slate-800 max-w-[120px] truncate">
              {student?.full_name || (isAdmin ? "Quản trị viên" : isSuperTeacher ? "Khối Trưởng" : "Thầy / Cô")}
            </div>
            <div className="text-[10px] text-slate-500 font-medium">
              {isAdmin
                ? "Admin Hệ thống"
                : isSuperTeacher
                ? "Khối Trưởng / Toàn trường"
                : "Giáo viên bộ môn"}
            </div>
          </div>

          {/* Logout Button */}
          <button
            type="button"
            onClick={logout}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
            title="Đăng xuất"
            aria-label="Đăng xuất"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
