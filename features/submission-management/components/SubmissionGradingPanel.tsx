"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  FileText,
  ArrowRight,
  Check,
  CheckCheck,
  XCircle,
  Eye,
  Plus,
} from "lucide-react";
import { cn, onlyNumberKeyDown } from "@/lib/utils";
import { SubmissionApprovalStatus } from "@/constants";
import { TeacherGradingSubmissionItem } from "../types";
import {
  AI_ERROR_TYPE_META,
  QUICK_TEACHER_FEEDBACKS,
  QUICK_REJECT_REASONS,
} from "../constants";
import { useManageSubmissionsContext } from "../contexts/ManageSubmissionsContext";

/**
 * Cột 3 (Phải): Bảng AI Co-pilot, Bóc tách lỗi từng dòng & Chấm thưởng Xu Heo Đất
 * - Sử dụng `key` theo Quy tắc 8 để tự động khởi tạo lại số xu và lời phê khi đổi học sinh
 * - Tối ưu hóa UX Chấm bài Thần tốc: 1-Click "Duyệt & Bạn tiếp theo"
 */
export function SubmissionGradingPanel() {
  const {
    activeSubmission,
    activeIndex,
    filteredSubmissions,
    activePhotoIndex,
    setActivePhotoIndex,
    isSubmitting,
    handleApproveSubmission,
    handleRejectSubmission,
  } = useManageSubmissionsContext();

  if (!activeSubmission) return null;

  return (
    <SubmissionGradingFormContent
      key={`${activeSubmission.id}-${activeSubmission.approval_status}`}
      submission={activeSubmission}
      currentIndex={activeIndex}
      totalInQueue={filteredSubmissions.length}
      activePhotoIndex={activePhotoIndex}
      setActivePhotoIndex={setActivePhotoIndex}
      isSubmitting={isSubmitting}
      onApprove={handleApproveSubmission}
      onReject={handleRejectSubmission}
    />
  );
}

function SubmissionGradingFormContent({
  submission,
  currentIndex,
  totalInQueue,
  activePhotoIndex,
  setActivePhotoIndex,
  isSubmitting,
  onApprove,
  onReject,
}: {
  submission: TeacherGradingSubmissionItem;
  currentIndex: number;
  totalInQueue: number;
  activePhotoIndex: number;
  setActivePhotoIndex: (idx: number) => void;
  isSubmitting: boolean;
  onApprove: (
    id: string,
    coins: number,
    feedback: string,
    autoAdvance?: boolean
  ) => void;
  onReject: (id: string, reason: string, autoAdvance?: boolean) => void;
}) {
  const [coinsInput, setCoinsInput] = useState<number>(
    submission.final_coins ?? submission.ai_suggested_coins
  );
  const [feedbackInput, setFeedbackInput] = useState<string>(
    submission.teacher_feedback ?? ""
  );
  const [showOcrText, setShowOcrText] = useState<boolean>(false);

  const isApproved =
    submission.approval_status === SubmissionApprovalStatus.APPROVED;
  const isRejected =
    submission.approval_status === SubmissionApprovalStatus.REJECTED;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col h-[740px] overflow-hidden">
      {/* 1. Header của Panel chấm điểm: Vị trí hàng đợi + Trạng thái */}
      <div className="p-4 border-b border-slate-200/80 bg-slate-50/70 flex items-center justify-between gap-2 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider block">
              AI Đánh giá &amp; Chấm điểm
            </span>
            {totalInQueue > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700 font-bold text-[10px]">
                {currentIndex + 1} / {totalInQueue}
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-500">
            Khung thưởng: +{submission.min_reward_coins} ~{" "}
            {submission.max_reward_coins} xu
          </span>
        </div>

        {isApproved ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Đã duyệt (+{submission.final_coins} xu)</span>
          </span>
        ) : isRejected ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Yêu cầu làm lại</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span>Đang chờ duyệt</span>
          </span>
        )}
      </div>

      {/* 2. Nội dung cuộn dọc: AI Co-pilot + Chỉnh xu + Lời phê */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Khối 1: Báo cáo từ AI Trợ giảng */}
        <div
          className={cn(
            "p-3.5 rounded-2xl border space-y-2.5",
            !submission.readable
              ? "bg-rose-50/70 border-rose-200"
              : "bg-indigo-50/50 border-indigo-200/80"
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              {!submission.readable ? (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              ) : (
                <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
              )}
              <span
                className={cn(
                  "text-xs font-extrabold uppercase tracking-wider",
                  !submission.readable ? "text-rose-800" : "text-indigo-950"
                )}
              >
                {!submission.readable
                  ? "Cảnh báo chất lượng ảnh"
                  : "Kết quả AI Chấm Gợi Ý"}
              </span>
            </div>

            {submission.readable && submission.ai_score !== null && (
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-600 text-white text-xs font-black tabular-nums">
                {submission.ai_score.toFixed(1)} / 10 đ
              </span>
            )}
          </div>

          {/* Lý do không đọc được nếu ảnh mờ */}
          {!submission.readable && submission.unreadable_reason && (
            <p className="text-xs font-semibold text-rose-700 leading-relaxed">
              {submission.unreadable_reason}
            </p>
          )}

          {/* Số câu đúng nếu là minh chứng trắc nghiệm */}
          {submission.correct_count !== null &&
            submission.total_questions !== null && (
              <div className="px-3 py-2 rounded-xl bg-white border border-indigo-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-600">
                  Số câu đúng nhận diện:
                </span>
                <span className="font-extrabold text-emerald-700">
                  {submission.correct_count} / {submission.total_questions} câu
                </span>
              </div>
            )}

          {/* Nhận xét tổng quan của AI */}
          {submission.ai_raw_response?.summary_comment && (
            <p className="text-xs text-slate-700 leading-relaxed">
              {submission.ai_raw_response.summary_comment}
            </p>
          )}

          {/* Nút bật/tắt bản dịch chữ viết tay OCR */}
          {submission.ai_raw_response?.ocr_transcript && (
            <div>
              <button
                type="button"
                onClick={() => setShowOcrText((prev) => !prev)}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0A62D6] hover:underline cursor-pointer"
              >
                <FileText className="w-3 h-3" />
                <span>
                  {showOcrText
                    ? "Ẩn văn bản AI đọc từ vở (OCR)"
                    : "Xem văn bản AI đọc từ vở (OCR)"}
                </span>
              </button>

              {showOcrText && (
                <div className="mt-2 p-2.5 rounded-xl bg-white border border-indigo-200/80 text-xs text-slate-700 italic leading-relaxed">
                  &ldquo;{submission.ai_raw_response.ocr_transcript}&rdquo;
                </div>
              )}
            </div>
          )}
        </div>

        {/* Khối 2: Danh sách lỗi chính tả / ngữ pháp từng dòng (`ai_submission_errors`) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700">
              Lỗi phát hiện trên trang vở ({submission.errors.length})
            </span>
            {submission.errors.length > 0 && (
              <span className="text-[11px] text-slate-400">
                Bấm vào lỗi để soi trang ảnh
              </span>
            )}
          </div>

          {submission.errors.length === 0 ? (
            <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/70 flex items-center gap-2 text-xs font-semibold text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {submission.readable
                  ? "Không phát hiện lỗi chính tả hay ngữ pháp nào!"
                  : "Chưa thể bóc tách lỗi do ảnh chụp bị mờ."}
              </span>
            </div>
          ) : (
            <div className="space-y-2">
              {submission.errors.map((err) => {
                const meta = AI_ERROR_TYPE_META[err.error_type];
                const isOnCurrentPage =
                  activePhotoIndex === err.page_index - 1;

                return (
                  <button
                    key={err.id}
                    type="button"
                    onClick={() => setActivePhotoIndex(err.page_index - 1)}
                    className={cn(
                      "w-full text-left p-3 rounded-xl border transition-all cursor-pointer space-y-1.5",
                      isOnCurrentPage
                        ? "bg-rose-50/40 border-rose-300 shadow-2xs"
                        : "bg-slate-50/70 hover:bg-slate-50 border-slate-200"
                    )}
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
                        <span className="text-[11px] font-bold text-slate-600">
                          Trang {err.page_index}
                          {err.line_number ? ` • Dòng ${err.line_number}` : ""}
                        </span>
                      </div>

                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#0A62D6]">
                        <Eye className="w-3 h-3" />
                        <span>Soi trang {err.page_index}</span>
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
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Khối 3: Chốt số xu thưởng Heo Đất (`final_coins`) */}
        <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-extrabold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
              <Image
                src="/coin.webp"
                alt="Coin"
                width={16}
                height={16}
                style={{ height: "auto" }}
                className="w-4 select-none"
              />
              <span>Số xu thưởng cho học sinh</span>
            </label>

            <button
              type="button"
              onClick={() => setCoinsInput(submission.ai_suggested_coins)}
              className="text-[11px] font-bold text-amber-800 hover:underline cursor-pointer"
            >
              AI đề xuất: +{submission.ai_suggested_coins} xu
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="number"
              min={0}
              max={500}
              value={coinsInput}
              onKeyDown={onlyNumberKeyDown}
              onChange={(e) =>
                setCoinsInput(Math.max(0, Number(e.target.value) || 0))
              }
              className="w-24 h-9 px-3 rounded-xl bg-white border border-amber-300 text-sm font-black text-amber-900 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 tabular-nums"
            />

            <button
              type="button"
              onClick={() => setCoinsInput(submission.min_reward_coins)}
              className={cn(
                "px-2.5 h-9 rounded-xl border text-xs font-bold transition-colors cursor-pointer",
                coinsInput === submission.min_reward_coins
                  ? "bg-amber-500 text-white border-amber-600"
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
                  ? "bg-amber-500 text-white border-amber-600"
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
                  ? "bg-amber-500 text-white border-amber-600"
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
              className="inline-flex items-center gap-0.5 px-2 h-9 rounded-xl border border-amber-200 bg-white text-amber-900 text-xs font-bold hover:bg-amber-100/60 transition-colors"
              title="Thưởng thêm 5 xu cho học sinh sáng tạo"
            >
              <Plus className="w-3 h-3 text-amber-600" />
              <span>5 xu</span>
            </button>
          </div>
        </div>

        {/* Khối 4: Lời phê của Giáo viên (`teacher_feedback`) */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700">
            Lời nhận xét / Góp ý gửi học sinh
          </label>

          <textarea
            rows={3}
            value={feedbackInput}
            onChange={(e) => setFeedbackInput(e.target.value)}
            placeholder="Nhập lời khen hoặc lý do yêu cầu con chụp lại bài..."
            className="w-full p-3 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-[#0A62D6] focus:ring-2 focus:ring-[#0A62D6]/20 leading-relaxed resize-none"
          />

          {/* Chip mẫu câu nhận xét nhanh */}
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
        </div>
      </div>

      {/* 3. Sticky Footer: Cụm nút Duyệt bài / Yêu cầu nộp lại */}
      <div className="p-3.5 border-t border-slate-200/80 bg-slate-50/90 flex flex-col sm:flex-row items-center gap-2 shrink-0">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => onReject(submission.id, feedbackInput, true)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 h-10 px-3.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/90 text-xs font-bold transition-colors cursor-pointer shrink-0 disabled:opacity-50"
        >
          <XCircle className="w-4 h-4 shrink-0" />
          <span>Yêu cầu nộp lại</span>
        </button>

        {/* Nút Phụ: Chỉ duyệt bài này */}
        <button
          type="button"
          disabled={isSubmitting}
          onClick={() =>
            onApprove(submission.id, coinsInput, feedbackInput, false)
          }
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 h-10 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer shrink-0 disabled:opacity-50"
          title="Chỉ duyệt và giữ nguyên học sinh này"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Chỉ duyệt</span>
        </button>

        {/* Nút Chính Nổi Bật Nhất: Duyệt & Bạn tiếp theo */}
        <button
          type="button"
          disabled={isSubmitting}
          onClick={() =>
            onApprove(submission.id, coinsInput, feedbackInput, true)
          }
          className="w-full sm:flex-1 inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer active:scale-98 disabled:opacity-50"
        >
          <CheckCheck className="w-4 h-4 shrink-0" />
          <span>Duyệt (+{coinsInput} xu) &amp; Tiếp</span>
          <ArrowRight className="w-3.5 h-3.5 shrink-0" />
        </button>
      </div>
    </div>
  );
}
