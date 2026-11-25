"use client";

import React from "react";
import { Zap, ArrowRight, CheckCircle2 } from "lucide-react";
import { CompressionStats } from "../types";
import { formatFileSize } from "../utils/compressImage";

interface CompressionStatsBadgeProps {
  stats: CompressionStats | null;
  isCompressing?: boolean;
}

export function CompressionStatsBadge({
  stats,
  isCompressing,
}: CompressionStatsBadgeProps) {
  if (isCompressing) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-400/40 text-amber-200 text-xs font-heading font-bold animate-pulse">
        <Zap className="w-3.5 h-3.5 text-amber-300 animate-bounce" />
        <span>Đang nén ảnh bằng thuật toán Client-side...</span>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="w-full rounded-2xl bg-gradient-to-r from-emerald-950/70 via-teal-900/60 to-emerald-950/70 border border-emerald-400/40 p-2.5 sm:p-3 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 select-none">
      {/* Thông số dung lượng */}
      <div className="flex items-center gap-2 text-xs sm:text-sm font-heading">
        <span className="flex items-center gap-1 text-emerald-300 font-black">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Đã nén tối ưu:</span>
        </span>
        <span className="line-through text-slate-400 font-bold">
          {formatFileSize(stats.originalSize)}
        </span>
        <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
        <span className="text-white font-black bg-emerald-500/30 px-2 py-0.5 rounded-lg border border-emerald-400/50">
          {formatFileSize(stats.compressedSize)}
        </span>
      </div>

      {/* Huy hiệu phần trăm tiết kiệm */}
      <div className="flex items-center gap-1.5 self-end sm:self-auto text-[11px] sm:text-xs font-heading">
        <span className="bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black px-2 py-0.5 rounded-full shadow-xs">
          Giảm {stats.compressionRatio}%
        </span>
        <span className="text-emerald-300/80 font-bold hidden md:inline">
          ({stats.compressedWidth}x{stats.compressedHeight}px • {stats.timeTakenMs}ms)
        </span>
      </div>
    </div>
  );
}

