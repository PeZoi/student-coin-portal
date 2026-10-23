"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { Star, Upload, FileText, X, Check, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { MissionItem } from "../types";
import { MissionWoodBanner } from "./MissionWoodBanner";
import { Button3D } from "@/components/ui/Button3D";

interface MissionDetailSideProps {
  mission: MissionItem;
  onBack?: () => void;
}

export function MissionDetailSide({ mission, onBack }: MissionDetailSideProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Xử lý chọn file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      toast.info(`Đã chọn tệp: ${e.target.files[0].name}`);
    }
  };

  // Hủy file hoặc quay lại nếu chưa chọn file
  const handleCancel = () => {
    if (selectedFile) {
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } else if (onBack) {
      onBack();
    }
  };

  // Nộp bài
  const handleSubmit = () => {
    if (!selectedFile) {
      toast.warning("Vui lòng tải lên ảnh chụp bài làm hoặc file Excel trước khi nộp nhé!");
      fileInputRef.current?.click();
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("Nộp bài tập thành công! Bạn nhận được lời khen và chờ nhận xu nhé! 🎉");
      setSelectedFile(null);
    }, 800);
  };

  return (
    <div className="w-full flex flex-col justify-between h-full select-none">
      {/* ======================================================== */}
      {/* CỤM ĐỈNH: BIỂN GỖ + THÔNG TIN NHIỆM VỤ & HUY HIỆU XU */}
      {/* ======================================================== */}
      <div className="flex flex-col gap-2 sm:gap-2.5 shrink-0 ">
        {/* Nút Quay lại dành cho màn hình Mobile (khi có prop onBack) */}
        

        {/* Tấm biển gỗ tiêu đề: CHI TIẾT NHIỆM VỤ 📝 */}
        <div className="relative -mt-0.5 mb-0.5 flex items-center justify-center min-h-[38px] flex-shrink-0">
          {onBack && (
            <div className="absolute left-0 z-20">
              <Button3D
                variant="yellow"
                size="sm"
                onClick={onBack}
                className="gap-1 py-1 px-2.5 text-xs font-heading"
              >
                <ArrowLeft className="w-3.5 h-3.5 stroke-[3]" />
                <span className="text-[11px] font-bold">Quay lại</span>
              </Button3D>
            </div>
          )}
          <MissionWoodBanner title="CHI TIẾT NHIỆM VỤ" />
        </div>

        {/* PHẦN 1: THÔNG TIN NHIỆM VỤ & HUY HIỆU THƯỞNG XU */}
        <div className="flex items-start justify-between gap-2 lg:gap-3">
          {/* Cột trái: Độ khó & Mô tả chi tiết */}
          <div className="flex-1 min-w-0 flex flex-col gap-1">
            {/* Độ khó & Sao đánh giá */}
            <div className="flex items-center gap-1 font-heading font-black text-slate-800 text-[11px] sm:text-xs lg:text-[13.5px] whitespace-nowrap">
              <span>Độ khó:</span>
              <span className="text-amber-600">{mission.difficultyLabel}</span>
              <div className="flex items-center text-amber-400 gap-0.5 ml-0.5">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Star
                    key={index}
                    className={`w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 ${
                      index < mission.difficultyStars ? "fill-amber-400 text-amber-500" : "text-slate-300"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Đoạn văn mô tả nhiệm vụ */}
            <p className="font-heading font-medium text-slate-700 text-[10px] sm:text-[11px] lg:text-[13px] leading-relaxed line-clamp-4 lg:line-clamp-5">
              {mission.description}
            </p>
          </div>

          {/* Cột phải: Khối hộp quà tặng xu vàng (+50 xu) */}
          <div className="flex-shrink-0 w-16 sm:w-20 lg:w-24 bg-gradient-to-b from-[#FFF5DC] to-[#FFE8B8] rounded-xl lg:rounded-2xl border border-amber-300/80 shadow-xs p-1 sm:p-1.5 lg:p-2.5 flex flex-col items-center justify-center text-center">
            {/* Số xu thưởng 3D */}
            <div className="font-heading font-black text-[11px] sm:text-xs lg:text-sm text-[#E65100] [text-shadow:_0_1px_0_#FFE082] leading-none mb-0.5">
              +{mission.rewardCoins} xu
            </div>

            {/* Đồng xu vàng 3D tỏa sáng */}
            <div className="relative w-7 h-7 sm:w-8 sm:h-8 lg:w-11 lg:h-11 flex items-center justify-center my-0.5">
              <div className="absolute inset-0 bg-yellow-300/35 rounded-full blur-xs animate-pulse pointer-events-none" />
              <Image
                src="/coin.png"
                alt="Coin"
                fill
                sizes="(max-width: 1024px) 36px, 48px"
                unoptimized
                className="object-contain drop-shadow-[0_2px_4px_rgba(180,70,0,0.3)]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* CỤM GIỮA: KHU VỰC NỘP MINH CHỨNG (UPLOAD) */}
      {/* ======================================================== */}
      <div className="flex-1 flex flex-col justify-end min-h-0 py-2 sm:py-5">
        <h4 className="font-heading font-black text-slate-800 text-[10.5px] sm:text-[11px] lg:text-[13px] mb-1">
          Nộp minh chứng
        </h4>

        {/* Input file ẩn */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*,.xlsx,.xls,.doc,.docx,.pdf"
          className="hidden"
        />

        {/* Khung Dropzone chọn ảnh / file bài làm */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="w-full bg-[#FFFDF7] hover:bg-[#FFF9EA] border-[1.5px] border-dashed border-amber-300/90 rounded-xl lg:rounded-2xl p-2 sm:p-3 lg:p-4 flex flex-col items-center justify-center gap-1 sm:gap-1.5 cursor-pointer transition-all duration-150 shadow-inner group"
        >
          {selectedFile ? (
            /* Khi đã chọn file */
            <div className="flex items-center gap-1.5 w-full justify-between bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg">
              <div className="flex items-center gap-1 min-w-0">
                <FileText className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-emerald-600 flex-shrink-0" />
                <span className="font-heading font-bold text-[11px] lg:text-xs text-emerald-800 truncate">
                  {selectedFile.name}
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCancel();
                }}
                className="w-4 h-4 rounded-full bg-slate-200/80 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition-colors flex-shrink-0"
              >
                <X className="w-2.5 h-2.5 stroke-[2.5]" />
              </button>
            </div>
          ) : (
            /* Chưa chọn file: Các biểu tượng Sticker 3D và dòng chữ */
            <>
              <div className="flex items-center justify-center -space-x-1">
                {/* Icon Ảnh / Camera */}
                <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 rounded-md lg:rounded-lg bg-gradient-to-tr from-sky-400 to-blue-500 border border-white flex items-center justify-center shadow-xs transform -rotate-6">
                  <Upload className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 text-white stroke-[2.5]" />
                </div>

                {/* Icon File Excel */}
                <svg viewBox="0 0 32 36" className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 transform rotate-6">
                  <rect x="2" y="2" width="28" height="32" rx="3" fill="#DCFCE7" stroke="#16A34A" strokeWidth="2" />
                  <rect x="6" y="8" width="8" height="8" rx="1" fill="#16A34A" />
                  <text x="10" y="14" fill="white" fontSize="6" fontWeight="bold" textAnchor="middle">X</text>
                  <line x1="16" y1="10" x2="26" y2="10" stroke="#16A34A" strokeWidth="1.5" />
                  <line x1="16" y1="14" x2="26" y2="14" stroke="#16A34A" strokeWidth="1.5" />
                  <line x1="8" y1="20" x2="26" y2="20" stroke="#86EFAC" strokeWidth="1.5" />
                </svg>
              </div>

              {/* Dòng chữ hướng dẫn */}
              <div className="font-heading font-bold text-[10px] sm:text-[10.5px] lg:text-[12px] text-slate-700 text-center">
                Chọn ảnh bài làm hoặc File Excel
              </div>
            </>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* CỤM ĐÁY: NÚT HÀNH ĐỘNG 3D (Nộp Bài Ngay! / Đã Hoàn Thành & Hủy) */}
      {/* ======================================================== */}
      <div className="flex items-center gap-2 flex-shrink-0 pt-1">
        {mission.isCompleted ? (
          <Button3D
            variant="green"
            size="sm"
            className="flex-1 pointer-events-none opacity-90 cursor-default uppercase tracking-wider gap-1.5 text-xs sm:text-[13px] lg:text-sm py-2"
          >
            <Check className="w-4 h-4 stroke-[3.5]" />
            <span>ĐÃ HOÀN THÀNH</span>
          </Button3D>
        ) : (
          <Button3D
            variant="green"
            size="sm"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 uppercase tracking-wider text-xs sm:text-[13px] lg:text-sm py-2"
          >
            {isSubmitting ? "Đang gửi..." : "Nộp Bài Ngay!"}
          </Button3D>
        )}

        {/* Nút nhỏ màu xám tròn 3D: Hủy */}
        <Button3D
          variant="slate"
          size="sm"
          onClick={handleCancel}
          className="w-16 sm:w-18 lg:w-20 text-xs sm:text-[13px] lg:text-sm py-2"
        >
          Hủy
        </Button3D>
      </div>
    </div>
  );
}
