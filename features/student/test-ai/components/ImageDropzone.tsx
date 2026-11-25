"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import {
  UploadCloud,
  Trash2,
  Plus,
  Zap,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { SubmissionImageItem } from "../types";
import { formatFileSize } from "../utils/compressImage";

interface ImageDropzoneProps {
  images: SubmissionImageItem[];
  totalStats: {
    count: number;
    totalOriginalSize: number;
    totalCompressedSize: number;
    overallRatio: number;
  } | null;
  isCompressing: boolean;
  onSelectFiles: (files: FileList | File[]) => void;
  onRemoveImage: (id: string) => void;
  onClearAll: () => void;
}

export function ImageDropzone({
  images,
  totalStats,
  isCompressing,
  onSelectFiles,
  onRemoveImage,
  onClearAll,
}: ImageDropzoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onSelectFiles(e.dataTransfer.files);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onSelectFiles(e.target.files);
      // Reset input value để cho phép chọn lại cùng file nếu muốn
      e.target.value = "";
    }
  };

  return (
    <div className="w-full flex flex-col gap-2.5">
      {/* Input File ẩn hỗ trợ MULTIPLE (chọn 1 hoặc nhiều ảnh) */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Trường hợp 1: Chưa chọn ảnh nào -> Hiển thị khung kéo thả chính */}
      {images.length === 0 ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative cursor-pointer w-full rounded-2xl border-2 border-dashed p-6 sm:p-8 flex flex-col items-center justify-center text-center transition-all duration-200 select-none ${
            isDragging
              ? "border-amber-400 bg-amber-400/10 scale-[1.01]"
              : "border-sky-300/40 hover:border-amber-300/80 bg-[#08428C]/60 hover:bg-[#08428C]/80"
          }`}
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-sky-500/20 to-amber-400/20 border border-sky-300/40 flex items-center justify-center mb-3 shadow-inner">
            <UploadCloud className="w-7 h-7 sm:w-8 sm:h-8 text-amber-300 stroke-[2.2]" />
          </div>
          <h4 className="font-heading font-black text-white text-sm sm:text-base mb-1">
            Chụp hoặc tải ảnh bài tập lên
          </h4>
          <p className="text-sky-200/80 text-xs sm:text-sm font-heading max-w-sm mb-2">
            Có thể chọn <strong>1 hoặc nhiều ảnh</strong> cùng lúc (Trang 1, Trang 2, Trang 3...)
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-300/30 text-[11px] sm:text-xs text-sky-200 font-heading font-bold">
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>Tự động nén song song tất cả các ảnh trước khi gửi</span>
          </div>
        </div>
      ) : (
        /* Trường hợp 2: Đã có từ 1 ảnh trở lên -> Hiển thị danh sách ảnh dạng Grid */
        <div className="w-full rounded-2xl border-2 border-sky-300/40 bg-[#06336E]/85 p-3 sm:p-4 flex flex-col gap-3">
          {/* Thanh tiêu đề & Nút thêm ảnh / Xóa tất cả */}
          <div className="flex items-center justify-between gap-2 border-b border-sky-300/20 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="font-heading font-black text-white text-xs sm:text-sm">
                Danh sách bài làm ({images.length} trang)
              </span>
              {isCompressing && (
                <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-300/30 flex items-center gap-1 animate-pulse">
                  <Zap className="w-3 h-3 text-amber-300" />
                  <span>Đang nén...</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer px-2.5 py-1 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 border border-amber-300/40 text-amber-200 text-xs font-heading font-black flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm trang khác</span>
              </button>
              <button
                type="button"
                onClick={onClearAll}
                className="cursor-pointer px-2 py-1 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/40 text-rose-300 text-xs font-heading font-bold flex items-center gap-1 transition-colors"
                title="Xóa tất cả ảnh"
              >
                <Trash2 className="w-3 h-3" />
                <span className="hidden sm:inline">Xóa hết</span>
              </button>
            </div>
          </div>

          {/* Banner thống kê nén tổng quát */}
          {totalStats && (
            <div className="w-full rounded-xl bg-gradient-to-r from-emerald-950/70 via-teal-900/60 to-emerald-950/70 border border-emerald-400/40 p-2 sm:p-2.5 flex items-center justify-between gap-2 text-xs font-heading select-none">
              <div className="flex items-center gap-1.5 text-emerald-300 font-black">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Tổng {totalStats.count} ảnh:</span>
                <span className="line-through text-slate-400 font-bold ml-1">
                  {formatFileSize(totalStats.totalOriginalSize)}
                </span>
                <ArrowRight className="w-3 h-3 text-emerald-400" />
                <span className="text-white bg-emerald-500/30 px-1.5 py-0.2 rounded border border-emerald-400/50">
                  {formatFileSize(totalStats.totalCompressedSize)}
                </span>
              </div>
              <span className="bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black px-2 py-0.5 rounded-full text-[11px] shadow-xs flex-shrink-0">
                Tiết kiệm {totalStats.overallRatio}%
              </span>
            </div>
          )}

          {/* Danh sách ảnh dạng Grid Thumbnail */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
            {images.map((img, index) => (
              <div
                key={img.id}
                className="relative group rounded-xl border border-sky-300/30 bg-[#042452]/90 overflow-hidden flex flex-col p-1.5 gap-1.5 shadow-sm hover:border-amber-400/60 transition-colors"
              >
                {/* Header ảnh: Thứ tự trang & Nút xóa */}
                <div className="flex items-center justify-between text-[11px] font-heading font-bold px-1">
                  <span className="text-amber-300 font-black">
                    Trang {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemoveImage(img.id)}
                    className="cursor-pointer p-1 text-slate-400 hover:text-rose-300 transition-colors"
                    title="Xóa trang này"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>

                {/* Khung Thumbnail ảnh */}
                <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-black/40 flex items-center justify-center">
                  <Image
                    src={img.previewUrl}
                    alt={`Trang ${index + 1}`}
                    width={400}
                    height={300}
                    unoptimized
                    style={{ height: "auto" }}
                    className="w-full h-full object-cover rounded-md"
                  />
                </div>

                {/* Thông số nén của riêng ảnh này */}
                <div className="flex items-center justify-between text-[10px] font-heading text-sky-200/80 px-1">
                  <span>{formatFileSize(img.stats.compressedSize)}</span>
                  <span className="text-emerald-300 font-black">
                    -{img.stats.compressionRatio}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
