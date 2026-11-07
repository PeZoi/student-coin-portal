"use client";

import Link from "next/link";
import { useUserStore } from "@/stores/useUserStore";
import { AppRoutes } from "@/constants/routes";
import { GraduationCap, LogOut, ExternalLink, CheckCircle2, Award, Clock } from "lucide-react";

export function TeacherDashboardView() {
  const { student, logout } = useUserStore();

  return (
    <div className="min-h-screen bg-[#F0F7FF] text-slate-800 flex flex-col">
      {/* Top Header */}
      <header className="border-b border-sky-100 bg-white/80 backdrop-blur px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 font-bold text-xl">
            🍎
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading font-black text-lg text-slate-900">
                Góc Giáo Viên
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                Thầy / Cô
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Không gian quản lý lớp học & đồng hành cùng các con
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={AppRoutes.STUDENT.DASHBOARD}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 transition-all"
          >
            <span>Xem Cổng Học Sinh</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 md:p-8 flex flex-col gap-6">
        {/* Welcome Card */}
        <div className="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6 sm:p-8 shadow-lg relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-black font-heading">
              Chào mừng {student?.full_name || "Thầy / Cô"}! 🌟
            </h2>
            <p className="text-emerald-100 text-sm mt-2 leading-relaxed">
              Thầy cô đã đăng nhập thành công vào Cổng Giáo Viên. Tại đây thầy cô có thể theo dõi tiến độ bài tập, chấm điểm và tặng xu động viên các bé!
            </p>
            <div className="mt-5 flex items-center gap-3">
              <Link
                href={AppRoutes.STUDENT.DASHBOARD}
                className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 transition-all shadow-md"
              >
                Trải nghiệm giao diện học sinh →
              </Link>
            </div>
          </div>
        </div>

        {/* Feature Placeholders */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-2">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Duyệt bài tập</h3>
            <p className="text-xs text-slate-500">
              Kiểm tra hình ảnh nộp bài và cộng xu thưởng cho học sinh.
            </p>
            <span className="text-[11px] font-semibold text-blue-600 mt-auto pt-2">Sắp ra mắt</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-2">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Thưởng xu đột xuất</h3>
            <p className="text-xs text-slate-500">
              Tặng xu khen thưởng cho các bé có thành tích xuất sắc trong tuần.
            </p>
            <span className="text-[11px] font-semibold text-amber-600 mt-auto pt-2">Sắp ra mắt</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-2">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Danh sách lớp</h3>
            <p className="text-xs text-slate-500">
              Theo dõi bảng xếp hạng chăm chỉ và số dư Heo Đất của từng bé.
            </p>
            <span className="text-[11px] font-semibold text-purple-600 mt-auto pt-2">Sắp ra mắt</span>
          </div>
        </div>
      </main>
    </div>
  );
}
