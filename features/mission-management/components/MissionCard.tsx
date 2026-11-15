"use client";

import { Sparkles, CheckCircle2, Clock3, AlertTriangle } from "lucide-react";
import { TeacherMissionItem } from "../types";
import { AI_GRADING_FOCUS_OPTIONS } from "../constants";
import { useManageMissionsContext } from "../contexts/ManageMissionsContext";
import { formatDate } from "../utils";
import {
  MissionIconAvatar,
  MissionRewardCoinsBadge,
  MissionDeadlineCell,
  MissionStatusBadge,
} from "./MissionBadges";
import { MissionRowActions } from "./MissionRowActions";

interface MissionCardProps {
  item: TeacherMissionItem;
}

export function MissionCard({ item }: MissionCardProps) {
  const {
    isAdmin,
    selectedIds,
    handleToggleSelect,
    handleOpenEditMission,
    handleOpenSubmissionsModal,
  } = useManageMissionsContext();

  const checked = selectedIds.includes(item.id);
  const progressPercent =
    item.total_students > 0
      ? Math.min(
          100,
          Math.round((item.submitted_count / item.total_students) * 100)
        )
      : 0;

  return (
    <div
      className={`rounded-2xl border p-4 sm:p-5 flex flex-col justify-between gap-4 transition-all ${
        item.is_deleted
          ? "bg-rose-50/20 border-rose-200/80"
          : checked
          ? "bg-[#F4F8FE] border-[#0A62D6]/50 ring-1 ring-[#0A62D6]/20 shadow-xs"
          : "bg-white border-slate-200 hover:border-slate-300 shadow-2xs hover:shadow-xs"
      }`}
    >
      <div className="space-y-3.5">
        {/* Header: Checkbox + Icon + Title + Status */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            {isAdmin && (
              <input
                type="checkbox"
                checked={checked}
                onChange={() => handleToggleSelect(item.id)}
                className="mt-2.5 w-4 h-4 rounded border-slate-300 text-[#0A62D6] focus:ring-[#0A62D6] cursor-pointer accent-[#0A62D6] shrink-0"
              />
            )}
            <MissionIconAvatar
              iconType={item.icon_type}
              isDeleted={item.is_deleted}
              isActive={item.is_active}
              size="md"
            />
            <div className="min-w-0">
              {item.is_deleted ? (
                <h3 className="text-[15px] font-bold text-slate-500 line-through leading-snug">
                  {item.title}
                </h3>
              ) : (
                <button
                  type="button"
                  onClick={() => handleOpenEditMission(item)}
                  className="text-left text-[15px] font-bold text-[#0F172A] hover:text-[#0A62D6] hover:underline transition-colors cursor-pointer leading-snug line-clamp-2"
                >
                  {item.title}
                </button>
              )}
            </div>
          </div>

          <div className="shrink-0">
            <MissionStatusBadge
              isActive={item.is_active}
              isDeleted={item.is_deleted}
              dueAt={item.due_at}
            />
          </div>
        </div>

        {/* Hướng dẫn làm bài cho học sinh */}
        <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed line-clamp-2">
          {item.description}
        </p>

        {/* Tiêu chí AI chấm bài (nếu có) */}
        {item.grading_focus && item.grading_focus.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 bg-indigo-50/80 px-2 py-0.5 rounded-md border border-indigo-100">
              <Sparkles className="w-3 h-3 shrink-0" />
              <span>Tiêu chí AI:</span>
            </span>
            {item.grading_focus.map((focusId) => {
              const label =
                AI_GRADING_FOCUS_OPTIONS.find((o) => o.id === focusId)?.label ||
                focusId;
              return (
                <span
                  key={focusId}
                  className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md"
                >
                  {label}
                </span>
              );
            })}
          </div>
        )}

        {/* Thông số cấu hình: Thưởng xu + Hạn chót */}
        <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-100 text-xs">
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-slate-400 block">
              Khung thưởng Heo Đất
            </span>
            <MissionRewardCoinsBadge
              minCoins={item.min_reward_coins}
              maxCoins={item.max_reward_coins}
            />
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-medium text-slate-400 block">
              Hạn chót nộp bài
            </span>
            <MissionDeadlineCell
              dueAt={item.due_at}
              isActive={item.is_active}
              isDeleted={item.is_deleted}
            />
          </div>
        </div>

        {/* Hộp tiến độ nộp bài & duyệt thưởng */}
        <div
          onClick={() => handleOpenSubmissionsModal(item)}
          className="rounded-xl bg-slate-50/90 hover:bg-[#F4F8FE] border border-slate-200/70 hover:border-blue-200 p-3 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-700 group-hover:text-[#0A62D6] transition-colors">
              Tiến độ học sinh nộp bài
            </span>
            <span className="font-bold text-[#0F172A] tabular-nums">
              {item.submitted_count}/{item.total_students} học sinh (
              {progressPercent}%)
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-slate-200/80 overflow-hidden mb-2.5">
            <div
              style={{ width: `${progressPercent}%` }}
              className={`h-full rounded-full transition-all duration-300 ${
                progressPercent >= 80
                  ? "bg-emerald-500"
                  : progressPercent >= 40
                  ? "bg-[#0A62D6]"
                  : "bg-amber-500"
              }`}
            />
          </div>

          <div className="flex items-center justify-between gap-2 text-[11px] flex-wrap">
            <span className="inline-flex items-center gap-1 font-medium text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Đã duyệt: {item.approved_count}</span>
            </span>

            <span
              className={`inline-flex items-center gap-1 font-semibold ${
                item.pending_review_count > 0
                  ? "text-amber-700"
                  : "text-slate-500"
              }`}
            >
              <Clock3 className="w-3.5 h-3.5 text-amber-500" />
              <span>Chờ duyệt: {item.pending_review_count}</span>
            </span>

            {item.late_count > 0 && (
              <span className="inline-flex items-center gap-1 font-medium text-rose-600">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                <span>Nộp trễ: {item.late_count}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer: Ngày tạo + Nút hành động */}
      <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <span className="text-[11px] font-medium text-slate-400">
          Giao bởi {item.creator_name} • {formatDate(item.created_at)}
        </span>
        <div className="w-full sm:w-auto">
          <MissionRowActions item={item} fullWidth />
        </div>
      </div>
    </div>
  );
}
