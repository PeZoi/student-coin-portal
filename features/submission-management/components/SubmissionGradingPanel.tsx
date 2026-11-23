"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Bot,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Check,
  CheckCheck,
  XCircle,
  Plus,
  ShieldCheck,
  Award,
  Lightbulb,
  ThumbsUp,
  ChevronDown,
  ChevronUp,
  Copy,
  Wand2,
  ListChecks,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";
import { SubmissionApprovalStatus } from "@/constants";
import { cn, onlyNumberKeyDown } from "@/lib/utils";
import { TeacherGradingSubmissionItem } from "../types";
import {
  AI_ERROR_TYPE_META,
  QUICK_TEACHER_FEEDBACKS,
  QUICK_REJECT_REASONS,
} from "../constants";
import { useManageSubmissionsContext } from "../contexts/ManageSubmissionsContext";

/**
 * Cột 2 (Phải): Bảng AI Co-pilot Đánh Giá, Bóc tách lỗi & Chốt Điểm Thưởng Xu
 * - Đồng bộ 100% schema `homework_submissions`, `ai_submission_errors` và `ai_raw_response` (snake_case)
 * - Hỗ trợ giáo viên chốt Điểm (/10), Số câu đúng/Tổng số câu (với bài chụp minh chứng), Xu thưởng & Lời phê
 */
export function SubmissionGradingPanel() {
  const {
    activeSubmission,
    isSubmitting,
    handleApproveSubmission,
    handleRejectSubmission,
  } = useManageSubmissionsContext();

  if (!activeSubmission) return null;

  return (
    <SubmissionGradingFormContent
      key={`${activeSubmission.id}-${activeSubmission.approval_status}`}
      submission={activeSubmission}
      isSubmitting={isSubmitting}
      onApprove={handleApproveSubmission}
      onReject={handleRejectSubmission}
    />
  );
}

function SubmissionGradingFormContent({
  submission,
  isSubmitting,
  onApprove,
  onReject,
}: {
  submission: TeacherGradingSubmissionItem;
  isSubmitting: boolean;
  onApprove: (
    id: string,
    coins: number,
    feedback: string,
    autoAdvance?: boolean,
    finalScore?: number | null,
    correctCount?: number | null,
    totalQuestions?: number | null
  ) => void;
  onReject: (id: string, reason: string, autoAdvance?: boolean) => void;
}) {
  const isApproved =
    submission.approval_status === SubmissionApprovalStatus.APPROVED;
  const showQuestionCountEditor =
    submission.submission_type === "platform_proof" ||
    submission.total_questions !== null;

  const initialFinalScore =
    submission.final_score ?? submission.ai_score ?? 10.0;

  const [scoreInput, setScoreInput] = useState<number>(initialFinalScore);
  const [correctCountInput, setCorrectCountInput] = useState<string>(
    submission.correct_count !== null ? String(submission.correct_count) : ""
  );
  const [totalQuestionsInput, setTotalQuestionsInput] = useState<string>(
    submission.total_questions !== null
      ? String(submission.total_questions)
      : ""
  );
  const [coinsInput, setCoinsInput] = useState<number>(
    submission.final_coins ?? submission.ai_suggested_coins
  );
  const [feedbackInput, setFeedbackInput] = useState<string>(
    submission.teacher_feedback ?? ""
  );
  const [showOcrText, setShowOcrText] = useState<boolean>(false);

  const parsedCorrect =
    correctCountInput.trim() === "" ? null : Math.max(0, Number(correctCountInput));
  const parsedTotal =
    totalQuestionsInput.trim() === "" ? null : Math.max(0, Number(totalQuestionsInput));
  const isQuestionCountInvalid =
    parsedCorrect !== null &&
    parsedTotal !== null &&
    parsedCorrect > parsedTotal;

  // Sao chép văn bản OCR
  const handleCopyOcr = () => {
    if (submission.ai_raw_response?.transcribed_text) {
      navigator.clipboard.writeText(submission.ai_raw_response.transcribed_text);
      toast.success("Đã sao chép văn bản nhận diện OCR vào bộ nhớ tạm!");
    }
  };

  // Áp dụng nhận xét của AI vào ô nhận xét của cô giáo
  const handleApplyAiComment = () => {
    if (submission.ai_raw_response?.overall_comment) {
      setFeedbackInput(submission.ai_raw_response.overall_comment);
      toast.info("Đã chèn nhận xét của AI vào khung lời phê!");
    }
  };

  // Quy đổi nhanh điểm /10 từ số câu đúng / tổng số câu
  const handleCalcScoreFromQuestions = () => {
    if (
      parsedCorrect !== null &&
      parsedTotal !== null &&
      parsedTotal > 0 &&
      parsedCorrect <= parsedTotal
    ) {
      const calculated = Math.round(((parsedCorrect / parsedTotal) * 10) * 10) / 10;
      setScoreInput(calculated);
    }
  };

  const improvementNotes = [
    ...(submission.ai_raw_response?.weaknesses ?? []),
    ...(submission.ai_raw_response?.suggestions ?? []),
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col h-[740px] overflow-hidden">
      {/* 1. Top Header: Tiêu đề AI Co-Pilot & Khung Thưởng Xu */}
      <div className="p-3.5 sm:p-4 border-b border-slate-200/80 bg-slate-50/70 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <Bot className="w-4.5 h-4.5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-black text-[#0F172A] uppercase tracking-wider truncate">
                AI Đánh Giá & Chấm Điểm
              </h3>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-extrabold shrink-0 tabular-nums">
          <Image
            src="/coin.webp"
            alt="Xu Heo Đất"
            width={14}
            height={14}
            style={{ height: "auto" }}
            className="w-3.5 select-none shrink-0"
          />
          <span>
            Khung: +{submission.min_reward_coins} ~ {submission.max_reward_coins} xu
          </span>
        </div>
      </div>

      {/* 2. Nội dung cuộn dọc: AI Metrics Dashboard + Bóc tách lỗi + Form Chấm Điểm & Lời phê */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* ================================================================= */}
        {/* KHỐI 1: BẢNG CHỈ SỐ AI TỔNG QUAN (AI EVALUATION METRICS DASHBOARD) */}
        {/* ================================================================= */}
        <div
          className={cn(
            "p-3.5 rounded-2xl border space-y-3",
            !submission.readable
              ? "bg-rose-50/70 border-rose-200"
              : "bg-gradient-to-br from-slate-50/80 via-indigo-50/30 to-violet-50/20 border-indigo-100"
          )}
        >
          {/* Cảnh báo ảnh mờ nếu bài không đọc được */}
          {!submission.readable && (
            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-white/90 border border-rose-200 text-rose-800 text-xs font-semibold">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Chất lượng ảnh không đảm bảo</p>
                <p className="text-[11px] text-rose-600 mt-0.5">
                  {submission.unreadable_reason ||
                    "Ảnh chụp mờ hoặc thiếu sáng, đề xuất yêu cầu học sinh chụp lại."}
                </p>
              </div>
            </div>
          )}

          {/* Grid 4 Chỉ số thật từ DB: Điểm AI, Độ chính xác, Độ rõ ảnh, Xu đề xuất */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {/* KPI 1: Điểm AI gợi ý */}
            <div className="bg-white/90 rounded-xl p-2.5 border border-slate-200/80 shadow-2xs text-center space-y-0.5">
              <div className="text-[10px] font-bold text-slate-500 flex items-center justify-center gap-1">
                <Award className="w-3 h-3 text-indigo-600" />
                <span>Điểm AI</span>
              </div>
              <div className="text-base font-black text-indigo-700 tabular-nums">
                {submission.ai_score !== null
                  ? `${submission.ai_score.toFixed(1)}/10`
                  : "--"}
              </div>
            </div>

            {/* KPI 2: Độ chính xác / Câu đúng */}
            <div className="bg-white/90 rounded-xl p-2.5 border border-slate-200/80 shadow-2xs text-center space-y-0.5">
              <div className="text-[10px] font-bold text-slate-500 flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Độ chính xác</span>
              </div>
              <div className="text-base font-black text-emerald-700 tabular-nums">
                {submission.correct_count !== null &&
                submission.total_questions !== null
                  ? `${submission.correct_count}/${submission.total_questions}`
                  : submission.errors.length === 0
                    ? "100%"
                    : `${submission.errors.length} lỗi`}
              </div>
            </div>

            {/* KPI 3: Độ rõ ảnh (readable) */}
            <div className="bg-white/90 rounded-xl p-2.5 border border-slate-200/80 shadow-2xs text-center space-y-0.5">
              <div className="text-[10px] font-bold text-slate-500 flex items-center justify-center gap-1">
                <ShieldCheck
                  className={cn(
                    "w-3 h-3",
                    submission.readable ? "text-blue-600" : "text-rose-500"
                  )}
                />
                <span>Chất lượng ảnh</span>
              </div>
              <div
                className={cn(
                  "text-sm font-black pt-0.5",
                  submission.readable ? "text-blue-700" : "text-rose-600"
                )}
              >
                {submission.readable ? "Rõ nét" : "Bị mờ"}
              </div>
            </div>

            {/* KPI 4: Xu đề xuất */}
            <div className="bg-white/90 rounded-xl p-2.5 border border-slate-200/80 shadow-2xs text-center space-y-0.5">
              <div className="text-[10px] font-bold text-slate-500 flex items-center justify-center gap-1">
                <Image
                  src="/coin.webp"
                  alt="Xu Heo Đất"
                  width={14}
                  height={14}
                  style={{ height: "auto" }}
                  className="w-3.5 select-none shrink-0"
                />
                <span>Xu đề xuất</span>
              </div>
              <div className="text-base font-black text-amber-700 tabular-nums">
                +{submission.ai_suggested_coins}
              </div>
            </div>
          </div>

          {/* Nhận xét tổng quan của AI */}
          {submission.ai_raw_response?.overall_comment && (
            <div className="bg-white/95 rounded-xl p-3 border border-indigo-100/80 shadow-2xs space-y-1">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-950">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Đánh giá từ AI Trợ Giảng</span>
                </div>
                {!isApproved && (
                  <button
                    type="button"
                    onClick={handleApplyAiComment}
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-[#0A62D6] hover:underline cursor-pointer"
                    title="Dùng nội dung này làm lời nhận xét gửi học sinh"
                  >
                    <Wand2 className="w-3 h-3" />
                    <span>Dùng nhận xét này</span>
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {submission.ai_raw_response.overall_comment}
              </p>
            </div>
          )}

          {/* Điểm mạnh (strengths) */}
          {submission.ai_raw_response?.strengths &&
            submission.ai_raw_response.strengths.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                  <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Điểm mạnh nổi bật:</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {submission.ai_raw_response.strengths.map((str, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-[11px] font-medium"
                    >
                      <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>{str}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

          {/* Điểm cần lưu ý & cải thiện (weaknesses + suggestions) */}
          {improvementNotes.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-amber-800 flex items-center gap-1">
                <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                <span>Cần lưu ý &amp; cải thiện:</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {improvementNotes.map((imp, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200/80 text-[11px] font-medium"
                  >
                    <span>• {imp}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Điểm AI chưa chắc chắn (uncertainties) */}
          {submission.ai_raw_response?.uncertainties &&
            submission.ai_raw_response.uncertainties.length > 0 && (
              <div className="p-2.5 rounded-xl bg-amber-50/90 border border-amber-200/80 space-y-1">
                <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Điểm AI cần cô giáo kiểm tra lại:</span>
                </span>
                <ul className="text-[11px] text-amber-800 space-y-0.5 pl-4 list-disc">
                  {submission.ai_raw_response.uncertainties.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

          {/* Khung OCR Nhận diện chữ viết tay (transcribed_text) */}
          {submission.ai_raw_response?.transcribed_text && (
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowOcrText((prev) => !prev)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/80 text-xs font-bold text-[#0A62D6] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  <span>
                    {showOcrText
                      ? "Ẩn văn bản nhận diện từ vở (OCR)"
                      : "Xem văn bản nhận diện từ vở (OCR)"}
                  </span>
                </div>
                {showOcrText ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {showOcrText && (
                <div className="mt-2 p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold border-b border-slate-100 pb-1.5">
                    <span>Nội dung AI trích xuất từ chữ viết tay:</span>
                    <button
                      type="button"
                      onClick={handleCopyOcr}
                      className="inline-flex items-center gap-1 text-[#0A62D6] hover:underline cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Sao chép</span>
                    </button>
                  </div>
                  <p className="leading-relaxed font-mono text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    &ldquo;{submission.ai_raw_response.transcribed_text}&rdquo;
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ================================================================= */}
        {/* KHỐI 2: CHI TIẾT BÓC TÁCH LỖI TRÊN TRANG VỞ (AI ERROR BREAKDOWN)   */}
        {/* ================================================================= */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-[#0F172A] uppercase tracking-wider">
                Bóc tách lỗi chi tiết
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px]">
                {submission.errors.length} lỗi
              </span>
            </div>
          </div>

          {submission.errors.length === 0 ? (
            <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-center gap-2.5 text-xs font-semibold text-emerald-800">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold">Không phát hiện lỗi chính tả hay ngữ pháp nào!</p>
                <p className="text-[11px] text-emerald-700/90 mt-0.5">
                  {submission.readable
                    ? "Bài làm đạt chuẩn chất lượng cao, đúng cú pháp và từ vựng yêu cầu."
                    : "Chưa thể quét lỗi do chất lượng ảnh chụp chưa đạt chuẩn."}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {submission.errors.map((err) => {
                const meta = AI_ERROR_TYPE_META[err.error_type];

                return (
                  <div
                    key={err.id}
                    className="w-full text-left p-3 rounded-xl border bg-slate-50/70 border-slate-200 space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-md text-[10px] font-bold border",
                            meta.badgeClass
                          )}
                        >
                          {meta.label}
                        </span>
                        {err.line_number && (
                          <span className="text-[11px] font-bold text-slate-600">
                            Dòng {err.line_number}
                          </span>
                        )}
                      </div>

                      <span
                        className={cn(
                          "px-1.5 py-0.5 rounded text-[10px] font-bold",
                          err.severity === "major"
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        )}
                      >
                        {err.severity === "major" ? "Lỗi nặng (-1đ)" : "Lỗi nhẹ (-0.5đ)"}
                      </span>
                    </div>

                    <div className="text-xs space-y-0.5">
                      <p className="text-rose-600 line-through font-medium">
                        {err.student_text}
                      </p>
                      <p className="text-emerald-700 font-bold">
                        → {err.correction_text}
                      </p>
                    </div>

                    {err.explanation && (
                      <p className="text-[11px] text-slate-600 leading-snug pt-0.5">
                        💡 {err.explanation}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ================================================================= */}
        {/* KHỐI 3: CHỐT SỐ CÂU ĐÚNG, ĐIỂM SỐ & THƯỞNG XU HEO ĐẤT             */}
        {/* ================================================================= */}
        <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/90 space-y-3">
          {/* Hàng 0 (Chỉ hiện với bài chụp minh chứng / bài có số câu): Giáo viên chốt số câu đúng / tổng số câu */}
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
                        onClick={handleCalcScoreFromQuestions}
                        className="text-[11px] font-bold text-[#0A62D6] hover:underline cursor-pointer"
                      >
                        Tính điểm ({Math.round(((parsedCorrect / parsedTotal) * 10) * 10) / 10} đ)
                      </button>
                    )}
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={0}
                      max={999}
                      disabled={isApproved}
                      value={correctCountInput}
                      onKeyDown={onlyNumberKeyDown}
                      onChange={(e) => setCorrectCountInput(e.target.value)}
                      placeholder="Đúng"
                      aria-label="Số câu đúng"
                      className="w-20 h-9 px-3 rounded-xl bg-white border border-amber-300 text-sm font-black text-emerald-700 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 tabular-nums disabled:bg-slate-100 disabled:text-slate-500"
                    />
                    <span className="text-sm font-black text-amber-800">/</span>
                    <input
                      type="number"
                      min={0}
                      max={999}
                      disabled={isApproved}
                      value={totalQuestionsInput}
                      onKeyDown={onlyNumberKeyDown}
                      onChange={(e) => setTotalQuestionsInput(e.target.value)}
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

          {/* Hàng 1: Chốt điểm số */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-700" />
                <span>Điểm bài tập (/10 đ)</span>
              </label>

              {!isApproved && submission.ai_score !== null && (
                <button
                  type="button"
                  onClick={() => setScoreInput(submission.ai_score!)}
                  className="text-[11px] font-bold text-amber-800 hover:underline cursor-pointer"
                >
                  Theo AI: {submission.ai_score.toFixed(1)} đ
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={10}
                step={0.1}
                disabled={isApproved}
                value={scoreInput}
                onChange={(e) =>
                  setScoreInput(
                    Math.min(10, Math.max(0, Number(e.target.value) || 0))
                  )
                }
                className="w-24 h-9 px-3 rounded-xl bg-white border border-amber-300 text-sm font-black text-amber-900 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 tabular-nums disabled:bg-slate-100 disabled:text-slate-500"
              />

              {!isApproved && (
                <div className="flex items-center gap-1.5">
                  {[10, 9.5, 9, 8.5].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setScoreInput(preset)}
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

          {/* Hàng 2: Chốt số xu thưởng Heo Đất */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                <Image
                  src="/coin.webp"
                  alt="Coin"
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
                  onClick={() => setCoinsInput(submission.ai_suggested_coins)}
                  className="text-[11px] font-bold text-amber-800 hover:underline cursor-pointer"
                >
                  AI đề xuất: +{submission.ai_suggested_coins} xu
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="number"
                min={0}
                max={500}
                disabled={isApproved}
                value={coinsInput}
                onKeyDown={onlyNumberKeyDown}
                onChange={(e) =>
                  setCoinsInput(Math.max(0, Number(e.target.value) || 0))
                }
                className="w-24 h-9 px-3 rounded-xl bg-white border border-amber-300 text-sm font-black text-amber-900 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 tabular-nums disabled:bg-slate-100 disabled:text-slate-500"
              />

              {!isApproved && (
                <>
                  <button
                    type="button"
                    onClick={() => setCoinsInput(submission.min_reward_coins)}
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
                    onClick={() => setCoinsInput(submission.ai_suggested_coins)}
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
                    onClick={() => setCoinsInput(submission.max_reward_coins)}
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
                      setCoinsInput((prev) =>
                        Math.min(submission.max_reward_coins + 10, prev + 5)
                      )
                    }
                    className="inline-flex items-center gap-0.5 px-2 h-9 rounded-xl border border-amber-200 bg-white text-amber-900 text-xs font-bold hover:bg-amber-100/60 transition-colors cursor-pointer"
                    title="Thưởng thêm 5 xu cho học sinh nỗ lực sáng tạo"
                  >
                    <Plus className="w-3 h-3 text-amber-600" />
                    <span>5 xu</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* KHỐI 4: LỜI PHÊ & NHẬN XÉT CỦA GIÁO VIÊN (`teacher_feedback`)     */}
        {/* ================================================================= */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-700">
              Lời nhận xét / Góp ý gửi học sinh
            </label>
            {!isApproved && submission.ai_raw_response?.overall_comment && (
              <button
                type="button"
                onClick={handleApplyAiComment}
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
            onChange={(e) => setFeedbackInput(e.target.value)}
            placeholder="Nhập lời khen hoặc lý do yêu cầu con làm/chụp lại bài..."
            className="w-full p-3 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-[#0A62D6] focus:ring-2 focus:ring-[#0A62D6]/20 leading-relaxed resize-none disabled:bg-slate-50 disabled:text-slate-600"
          />

          {/* Mẫu nhận xét nhanh (1-Click) */}
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
                    onClick={() => setFeedbackInput(sample)}
                    className="text-left px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#EAF2FF] hover:text-[#0A62D6] text-[11px] font-medium text-slate-600 transition-colors cursor-pointer line-clamp-1"
                  >
                    {sample}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Sticky Footer: Cụm nút Duyệt bài / Yêu cầu nộp lại (Khóa lại khi đã duyệt để tránh cộng đúp xu) */}
      <div className="p-3.5 border-t border-slate-200/80 bg-slate-50/90 flex flex-col sm:flex-row items-center gap-2 shrink-0">
        {isApproved ? (
          <div className="w-full inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold">
            <CheckCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Đã duyệt &amp; cộng +{submission.final_coins ?? coinsInput} xu Heo Đất
            </span>
          </div>
        ) : (
          <>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => onReject(submission.id, feedbackInput, true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/90 text-xs font-bold transition-colors cursor-pointer shrink-0 disabled:opacity-50"
            >
              <XCircle className="w-4 h-4 shrink-0" />
              <span>Yêu cầu nộp lại</span>
            </button>

            {/* Nút Chính Nổi Bật: Duyệt bài */}
            <button
              type="button"
              disabled={isSubmitting || isQuestionCountInvalid}
              onClick={() =>
                onApprove(
                  submission.id,
                  coinsInput,
                  feedbackInput,
                  true,
                  scoreInput,
                  showQuestionCountEditor ? parsedCorrect : undefined,
                  showQuestionCountEditor ? parsedTotal : undefined
                )
              }
              className="w-full sm:flex-1 inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer active:scale-98 disabled:opacity-50"
            >
              <CheckCheck className="w-4 h-4 shrink-0" />
              <span>Duyệt (+{coinsInput} xu)</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
