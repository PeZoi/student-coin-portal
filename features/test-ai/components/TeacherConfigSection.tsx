"use client";

import React from "react";
import {
  Coins,
  Sliders,
  UserCheck,
} from "lucide-react";
import { CoinRewardMode, PlatformProofCoinPolicy, SubjectiveWritingCoinPolicy } from "../types";

interface TeacherConfigSectionProps {
  coinRewardMode: CoinRewardMode;
  onChangeCoinRewardMode: (mode: CoinRewardMode) => void;
  platformProofCoins: PlatformProofCoinPolicy;
  onChangePlatformProofCoins: (updates: Partial<PlatformProofCoinPolicy>) => void;
  subjectiveCoins: SubjectiveWritingCoinPolicy;
  onChangeSubjectiveCoins: (updates: Partial<SubjectiveWritingCoinPolicy>) => void;
  gradingFocus?: string[];
  onToggleGradingFocus?: (focusId: string) => void;
  gradingFocusCustom?: string;
  onChangeGradingFocusCustom?: (val: string) => void;
}

export function TeacherConfigSection({
  coinRewardMode,
  onChangeCoinRewardMode,
  platformProofCoins,
  onChangePlatformProofCoins,
  subjectiveCoins,
  onChangeSubjectiveCoins,
}: TeacherConfigSectionProps) {
  return (
    <div className="w-full rounded-2xl bg-[#083E86]/90 border-2 border-amber-300/40 p-3.5 sm:p-4 flex flex-col gap-3.5 shadow-lg select-none text-white font-heading">
      {/* Header section */}
      <div className="flex items-center justify-between border-b border-sky-300/25 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-900 flex items-center justify-center font-black shadow-sm">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-black text-sm sm:text-base text-amber-300 flex items-center gap-1.5">
              <span>Cấu hình bài tập của Cô giáo</span>
            </h3>
            <p className="text-[11px] text-sky-200/80 font-normal">
              Thiết lập cơ chế thưởng xu trước khi nộp
            </p>
          </div>
        </div>
      </div>

      {/* FIELD: CƠ CHẾ ĐỀ XUẤT XU THƯỞNG (2 KIỂU) */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="font-black text-xs text-amber-300 flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-amber-300" />
            <span>Cơ chế thưởng Xu cho bài tập này:</span>
          </label>
        </div>

        {/* Tab chuyển đổi giữa 2 kiểu bài tập */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-[#042A60]/90 p-1.5 rounded-2xl border border-sky-300/30">
          {/* Kiểu 1 */}
          <button
            type="button"
            onClick={() => onChangeCoinRewardMode("platform_proof")}
            className={`cursor-pointer p-2 rounded-xl text-left transition-all ${
              coinRewardMode === "platform_proof"
                ? "bg-gradient-to-r from-[#0E6CD4] to-[#1258AF] text-white border-2 border-amber-300 shadow-md"
                : "text-sky-200 hover:bg-white/10"
            }`}
          >
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-sm">📊</span>
              <span className="font-black text-xs">
                1. Minh chứng nền tảng khác
              </span>
            </div>
            <p className="text-[11px] text-sky-200/80 leading-tight">
              Chụp ảnh kết quả làm bài trắc nghiệm (ví dụ: 16/20, 20/20)
            </p>
          </button>

          {/* Kiểu 2 */}
          <button
            type="button"
            onClick={() => onChangeCoinRewardMode("subjective_writing")}
            className={`cursor-pointer p-2 rounded-xl text-left transition-all ${
              coinRewardMode === "subjective_writing"
                ? "bg-gradient-to-r from-[#0E6CD4] to-[#1258AF] text-white border-2 border-amber-300 shadow-md"
                : "text-sky-200 hover:bg-white/10"
            }`}
          >
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-sm">✍️</span>
              <span className="font-black text-xs">
                2. Đoạn văn / Tự luận (Cần duyệt)
              </span>
            </div>
            <p className="text-[11px] text-sky-200/80 leading-tight">
              Viết đoạn văn trong vở, AI đề xuất xu & giáo viên double-check
            </p>
          </button>
        </div>

        {/* Nội dung cấu hình chi tiết theo từng kiểu */}
        {coinRewardMode === "platform_proof" ? (
          /* Cấu hình Kiểu 1: Minh chứng nền tảng khác */
          <div className="p-3 rounded-xl bg-[#042452]/90 border border-sky-300/30 flex flex-col gap-2.5 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Xu nếu đúng hết */}
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-emerald-300 flex items-center gap-1">
                  <span>✓ Xu nếu đúng hết (100% / max điểm):</span>
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={500}
                    value={platformProofCoins.fullScoreCoins}
                    onChange={(e) =>
                      onChangePlatformProofCoins({
                        fullScoreCoins: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-[#031C42] text-amber-300 font-black text-sm px-3 py-1.5 rounded-xl border border-emerald-400/40 focus:outline-none focus:border-amber-400"
                  />
                  <span className="text-xs font-bold text-sky-200 flex-shrink-0">
                    xu
                  </span>
                </div>
              </div>

              {/* Xu nếu có câu sai */}
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                  <span>⚠ Xu nếu có câu sai (đạt một phần):</span>
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={500}
                    value={platformProofCoins.partialScoreCoins}
                    onChange={(e) =>
                      onChangePlatformProofCoins({
                        partialScoreCoins: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-[#031C42] text-amber-300 font-black text-sm px-3 py-1.5 rounded-xl border border-amber-400/40 focus:outline-none focus:border-amber-400"
                  />
                  <span className="text-xs font-bold text-sky-200 flex-shrink-0">
                    xu
                  </span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-sky-200/70 italic">
              *AI sẽ nhận diện tỉ lệ điểm số trong ảnh chụp (ví dụ: đạt 20/20 tặng {platformProofCoins.fullScoreCoins} xu, đạt 16/20 tặng {platformProofCoins.partialScoreCoins} xu).
            </p>
          </div>
        ) : (
          /* Cấu hình Kiểu 2: Tự luận / Viết đoạn văn (Đề xuất khoảng xu & Giáo viên double check) */
          <div className="p-3 rounded-xl bg-[#042452]/90 border border-sky-300/30 flex flex-col gap-2.5 animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-sky-100">
                Khoảng xu đề xuất (AI sẽ gợi ý trong khoảng này):
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Min xu */}
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-bold text-sky-200">
                  Từ (Tối thiểu):
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={200}
                    value={subjectiveCoins.minCoins}
                    onChange={(e) =>
                      onChangeSubjectiveCoins({
                        minCoins: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-[#031C42] text-amber-300 font-black text-sm px-3 py-1.5 rounded-xl border border-sky-400/30 focus:outline-none focus:border-amber-400"
                  />
                  <span className="text-xs font-bold text-sky-200 flex-shrink-0">
                    xu
                  </span>
                </div>
              </div>

              {/* Max xu */}
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-bold text-sky-200">
                  Đến (Tối đa):
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={500}
                    value={subjectiveCoins.maxCoins}
                    onChange={(e) =>
                      onChangeSubjectiveCoins({
                        maxCoins: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-[#031C42] text-amber-300 font-black text-sm px-3 py-1.5 rounded-xl border border-sky-400/30 focus:outline-none focus:border-amber-400"
                  />
                  <span className="text-xs font-bold text-sky-200 flex-shrink-0">
                    xu
                  </span>
                </div>
              </div>
            </div>

            {/* Thông báo double check của giáo viên */}
            <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-500/15 border border-amber-400/40 text-amber-200 text-xs">
              <UserCheck className="w-4 h-4 text-amber-300 flex-shrink-0" />
              <span>
                <strong>Cần giáo viên duyệt lại:</strong> AI sẽ chấm điểm và đề xuất số xu phù hợp trong khoảng {subjectiveCoins.minCoins} - {subjectiveCoins.maxCoins} xu, sau đó chuyển sang danh sách chờ cô giáo xác nhận duyệt.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

