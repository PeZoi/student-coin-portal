"use client";

import React from "react";
import { Flame, Sparkles, TrendingUp, Trophy, X } from "lucide-react";
import { Button3D } from "@/components/ui/Button3D";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

interface StudentLeaderboardRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  rewardConfig: {
    top1BonusCoins: number;
    top2BonusCoins: number;
    top3BonusCoins: number;
  };
}

/**
 * Modal giải thích luật 3 bảng xếp hạng thi đua thân thiện dành cho học sinh
 */
export function StudentLeaderboardRuleModal({
  isOpen,
  onClose,
  rewardConfig,
}: StudentLeaderboardRuleModalProps) {
  useBodyScrollLock(isOpen);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="student-ranking-rules-title"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl rounded-[26px] bg-white border-4 border-sky-200/80 shadow-[0_20px_50px_rgba(0,25,80,0.45)] overflow-hidden my-auto"
      >
        {/* Header Game UI */}
        <div className="bg-gradient-to-r from-[#0080FF] via-[#0095FF] to-[#006ED6] px-5 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-white">
            <div className="w-9 h-9 rounded-xl bg-white/20 border border-white/40 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2
                id="student-ranking-rules-title"
                className="font-heading font-black text-base sm:text-lg tracking-wide leading-tight"
              >
                Luật Xếp Hạng Thi Đua
              </h2>
              <p className="text-xs font-heading font-bold text-sky-100">
                Công bằng để bạn nào chăm chỉ cũng có cơ hội lên Top!
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng cửa sổ"
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer flex-shrink-0"
          >
            <X className="w-4 h-4 stroke-[3]" />
          </button>
        </div>

        {/* Nội dung */}
        <div className="p-5 space-y-3.5 max-h-[72vh] overflow-y-auto font-heading">
          {/* 1. Xu học tập */}
          <div className="rounded-2xl bg-sky-50 border-2 border-sky-200/80 p-3.5">
            <div className="flex items-center gap-2 text-sm font-black text-[#006ED6]">
              <Trophy className="w-4 h-4 flex-shrink-0" />
              <span>1. Top Xu Tháng Này</span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-700 mt-1 leading-relaxed">
              Tính theo tổng <strong>Xu làm bài tập</strong> và{" "}
              <strong>Xu thưởng phát biểu / khen ngợi</strong> từ thầy cô trong
              tháng (<em>không tính xu vòng quay may mắn</em>). Bằng xu sẽ ưu
              tiên bạn hoàn thành nhiều bài tập hơn.
            </p>
          </div>

          {/* 2. Chia 2 bảng Tiến bộ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-2xl bg-amber-50/90 border-2 border-amber-200 p-3.5">
              <div className="flex items-center gap-1.5 text-sm font-black text-amber-700">
                <Flame className="w-4 h-4 flex-shrink-0" />
                <span>2. Tiến Bộ • Dẫn Đầu</span>
              </div>
              <p className="text-xs font-semibold text-slate-700 mt-1 leading-relaxed">
                Dành cho <strong>nửa trên lớp tháng trước</strong> cùng nhau giữ
                vững phong độ và chinh phục mốc xu cao hơn nữa.
              </p>
            </div>

            <div className="rounded-2xl bg-emerald-50/90 border-2 border-emerald-200 p-3.5">
              <div className="flex items-center gap-1.5 text-sm font-black text-emerald-700">
                <TrendingUp className="w-4 h-4 flex-shrink-0" />
                <span>3. Tiến Bộ • Vươn Lên</span>
              </div>
              <p className="text-xs font-semibold text-slate-700 mt-1 leading-relaxed">
                Dành cho <strong>nửa sau lớp tháng trước</strong> cùng nhau bứt
                tốc! Học sinh mới vào lớp trong tháng sẽ bắt đầu xét tiến bộ từ
                tháng sau.
              </p>
            </div>
          </div>

          {/* 3. Công thức + Mức thưởng */}
          <div className="rounded-2xl bg-slate-50 border-2 border-slate-200/80 p-3.5 space-y-2">
            <p className="text-xs sm:text-sm font-black text-slate-800">
              Cách tính Tiến Bộ &amp; Phần Thưởng Cuối Tháng
            </p>
            <div className="rounded-xl bg-[#0B4899] text-white px-3.5 py-2 text-xs sm:text-sm font-black text-center">
              Xu tiến bộ = Xu tháng này − Xu tháng trước
            </div>
            <p className="text-xs font-semibold text-slate-600 leading-relaxed">
              Top 3 xuất sắc nhất mỗi bảng cuối tháng nhận thưởng nóng:{" "}
              <strong className="text-amber-600">
                Top 1: +{rewardConfig.top1BonusCoins} xu
              </strong>
              ,{" "}
              <strong className="text-amber-600">
                Top 2: +{rewardConfig.top2BonusCoins} xu
              </strong>
              ,{" "}
              <strong className="text-amber-600">
                Top 3: +{rewardConfig.top3BonusCoins} xu
              </strong>
              .
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-end">
          <Button3D
            variant="slate"
            size="md"
            onClick={onClose}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-black px-6"
          >
            Con hiểu rồi ạ!
          </Button3D>
        </div>
      </div>
    </div>
  );
}
