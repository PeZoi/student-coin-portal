"use client";

import { useState } from "react";
import Image from "next/image";
import { Clock, AlertCircle, Users, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/date";
import { TeacherMissionItem } from "../types";
import { AI_GRADING_FOCUS_OPTIONS } from "../constants";
import { useManageMissionsContext } from "../contexts/ManageMissionsContext";
import { MissionStatusBadge } from "./MissionBadges";
import { MissionRowActions } from "./MissionRowActions";

interface MissionCardProps {
  item: TeacherMissionItem;
}

/**
 * Thẻ Bài tập trên Màn hình Quản lý / Giao bài tập (Mission Card)
 * - Đồng bộ phong cách thẻ mới từ Màn hình Duyệt bài tập:
 *   + Viền xám mảnh (#E2E8F0) bo góc mềm mại, đổ bóng nhẹ
 *   + Icon thumbnail bài tập trực quan từ /submissions/write.webp hoặc /submissions/capture.webp
 *   + Tiêu đề bài tập nổi bật, click để chỉnh sửa
 *   + Hàng Hạn chót nộp bài (kèm badge Đã quá hạn) và Thưởng Xu Heo Đất (icon /coin.webp) nằm cùng dòng
 *   + Thanh tiến độ học sinh nộp bài đa sắc (Multi-segment progress bar)
 *   + 4 khối KPI học sinh: Chờ duyệt, Đã duyệt, Cần sửa, Chưa nộp (chữ không rớt dòng)
 *   + Tiêu chí AI chấm bài đặt ngay DƯỚI 4 khối KPI
 *   + Footer tinh gọn: bên trái là thông tin người giao & ngày tạo, bên phải là nút Duyệt bài / Bài nộp và menu thao tác
 *   + Bỏ nút Danh sách học sinh theo yêu cầu
 */
export function MissionCard({ item }: MissionCardProps) {
  const {
    isAdmin,
    selectedIds,
    handleToggleSelect,
    handleOpenEditMission,
    handleOpenProgressModal,
  } = useManageMissionsContext();

  const checked = selectedIds.includes(item.id);

  // Snapshot mốc thời gian bằng state để đảm bảo tính Idempotent thuần khiết (tránh gọi Date.now() trong render)
  const [snapshotTime] = useState(() => Date.now());
  const isExpired = Boolean(
    item.is_active &&
      !item.is_deleted &&
      new Date(item.due_at).getTime() < snapshotTime
  );

  // Tính tỷ lệ phần trăm các nhóm học sinh
  const total = Math.max(1, item.total_students);
  const submitted = item.submitted_count;
  const pending = item.pending_review_count;
  const approved = item.approved_count;
  const rejected = item.rejected_count ?? 0;
  const unsubmitted = Math.max(0, item.total_students - submitted);

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
    item.submission_type === "platform_proof"
      ? "/submissions/capture.webp"
      : "/submissions/write.webp";

  return (
    <div
      className={cn(
        "rounded-2xl border border-[#E2E8F0] hover:border-slate-300 transition-all duration-200 shadow-2xs hover:shadow-md flex flex-col justify-between overflow-hidden group bg-white",
        item.is_deleted && "bg-rose-50/20 border-rose-200/80",
        checked &&
          "bg-[#F4F8FE] border-[#0A62D6]/50 ring-1 ring-[#0A62D6]/20 shadow-xs",
        isExpired && "bg-slate-50/40 opacity-95 hover:opacity-100"
      )}
    >
      {/* 1. Header Thẻ: Checkbox + Thumbnail + Tiêu đề + Trạng thái */}
      <div className="p-5 pb-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            {isAdmin && (
              <input
                type="checkbox"
                checked={checked}
                onChange={() => handleToggleSelect(item.id)}
                className="mt-2.5 w-4 h-4 rounded border-slate-300 text-[#0A62D6] focus:ring-[#0A62D6] cursor-pointer accent-[#0A62D6] shrink-0"
              />
            )}

            {/* Thumbnail ảnh minh họa bài tập */}
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden border border-slate-200/90 bg-white shrink-0 relative shadow-2xs group-hover:scale-105 transition-transform">
              <Image
                src={thumbnailSrc}
                alt={item.title}
                width={48}
                height={48}
                style={{ height: "auto" }}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Tiêu đề bài tập */}
            <div className="min-w-0 flex-1 pt-0.5">
              {item.is_deleted ? (
                <h3 className="text-base font-extrabold text-slate-500 line-through leading-snug">
                  {item.title}
                </h3>
              ) : (
                <h3
                  onClick={() => handleOpenEditMission(item)}
                  className="text-base font-extrabold text-[#0F172A] hover:text-[#0A62D6] transition-colors cursor-pointer line-clamp-2 leading-snug"
                  title={item.title}
                >
                  {item.title}
                </h3>
              )}
            </div>
          </div>

          {/* Badge trạng thái bài tập */}
          <div className="shrink-0 pt-0.5">
            <MissionStatusBadge
              isActive={item.is_active}
              isDeleted={item.is_deleted}
              dueAt={item.due_at}
            />
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
              Hạn nộp: {formatDate(item.due_at, "HH:mm - dd/MM/yyyy")}
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
              +{item.min_reward_coins === item.max_reward_coins
                ? item.max_reward_coins
                : `${item.min_reward_coins}~${item.max_reward_coins}`}{" "}
              xu
            </span>
          </div>
        </div>
      </div>

      {/* 2. Trọng tâm: Tiến độ Nộp bài & 4 Khối KPI & Tiêu chí AI */}
      <div className="px-5 py-4 bg-slate-50/70 border-y border-slate-100 space-y-3">
        {/* Thanh tiến độ nộp bài phân màu (Multi-segment progress bar) */}
        <div
          onClick={() => handleOpenProgressModal(item)}
          className="cursor-pointer group/progress"
          title="Xem chi tiết tiến độ học sinh"
        >
          <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
            <span className="text-slate-700 flex items-center gap-1.5 group-hover/progress:text-[#0A62D6] transition-colors">
              <Users className="w-3.5 h-3.5 text-slate-500" />
              <span>Tiến độ nộp bài:</span>
              <strong className="text-[#0F172A]">
                {submitted}/{item.total_students} học sinh
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
        <div
          onClick={() => handleOpenProgressModal(item)}
          className="grid grid-cols-4 gap-1.5 sm:gap-2 cursor-pointer"
        >
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
              {hasPending && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
              )}
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

          {/* Cần sửa */}
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

        {/* Tiêu chí AI chấm bài (Được đặt ngay dưới các KPI theo yêu cầu của giáo viên) */}
        {item.grading_focus && item.grading_focus.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50/90 px-2 py-0.5 rounded-md border border-indigo-100">
              <Sparkles className="w-3 h-3 text-indigo-600 shrink-0" />
              <span>Tiêu chí AI:</span>
            </span>
            {item.grading_focus.map((focusId) => {
              const label =
                AI_GRADING_FOCUS_OPTIONS.find((o) => o.id === focusId)?.label ||
                focusId;
              return (
                <span
                  key={focusId}
                  className="text-[11px] font-medium text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200/80 shadow-2xs"
                >
                  {label}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Footer Thao Tác: Ngày giao bài + Nút Duyệt bài & Menu ... (Không có nút danh sách học sinh) */}
      <div className="p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <span className="text-[11px] font-medium text-slate-400">
          Giao bởi {item.creator_name} •{" "}
          {formatDate(item.created_at, "dd/MM/yyyy")}
        </span>
        <div className="w-full sm:w-auto">
          <MissionRowActions item={item} />
        </div>
      </div>
    </div>
  );
}
