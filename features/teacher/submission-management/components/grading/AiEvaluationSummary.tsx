"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Check,
  ShieldCheck,
  Award,
  Lightbulb,
  ThumbsUp,
  ChevronDown,
  ChevronUp,
  Copy,
  Wand2,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { SUBMISSION_MEDIA_PATHS } from "../../constants";
import { TeacherGradingSubmissionItem } from "../../types";

interface AiEvaluationSummaryProps {
  submission: TeacherGradingSubmissionItem;
  isApproved: boolean;
  onApplyAiComment: (comment: string) => void;
}

/**
 * Khối 1 trong Panel Chấm bài: Bảng chỉ số AI tổng quan (4 Mini KPI, Nhận xét AI,
 * Điểm mạnh, Điểm cần lưu ý/cải thiện, Điểm AI chưa chắc chắn và OCR chữ viết tay)
 */
export function AiEvaluationSummary({
  submission,
  isApproved,
  onApplyAiComment,
}: AiEvaluationSummaryProps) {
  const [showOcrText, setShowOcrText] = useState(false);

  const handleCopyOcr = () => {
    if (submission.ai_raw_response?.transcribed_text) {
      navigator.clipboard.writeText(submission.ai_raw_response.transcribed_text);
      toast.success("Đã sao chép văn bản nhận diện OCR vào bộ nhớ tạm!");
    }
  };

  const improvementNotes = [
    ...(submission.ai_raw_response?.weaknesses ?? []),
    ...(submission.ai_raw_response?.suggestions ?? []),
  ];

  return (
    <div
      className={cn(
        "p-3.5 rounded-2xl border space-y-3",
        !submission.readable
          ? "bg-rose-50 border-rose-200"
          : "bg-indigo-50/40 border-indigo-100"
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

      {/* Grid 4 Chỉ số thật từ DB: Điểm AI, Độ chính xác, Chất lượng ảnh, Xu đề xuất */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="bg-white rounded-xl p-2.5 border border-slate-200/80 shadow-2xs text-center space-y-0.5">
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

        <div className="bg-white rounded-xl p-2.5 border border-slate-200/80 shadow-2xs text-center space-y-0.5">
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

        <div className="bg-white rounded-xl p-2.5 border border-slate-200/80 shadow-2xs text-center space-y-0.5">
          <div className="text-[10px] font-bold text-slate-500 flex items-center justify-center gap-1">
            <ShieldCheck
              className={cn(
                "w-3 h-3",
                submission.readable ? "text-blue-600" : "text-rose-500"
              )}
            />
            <span>Ảnh</span>
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

        <div className="bg-white rounded-xl p-2.5 border border-slate-200/80 shadow-2xs text-center space-y-0.5">
          <div className="text-[10px] font-bold text-slate-500 flex items-center justify-center gap-1">
            <Image
              src={SUBMISSION_MEDIA_PATHS.COIN_ICON}
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
                onClick={() =>
                  onApplyAiComment(submission.ai_raw_response!.overall_comment!)
                }
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

      {/* Điểm mạnh */}
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

      {/* Điểm cần lưu ý & cải thiện */}
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

      {/* Điểm AI chưa chắc chắn */}
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

      {/* Khung OCR Nhận diện chữ viết tay */}
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
  );
}
