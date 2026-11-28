"use client";

import { Flame, Scale, TrendingUp, Trophy, X } from "lucide-react";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

interface RankingFormulaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Modal giải thích minh bạch cách chia 3 bảng xếp hạng & công thức tính tiến bộ thuần theo số xu tăng thêm
 */
export function RankingFormulaModal({
  isOpen,
  onClose,
}: RankingFormulaModalProps) {
  useBodyScrollLock(isOpen);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ranking-formula-title"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white rounded-2xl border border-[#E2E8F0] shadow-xl overflow-hidden my-auto"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EAF2FF] text-[#0A62D6] flex items-center justify-center shrink-0">
              <Scale className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2
                id="ranking-formula-title"
                className="text-base sm:text-lg font-heading font-black text-[#0F172A]"
              >
                Quy tắc 3 Bảng xếp hạng &amp; Cách tính tiến bộ
              </h2>
              <p className="text-xs text-[#64748B]">
                Đảm bảo công bằng để cả học sinh chăm chỉ lẫn học sinh cần bứt tốc đều có cơ hội tỏa sáng.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng cửa sổ"
            className="w-9 h-9 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* 1. Bảng 1 */}
          <div className="rounded-xl border border-[#CFE1FB] bg-[#F5F9FF] p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-[#0A62D6]">
              <Trophy className="w-4 h-4" aria-hidden="true" />
              <span>Bảng 1: Top Xu Tháng Này</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 mt-1.5 leading-relaxed">
              Xếp hạng toàn bộ học sinh theo <strong>tổng số xu kiếm được trong tháng hiện tại</strong> (từ làm bài tập, thưởng nóng, vòng quay...). Nếu bằng xu nhau, ưu tiên bạn hoàn thành nhiều bài tập hơn.
            </p>
          </div>

          {/* 2. Cách chia 2 nhóm Tiến bộ */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2.5">
            <p className="text-sm font-bold text-[#0F172A]">
              Cách chia 2 Bảng Tiến Bộ từ kết quả Tháng trước
            </p>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              Lấy danh sách xếp hạng tổng xu của <strong>tháng trước</strong> gồm <strong>N</strong> học sinh, chia đôi tại vị trí <code className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-xs">floor(N / 2)</code>. Nếu sĩ số lẻ, phần dư được đưa sang bảng thứ 2 (ví dụ: 13 em → 6 em Nhóm Dẫn Đầu, 7 em Nhóm Vươn Lên).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="rounded-xl bg-white border border-amber-200 p-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700">
                  <Flame className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Bảng 2: Tiến Bộ • Nhóm Dẫn Đầu</span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Gồm <strong>nửa trên tháng trước</strong> (nhóm chăm chỉ), thi đua cùng các bạn có xuất phát điểm cao.
                </p>
              </div>

              <div className="rounded-xl bg-white border border-emerald-200 p-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                  <TrendingUp className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Bảng 3: Tiến Bộ • Nhóm Vươn Lên</span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Gồm <strong>nửa sau tháng trước + phần dư</strong>, thi đua cùng nhóm để khích lệ tinh thần vượt bậc.
                </p>
              </div>
            </div>
          </div>

          {/* 3. Công thức tính số xu tăng thêm */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
            <p className="text-sm font-bold text-[#0F172A]">
              Công thức xếp hạng Tiến bộ (áp dụng chung cho cả 2 nhóm)
            </p>
            <div className="rounded-lg bg-slate-900 text-slate-100 px-4 py-3 font-mono text-xs sm:text-sm overflow-x-auto">
              Số xu tiến bộ = Xu kiếm được tháng này − Xu kiếm được tháng trước
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Vì học sinh đã được chia nhóm theo đúng phong độ tháng trước, việc xếp hạng trực tiếp theo <strong>số xu tăng thêm (+Xu)</strong> phản ánh công bằng tuyệt đối công sức làm thêm bài tập của từng em. Nếu bằng số xu tăng thêm, ưu tiên em có tổng xu tháng này cao hơn.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/60 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-5 rounded-xl bg-[#0A62D6] hover:bg-[#0850B0] text-white text-sm font-semibold transition-colors cursor-pointer"
          >
            Đã hiểu
          </button>
        </div>
      </div>
    </div>
  );
}
