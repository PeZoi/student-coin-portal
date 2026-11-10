"use client";

import Link from "next/link";
import { AppRoutes } from "@/constants/routes";
import { useUserStore } from "@/stores/useUserStore";
import { UserRole } from "@/constants/auth";
import {
  FileCheck2,
  Users,
  Gift,
  Coins,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Award,
  KeyRound,
  Settings,
  History,
} from "lucide-react";

export function TeacherDashboardView() {
  const { student } = useUserStore();
  const isAdmin = student?.role === UserRole.ADMIN;
  const isSuperTeacher = student?.role === UserRole.SUPER_TEACHER;

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. WELCOME HERO SECTION (Clean, Solid, No Heavy Gradients) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {isAdmin
                  ? "Bàn điều hành Quản trị"
                  : isSuperTeacher
                  ? "Bàn làm việc Khối Trưởng (Toàn trường)"
                  : "Bàn làm việc Giáo viên"}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-heading tracking-tight">
              Xin chào, {student?.full_name || (isAdmin ? "Quản trị viên" : isSuperTeacher ? "Khối Trưởng" : "Thầy / Cô")}! 👋
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {isSuperTeacher
                ? "Bạn có quyền giám sát toàn bộ lớp học trong trường, duyệt bài chéo và khen thưởng thi đua toàn khối."
                : "Lớp 3A1 hôm nay có 5 bài tập chờ duyệt và 2 phần quà đang chờ trao tận tay."}
            </p>
          </div>

          {/* Quick Action Shortcuts */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <Link
              href={AppRoutes.TEACHER.SUBMISSIONS}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs active:scale-98"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Duyệt bài ngay</span>
            </Link>
            <Link
              href={AppRoutes.TEACHER.MISSIONS}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors border border-slate-200"
            >
              <span>+ Giao nhiệm vụ</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. STATS KPI CARDS (4 Solid Metric Cards) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Bài chờ duyệt */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bài chờ duyệt</p>
            <div className="text-2xl font-black text-slate-900 mt-1">5 bài</div>
            <p className="text-[11px] font-semibold text-blue-600 mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 inline-block" />
              +3 bài mới sáng nay
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <FileCheck2 className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Tỷ lệ nộp bài */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tỷ lệ nộp bài</p>
            <div className="text-2xl font-black text-slate-900 mt-1">87.5%</div>
            <p className="text-[11px] font-semibold text-emerald-600 mt-1">
              28 / 32 học sinh hoàn thành
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Yêu cầu đổi quà */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Đổi quà chờ trao</p>
            <div className="text-2xl font-black text-slate-900 mt-1">2 phần</div>
            <p className="text-[11px] font-semibold text-rose-600 mt-1">
              Cần trao tại lớp học
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
            <Gift className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Tổng xu phát thưởng */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Xu thưởng tuần này</p>
            <div className="text-2xl font-black text-slate-900 mt-1">1,420</div>
            <p className="text-[11px] font-semibold text-amber-600 mt-1">
              +320 xu so với tuần trước
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
            <Coins className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. TWO COLUMNS CONTENT: RECENT SUBMISSIONS & REWARDS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Submissions (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <FileCheck2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Bài tập nộp gần nhất cần duyệt</h2>
                  <p className="text-xs text-slate-500">Xem trước bài làm và xác nhận cộng xu cho học sinh</p>
                </div>
              </div>
              <Link
                href={AppRoutes.TEACHER.SUBMISSIONS}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <span>Xem tất cả (5)</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* List of 3 Mock Submissions */}
            <div className="space-y-3">
              {/* Submission 1 */}
              <div className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-black text-xs flex items-center justify-center shrink-0">
                    MA
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">Nguyễn Minh An</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                        Toán học
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 font-medium">Nhiệm vụ: Bảng nhân 7 và bài tập ứng dụng</p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-600 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> 15 phút trước
                      </span>
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> AI Check: 9/10 câu đúng
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Duyệt (+30 xu)
                  </button>
                  <Link
                    href={AppRoutes.TEACHER.SUBMISSIONS}
                    className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-semibold transition-colors"
                  >
                    Chi tiết
                  </Link>
                </div>
              </div>

              {/* Submission 2 */}
              <div className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-700 font-black text-xs flex items-center justify-center shrink-0">
                    BN
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">Trần Bảo Ngọc</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                        Tiếng Việt
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 font-medium">Nhiệm vụ: Luyện viết chính tả bài 12</p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-600 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> 45 phút trước
                      </span>
                      <span className="text-blue-700 font-semibold flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> AI Check: Chữ viết rõ ràng
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Duyệt (+25 xu)
                  </button>
                  <Link
                    href={AppRoutes.TEACHER.SUBMISSIONS}
                    className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-semibold transition-colors"
                  >
                    Chi tiết
                  </Link>
                </div>
              </div>

              {/* Submission 3 */}
              <div className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 font-black text-xs flex items-center justify-center shrink-0">
                    HN
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">Lê Hoàng Nam</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                        Rèn luyện
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 font-medium">Nhiệm vụ: Đọc sách 20 phút mỗi tối</p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-600 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> 2 giờ trước
                      </span>
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Có ảnh kèm chữ ký PH
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Duyệt (+20 xu)
                  </button>
                  <Link
                    href={AppRoutes.TEACHER.SUBMISSIONS}
                    className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-semibold transition-colors"
                  >
                    Chi tiết
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-2 border-t border-slate-100 text-center">
            <Link
              href={AppRoutes.TEACHER.SUBMISSIONS}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1"
            >
              <span>Mở giao diện duyệt bài tập chi tiết</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Right Column: Pending Rewards & Quick Award (1 col) */}
        <div className="space-y-6">
          {/* Box 1: Yêu cầu đổi quà chờ trao */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  <Gift className="w-3.5 h-3.5" />
                </div>
                <h2 className="text-xs font-bold text-slate-900">Quà chờ trao tại lớp (2)</h2>
              </div>
              <Link
                href={AppRoutes.TEACHER.REWARDS}
                className="text-[11px] font-bold text-emerald-700 hover:underline"
              >
                Kho quà →
              </Link>
            </div>

            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-bold text-slate-900">Phạm Tuấn Kiệt</div>
                  <div className="text-[11px] text-slate-500">Hộp bút màu 24 cây</div>
                  <div className="text-[10px] font-bold text-amber-600 mt-0.5">-150 xu</div>
                </div>
                <button
                  type="button"
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-colors cursor-pointer"
                >
                  Đã trao
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-bold text-slate-900">Đỗ Thùy Linh</div>
                  <div className="text-[11px] text-slate-500">Sổ tay phi hành gia</div>
                  <div className="text-[10px] font-bold text-amber-600 mt-0.5">-80 xu</div>
                </div>
                <button
                  type="button"
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-colors cursor-pointer"
                >
                  Đã trao
                </button>
              </div>
            </div>
          </div>

          {/* Box 2: Khen thưởng nóng xu (Symbolic Box) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Award className="w-3.5 h-3.5" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-slate-900">Thưởng nóng xu tại lớp</h2>
                <p className="text-[10px] text-slate-500">Khích lệ học sinh phát biểu hăng hái</p>
              </div>
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Chọn học sinh:
                </label>
                <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center justify-between cursor-pointer">
                  <span>-- Chọn tên học sinh --</span>
                  <ChevronRight className="w-3 h-3 text-slate-400 rotate-90" />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Mức xu thưởng:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    className="py-1.5 rounded-lg bg-slate-100 hover:bg-amber-100 hover:text-amber-800 text-xs font-bold text-slate-700 border border-slate-200 transition-colors"
                  >
                    +10 xu
                  </button>
                  <button
                    type="button"
                    className="py-1.5 rounded-lg bg-amber-500 text-white text-xs font-bold shadow-xs"
                  >
                    +20 xu
                  </button>
                  <button
                    type="button"
                    className="py-1.5 rounded-lg bg-slate-100 hover:bg-amber-100 hover:text-amber-800 text-xs font-bold text-slate-700 border border-slate-200 transition-colors"
                  >
                    +50 xu
                  </button>
                </div>
              </div>

              <button
                type="button"
                className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer mt-1"
              >
                Gửi xu khen ngợi 🌟
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. ADMIN PRIVILEGE SECTION (Solid Dark Card if Admin) */}
      {/* ========================================================================= */}
      {isAdmin && (
        <div className="rounded-2xl border border-slate-300 bg-white p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Quản trị Hệ thống (Admin Only)</h2>
                <p className="text-xs text-slate-500">Các công cụ quản lý bảo mật và cấp phát tài khoản</p>
              </div>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200">
              Admin Privilege
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100/70 transition-colors cursor-pointer">
              <Users className="w-4 h-4 text-purple-600 mb-2" />
              <div className="text-xs font-bold text-slate-900">Quản lý Tài khoản</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Tạo tài khoản & phân quyền GV</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100/70 transition-colors cursor-pointer">
              <KeyRound className="w-4 h-4 text-amber-600 mb-2" />
              <div className="text-xs font-bold text-slate-900">Reset PIN / Mật khẩu</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Đặt lại PIN 4 số cho học sinh</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100/70 transition-colors cursor-pointer">
              <Settings className="w-4 h-4 text-blue-600 mb-2" />
              <div className="text-xs font-bold text-slate-900">Cấu hình Bảo mật</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Thời gian khóa & giới hạn sai PIN</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100/70 transition-colors cursor-pointer">
              <History className="w-4 h-4 text-emerald-600 mb-2" />
              <div className="text-xs font-bold text-slate-900">Nhật ký Đăng nhập</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Xem bảng `auth_logs` an ninh</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
