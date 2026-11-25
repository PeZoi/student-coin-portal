"use client";

import Link from "next/link";
import Image from "next/image";
import { AppRoutes } from "@/constants/routes";
import { ChevronRight, CheckCircle, Award } from "lucide-react";
import { DashboardTopStudentItem } from "../types";

interface TopStudentsMonthlyCardProps {
  topStudents: DashboardTopStudentItem[];
  activeClassName?: string | null;
}

export function TopStudentsMonthlyCard({
  topStudents,
}: TopStudentsMonthlyCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-2xs flex flex-col justify-between">
      <div>
        {/* Header khối */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold border border-amber-200/80">
              <Award className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-extrabold text-[#0F172A] font-heading">
                  Top 3 nhận xu tháng này
                </h2>
              </div>
              <p className="text-[11px] text-slate-500">
                Học sinh nhận nhiều xu nhất
              </p>
            </div>
          </div>

          <Link
            href={AppRoutes.TEACHER.LEADERBOARD}
            className="text-xs font-bold text-[#0A62D6] hover:text-[#0850B0] flex items-center gap-0.5 group transition-colors"
          >
            <span>Xem BXH</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Danh sách Top 3 (Đồng bộ, đơn giản, bỏ ID & Streak) */}
        <div className="space-y-2">
          {topStudents.slice(0, 3).map((st) => {
            return (
              <div
                key={st.student_id}
                className="p-2.5 rounded-xl border border-slate-100/90 bg-slate-50/50 hover:bg-white hover:border-slate-200 transition-all flex items-center justify-between gap-2.5"
              >
                {/* Phần trái: Thứ hạng đồng bộ + Avatar + Tên */}
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Badge thứ hạng đồng bộ cho cả 5 vị trí */}
                  <div
                    className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center font-heading font-black text-xs border ${
                      st.rank === 1
                        ? "bg-amber-100 text-amber-800 border-amber-300 shadow-2xs"
                        : st.rank === 2
                        ? "bg-slate-100 text-slate-700 border-slate-300"
                        : st.rank === 3
                        ? "bg-orange-100 text-orange-800 border-orange-300"
                        : "bg-slate-100 text-slate-500 border-slate-200"
                    }`}
                  >
                    <span>{st.rank}</span>
                  </div>

                  {/* Avatar học sinh */}
                  <div className="relative shrink-0">
                    <Image
                      src={st.avatar_url}
                      alt={st.student_name}
                      width={36}
                      height={36}
                      style={{ height: "auto" }}
                      className="w-9 h-9 rounded-full object-cover bg-white border border-slate-200"
                    />
                  </div>

                  {/* Thông tin: Tên học sinh & số bài nộp (Đã bỏ ID & Streak) */}
                  <div className="min-w-0">
                    <span className="text-xs font-extrabold text-[#0F172A] block truncate">
                      {st.student_name}
                    </span>

                    <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                      <CheckCircle className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>{st.completed_missions_count} bài nộp</span>
                    </div>
                  </div>
                </div>

                {/* Phần phải: Tổng xu kiếm được (Chỉ text và icon, không badge) */}
                <div className="shrink-0 text-right">
                  <div className="inline-flex items-center gap-1 font-extrabold text-xs text-amber-600 tabular-nums">
                    <Image
                      src="/wheel/coin.webp"
                      alt="Xu"
                      width={14}
                      height={14}
                      style={{ height: "auto" }}
                      className="w-3.5 h-3.5 select-none"
                    />
                    <span>+{st.monthly_coins_earned}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3 mt-3 border-t border-slate-100 text-center">
        <Link
          href={AppRoutes.TEACHER.LEADERBOARD}
          className="text-xs font-bold text-[#0A62D6] hover:text-[#0850B0] inline-flex items-center gap-1"
        >
          <span>Xem bảng xếp hạng đầy đủ</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
