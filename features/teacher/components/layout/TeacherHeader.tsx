"use client";

import { useUserStore } from "@/stores/useUserStore";
import { UserRole } from "@/constants/auth";
import {
  Menu,
  LogOut,
  ChevronDown,
  Bell,
  School,
  Search,
  GraduationCap,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

interface TeacherHeaderProps {
  onToggleSidebar: () => void;
}

export function TeacherHeader({ onToggleSidebar }: TeacherHeaderProps) {
  const { student, logout } = useUserStore();
  const isAdmin = student?.role === UserRole.ADMIN;
  const isSuperTeacher = student?.role === UserRole.SUPER_TEACHER;

  const displayName =
    student?.full_name ||
    (isAdmin ? "Quản trị viên" : isSuperTeacher ? "Tổ trưởng chuyên môn" : "Giáo viên bộ môn");

  const roleLabel = isAdmin ? "Quản trị viên" : isSuperTeacher ? "Tổ trưởng" : "Giáo viên";
  const classNameDisplay = student?.class_name || (isAdmin ? "Toàn trường" : "Lớp 3A1");

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 z-30 h-16 bg-white/85 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between transition-all">
      {/* 1. KHU VỰC BÊN TRÁI: Toggle Mobile & Selector Không gian làm việc */}
      <div className="flex items-center gap-3">
        {/* Nút Toggle mở Sidebar trên Mobile */}
        <button
          type="button"
          onClick={onToggleSidebar}
          title="Mở menu điều hướng"
          className="lg:hidden w-9 h-9 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Workspace / Class Selector Pill */}
        <button
          type="button"
          title="Chọn lớp hoặc phạm vi quản lý"
          className="group inline-flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl bg-white hover:bg-slate-50/80 border border-slate-200/80 hover:border-slate-300 shadow-2xs transition-all cursor-pointer select-none"
        >
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#0A62D6] flex items-center justify-center shrink-0 border border-blue-100/80 group-hover:bg-blue-100/70 transition-colors">
            <School className="w-4 h-4" />
          </div>

          <div className="flex flex-col text-left leading-tight">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden sm:block">
              {isAdmin || isSuperTeacher ? "Phạm vi" : "Lớp phụ trách"}
            </span>
            <span className="text-xs sm:text-[13px] font-bold text-slate-900 truncate max-w-[120px] sm:max-w-[160px]">
              {classNameDisplay}
            </span>
          </div>

          {/* Badge trạng thái đồng bộ thời gian thực */}
          <span className="hidden md:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-[11px] font-semibold text-emerald-700 border border-emerald-200/70">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            <span>{isAdmin ? "Toàn hệ thống" : "Đang kết nối"}</span>
          </span>

          <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform group-hover:translate-y-0.5 ml-0.5 shrink-0" />
        </button>
      </div>

      {/* 2. KHU VỰC Ở GIỮA: Ô tìm kiếm nhanh tinh gọn (Đã bỏ phím tắt Command / Ctrl+K) */}
      <div className="hidden md:flex items-center">
        <div className="relative w-56 lg:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Tìm học sinh, nhiệm vụ, lớp..."
            className="w-full h-9 pl-9 pr-3 rounded-xl bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-xs text-slate-800 placeholder-slate-400 border border-transparent focus:border-[#0A62D6] focus:ring-2 focus:ring-[#0A62D6]/20 transition-all outline-none"
          />
        </div>
      </div>

      {/* 3. KHU VỰC BÊN PHẢI: Niên khóa, Chuông thông báo & Phù hiệu Chức danh Sư phạm */}
      <div className="flex items-center gap-2 sm:gap-3">

        {/* Nút Chuông thông báo */}
        <button
          type="button"
          title="Thông báo mới"
          className="relative w-9 h-9 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-transparent hover:border-slate-200 flex items-center justify-center transition-all cursor-pointer"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
          </span>
        </button>

        <div className="h-6 w-px bg-slate-200 hidden sm:block" />

        {/* Khung Phù hiệu Chức danh & Họ tên Giáo viên (Thay thế hoàn toàn avatar cá nhân) */}
        <div className="flex items-center gap-2.5 pl-2 pr-1.5 py-1.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all">
          {/* Biểu tượng Phù hiệu Chức danh */}
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
              isAdmin
                ? "bg-rose-50 text-rose-600 border-rose-200/70"
                : isSuperTeacher
                ? "bg-indigo-50 text-indigo-600 border-indigo-200/70"
                : "bg-blue-50 text-[#0A62D6] border-blue-200/70"
            }`}
          >
            {isAdmin ? (
              <ShieldCheck className="w-4 h-4" />
            ) : isSuperTeacher ? (
              <Sparkles className="w-4 h-4" />
            ) : (
              <GraduationCap className="w-4 h-4" />
            )}
          </div>

          {/* Họ tên & Chức vụ */}
          <div className="flex flex-col text-left leading-tight pr-1">
            <span className="text-xs font-bold text-slate-900 max-w-[140px] truncate">
              {displayName}
            </span>
            <span className="text-[10px] font-semibold text-slate-500 mt-0.5">
              {roleLabel}
            </span>
          </div>

          <div className="h-5 w-px bg-slate-200 hidden sm:block" />

          {/* Nút Đăng xuất */}
          <button
            type="button"
            onClick={logout}
            title="Đăng xuất khỏi tài khoản"
            className="w-8 h-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
