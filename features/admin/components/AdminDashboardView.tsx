"use client";

import Link from "next/link";
import { useUserStore } from "@/stores/useUserStore";
import { AppRoutes } from "@/constants/routes";
import { ShieldAlert, LogOut, ExternalLink, Users, Award, BookOpen, Settings } from "lucide-react";

export function AdminDashboardView() {
  const { student, logout } = useUserStore();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Top Navigation */}
      <header className="border-b border-slate-800 bg-slate-950/60 backdrop-blur px-4 sm:px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading font-black text-lg text-white">
                Admin Console
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Toàn quyền
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Cổng quản trị tối cao Student Coin Portal
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={AppRoutes.STUDENT.DASHBOARD}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
          >
            <span>Xem Cổng Học Sinh</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 md:p-8 flex flex-col gap-6">
        {/* Welcome Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-purple-900/50 via-slate-800 to-slate-900 border border-purple-500/30 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white font-heading">
              Xin chào, {student?.full_name || "Quản trị viên"}! 👋
            </h2>
            <p className="text-sm text-slate-300 mt-1">
              Bạn đang đăng nhập dưới quyền Quản trị viên hệ thống (Admin). Toàn quyền kiểm soát tài khoản, phần thưởng và nhật ký.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={AppRoutes.TEACHER.DASHBOARD}
              className="text-xs font-bold px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-md"
            >
              Vào Cổng Giáo Viên →
            </Link>
          </div>
        </div>

        {/* Feature Grid Placeholders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-950/50 border border-slate-800 hover:border-slate-700 transition-all flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Quản lý Học sinh</h3>
              <p className="text-xs text-slate-400 mt-1">
                Xem danh sách, mở khóa tài khoản và đặt lại mã PIN cho các bé.
              </p>
            </div>
            <span className="text-[11px] font-semibold text-blue-400 mt-auto">Sắp ra mắt</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950/50 border border-slate-800 hover:border-slate-700 transition-all flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Duyệt Đổi quà</h3>
              <p className="text-xs text-slate-400 mt-1">
                Kiểm duyệt yêu cầu đổi xu nhận quà và hoàn tiền tự động.
              </p>
            </div>
            <span className="text-[11px] font-semibold text-amber-400 mt-auto">Sắp ra mắt</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950/50 border border-slate-800 hover:border-slate-700 transition-all flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Nhiệm vụ & Bài tập</h3>
              <p className="text-xs text-slate-400 mt-1">
                Tạo bài tập tích xu theo tuần và phê duyệt bằng chứng hoàn thành.
              </p>
            </div>
            <span className="text-[11px] font-semibold text-emerald-400 mt-auto">Sắp ra mắt</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950/50 border border-slate-800 hover:border-slate-700 transition-all flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Cấu hình Hệ thống</h3>
              <p className="text-xs text-slate-400 mt-1">
                Tùy chỉnh số lần sai tối đa, thời gian khóa và bảo mật đăng nhập.
              </p>
            </div>
            <span className="text-[11px] font-semibold text-rose-400 mt-auto">Sắp ra mắt</span>
          </div>
        </div>
      </main>
    </div>
  );
}
