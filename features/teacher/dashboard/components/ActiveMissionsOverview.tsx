"use client";

import Link from "next/link";
import Image from "next/image";
import { AppRoutes } from "@/constants/routes";
import { MissionSubmissionType } from "@/constants";
import { formatDate } from "@/lib/date";
import { ListTodo, ChevronRight, Clock, Users, AlertCircle, FileCheck2, CheckCircle2 } from "lucide-react";
import { DashboardActiveMissionItem } from "../types";

interface ActiveMissionsOverviewProps {
  missions: DashboardActiveMissionItem[];
}

export function ActiveMissionsOverview({ missions }: ActiveMissionsOverviewProps) {
  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 sm:p-6 shadow-2xs">
      {/* Header khối */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#EAF2FF] text-[#0A62D6] flex items-center justify-center font-bold border border-blue-100">
            <ListTodo className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[#0F172A] font-heading">
              Theo dõi tiến độ bài tập đang mở
            </h2>
            <p className="text-xs text-slate-500">
              Kiểm tra tỷ lệ hoàn thành, hạn chót và số lượng bài chờ cô chấm
            </p>
          </div>
        </div>

        <Link
          href={AppRoutes.TEACHER.MISSIONS}
          className="text-xs font-bold text-[#0A62D6] hover:text-[#0850B0] flex items-center gap-1 group transition-colors whitespace-nowrap shrink-0"
        >
          <span>Quản lý tất cả ({missions.length})</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Grid danh sách bài tập (Responsive chuẩn: 1 cột mobile, 2 cột tablet, 3 cột desktop rộng) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {missions.map((m) => {
          const isExpired = Boolean(m.is_expired);
          const total = Math.max(1, m.total_students);
          const submitted = m.submitted_count;
          const pending = m.pending_count;
          const approved = m.approved_count;
          const rejected = m.rejected_count;
          const unsubmitted = Math.max(0, m.total_students - submitted);

          const approvedPercent = Math.round((approved / total) * 100);
          const pendingPercent = Math.round((pending / total) * 100);
          const rejectedPercent = Math.round((rejected / total) * 100);
          const unsubmittedPercent = Math.max(
            0,
            100 - approvedPercent - pendingPercent - rejectedPercent
          );

          const submissionRate = Math.round((submitted / total) * 100);
          const hasPending = pending > 0;
          const isAllDone = submitted > 0 && pending === 0 && rejected === 0;

          const thumbnailSrc =
            m.submission_type === MissionSubmissionType.PLATFORM_PROOF
              ? "/submissions/capture.webp"
              : "/submissions/write.webp";

          return (
            <div
              key={m.id}
              className={`bg-white rounded-2xl border border-[#E2E8F0] hover:border-slate-300 transition-all duration-200 shadow-2xs hover:shadow-md flex flex-col justify-between overflow-hidden group ${
                isExpired ? "bg-slate-50/40 opacity-95 hover:opacity-100" : ""
              }`}
            >
              {/* 1. Header Thẻ: Icon bài tập + Tiêu đề */}
              <div className="p-4 sm:p-5 pb-3 space-y-3">
                <div className="flex items-start gap-3 min-w-0">
                  {/* Thumbnail bài tập */}
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200/90 bg-white shrink-0 relative shadow-2xs">
                    <Image
                      src={thumbnailSrc}
                      alt={m.title}
                      width={48}
                      height={48}
                      style={{ height: "auto" }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3
                      className="text-sm sm:text-[15px] font-extrabold text-[#0F172A] group-hover:text-[#0A62D6] transition-colors line-clamp-2 leading-snug"
                      title={m.title}
                    >
                      {m.title}
                    </h3>
                  </div>
                </div>

                {/* Hàng Hạn nộp + Xu Heo Đất (Chống vỡ dòng trên màn hình hẹp) */}
                <div className="flex items-center justify-between gap-2 text-xs font-medium pt-1 border-t border-slate-100/80">
                  <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                    <Clock
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isExpired ? "text-rose-500" : "text-slate-400"
                      }`}
                    />
                    <span
                      className={`text-xs whitespace-nowrap ${
                        isExpired ? "text-rose-600 font-semibold" : "text-slate-500"
                      }`}
                    >
                      Hạn nộp: {formatDate(m.due_at, "HH:mm - dd/MM/yyyy")}
                    </span>

                    {isExpired && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold whitespace-nowrap">
                        <AlertCircle className="w-3 h-3 text-rose-600 shrink-0" />
                        <span>Đã quá hạn</span>
                      </span>
                    )}
                  </div>

                  {/* Badge xu Heo Đất */}
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-200/80 text-xs font-black shrink-0 whitespace-nowrap shadow-2xs">
                    <Image
                      src="/coin.webp"
                      alt="Xu Heo Đất"
                      width={14}
                      height={14}
                      style={{ height: "auto" }}
                      className="w-3.5 select-none shrink-0"
                    />
                    <span>
                      +{m.min_reward_coins}~{m.max_reward_coins} xu
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Tổng hợp Thông tin Học sinh & Tiến độ Nộp bài */}
              <div className="px-4 sm:px-5 py-3.5 bg-slate-50/70 border-y border-slate-100 space-y-3">
                {/* Thanh tiến độ nộp bài phân màu (Multi-segment progress bar) */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
                    <span className="text-slate-700 flex items-center gap-1.5 text-xs whitespace-nowrap">
                      <Users className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="whitespace-nowrap">Tiến độ nộp bài:</span>
                      <strong className="text-[#0F172A] whitespace-nowrap">
                        {submitted}/{m.total_students} học sinh
                      </strong>
                    </span>
                    <span className="text-slate-800 text-xs font-extrabold tabular-nums whitespace-nowrap ml-2">
                      {submissionRate}%
                    </span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-slate-200/90 overflow-hidden flex shadow-inner">
                    {approvedPercent > 0 && (
                      <div
                        className="bg-emerald-500 h-full transition-all duration-300"
                        style={{ width: `${approvedPercent}%` }}
                        title={`Đã duyệt: ${approved} học sinh (${approvedPercent}%)`}
                      />
                    )}
                    {pendingPercent > 0 && (
                      <div
                        className="bg-amber-400 h-full transition-all duration-300"
                        style={{ width: `${pendingPercent}%` }}
                        title={`Chờ duyệt: ${pending} học sinh (${pendingPercent}%)`}
                      />
                    )}
                    {rejectedPercent > 0 && (
                      <div
                        className="bg-rose-500 h-full transition-all duration-300"
                        style={{ width: `${rejectedPercent}%` }}
                        title={`Cần sửa: ${rejected} học sinh (${rejectedPercent}%)`}
                      />
                    )}
                    {unsubmittedPercent > 0 && (
                      <div
                        className="bg-slate-200 h-full transition-all duration-300"
                        style={{ width: `${unsubmittedPercent}%` }}
                        title={`Chưa nộp: ${unsubmitted} học sinh (${unsubmittedPercent}%)`}
                      />
                    )}
                  </div>
                </div>

                {/* 4 Ô Thống kê con: Chờ duyệt | Đã duyệt | Cần sửa | Chưa nộp */}
                <div className="grid grid-cols-4 gap-2 text-center">
                  {/* Ô 1: Chờ duyệt */}
                  <div
                    className={`rounded-xl p-2 border transition-colors ${
                      hasPending
                        ? "bg-amber-50/50 border-amber-300 text-amber-900 ring-1 ring-amber-300/60"
                        : "bg-white border-slate-200/80 text-slate-700"
                    }`}
                  >
                    <span className="text-[11px] text-slate-500 font-medium block leading-tight whitespace-nowrap">
                      Chờ duyệt
                    </span>
                    <span
                      className={`text-xs sm:text-sm font-black tabular-nums block mt-1 whitespace-nowrap ${
                        hasPending ? "text-amber-800" : "text-slate-700"
                      }`}
                    >
                      {pending} bài
                    </span>
                  </div>

                  {/* Ô 2: Đã duyệt */}
                  <div className="rounded-xl p-2 border border-slate-200/80 bg-white text-slate-700">
                    <span className="text-[11px] text-slate-500 font-medium block leading-tight whitespace-nowrap">
                      Đã duyệt
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-emerald-700 tabular-nums block mt-1 whitespace-nowrap">
                      {approved} bài
                    </span>
                  </div>

                  {/* Ô 3: Cần sửa */}
                  <div className="rounded-xl p-2 border border-slate-200/80 bg-white text-slate-700">
                    <span className="text-[11px] text-slate-500 font-medium block leading-tight whitespace-nowrap">
                      Cần sửa
                    </span>
                    <span
                      className={`text-xs sm:text-sm font-bold tabular-nums block mt-1 whitespace-nowrap ${
                        rejected > 0 ? "text-rose-600" : "text-slate-400"
                      }`}
                    >
                      {rejected} bài
                    </span>
                  </div>

                  {/* Ô 4: Chưa nộp */}
                  <div className="rounded-xl p-2 border border-slate-200/80 bg-white text-slate-700">
                    <span className="text-[11px] text-slate-500 font-medium block leading-tight whitespace-nowrap">
                      Chưa nộp
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-slate-400 tabular-nums block mt-1 whitespace-nowrap">
                      {unsubmitted} em
                    </span>
                  </div>
                </div>
              </div>

              {/* 3. Footer Nút Chấm bài */}
              <div className="p-3.5 sm:p-4">
                <Link
                  href={AppRoutes.TEACHER.SUBMISSIONS}
                  className={`w-full inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer active:scale-98 ${
                    hasPending
                      ? "bg-[#0A62D6] hover:bg-[#0850B0] text-white"
                      : isAllDone
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                >
                  {hasPending ? (
                    <>
                      <FileCheck2 className="w-4 h-4" />
                      <span>Chấm bài ({pending}) →</span>
                    </>
                  ) : isAllDone ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Đã duyệt xong (100%)</span>
                    </>
                  ) : (
                    <>
                      <Users className="w-4 h-4 text-slate-500" />
                      <span>Xem danh sách nộp bài</span>
                    </>
                  )}
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
