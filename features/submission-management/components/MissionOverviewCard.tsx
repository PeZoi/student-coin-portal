"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Clock,
  ArrowRight,
  Users,
  CheckCircle2,
  FileCheck2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AppRoutes } from "@/constants/routes";
import { MissionSubmissionSummary } from "../types";
import { formatDate } from "@/lib/date";

interface MissionOverviewCardProps {
  mission: MissionSubmissionSummary;
}

/**
 * Thẻ Bài tập Trực quan trên Màn hình Tổng quan Duyệt bài (Assignment Overview Card)
 * - Tinh chỉnh tối giản:
 *   + Bỏ badge môn học và lớp
 *   + Đổi xu thành icon ảnh /coin.webp
 *   + Thêm ảnh thumbnail minh họa bài tập từ folder submissions (/write.webp hoặc /capture.webp)
 *   + Text "Chờ duyệt" không bao giờ bị rớt dòng (whitespace-nowrap)
 *   + Bỏ hoàn toàn hàng AI TB, ảnh mờ và avatar học sinh
 *   + Đánh dấu rõ ràng bài tập đã quá hạn nộp
 */
export function MissionOverviewCard({ mission }: MissionOverviewCardProps) {
  const detailHref = AppRoutes.TEACHER.SUBMISSION_DETAIL(mission.id);
  // Trạng thái quá hạn nộp đã được tính toán sẵn từ Hook (100% Pure Component, không gọi Date.now trong render)
  const isExpired = Boolean(mission.is_expired);

  // Tính tỷ lệ phần trăm các nhóm học sinh
  const total = Math.max(1, mission.total_students);
  const submitted = mission.submitted_count;
  const pending = mission.pending_count;
  const approved = mission.approved_count;
  const rejected = mission.rejected_count;
  const unsubmitted = Math.max(0, mission.total_students - submitted);

  const approvedPercent = Math.round((approved / total) * 100);
  const pendingPercent = Math.round((pending / total) * 100);
  const rejectedPercent = Math.round((rejected / total) * 100);
  const unsubmittedPercent = Math.max(
    0,
    100 - approvedPercent - pendingPercent - rejectedPercent
  );

  const submissionRate = Math.round((submitted / total) * 100);
  const hasPending = pending > 0;

  // Lựa chọn ảnh thumbnail bài tập từ thư mục public/submissions/
  const thumbnailSrc =
    mission.submission_type === "platform_proof"
      ? "/submissions/capture.webp"
      : "/submissions/write.webp";

  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-[#E2E8F0] hover:border-slate-300 transition-all duration-200 shadow-2xs hover:shadow-md flex flex-col justify-between overflow-hidden group",
        isExpired && "bg-slate-50/40 opacity-90 hover:opacity-100"
      )}
    >
      {/* 1. Header Thẻ: Icon bài tập + Tiêu đề (Chiếm trọn hàng trên) */}
      <div className="p-5 pb-4 space-y-3">
        <div className="flex items-center gap-3">
          {/* Ảnh minh họa bài tập từ folder submissions */}
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden border border-slate-200/90 bg-white shrink-0 relative shadow-2xs group-hover:scale-105 transition-transform">
            <Image
              src={thumbnailSrc}
              alt={mission.title}
              width={48}
              height={48}
              style={{ height: "auto" }}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="min-w-0 flex-1">
            <Link href={detailHref} className="block">
              <h3
                className="text-base font-extrabold text-[#0F172A] group-hover:text-[#0A62D6] transition-colors cursor-pointer line-clamp-2 leading-snug"
                title={mission.title}
              >
                {mission.title}
              </h3>
            </Link>
          </div>
        </div>

        {/* Dòng Hạn nộp + Thông tin Xu Heo Đất nằm cùng một hàng */}
        <div className="flex items-center justify-between gap-2 text-xs font-medium pt-0.5">
          {/* Hạn nộp */}
          <div className="flex items-center gap-1.5 flex-wrap min-w-0">
            <Clock
              className={cn(
                "w-3.5 h-3.5 shrink-0",
                isExpired ? "text-rose-500" : "text-slate-400"
              )}
            />
            <span
              className={cn(
                isExpired ? "text-rose-600 font-semibold" : "text-slate-500"
              )}
            >
              Hạn nộp: {formatDate(mission.due_at, "HH:mm - dd/MM/yyyy")}
            </span>

            {isExpired && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold whitespace-nowrap">
                <AlertCircle className="w-3 h-3 text-rose-600 shrink-0" />
                <span>Đã quá hạn</span>
              </span>
            )}
          </div>

          {/* Phần thưởng xu Heo Đất (Dùng icon xu thật /coin.webp) */}
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-200/80 text-xs font-black shrink-0 whitespace-nowrap shadow-2xs">
            <Image
              src="/coin.webp"
              alt="Xu Heo Đất"
              width={15}
              height={15}
              style={{ height: "auto" }}
              className="w-3.5 select-none shrink-0"
            />
            <span>
              +{mission.min_reward_coins}~{mission.max_reward_coins} xu
            </span>
          </div>
        </div>
      </div>

      {/* 2. Trọng tâm: Tổng hợp Thông tin Học sinh & Tiến độ Nộp bài */}
      <div className="px-5 py-4 bg-slate-50/70 border-y border-slate-100 space-y-3">
        {/* Thanh tiến độ nộp bài phân màu (Multi-segment progress bar) */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
            <span className="text-slate-700 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-500" />
              <span>Tiến độ nộp bài:</span>
              <strong className="text-[#0F172A]">
                {submitted}/{mission.total_students} học sinh
              </strong>
            </span>
            <span
              className={cn(
                "text-xs font-extrabold",
                submissionRate >= 80 ? "text-emerald-700" : "text-amber-700"
              )}
            >
              {submissionRate}%
            </span>
          </div>

          {/* Progress Bar với 4 phân đoạn màu */}
          <div
            className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden flex"
            title={`Đã duyệt: ${approved} | Chờ duyệt: ${pending} | Cần sửa: ${rejected} | Chưa nộp: ${unsubmitted}`}
          >
            {approvedPercent > 0 && (
              <div
                style={{ width: `${approvedPercent}%` }}
                className="bg-emerald-500 transition-all duration-300"
              />
            )}
            {pendingPercent > 0 && (
              <div
                style={{ width: `${pendingPercent}%` }}
                className="bg-amber-500 transition-all duration-300"
              />
            )}
            {rejectedPercent > 0 && (
              <div
                style={{ width: `${rejectedPercent}%` }}
                className="bg-rose-500 transition-all duration-300"
              />
            )}
            {unsubmittedPercent > 0 && (
              <div
                style={{ width: `${unsubmittedPercent}%` }}
                className="bg-slate-300 transition-all duration-300"
              />
            )}
          </div>
        </div>

        {/* 4 Thẻ Pills thống kê học sinh (Đảm bảo chữ KHÔNG BAO GIỜ bị rớt dòng) */}
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
          {/* Chờ duyệt */}
          <div
            className={cn(
              "px-1.5 sm:px-2 py-1.5 rounded-xl border text-center transition-all",
              hasPending
                ? "bg-amber-50 text-amber-900 border-amber-300 font-extrabold shadow-2xs"
                : "bg-white text-slate-600 border-slate-200 font-semibold"
            )}
          >
            <div className="text-[11px] font-bold text-slate-600 whitespace-nowrap truncate">
              Chờ duyệt
            </div>
            <div
              className={cn(
                "text-xs sm:text-sm font-black flex items-center justify-center gap-1 whitespace-nowrap mt-0.5",
                hasPending ? "text-amber-700" : "text-slate-800"
              )}
            >
              <span>{pending} bài</span>
            </div>
          </div>

          {/* Đã duyệt */}
          <div className="px-1.5 sm:px-2 py-1.5 rounded-xl bg-white border border-slate-200 text-center">
            <div className="text-[11px] font-bold text-slate-600 whitespace-nowrap truncate">
              Đã duyệt
            </div>
            <div className="text-xs sm:text-sm font-black text-emerald-700 whitespace-nowrap mt-0.5">
              {approved} bài
            </div>
          </div>

          {/* Cần làm lại */}
          <div className="px-1.5 sm:px-2 py-1.5 rounded-xl bg-white border border-slate-200 text-center">
            <div className="text-[11px] font-bold text-slate-600 whitespace-nowrap truncate">
              Cần sửa
            </div>
            <div
              className={cn(
                "text-xs sm:text-sm font-black whitespace-nowrap mt-0.5",
                rejected > 0 ? "text-rose-600" : "text-slate-600"
              )}
            >
              {rejected} bài
            </div>
          </div>

          {/* Chưa nộp */}
          <div className="px-1.5 sm:px-2 py-1.5 rounded-xl bg-white border border-slate-200 text-center">
            <div className="text-[11px] font-bold text-slate-500 whitespace-nowrap truncate">
              Chưa nộp
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-500 whitespace-nowrap mt-0.5">
              {unsubmitted} em
            </div>
          </div>
        </div>
      </div>

      {/* 3. Footer Thao Tác: Mở danh sách học sinh của bài tập */}
      <div className="p-4 bg-white flex items-center justify-end gap-2.5">
        {hasPending ? (
          <Link
            href={detailHref}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#0A62D6] hover:bg-[#0850B0] text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-98 shrink-0"
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Chấm bài ({pending})</span>
            <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
          </Link>
        ) : (
          <Link
            href={detailHref}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-colors cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Đã duyệt xong (100%)</span>
          </Link>
        )}
      </div>
    </div>
  );
}
