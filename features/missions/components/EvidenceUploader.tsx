"use client";

import { Camera, FileSpreadsheet, FileText, Upload, X } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface EvidenceUploaderProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  disabled?: boolean;
  maxFiles?: number;
  maxSizeMB?: number;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

const DEFAULT_MAX_FILES = 5;
const DEFAULT_MAX_SIZE_MB = 10;
const ACCEPTED_EXTENSIONS = "image/*,.xlsx,.xls,.doc,.docx,.pdf";

// Phát hiện thiết bị cảm ứng an toàn SSR bằng useSyncExternalStore
const noopSubscribe = () => () => {};
const getTouchSnapshot = () =>
  typeof window !== "undefined" &&
  ("ontouchstart" in window || navigator.maxTouchPoints > 0);
const getTouchServerSnapshot = () => false;

export function EvidenceUploader({
  files,
  onFilesChange,
  disabled = false,
  maxFiles = DEFAULT_MAX_FILES,
  maxSizeMB = DEFAULT_MAX_SIZE_MB,
  inputRef: externalInputRef,
}: EvidenceUploaderProps) {
  const internalInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const activeInputRef = externalInputRef || internalInputRef;

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const hasTouch = useSyncExternalStore(noopSubscribe, getTouchSnapshot, getTouchServerSnapshot);

  // Quản lý URL xem trước và thu hồi bộ nhớ (revokeObjectURL)
  const previews = useMemo(() => {
    return files.map((file) => {
      const isImage = file.type.startsWith("image/");
      const url = isImage ? URL.createObjectURL(file) : null;
      return { file, isImage, url };
    });
  }, [files]);

  useEffect(() => {
    return () => {
      // Dọn dẹp tất cả object URL khi unmount hoặc khi files thay đổi
      previews.forEach((p) => {
        if (p.url) {
          URL.revokeObjectURL(p.url);
        }
      });
    };
  }, [previews]);

  // Xử lý khi thêm tệp
  const handleAddFiles = (newFileList: FileList | null) => {
    if (!newFileList || newFileList.length === 0) return;
    setErrorMessage(null);

    const newFilesArray = Array.from(newFileList);
    const validFiles: File[] = [];
    let hasSizeError = false;

    for (const file of newFilesArray) {
      // Kiểm tra dung lượng (10MB)
      if (file.size > maxSizeMB * 1024 * 1024) {
        hasSizeError = true;
        toast.error(`Tệp "${file.name}" vượt quá dung lượng ${maxSizeMB}MB cho phép!`);
        continue;
      }
      validFiles.push(file);
    }

    if (hasSizeError) {
      setErrorMessage(`Một số tệp có dung lượng vượt quá ${maxSizeMB}MB và đã bị bỏ qua.`);
    }

    // Kiểm tra giới hạn số lượng tối đa 5 tệp
    const totalCount = files.length + validFiles.length;
    if (totalCount > maxFiles) {
      const allowedCount = Math.max(0, maxFiles - files.length);
      const trimmedFiles = validFiles.slice(0, allowedCount);
      toast.warning(`Chỉ được chọn tối đa ${maxFiles} tệp. Đã thêm ${allowedCount} tệp đầu tiên.`);
      onFilesChange([...files, ...trimmedFiles]);
    } else {
      if (validFiles.length > 0) {
        toast.success(`Đã thêm ${validFiles.length} tệp minh chứng.`);
      }
      onFilesChange([...files, ...validFiles]);
    }

    // Reset input value để có thể chọn lại cùng một tệp
    if (activeInputRef.current) activeInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  // Xóa một tệp
  const handleRemoveFile = (indexToRemove: number) => {
    const fileToRemove = files[indexToRemove];
    const updated = files.filter((_, idx) => idx !== indexToRemove);
    onFilesChange(updated);
    toast.info(`Đã bỏ tệp: ${fileToRemove.name}`);
  };

  return (
    <div className="w-full flex flex-col gap-2.5 select-none">
      {/* 2 Input ẩn: Một cho chọn file thường và một cho chụp ảnh camera */}
      <input
        ref={activeInputRef}
        type="file"
        multiple
        accept={ACCEPTED_EXTENSIONS}
        disabled={disabled || files.length >= maxFiles}
        onChange={(e) => handleAddFiles(e.target.files)}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        disabled={disabled || files.length >= maxFiles}
        onChange={(e) => handleAddFiles(e.target.files)}
        className="hidden"
      />

      {/* 1. KHU VỰC 2 NÚT HÀNH ĐỘNG RÕ RÀNG (CHỤP ẢNH & CHỌN TỆP) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {/* Nút 1: Chụp ảnh trực tiếp từ camera (chỉ hiện trên thiết bị cảm ứng) */}
        {hasTouch && (
          <button
            type="button"
            disabled={disabled || files.length >= maxFiles}
            onClick={() => cameraInputRef.current?.click()}
            className="min-h-[48px] h-12 flex items-center justify-center gap-2 px-3 rounded-xl bg-gradient-to-b from-[#38BDF8] to-[#0284C7] hover:brightness-105 active:scale-[0.985] text-white font-heading font-black text-xs sm:text-[13px] border border-sky-300 shadow-[0_3px_0_#0369A1] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Camera className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5] flex-shrink-0" />
            <span>Chụp ảnh bài làm</span>
          </button>
        )}

        {/* Nút 2: Chọn tệp từ thư viện/máy tính */}
        <button
          type="button"
          disabled={disabled || files.length >= maxFiles}
          onClick={() => activeInputRef.current?.click()}
          className={cn(
            "min-h-[48px] h-12 flex items-center justify-center gap-2 px-3 rounded-xl font-heading font-black text-xs sm:text-[13px] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
            hasTouch
              ? "bg-[#FFFDF7] hover:bg-[#FFF9EA] text-amber-950 border-[1.5px] border-dashed border-amber-400 shadow-xs active:scale-[0.985]"
              : "w-full col-span-2 bg-gradient-to-b from-[#FFFDF7] to-[#FFF5DC] hover:bg-[#FFF9EA] text-amber-950 border-[1.5px] border-dashed border-amber-400 shadow-xs active:scale-[0.985]"
          )}
        >
          <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-amber-700 stroke-[2.5] flex-shrink-0" />
          <span>{hasTouch ? "Chọn từ thư viện" : "Chọn ảnh hoặc tệp bài làm"}</span>
        </button>
      </div>

      {/* Dòng hướng dẫn ngắn gọn */}
      <div className="flex items-center justify-between text-[11px] font-heading font-medium text-amber-900/70 px-0.5">
        <span>Ảnh bài làm hoặc tệp Excel, Word, PDF</span>
        <span>
          Đã chọn: <strong className="font-black text-amber-950">{files.length}/{maxFiles}</strong>
        </span>
      </div>

      {/* Thông báo lỗi nếu có */}
      {errorMessage && (
        <div className="text-[11px] font-heading font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-2.5 py-1.5">
          {errorMessage}
        </div>
      )}

      {/* 2. LƯỚI THUMBNAIL XEM TRƯỚC (3 CỘT) */}
      {files.length > 0 && (
        <div className="grid grid-cols-3 gap-2 pt-1">
          {previews.map(({ file, isImage, url }, idx) => (
            <div
              key={`${file.name}-${file.size}-${idx}`}
              className="relative aspect-square rounded-xl bg-amber-50/80 border border-amber-300/80 overflow-hidden shadow-xs flex flex-col items-center justify-center p-1 group"
            >
              {isImage && url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={url}
                  alt={file.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-1 text-center">
                  {file.name.endsWith(".xlsx") || file.name.endsWith(".xls") ? (
                    <FileSpreadsheet className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-600 stroke-[1.8] mb-1" />
                  ) : (
                    <FileText className="w-7 h-7 sm:w-8 sm:h-8 text-sky-600 stroke-[1.8] mb-1" />
                  )}
                  <span className="font-heading font-bold text-[10px] text-amber-950 line-clamp-1 w-full px-1">
                    {file.name}
                  </span>
                </div>
              )}

              {/* Tên tệp dán mờ ở đáy thumbnail */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-1.5 py-1 pointer-events-none">
                <span className="block text-[9.5px] font-heading font-bold text-white truncate text-center">
                  {file.name}
                </span>
              </div>

              {/* Nút xóa thumbnail: vùng chạm 44x44 chuẩn a11y */}
              <button
                type="button"
                onClick={() => handleRemoveFile(idx)}
                aria-label={`Xóa tệp ${file.name}`}
                className="absolute top-0 right-0 w-11 h-11 flex items-start justify-end p-1.5 z-10 cursor-pointer focus:outline-none"
              >
                <div className="w-5 h-5 rounded-full bg-black/65 hover:bg-rose-600 text-white flex items-center justify-center transition-colors shadow-xs">
                  <X className="w-3 h-3 stroke-[3]" />
                </div>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
