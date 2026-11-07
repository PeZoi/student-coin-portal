"use client";

import Link from "next/link";
import { useUserStore } from "@/stores/useUserStore";
import { AppRoutes } from "@/constants/routes";
import {
  GraduationCap,
  LogOut,
  ExternalLink,
  CheckCircle2,
  Award,
  Users,
  ShieldCheck,
  Settings,
  History,
  Gift,
  KeyRound,
  Sparkles,
} from "lucide-react";

export function TeacherDashboardView() {
  const { student, logout } = useUserStore();

  const isAdmin = student?.role === "admin";

  return (
    <div className="min-h-screen bg-[#F0F7FF] text-slate-800 flex flex-col antialiased">
      {/* ========================================================================= */}
      {/* TOP HEADER */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 border-b border-sky-100 bg-white/90 backdrop-blur-md px-4 sm:px-6 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xl shadow-xs transition-all ${
              isAdmin
                ? "bg-purple-100 text-purple-700 border border-purple-200"
                : "bg-emerald-100 text-emerald-700 border border-emerald-200"
            }`}
          >
            {isAdmin ? "👑" : "🍎"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading font-black text-lg text-slate-900 leading-tight">
                {isAdmin ? "Bàn Làm Việc Quản Trị" : "Góc Giáo Viên"}
              </h1>
              {isAdmin ? (
                <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-300 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-purple-600" />
                  Admin
                </span>
              ) : (
                <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Thầy / Cô
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {isAdmin
                ? "Toàn quyền điều hành tính năng giáo viên & cấu hình hệ thống"
                : "Quản lý lớp học & đồng hành học tập cùng các bé"}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <Link
            href={AppRoutes.STUDENT.DASHBOARD}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 transition-all shadow-xs"
          >
            <span>Cổng Học Sinh</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-all cursor-pointer shadow-xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MAIN CONTAINER */}
      {/* ========================================================================= */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 md:p-8 flex flex-col gap-8">
        {/* Welcome Hero Card */}
        <div
          className={`rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden transition-all ${
            isAdmin
              ? "bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-900 text-white border border-purple-500/20"
              : "bg-gradient-to-r from-emerald-600 via-teal-700 to-cyan-700 text-white"
          }`}
        >
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-bold backdrop-blur-sm mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>
                {isAdmin
                  ? "Chế độ Quản trị viên (Admin Mode)"
                  : "Chế độ Giáo viên (Teacher Mode)"}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-heading leading-snug">
              Chào mừng {student?.full_name || (isAdmin ? "Quản trị viên" : "Thầy / Cô")}! 🌟
            </h2>
            <p className="text-sm sm:text-base text-white/85 mt-2 leading-relaxed">
              {isAdmin
                ? "Bạn đang đăng nhập với tư cách Quản trị viên cao nhất. Bạn có thể sử dụng tất cả tính năng của giáo viên đồng thời quản lý cấu hình, người dùng và nhật ký an ninh."
                : "Thầy/Cô đã đăng nhập thành công vào hệ thống. Hãy kiểm tra bài tập hôm nay của các con và tặng xu khen thưởng cho các bé nhé!"}
            </p>
            <div className="mt-5 flex items-center gap-3">
              <Link
                href={AppRoutes.STUDENT.DASHBOARD}
                className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 transition-all shadow-md"
              >
                Trải nghiệm giao diện học sinh →
              </Link>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PHẦN 1: CÔNG CỤ DÀNH CHO GIÁO VIÊN (Cả Giáo viên & Admin đều nhìn thấy) */}
        {/* ========================================================================= */}
        <section className="flex flex-col gap-3.5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading font-black text-lg text-slate-900 flex items-center gap-2">
                <span>🍎</span>
                <span>Nghiệp Vụ Lớp Học & Bài Tập</span>
              </h3>
              <p className="text-xs text-slate-500">
                Các chức năng quản lý bài tập và động viên học sinh hàng ngày
              </p>
            </div>
            <span className="text-xs font-semibold text-sky-700 bg-sky-100 px-2.5 py-1 rounded-full">
              Chung cho Giáo viên & Admin
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Duyệt bài tập */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-emerald-300 hover:shadow-md transition-all flex flex-col gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-base">Duyệt bài tập</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Kiểm tra hình ảnh bài làm học sinh đã nộp và cộng xu thưởng Heo Đất.
              </p>
              <div className="mt-auto pt-2 flex items-center justify-between text-xs font-semibold">
                <span className="text-blue-600">Sắp ra mắt</span>
                <span className="text-slate-400 group-hover:text-slate-600">→</span>
              </div>
            </div>

            {/* Card 2: Thưởng xu đột xuất */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-amber-300 hover:shadow-md transition-all flex flex-col gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-base">Thưởng xu khen ngợi</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Tặng nóng 10 - 50 xu khích lệ các con có tinh thần phát biểu và làm bài xuất sắc.
              </p>
              <div className="mt-auto pt-2 flex items-center justify-between text-xs font-semibold">
                <span className="text-amber-600">Sắp ra mắt</span>
                <span className="text-slate-400 group-hover:text-slate-600">→</span>
              </div>
            </div>

            {/* Card 3: Danh sách lớp */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-purple-300 hover:shadow-md transition-all flex flex-col gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-base">Hồ sơ lớp học</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Theo dõi sĩ số, danh sách học sinh và số dư Heo Đất tích lũy của từng bé.
              </p>
              <div className="mt-auto pt-2 flex items-center justify-between text-xs font-semibold">
                <span className="text-purple-600">Sắp ra mắt</span>
                <span className="text-slate-400 group-hover:text-slate-600">→</span>
              </div>
            </div>

            {/* Card 4: Duyệt quà tặng */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-rose-300 hover:shadow-md transition-all flex flex-col gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Gift className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-base">Duyệt đổi quà</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Xác nhận các yêu cầu đổi xu lấy dụng cụ học tập hoặc quà tặng của học sinh.
              </p>
              <div className="mt-auto pt-2 flex items-center justify-between text-xs font-semibold">
                <span className="text-rose-600">Sắp ra mắt</span>
                <span className="text-slate-400 group-hover:text-slate-600">→</span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* PHẦN 2: CÔNG CỤ ĐỘC QUYỀN DÀNH CHO ADMIN (Chỉ Admin mới nhìn thấy) */}
        {/* ========================================================================= */}
        {isAdmin && (
          <section className="flex flex-col gap-3.5 p-5 sm:p-6 rounded-3xl bg-slate-900 text-slate-100 border border-purple-500/30 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-lg text-white flex items-center gap-2">
                    <span>👑</span>
                    <span>Khu Vực Quản Trị Hệ Thống</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Các công cụ quản lý bảo mật và tài khoản chỉ hiển thị riêng cho Admin
                  </p>
                </div>
              </div>
              <span className="self-start sm:self-auto text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                Admin Privilege Only
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              {/* Admin Card 1: Quản lý người dùng */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-950 transition-all flex flex-col gap-2 group">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Users className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-white text-sm">Quản lý Tài khoản</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Tạo tài khoản giáo viên, mở khóa học sinh bị khóa do nhập sai mã PIN.
                </p>
                <span className="text-[11px] font-semibold text-purple-400 mt-auto pt-2">
                  Toàn quyền
                </span>
              </div>

              {/* Admin Card 2: Reset PIN & Mật khẩu */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-950 transition-all flex flex-col gap-2 group">
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <KeyRound className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-white text-sm">Đặt lại PIN / Mật khẩu</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Hỗ trợ phụ huynh lấy lại mã PIN 4 số hoặc đổi mật khẩu cho giáo viên.
                </p>
                <span className="text-[11px] font-semibold text-purple-400 mt-auto pt-2">
                  Toàn quyền
                </span>
              </div>

              {/* Admin Card 3: Cấu hình hệ thống */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-950 transition-all flex flex-col gap-2 group">
                <div className="w-9 h-9 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Settings className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-white text-sm">Cấu hình Bảo mật</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Thiết lập số lần nhập sai tối đa, thời gian khóa tài khoản tạm thời.
                </p>
                <span className="text-[11px] font-semibold text-purple-400 mt-auto pt-2">
                  Toàn quyền
                </span>
              </div>

              {/* Admin Card 4: Nhật ký xác thực */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-950 transition-all flex flex-col gap-2 group">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <History className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-white text-sm">Nhật ký Đăng nhập</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Xem bảng `auth_logs`, theo dõi địa chỉ IP, thiết bị và cảnh báo bất thường.
                </p>
                <span className="text-[11px] font-semibold text-purple-400 mt-auto pt-2">
                  Toàn quyền
                </span>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
