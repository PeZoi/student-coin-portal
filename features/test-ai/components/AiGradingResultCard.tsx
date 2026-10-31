"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Award,
  CheckCircle,
  AlertCircle,
  Sparkles,
  RotateCcw,
  BookOpen,
  FileText,
  Copy,
  Check,
  PencilLine,
  HelpCircle,
  AlertTriangle,
} from "lucide-react";
import { AiGradingResult } from "../types";
import { Button3D } from "@/components/ui/Button3D";
import { toast } from "sonner";

interface AiGradingResultCardProps {
  result: AiGradingResult;
  teacherAssignment?: string;
  onReset: () => void;
}

export function AiGradingResultCard({
  result,
  teacherAssignment,
  onReset,
}: AiGradingResultCardProps) {
  const [copiedTranscript, setCopiedTranscript] = useState(false);

  const handleCopyTranscript = () => {
    if (!result.transcribedText) return;
    navigator.clipboard.writeText(result.transcribedText);
    setCopiedTranscript(true);
    toast.success("Đã sao chép văn bản bài làm học sinh!");
    setTimeout(() => setCopiedTranscript(false), 2000);
  };

  const isPlatformProof = result.coinRewardMode === "platform_proof";

  // 1. Trường hợp ảnh bài làm mờ hoặc không thể đọc được
  if (result.readable === false) {
    return (
      <div className="w-full rounded-[24px] bg-white shadow-xl border-4 border-rose-300 p-5 sm:p-6 flex flex-col gap-4 text-slate-800 select-none animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 border-b border-rose-100 pb-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center flex-shrink-0 shadow-md">
            <AlertCircle className="w-7 h-7 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="font-heading font-black text-lg text-rose-700">
              {isPlatformProof
                ? "ẢNH MINH CHỨNG KHÔNG THỂ NHẬN DIỆN"
                : "ẢNH BÀI LÀM KHÔNG THỂ ĐỌC ĐƯỢC"}
            </h3>
            <p className="text-xs text-slate-500 font-heading">
              {isPlatformProof
                ? "AI không thể nhận diện được điểm số từ ảnh chụp màn hình này"
                : "AI không thể nhận diện chữ viết tay từ ảnh này"}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex flex-col gap-1.5">
          <span className="font-heading font-bold text-xs text-rose-800">
            Lý do không nhận diện được:
          </span>
          <p className="text-sm font-heading text-slate-800 leading-relaxed font-medium">
            {result.unreadableReason ||
              result.overallComment ||
              (isPlatformProof
                ? "Ảnh chụp màn hình bị mờ hoặc không hiển thị rõ phần điểm số/kết quả làm bài."
                : "Ảnh bài làm bị mờ, lóa sáng, thiếu chữ hoặc không phải bài viết tiếng Anh.")}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs font-heading text-amber-900 leading-relaxed">
          <p className="font-bold mb-1">💡 Hướng dẫn chụp ảnh đạt chuẩn:</p>
          {isPlatformProof ? (
            <ul className="list-disc pl-4 space-y-1 text-slate-700">
              <li>Chụp rõ phần hiển thị kết quả hoặc điểm số (ví dụ: 15/15 points, 18/20, 100%).</li>
              <li>Đảm bảo ảnh chụp không bị chói sáng, bóng lóa hoặc che khuất con số kết quả.</li>
              <li>Chụp trực diện màn hình máy tính hoặc điện thoại để các con số hiển thị rõ nét nhất.</li>
            </ul>
          ) : (
            <ul className="list-disc pl-4 space-y-1 text-slate-700">
              <li>Chụp vuông góc từ trên xuống, đủ ánh sáng, không bị bóng tay che khuất.</li>
              <li>Đặt trang vở ngay ngắn, lấy đủ 4 góc của trang giấy.</li>
              <li>Đảm bảo các chữ viết bằng bút mực rõ nét, không bị nhòe.</li>
            </ul>
          )}
        </div>

        <div className="pt-2 flex justify-center">
          <Button3D onClick={onReset} variant="yellow" size="md" className="gap-1.5">
            <RotateCcw className="w-4 h-4 stroke-[3]" />
            <span>Chụp & Nộp lại ảnh khác</span>
          </Button3D>
        </div>
      </div>
    );
  }

  // 2. Trường hợp chấm bài thành công
  const hasErrors = result.errors && result.errors.length > 0;
  const hasUncertainties = result.uncertainties && result.uncertainties.length > 0;

  return (
    <div className="w-full rounded-[24px] bg-white shadow-xl border-4 border-amber-300/80 p-4 sm:p-6 flex flex-col gap-4 text-slate-800 select-none animate-in fade-in zoom-in-95 duration-200">
      {/* Header kết quả chấm bài */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-100 pb-4 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-500 border-2 border-white shadow-md flex items-center justify-center flex-shrink-0">
            <Award className="w-7 h-7 text-white stroke-[2.5]" />
          </div>
          <div>
            <h3 className="font-heading font-black text-lg sm:text-xl text-slate-800">
              {isPlatformProof ? "KẾT QUẢ XÁC THỰC MINH CHỨNG" : "KẾT QUẢ CHẤM ĐIỂM CỦA AI"}
            </h3>
            <p className="text-xs text-slate-500 font-heading">
              Đã chấm lúc: {result.gradedAt}
            </p>
          </div>
        </div>

        {/* Cụm Điểm số & Xu thưởng */}
        <div className="flex items-center gap-2">
          {/* Huy hiệu điểm số / số câu đúng */}
          <div className="px-4 py-2 rounded-2xl bg-gradient-to-b from-[#FFFBE8] to-[#FFF0B8] border-2 border-[#F59E0B] shadow-sm flex flex-col items-center justify-center min-w-[90px]">
            <span className="text-[10px] font-heading font-black text-amber-800 uppercase tracking-wider">
              {isPlatformProof ? "Số câu đúng" : "Điểm số"}
            </span>
            <span className="font-heading font-black text-2xl sm:text-3xl text-[#D97706] leading-none">
              {isPlatformProof && result.totalQuestions > 0 ? (
                <>
                  {result.correctCount}/{result.totalQuestions}
                  <span className="text-xs text-amber-700 block font-bold mt-0.5">
                    ({result.score}/10đ)
                  </span>
                </>
              ) : (
                <>
                  {result.score !== null ? result.score : "--"}
                  <span className="text-sm text-amber-700">/10</span>
                </>
              )}
            </span>
          </div>

          {/* Huy hiệu xu thưởng */}
          {result.coinReward > 0 && (
            <div
              className={`px-3 py-2 rounded-2xl border-2 shadow-sm flex flex-col items-center justify-center ${
                result.needsTeacherReview
                  ? "bg-gradient-to-b from-amber-50 to-amber-100/80 border-amber-300"
                  : "bg-gradient-to-b from-sky-50 to-sky-100 border-sky-300"
              }`}
            >
              <span
                className={`text-[10px] font-heading font-black uppercase tracking-wider ${
                  result.needsTeacherReview ? "text-amber-800" : "text-sky-800"
                }`}
              >
                {result.needsTeacherReview ? "Đề xuất Xu" : "Thưởng tích lũy"}
              </span>
              <div className="flex items-center gap-1">
                <span
                  className={`font-heading font-black text-lg sm:text-xl leading-none ${
                    result.needsTeacherReview ? "text-amber-700" : "text-[#006ED6]"
                  }`}
                >
                  +{result.coinReward}
                </span>
                <Image
                  src="/coin.png"
                  alt="Xu"
                  width={20}
                  height={20}
                  unoptimized
                  style={{ height: "auto" }}
                  className="w-4 h-4 object-contain"
                />
              </div>
              {result.needsTeacherReview && (
                <span className="text-[9px] text-amber-800 font-bold bg-amber-200/70 px-1.5 py-0.2 rounded-full mt-0.5">
                  Chờ cô giáo duyệt
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Đề bài cô giáo giao đã được đối chiếu */}
      {teacherAssignment && (
        <div className="p-3 rounded-2xl bg-sky-50 border border-sky-200 flex flex-col gap-1 text-xs font-heading">
          <span className="font-black text-sky-800 flex items-center gap-1">
            <span>📌 Yêu cầu cô giáo giao (AI đã đối chiếu):</span>
          </span>
          <p className="text-slate-700 font-medium italic leading-relaxed">
            &ldquo;{teacherAssignment}&rdquo;
          </p>
        </div>
      )}

      {/* Văn bản bài làm gốc của học sinh */}
      {result.transcribedText && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-[#F8FAFC] border-2 border-slate-200/90 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="font-heading font-black text-xs sm:text-sm text-slate-800 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-sky-600" />
              <span>
                {isPlatformProof
                  ? "📊 Thông tin ghi nhận từ ảnh minh chứng:"
                  : "📝 Văn bản bài làm học sinh (AI đọc từ ảnh):"}
              </span>
            </span>
            <button
              type="button"
              onClick={handleCopyTranscript}
              className="cursor-pointer text-[11px] font-heading font-bold text-sky-700 hover:text-sky-900 bg-sky-100/70 hover:bg-sky-200/70 border border-sky-300/60 px-2 py-0.5 rounded-lg flex items-center gap-1 transition-colors"
              title="Sao chép nội dung"
            >
              {copiedTranscript ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span>Đã sao chép</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Sao chép</span>
                </>
              )}
            </button>
          </div>

          <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm font-serif leading-relaxed text-slate-800 whitespace-pre-wrap select-text">
            {result.transcribedText}
          </div>

          {/* Dải thông báo chữ khó đọc / chưa chắc chắn */}
          {hasUncertainties && (
            <div className="p-2 rounded-xl bg-amber-50/90 border border-amber-300/80 flex items-start gap-2 text-[11px] text-amber-900 font-heading">
              <HelpCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">
                  Chỗ chữ mờ / khó đọc AI chưa chắc chắn ({result.uncertainties?.length}):
                </span>{" "}
                <span>{result.uncertainties?.join(", ")}</span>
              </div>
            </div>
          )}

          <p className="text-[10px] text-slate-500 font-heading italic">
            {isPlatformProof
              ? "*AI tự động nhận diện số câu đúng, tổng điểm và trạng thái từ ảnh chụp màn hình."
              : "*Chép nguyên văn 100% giữ nguyên từ viết sai của học sinh để giáo viên đối chiếu trực tiếp."}
          </p>
        </div>
      )}

      {/* Bài mẫu viết lại chuẩn ngữ pháp nếu có */}
      {result.suggestedRevision && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-50/70 to-teal-50/70 border-2 border-emerald-300/80 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="font-heading font-black text-xs sm:text-sm text-emerald-900 flex items-center gap-1.5">
              <PencilLine className="w-4 h-4 text-emerald-600" />
              <span>✨ Gợi ý viết lại chuẩn ngữ pháp (Suggested Revision):</span>
            </span>
            <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
              Bài mẫu tối ưu
            </span>
          </div>
          <div className="p-3 rounded-xl bg-white border border-emerald-200 text-xs sm:text-sm font-serif leading-relaxed text-emerald-950 whitespace-pre-wrap select-text">
            {result.suggestedRevision}
          </div>
        </div>
      )}

      {/* Lời phê tổng quát của AI Giáo Viên */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-2.5">
        <Sparkles className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-heading font-black text-xs sm:text-sm text-amber-900 mb-0.5">
            Lời nhận xét từ AI Giáo Viên:
          </h4>
          <p className="font-heading font-medium text-xs sm:text-sm text-slate-700 leading-relaxed">
            &ldquo;{result.overallComment}&rdquo;
          </p>
        </div>
      </div>

      {/* Điểm mạnh & Điểm cần lưu ý */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {result.strengths.length > 0 && (
          <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200">
            <h5 className="font-heading font-black text-xs text-emerald-800 flex items-center gap-1.5 mb-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Điểm làm rất tốt:</span>
            </h5>
            <ul className="space-y-1">
              {result.strengths.map((str, idx) => (
                <li
                  key={idx}
                  className="text-xs text-slate-700 font-heading flex items-start gap-1"
                >
                  <span className="text-emerald-500 font-bold">•</span>
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {result.weaknesses.length > 0 && (
          <div className="p-3 rounded-2xl bg-rose-50/70 border border-rose-200">
            <h5 className="font-heading font-black text-xs text-rose-800 flex items-center gap-1.5 mb-1.5">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>Cần chú ý sửa lại:</span>
            </h5>
            <ul className="space-y-1">
              {result.weaknesses.map((weak, idx) => (
                <li
                  key={idx}
                  className="text-xs text-slate-700 font-heading flex items-start gap-1"
                >
                  <span className="text-rose-500 font-bold">•</span>
                  <span>{weak}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* DANH SÁCH LỖI THEO CHUẨN MỚI ("errors") */}
      {hasErrors ? (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h5 className="font-heading font-black text-xs sm:text-sm text-slate-800 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>
                Chi tiết các lỗi cần sửa ({result.errors?.length} lỗi):
              </span>
            </h5>
            <span className="text-[10px] font-heading font-bold text-slate-500">
              *Major trừ 1.0đ • Minor trừ 0.5đ
            </span>
          </div>

          <div className="space-y-2.5">
            {result.errors?.map((err, idx) => {
              const isMajor = err.severity === "major";
              const typeBadge =
                err.type === "spelling"
                  ? { label: "Chính tả", bg: "bg-purple-100 text-purple-800 border-purple-300" }
                  : err.type === "grammar"
                  ? { label: "Ngữ pháp", bg: "bg-blue-100 text-blue-800 border-blue-300" }
                  : err.type === "vocab"
                  ? { label: "Từ vựng", bg: "bg-amber-100 text-amber-800 border-amber-300" }
                  : err.type === "punctuation"
                  ? { label: "Dấu câu", bg: "bg-slate-100 text-slate-800 border-slate-300" }
                  : { label: "Nội dung", bg: "bg-rose-100 text-rose-800 border-rose-300" };

              return (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border text-xs font-heading flex flex-col gap-1.5 ${
                    isMajor
                      ? "bg-rose-50/60 border-rose-200"
                      : "bg-amber-50/60 border-amber-200"
                  }`}
                >
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-slate-800">
                        {err.line ? `Dòng ${err.line}` : `Lỗi #${idx + 1}`}
                      </span>
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${typeBadge.bg}`}
                      >
                        {typeBadge.label}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                        isMajor
                          ? "bg-rose-600 text-white border-rose-700"
                          : "bg-amber-500 text-white border-amber-600"
                      }`}
                    >
                      {isMajor ? "Major (-1.0đ)" : "Minor (-0.5đ)"}
                    </span>
                  </div>

                  {/* So sánh học sinh viết vs Sửa chuẩn */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2 rounded-lg bg-white/80 border border-slate-200/70 text-[11px]">
                    <div>
                      <span className="text-slate-500 font-bold">Học sinh viết: </span>
                      <span className="text-rose-600 font-bold line-through">
                        &ldquo;{err.studentText}&rdquo;
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-bold">Sửa chuẩn: </span>
                      <span className="text-emerald-700 font-bold">
                        &ldquo;{err.correction}&rdquo;
                      </span>
                    </div>
                  </div>

                  {/* Giải thích ngắn gọn */}
                  {err.explanation && (
                    <p className="text-slate-700 text-[11px] font-medium leading-snug">
                      👉 {err.explanation}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : result.detailedReviews.length > 0 ? (
        /* Fallback chi tiết từng câu nếu không có errors mới */
        <div className="flex flex-col gap-2">
          <h5 className="font-heading font-black text-xs sm:text-sm text-slate-800 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-sky-600" />
            <span>
              {isPlatformProof
                ? "Chi tiết kết quả minh chứng:"
                : "Chi tiết từng câu trong bài làm:"}
            </span>
          </h5>

          <div className="space-y-2">
            {result.detailedReviews.map((item, idx) => {
              const isCorrect = item.status === "correct";
              const isPartial = item.status === "partially_correct";

              return (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl border text-xs font-heading ${
                    isCorrect
                      ? "bg-emerald-50/50 border-emerald-200"
                      : isPartial
                      ? "bg-amber-50/60 border-amber-200"
                      : "bg-rose-50/50 border-rose-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-black text-slate-800">
                      {item.questionNumber}
                    </span>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                        isCorrect
                          ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                          : isPartial
                          ? "bg-amber-100 text-amber-800 border-amber-300"
                          : "bg-rose-100 text-rose-800 border-rose-300"
                      }`}
                    >
                      {isCorrect
                        ? "Chính xác ✓"
                        : isPartial
                        ? "Một phần đúng"
                        : "Cần xem lại ✗"}
                    </span>
                  </div>

                  <p className="text-slate-600 mb-1 leading-snug">
                    {item.feedback}
                  </p>

                  {item.studentAnswer && (
                    <div className="text-[11px] text-slate-500">
                      <span>Bài làm: </span>
                      <strong className="text-slate-700">
                        {item.studentAnswer}
                      </strong>
                    </div>
                  )}

                  {item.correctAnswer && (
                    <div className="text-[11px] text-emerald-700 mt-0.5">
                      <span>Sửa chuẩn: </span>
                      <strong className="text-emerald-800 font-bold">
                        {item.correctAnswer}
                      </strong>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Trường hợp bài làm hoàn hảo không có lỗi */
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs font-heading text-emerald-900">
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span className="font-bold">
            🎉 Bài làm hoàn hảo! Không phát hiện lỗi sai chính tả hay ngữ pháp nào.
          </span>
        </div>
      )}

      {/* Nút làm bài khác */}
      <div className="pt-2 flex justify-center">
        <Button3D
          onClick={onReset}
          variant="yellow"
          size="md"
          className="gap-1.5"
        >
          <RotateCcw className="w-4 h-4 stroke-[3]" />
          <span>Nộp bài tập khác</span>
        </Button3D>
      </div>
    </div>
  );
}
