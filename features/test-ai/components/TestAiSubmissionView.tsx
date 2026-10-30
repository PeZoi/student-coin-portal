"use client";

import React, { useEffect } from "react";
import { ArrowLeft, BookOpen, Send, HelpCircle, FileQuestion } from "lucide-react";
import { Button3D } from "@/components/ui/Button3D";
import { DashboardBackgroundDecor } from "@/features/dashboard/components/DashboardBackgroundDecor";
import { useTestAiSubmission } from "../hooks/useTestAiSubmission";
import { ImageDropzone } from "./ImageDropzone";
import { AiConfigPanel } from "./AiConfigPanel";
import { AiGradingResultCard } from "./AiGradingResultCard";
import { TeacherConfigSection } from "./TeacherConfigSection";

export function TestAiSubmissionView() {
  const {
    submission,
    updateFormField,
    setCoinRewardMode,
    updatePlatformProofCoins,
    updateSubjectiveCoins,
    handleSelectFiles,
    handleRemoveImage,
    handleClearAllImages,
    totalCompressionStats,
    isCompressing,
    isSubmitting,
    gradingResult,
    handleSubmitToAi,
    handleResetSubmission,
    aiConfig,
    updateAiConfig,
  } = useTestAiSubmission();

  // Tự động cuộn mượt mà xuống khu vực kết quả chấm điểm của AI khi có kết quả
  useEffect(() => {
    if (gradingResult) {
      setTimeout(() => {
        const el = document.getElementById("ai-grading-result-section");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 150);
    }
  }, [gradingResult]);

  return (
    <div className="relative w-full h-full flex-1 flex flex-col items-center px-3 sm:px-6 lg:px-8 pt-3 pb-6 min-h-0 overflow-y-auto select-none">
      {/* Background Decor */}
      <DashboardBackgroundDecor />

      {/* Header Bar */}
      <div className="relative z-10 w-full max-w-6xl mb-3 flex items-center justify-between">
        <Button3D
          href="/student"
          variant="yellow"
          size="sm"
          className="gap-1.5 py-1.5 px-3.5 text-xs sm:text-sm tracking-wide"
        >
          <ArrowLeft className="w-4 h-4 stroke-[3]" />
          <span>Trang chủ</span>
        </Button3D>

        <div className="flex items-center gap-2 bg-[#0A4EA3]/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-sky-300/40 shadow-md">
          <span className="text-base">🇬🇧</span>
          <span className="font-heading font-black text-xs sm:text-sm text-white uppercase tracking-wider">
            Nộp bài tập Tiếng Anh • AI Chấm điểm & Sửa lỗi
          </span>
        </div>
      </div>

      {/* Main Container: Form nộp bài & Cấu hình ở trên, Kết quả chấm điểm Full Width ở dưới */}
      <main className="relative z-10 w-full max-w-6xl flex flex-col gap-5 items-start">
        {/* HÀNG TRÊN (Chia 2 cột): Form nộp bài bên trái (7 cột) & Config API bên phải (5 cột) */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* CỘT TRÁI (7 Cột): Khối Phiếu Nộp Bài Tập Tiếng Anh */}
          <div className="lg:col-span-7 rounded-[26px] bg-[#1464CB]/90 backdrop-blur-md border-3 border-sky-200/50 p-4 sm:p-5 shadow-2xl flex flex-col gap-3.5 text-white">
            <div className="flex items-center justify-between border-b border-sky-300/30 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-900 font-black flex items-center justify-center shadow-sm text-lg">
                  🇬🇧
                </div>
                <div>
                  <h2 className="font-heading font-black text-base sm:text-lg leading-tight flex items-center gap-1.5">
                    <span>Phiếu Nộp Bài Tập Tiếng Anh</span>
                    <span className="text-[10px] bg-amber-400/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-300/30">
                      English Only
                    </span>
                  </h2>
                  <p className="text-[11px] text-sky-200/80 font-heading">
                    AI sẽ đối chiếu trực tiếp với yêu cầu đề bài của cô giáo để chấm ngữ pháp, từ vựng và chính tả
                  </p>
                </div>
              </div>
            </div>

            {/* Tên bài tập Tiếng Anh */}
            <div className="flex flex-col gap-1">
              <label className="font-heading font-bold text-xs text-sky-100 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                <span>Tên bài tập Tiếng Anh:</span>
              </label>
              <input
                type="text"
                value={submission.homeworkTitle}
                onChange={(e) => updateFormField("homeworkTitle", e.target.value)}
                placeholder="Ví dụ: Unit 6: My Favourite Hobby - Writing Task"
                className="w-full bg-[#052C63]/90 text-white placeholder:text-sky-300/50 px-3.5 py-2 rounded-xl border border-sky-300/40 text-xs sm:text-sm font-heading font-bold focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
              />
            </div>

            {/* Đề bài cô giáo giao (Teacher's Assignment) */}
            <div className="flex flex-col gap-1.5 p-3 rounded-2xl bg-[#083E88]/80 border border-amber-300/40">
              <div className="flex items-center justify-between">
                <label className="font-heading font-black text-xs text-amber-300 flex items-center gap-1.5">
                  <FileQuestion className="w-4 h-4 text-amber-300" />
                  <span>Đề bài / Yêu cầu cô giáo giao:</span>
                </label>
              </div>

              <textarea
                rows={3}
                value={submission.teacherAssignment}
                onChange={(e) =>
                  updateFormField("teacherAssignment", e.target.value)
                }
                placeholder="Nhập nội dung đề bài cô giáo giao (Ví dụ: Mô tả căn nhà của em, hoặc Write a short paragraph about your best friend...)"
                className="w-full bg-[#042555] text-white placeholder:text-sky-300/50 p-2.5 rounded-xl border border-sky-300/35 text-xs sm:text-sm font-heading font-medium focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 resize-none leading-relaxed"
              />
            </div>

            {/* Cấu hình cơ chế xu của Cô giáo */}
            <TeacherConfigSection
              coinRewardMode={submission.coinRewardMode}
              onChangeCoinRewardMode={setCoinRewardMode}
              platformProofCoins={submission.platformProofCoins}
              onChangePlatformProofCoins={updatePlatformProofCoins}
              subjectiveCoins={submission.subjectiveCoins}
              onChangeSubjectiveCoins={updateSubjectiveCoins}
            />

            {/* Vùng tải & Nén ảnh bài tập */}
            <div className="flex flex-col gap-1">
              <label className="font-heading font-bold text-xs text-sky-100 flex items-center justify-between">
                <span>Ảnh chụp bài làm trong vở hoặc phiếu in:</span>
                <span className="text-[11px] text-amber-300">
                  *Tự động nén để AI đọc nhanh và rõ nét
                </span>
              </label>
              <ImageDropzone
                images={submission.images}
                totalStats={totalCompressionStats}
                isCompressing={isCompressing}
                onSelectFiles={handleSelectFiles}
                onRemoveImage={handleRemoveImage}
                onClearAll={handleClearAllImages}
              />
            </div>

            {/* Lời nhắn gửi riêng cho cô giáo */}
            <div className="flex flex-col gap-1">
              <label className="font-heading font-bold text-xs text-sky-100 flex items-center justify-between">
                <span>Lời nhắn gửi riêng cho Cô giáo (tùy chọn):</span>
                <span className="text-[10px] text-amber-300 font-normal">
                  *Dành riêng cho cô giáo khi duyệt bài, không gửi cho AI
                </span>
              </label>
              <textarea
                rows={2}
                value={submission.studentNote}
                onChange={(e) => updateFormField("studentNote", e.target.value)}
                placeholder="Nhập lời nhắn gửi riêng cho cô giáo (nếu có)..."
                className="w-full bg-[#052C63]/90 text-white placeholder:text-sky-300/50 px-3.5 py-2 rounded-xl border border-sky-300/40 text-xs sm:text-sm font-heading font-medium focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 resize-none"
              />
            </div>

            {/* Nút nộp bài 3D */}
            <div className="pt-2 flex flex-col items-center gap-2">
              <Button3D
                onClick={handleSubmitToAi}
                disabled={
                  isSubmitting ||
                  isCompressing ||
                  submission.images.length === 0
                }
                variant="green"
                size="lg"
                fullWidth
                className="gap-2 shadow-xl"
              >
                <Send className="w-5 h-5 stroke-[2.5]" />
                <span>
                  {isSubmitting
                    ? `AI đang đọc và chấm ${submission.images.length} trang bài...`
                    : isCompressing
                    ? "Đang nén ảnh bài làm..."
                    : submission.images.length > 0
                    ? `Nộp ${submission.images.length} trang bài cho AI chấm ngay`
                    : "Nộp bài Tiếng Anh cho AI chấm ngay"}
                </span>
              </Button3D>

              <p className="text-[11px] text-sky-200/70 font-heading text-center">
                Nhận kết quả phân tích Ngữ pháp, Từ vựng, Điểm số và Thưởng xu ngay lập tức
              </p>
            </div>
          </div>

          {/* CỘT PHẢI (5 Cột): CONFIG API KEY & QUY TRÌNH (LUÔN NẰM BÊN CẠNH PHIẾU NỘP BÀI) */}
          <div className="lg:col-span-5 flex flex-col gap-3.5">
            <AiConfigPanel
              config={aiConfig}
              onUpdateConfig={updateAiConfig}
            />

            {/* Hướng dẫn ngắn */}
            <div className="rounded-2xl bg-[#09418A]/80 backdrop-blur-md border border-sky-300/30 p-4 text-white text-xs font-heading">
              <h4 className="font-black text-amber-300 flex items-center gap-1.5 mb-2 text-sm">
                <HelpCircle className="w-4 h-4" />
                <span>Quy trình AI chấm bài Tiếng Anh:</span>
              </h4>
              <ol className="list-decimal list-inside space-y-1.5 text-sky-100">
                <li>
                  <strong>Đề bài cô giáo:</strong> Nhập nội dung yêu cầu đề bài ở cột bên trái.
                </li>
                <li>
                  <strong>Chụp bài làm:</strong> Tải ảnh bài viết của học sinh lên.
                </li>
                <li>
                  <strong>Nén ảnh tự động:</strong> Giảm 75-85% dung lượng ngay trên máy để gửi siêu nhanh.
                </li>
                <li>
                  <strong>AI đối chiếu & chấm điểm:</strong> AI đọc ảnh bài làm, so khớp với yêu cầu đề bài cô giao, chỉ ra câu đúng/sai, lỗi thì động từ và chính tả.
                </li>
              </ol>
            </div>
          </div>
        </div>

        {/* HÀNG DƯỚI: KHU VỰC KẾT QUẢ CHẤM ĐIỂM CỦA AI FULL-WIDTH 100% (CHIẾM TRỌN 2 CỘT) */}
        {gradingResult && (
          <div
            id="ai-grading-result-section"
            className="w-full animate-in fade-in slide-in-from-bottom-3 duration-300"
          >
            <AiGradingResultCard
              result={gradingResult}
              teacherAssignment={submission.teacherAssignment}
              onReset={handleResetSubmission}
            />
          </div>
        )}
      </main>
    </div>
  );
}
