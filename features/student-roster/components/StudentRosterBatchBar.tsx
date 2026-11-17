"use client";

import { Award, KeyRound, X } from "lucide-react";

interface StudentRosterBatchBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBatchAward?: () => void;
  onBatchResetPin?: () => void;
}

/**
 * Thanh tác vụ hàng loạt nổi bật khi giáo viên chọn học sinh bằng checkbox
 * - Đồng bộ với MissionsBatchBar và StudentsBatchBar
 */
export function StudentRosterBatchBar({
  selectedCount,
  onClearSelection,
  onBatchAward,
  onBatchResetPin,
}: StudentRosterBatchBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#0F172A] text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-700/60 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="flex items-center gap-2 pr-3 border-r border-slate-700">
        <span className="w-2 h-2 rounded-full bg-[#0A62D6] animate-pulse" />
        <span className="text-xs sm:text-sm font-bold text-slate-200">
          Đã chọn <strong className="text-white">{selectedCount}</strong> học sinh
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onBatchAward}
          className="h-8.5 px-3 rounded-xl bg-[#0A62D6] hover:bg-[#0850B0] text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
        >
          <Award className="w-3.5 h-3.5" />
          <span>Thưởng xu</span>
        </button>

        <button
          type="button"
          onClick={onBatchResetPin}
          className="h-8.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border border-slate-700 active:scale-95"
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>Đặt lại PIN</span>
        </button>

        <button
          type="button"
          onClick={onClearSelection}
          className="h-8.5 px-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors flex items-center gap-1 text-xs cursor-pointer"
          title="Bỏ chọn tất cả"
        >
          <X className="w-3.5 h-3.5" />
          <span>Bỏ chọn</span>
        </button>
      </div>
    </div>
  );
}
