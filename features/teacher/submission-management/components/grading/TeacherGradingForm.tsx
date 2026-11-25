"use client";

import Image from "next/image";
import { Award, ListChecks, Plus, Wand2 } from "lucide-react";
import { cn, onlyNumberKeyDown } from "@/lib/utils";
import {
  QUICK_REJECT_REASONS,
  QUICK_TEACHER_FEEDBACKS,
  SUBMISSION_GRADING_CONFIG,
  SUBMISSION_MEDIA_PATHS,
} from "../../constants";
import { TeacherGradingSubmissionItem } from "../../types";

interface TeacherGradingFormProps {
  submission: TeacherGradingSubmissionItem;
  isApproved: boolean;
  showQuestionCountEditor: boolean;
  scoreInput: number;
  onScoreChange: (val: number) => void;
  correctCountInput: string;
  onCorrectCountChange: (val: string) => void;
  totalQuestionsInput: string;
  onTotalQuestionsChange: (val: string) => void;
  parsedCorrect: number | null;
  parsedTotal: number | null;
  isQuestionCountInvalid: boolean;
  onCalcScoreFromQuestions: () => void;
  coinsInput: number;
  onCoinsChange: (val: number) => void;
  feedbackInput: string;
  onFeedbackChange: (val: string) => void;
  onApplyAiComment: () => void;
}

/**
 * Khối 3 & 4 trong Panel Chấm bài: Form chốt Số câu đúng/tổng số câu, Điểm (/10),
 * Xu thưởng Heo Đất và Lời phê của Giáo viên (Zero Hardcode từ SUBMISSION_GRADING_CONFIG)
 */
export function TeacherGradingForm({
  submission,
  isApproved,
  showQuestionCountEditor,
  scoreInput,
  onScoreChange,
  correctCountInput,
  onCorrectCountChange,
  totalQuestionsInput,
  onTotalQuestionsChange,
  parsedCorrect,
  parsedTotal,
  isQuestionCountInvalid,
  onCalcScoreFromQuestions,
  coinsInput,
  onCoinsChange,
  feedbackInput,
  onFeedbackChange,
  onApplyAiComment,
}: TeacherGradingFormProps) {
  return (
    <>
      {/* KHỐI 3: CHỐT SỐ CÂU ĐÚNG, ĐIỂM SỐ & THƯỞNG XU HEO ĐẤT */}
      <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/90 space-y-3">
        {showQuestionCountEditor && (
          <>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-black text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                  <ListChecks className="w-4 h-4 text-amber-700" />
                  <span>Số câu đúng / Tổng số câu</span>
                </label>

                {!isApproved &&
                  parsedCorrect !== null &&
                  parsedTotal !== null &&
                  parsedTotal > 0 &&
                  !isQuestionCountInvalid && (
                    <button
                      type="button"
                      onClick={onCalcScoreFromQuestions}
                      className="text-[11px] font-bold text-[#0A62D6] hover:underline cursor-pointer"
                    >
                      Tính điểm (
                      {Math.round(
                        (parsedCorrect / parsedTotal) *
                          SUBMISSION_GRADING_CONFIG.MAX_SCORE *
                          10
                      ) / 10}{" "}
                      đ)
                    </button>
                  )}
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={0}
                    max={SUBMISSION_GRADING_CONFIG.MAX_QUESTION_COUNT}
                    disabled={isApproved}
                    value={correctCountInput}
                    onKeyDown={onlyNumberKeyDown}
                    onWheel={(e) => e.currentTarget.blur()}
                    onChange={(e) => onCorrectCountChange(e.target.value)}
                    placeholder="Đúng"
                    aria-label="Số câu đúng"
                    className="w-20 h-9 px-3 rounded-xl bg-white border border-amber-300 text-sm font-black text-emerald-700 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 tabular-nums disabled:bg-slate-100 disabled:text-slate-500"
                  />
                  <span className="text-sm font-black text-amber-800">/</span>
                  <input
                    type="number"
                    min={0}
                    max={SUBMISSION_GRADING_CONFIG.MAX_QUESTION_COUNT}
                    disabled={isApproved}
                    value={totalQuestionsInput}
                    onKeyDown={onlyNumberKeyDown}
                    onWheel={(e) => e.currentTarget.blur()}
                    onChange={(e) => onTotalQuestionsChange(e.target.value)}
                    placeholder="Tổng"
                    aria-label="Tổng số câu"
                    className="w-20 h-9 px-3 rounded-xl bg-white border border-amber-300 text-sm font-black text-amber-900 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 tabular-nums disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>

                {parsedCorrect !== null &&
                  parsedTotal !== null &&
                  !isQuestionCountInvalid && (
                    <span className="text-xs font-bold text-rose-600 tabular-nums">
                      ({Math.max(0, parsedTotal - parsedCorrect)} câu sai)
                    </span>
                  )}
              </div>

              {isQuestionCountInvalid && (
                <p className="text-[11px] font-semibold text-rose-600">
                  Số câu đúng không được lớn hơn tổng số câu hỏi.
                </p>
              )}
            </div>

            <div className="h-px bg-amber-200/60" />
          </>
        )}

        {/* Chốt điểm số */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-700" />
              <span>Điểm bài tập (/{SUBMISSION_GRADING_CONFIG.MAX_SCORE} đ)</span>
            </label>

            {!isApproved && submission.ai_score !== null && (
              <button
                type="button"
                onClick={() => onScoreChange(submission.ai_score!)}
                className="text-[11px] font-bold text-amber-800 hover:underline cursor-pointer"
              >
                Theo AI: {submission.ai_score.toFixed(1)} đ
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="number"
              min={SUBMISSION_GRADING_CONFIG.MIN_SCORE}
              max={SUBMISSION_GRADING_CONFIG.MAX_SCORE}
              step={SUBMISSION_GRADING_CONFIG.SCORE_STEP}
              disabled={isApproved}
              value={scoreInput}
              onWheel={(e) => e.currentTarget.blur()}
              onChange={(e) =>
                onScoreChange(
                  Math.min(
                    SUBMISSION_GRADING_CONFIG.MAX_SCORE,
                    Math.max(
                      SUBMISSION_GRADING_CONFIG.MIN_SCORE,
                      Number(e.target.value) || 0
                    )
                  )
                )
              }
              className="w-24 h-9 px-3 rounded-xl bg-white border border-amber-300 text-sm font-black text-amber-900 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 tabular-nums disabled:bg-slate-100 disabled:text-slate-500"
            />

            {!isApproved && (
              <div className="flex items-center gap-1.5">
                {SUBMISSION_GRADING_CONFIG.SCORE_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => onScoreChange(preset)}
                    className={cn(
                      "px-2.5 h-9 rounded-xl border text-xs font-bold transition-colors cursor-pointer tabular-nums",
                      scoreInput === preset
                        ? "bg-amber-500 text-white border-amber-600 shadow-2xs"
                        : "bg-white text-amber-900 border-amber-200 hover:bg-amber-100/60"
                    )}
                  >
                    {preset} đ
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="h-px bg-amber-200/60" />

        {/* Chốt số xu thưởng Heo Đất */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
              <Image
                src={SUBMISSION_MEDIA_PATHS.COIN_ICON}
                alt="Xu Heo Đất"
                width={16}
                height={16}
                style={{ height: "auto" }}
                className="w-4 select-none shrink-0"
              />
              <span>Xu Heo Đất trao thưởng</span>
            </label>

            {!isApproved && (
              <button
                type="button"
                onClick={() => onCoinsChange(submission.ai_suggested_coins)}
                className="text-[11px] font-bold text-amber-800 hover:underline cursor-pointer"
              >
                AI đề xuất: +{submission.ai_suggested_coins} xu
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="number"
              min={SUBMISSION_GRADING_CONFIG.MIN_COINS}
              max={SUBMISSION_GRADING_CONFIG.MAX_MANUAL_COINS}
              disabled={isApproved}
              value={coinsInput}
              onKeyDown={onlyNumberKeyDown}
              onWheel={(e) => e.currentTarget.blur()}
              onChange={(e) =>
                onCoinsChange(
                  Math.min(
                    SUBMISSION_GRADING_CONFIG.MAX_MANUAL_COINS,
                    Math.max(
                      SUBMISSION_GRADING_CONFIG.MIN_COINS,
                      Number(e.target.value) || 0
                    )
                  )
                )
              }
              className="w-24 h-9 px-3 rounded-xl bg-white border border-amber-300 text-sm font-black text-amber-900 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 tabular-nums disabled:bg-slate-100 disabled:text-slate-500"
            />

            {!isApproved && (
              <>
                <button
                  type="button"
                  onClick={() => onCoinsChange(submission.min_reward_coins)}
                  className={cn(
                    "px-2.5 h-9 rounded-xl border text-xs font-bold transition-colors cursor-pointer",
                    coinsInput === submission.min_reward_coins
                      ? "bg-amber-500 text-white border-amber-600 shadow-2xs"
                      : "bg-white text-amber-900 border-amber-200 hover:bg-amber-100/60"
                  )}
                >
                  Sàn ({submission.min_reward_coins})
                </button>

                <button
                  type="button"
                  onClick={() => onCoinsChange(submission.ai_suggested_coins)}
                  className={cn(
                    "px-2.5 h-9 rounded-xl border text-xs font-bold transition-colors cursor-pointer",
                    coinsInput === submission.ai_suggested_coins
                      ? "bg-amber-500 text-white border-amber-600 shadow-2xs"
                      : "bg-white text-amber-900 border-amber-200 hover:bg-amber-100/60"
                  )}
                >
                  Chuẩn AI ({submission.ai_suggested_coins})
                </button>

                <button
                  type="button"
                  onClick={() => onCoinsChange(submission.max_reward_coins)}
                  className={cn(
                    "px-2.5 h-9 rounded-xl border text-xs font-bold transition-colors cursor-pointer",
                    coinsInput === submission.max_reward_coins
                      ? "bg-amber-500 text-white border-amber-600 shadow-2xs"
                      : "bg-white text-amber-900 border-amber-200 hover:bg-amber-100/60"
                  )}
                >
                  Tối đa ({submission.max_reward_coins})
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onCoinsChange(
                      Math.min(
                        submission.max_reward_coins +
                          SUBMISSION_GRADING_CONFIG.MAX_BONUS_OVER_CAP,
                        coinsInput + SUBMISSION_GRADING_CONFIG.BONUS_STEP_COINS
                      )
                    )
                  }
                  className="inline-flex items-center gap-0.5 px-2 h-9 rounded-xl border border-amber-200 bg-white text-amber-900 text-xs font-bold hover:bg-amber-100/60 transition-colors cursor-pointer"
                  title={`Thưởng thêm ${SUBMISSION_GRADING_CONFIG.BONUS_STEP_COINS} xu cho học sinh nỗ lực sáng tạo`}
                >
                  <Plus className="w-3 h-3 text-amber-600" />
                  <span>{SUBMISSION_GRADING_CONFIG.BONUS_STEP_COINS} xu</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* KHỐI 4: LỜI PHÊ & NHẬN XÉT CỦA GIÁO VIÊN */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-slate-700">
            Lời nhận xét / Góp ý gửi học sinh
          </label>
          {!isApproved && submission.ai_raw_response?.overall_comment && (
            <button
              type="button"
              onClick={onApplyAiComment}
              className="text-[11px] font-bold text-[#0A62D6] hover:underline cursor-pointer flex items-center gap-1"
            >
              <Wand2 className="w-3 h-3" />
              <span>Sao chép nhận xét AI</span>
            </button>
          )}
        </div>

        <textarea
          rows={3}
          disabled={isApproved}
          value={feedbackInput}
          onChange={(e) => onFeedbackChange(e.target.value)}
          placeholder="Nhập lời khen hoặc lý do yêu cầu con làm/chụp lại bài..."
          className="w-full p-3 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-[#0A62D6] focus:ring-2 focus:ring-[#0A62D6]/20 leading-relaxed resize-none disabled:bg-slate-50 disabled:text-slate-600"
        />

        {!isApproved && (
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-400 block">
              Mẫu nhận xét nhanh (1-click):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {(submission.readable
                ? QUICK_TEACHER_FEEDBACKS
                : QUICK_REJECT_REASONS
              ).map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onFeedbackChange(sample)}
                  className="text-left px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#EAF2FF] hover:text-[#0A62D6] text-[11px] font-medium text-slate-600 transition-colors cursor-pointer line-clamp-1"
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
