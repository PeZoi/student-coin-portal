"use client";

import Image from "next/image";
import { Award, Sparkles, Loader2, ChevronDown } from "lucide-react";
import { DashboardStudentQuickAwardItem } from "../types";

interface QuickCoinAwardWidgetProps {
  students: DashboardStudentQuickAwardItem[];
  selectedStudentId: string;
  onSelectStudentId: (id: string) => void;
  selectedCoinAmount: number;
  onSelectCoinAmount: (amount: number) => void;
  awardReason: string;
  onChangeReason: (reason: string) => void;
  isSubmitting: boolean;
  onSubmitAward: () => void;
}

const PRESET_AMOUNTS = [10, 20, 50];

const PRESET_REASONS = [
  "Phát biểu hăng hái xây dựng bài",
  "Giúp đỡ bạn bè trong giờ học",
  "Vở sạch chữ đẹp, hoàn thành bài sớm",
  "Tiến bộ vượt bậc môn học",
];

export function QuickCoinAwardWidget({
  students,
  selectedStudentId,
  onSelectStudentId,
  selectedCoinAmount,
  onSelectCoinAmount,
  awardReason,
  onChangeReason,
  isSubmitting,
  onSubmitAward,
}: QuickCoinAwardWidgetProps) {
  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-2xs">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
        <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold border border-amber-100">
          <Award className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-[#0F172A]">Thưởng nóng xu tại lớp</h2>
          <p className="text-[11px] text-slate-500">Khích lệ học sinh phát biểu hăng hái</p>
        </div>
      </div>

      <div className="space-y-3">
        {/* 1. Chọn học sinh */}
        <div>
          <label className="text-[11px] font-bold text-slate-600 block mb-1">
            Chọn học sinh khen thưởng:
          </label>
          <div className="relative">
            <select
              aria-label="Chọn học sinh khen thưởng"
              value={selectedStudentId}
              onChange={(e) => onSelectStudentId(e.target.value)}
              className="w-full pl-3 pr-8 py-2 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-xs font-semibold text-slate-800 transition-colors focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer appearance-none"
            >
              <option value="">-- Chọn học sinh trong danh sách --</option>
              {students.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.full_name} ({st.class_name}) • Đang có {st.current_coins} xu
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {selectedStudent && (
            <div className="mt-2 p-2 rounded-xl bg-emerald-50/60 border border-emerald-200/60 flex items-center gap-2.5">
              <Image
                src={selectedStudent.avatar_url}
                alt={selectedStudent.full_name}
                width={32}
                height={32}
                style={{ height: "auto" }}
                className="w-8 h-8 rounded-full border border-emerald-300 object-cover bg-white shrink-0"
              />
              <div className="text-[11px] min-w-0">
                <span className="font-bold text-emerald-900 block truncate">
                  {selectedStudent.full_name}
                </span>
                <span className="text-emerald-700">
                  Số dư Heo Đất: <strong>{selectedStudent.current_coins} xu</strong>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 2. Mức xu thưởng */}
        <div>
          <label className="text-[11px] font-bold text-slate-600 block mb-1">
            Mức xu thưởng:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {PRESET_AMOUNTS.map((amount) => {
              const isSelected = selectedCoinAmount === amount;
              return (
                <button
                  key={amount}
                  type="button"
                  onClick={() => onSelectCoinAmount(amount)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer border ${
                    isSelected
                      ? "bg-amber-500 text-white border-amber-600 shadow-2xs"
                      : "bg-slate-50 hover:bg-amber-50 hover:text-amber-800 text-slate-700 border-slate-200"
                  }`}
                >
                  <Image
                    src="/wheel/coin.webp"
                    alt="Xu"
                    width={14}
                    height={14}
                    style={{ height: "auto" }}
                    className="w-3.5 h-3.5"
                  />
                  <span>+{amount} xu</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Lý do khen thưởng */}
        <div>
          <label className="text-[11px] font-bold text-slate-600 block mb-1">
            Lý do khen thưởng:
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {PRESET_REASONS.map((reason) => (
              <button
                key={reason}
                type="button"
                onClick={() => onChangeReason(reason)}
                className={`text-[10px] px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${
                  awardReason === reason
                    ? "bg-emerald-50 text-emerald-700 border-emerald-300 font-bold"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {reason}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={awardReason}
            onChange={(e) => onChangeReason(e.target.value)}
            placeholder="Hoặc nhập lời khen riêng..."
            className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        {/* Nút gửi xu khen thưởng */}
        <button
          type="button"
          onClick={onSubmitAward}
          disabled={!selectedStudentId || isSubmitting}
          className="w-full py-2.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Đang cộng xu Heo Đất...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Tặng ngay +{selectedCoinAmount} xu cho học sinh</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
