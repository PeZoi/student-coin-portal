"use client";

import { useMemo } from "react";
import {
  ArrowLeft,
  BookOpen,
  CheckCheck,
  LayoutGrid,
  Users,
  Coins,
  Clock,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/date";
import {
  TeacherSelect,
  TeacherSelectOption,
} from "@/components/ui/TeacherSelect";
import { useManageSubmissionsContext } from "../contexts/ManageSubmissionsContext";
import { SUBMISSION_SUBJECT_META } from "../constants";

/**
 * Header Không gian Chi tiết Bài tập (Level 2 Header)
 * - Cung cấp nút quay lại danh sách bài tập, KPI của riêng bài tập đang duyệt
 * - Cho phép chuyển đổi linh hoạt giữa "Studio Chấm bài 3 cột" và "Danh sách học sinh"
 */
export function MissionDetailHeader() {
  const {
    selectedMission,
    selectedMissionId,
    missionFilterOptions,
    handleSelectMission,
    viewMode,
    setViewMode,
    pendingCount,
    approvedCount,
    validAiPendingCount,
    totalCoinsAwarded,
    handleBatchApproveValid,
  } = useManageSubmissionsContext();

  const subjectMeta = selectedMission
    ? SUBMISSION_SUBJECT_META[selectedMission.subject_code] ||
      SUBMISSION_SUBJECT_META.other
    : SUBMISSION_SUBJECT_META.other;

  // Options chuyển đổi bài tập nhanh
  const missionSelectOptions = useMemo<TeacherSelectOption[]>(() => {
    return missionFilterOptions.map((m) => ({
      value: m.id,
      label: m.title,
      badge:
        m.pending_count > 0 ? `${m.pending_count} chờ` : `${m.total_submitted} nộp`,
    }));
  }, [missionFilterOptions]);

  return (
    <div className="space-y-4">
      {/* 1. Thanh Breadcrumb & Nút Quay Lại */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleSelectMission(null)}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer shrink-0 active:scale-98"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Tất cả bài tập</span>
          </button>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 font-medium truncate">
            <span>Duyệt bài</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span
              className={cn(
                "font-bold px-2 py-0.5 rounded text-[11px] border",
                subjectMeta.badgeClass
              )}
            >
              {selectedMission?.subject || "Môn học"}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-800 font-semibold truncate max-w-xs">
              {selectedMission?.title}
            </span>
          </div>
        </div>

        {/* Dropdown chuyển đổi bài tập nhanh */}
        <div className="w-full sm:w-80 shrink-0">
          <TeacherSelect
            value={selectedMissionId || "msn-001"}
            onChange={(val) => handleSelectMission(val)}
            options={missionSelectOptions}
            icon={<BookOpen className="w-3.5 h-3.5" />}
            className="w-full"
          />
        </div>
      </div>

      {/* 2. Banner Tóm Tắt Bài Tập & 4 Thẻ KPI */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={cn(
                  "inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold border",
                  subjectMeta.badgeClass
                )}
              >
                {selectedMission?.subject}
              </span>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                {selectedMission?.class_name || "Lớp 3A1"}
              </span>
              <div className="inline-flex items-center gap-1 text-xs text-slate-500">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  Hạn nộp:{" "}
                  {selectedMission
                    ? formatDate(selectedMission.due_at, "HH:mm - dd/MM/yyyy")
                    : "--"}
                </span>
              </div>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] font-heading tracking-tight">
              {selectedMission?.title || "Chi tiết bài tập"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
              {selectedMission?.description}
            </p>
          </div>

          {/* Cụm nút hành động trên Header */}
          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            {/* Nút Duyệt nhanh bài hợp lệ */}
            {validAiPendingCount > 0 && (
              <button
                type="button"
                onClick={handleBatchApproveValid}
                className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer active:scale-98"
              >
                <CheckCheck className="w-4 h-4 shrink-0" />
                <span>Duyệt nhanh bài hợp lệ ({validAiPendingCount})</span>
              </button>
            )}

            {/* Toggle View Mode: Studio 3 Cột ↔ Danh Sách Học Sinh */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/80">
              <button
                type="button"
                onClick={() => setViewMode("studio")}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                  viewMode === "studio"
                    ? "bg-white text-[#0A62D6] shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                )}
                title="Chế độ Studio Chấm nhanh 3 cột"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Studio Chấm bài</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("roster")}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                  viewMode === "roster"
                    ? "bg-white text-[#0A62D6] shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                )}
                title="Xem danh sách toàn bộ học sinh lớp đối với bài này"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Danh sách học sinh</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4 Thẻ KPI của bài tập này */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-1 border-t border-slate-100">
          {/* KPI 1: Đã nộp */}
          <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/70">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Tiến độ nộp bài
            </span>
            <span className="text-xl font-black text-slate-900 mt-0.5 block">
              {selectedMission?.submitted_count ?? 0} /{" "}
              {selectedMission?.total_students ?? 32} em
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              Tỷ lệ hoàn thành:{" "}
              {Math.round(
                ((selectedMission?.submitted_count ?? 0) /
                  (selectedMission?.total_students ?? 32)) *
                  100
              )}
              %
            </span>
          </div>

          {/* KPI 2: Chờ duyệt */}
          <div
            className={cn(
              "p-3.5 rounded-xl border transition-all",
              pendingCount > 0
                ? "bg-amber-50/80 border-amber-300"
                : "bg-slate-50/80 border-slate-200/70"
            )}
          >
            <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block">
              Chờ giáo viên duyệt
            </span>
            <span className="text-xl font-black text-amber-950 mt-0.5 flex items-center gap-1.5">
              {pendingCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              )}
              {pendingCount} bài nộp
            </span>
            <span className="text-[11px] text-amber-800 font-medium">
              {validAiPendingCount > 0
                ? `${validAiPendingCount} bài AI đánh giá tốt`
                : "Cần giáo viên chấm trực tiếp"}
            </span>
          </div>

          {/* KPI 3: Đã duyệt */}
          <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/70">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Đã duyệt hoàn thành
            </span>
            <span className="text-xl font-black text-emerald-800 mt-0.5 block">
              {approvedCount} bài
            </span>
            <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
              <Coins className="w-3 h-3 text-emerald-600" />
              <span>Đã trao: +{totalCoinsAwarded} xu Heo Đất</span>
            </span>
          </div>

          {/* KPI 4: Đánh giá AI */}
          <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/70">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Đánh giá AI Co-pilot
            </span>
            <span className="text-xl font-black text-indigo-900 mt-0.5 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>
                {selectedMission?.ai_average_score?.toFixed(1) ?? "9.2"}/10 ⭐
              </span>
            </span>
            <span className="text-[11px] text-indigo-700 font-medium">
              Độ chính xác và rõ nét cao
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
