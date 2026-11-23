"use client";

import Image from "next/image";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  RotateCw,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Clock,
  Move,
  Images,
} from "lucide-react";
import { formatDate } from "@/lib/date";
import { cn } from "@/lib/utils";
import { Tooltip } from "@/components/ui/tooltip";
import { TeacherGradingSubmissionItem } from "../types";
import { useManageSubmissionsContext } from "../contexts/ManageSubmissionsContext";
import { useImageViewer } from "../hooks/useImageViewer";

/**
 * Cột 2 (Giữa): Khu vực Soi ảnh Minh chứng Đa trang (1–5 tấm ảnh)
 * - Tách riêng Canvas nhận `key={activeSubmission.id}` theo Quy tắc 8 để tự động reset Zoom & Xoay khi đổi học sinh
 */
export function SubmissionImageViewer() {
  const { activeSubmission, activePhotoIndex, setActivePhotoIndex } =
    useManageSubmissionsContext();

  if (!activeSubmission) return null;

  return (
    <SubmissionImageViewerCanvas
      key={activeSubmission.id}
      submission={activeSubmission}
      activePhotoIndex={activePhotoIndex}
      setActivePhotoIndex={setActivePhotoIndex}
    />
  );
}

function SubmissionImageViewerCanvas({
  submission,
  activePhotoIndex,
  setActivePhotoIndex,
}: {
  submission: TeacherGradingSubmissionItem;
  activePhotoIndex: number;
  setActivePhotoIndex: (idx: number) => void;
}) {
  const photos = submission.proof_image_urls;
  const totalPhotos = photos.length;
  const currentPhotoUrl = photos[activePhotoIndex] || "/book/book.svg";

  const {
    zoom,
    rotation,
    isFullscreen,
    isDragging,
    panOffset,
    hasPrevPhoto,
    hasNextPhoto,
    handleSelectPhoto,
    handlePrevPhoto,
    handleNextPhoto,
    handleZoomIn,
    handleZoomOut,
    handleRotateLeft,
    handleRotateRight,
    handleResetView,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    toggleFullscreen,
  } = useImageViewer({
    totalPhotos,
    activePhotoIndex,
    setActivePhotoIndex,
  });

  return (
    <div
      className={cn(
        "bg-slate-900 rounded-2xl border border-slate-800 shadow-sm flex flex-col overflow-hidden select-none",
        isFullscreen
          ? "fixed inset-3 z-50 h-auto"
          : "h-[740px]"
      )}
    >
      {/* 1. Thanh công cụ Soi ảnh chuyên dụng (Top Bar) */}
      <div className="px-4 py-2.5 bg-slate-950/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
        {/* Thông tin bài đang soi */}
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0A62D6] text-white text-xs font-bold shrink-0">
            <Images className="w-3.5 h-3.5" />
            <span>
              Trang {activePhotoIndex + 1} / {totalPhotos}
            </span>
          </span>

          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-bold text-white truncate">
              {submission.student_name}
            </p>
            <p className="text-[11px] text-slate-400 flex items-center gap-1 truncate">
              <Clock className="w-3 h-3 shrink-0" />
              <span>Nộp lúc: {formatDate(submission.created_at, "HH:mm dd/MM/yyyy")}</span>
            </p>
          </div>
        </div>

        {/* Cụm nút điều khiển Zoom + Xoay 90° + Toàn màn hình */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <Tooltip content="Thu nhỏ ảnh" side="bottom">
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={zoom <= 50}
              className="w-8 h-8 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
          </Tooltip>

          <span className="px-2 text-xs font-bold text-slate-200 tabular-nums min-w-[48px] text-center">
            {zoom}%
          </span>

          <Tooltip content="Phóng to ảnh để soi chữ viết" side="bottom">
            <button
              type="button"
              onClick={handleZoomIn}
              disabled={zoom >= 250}
              className="w-8 h-8 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </Tooltip>

          <div className="w-px h-4 bg-slate-800 mx-0.5" />

          <Tooltip content="Xoay trái 90° (Khi ảnh chụp bị ngang)" side="bottom">
            <button
              type="button"
              onClick={handleRotateLeft}
              className="w-8 h-8 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </Tooltip>

          <Tooltip content="Xoay phải 90°" side="bottom">
            <button
              type="button"
              onClick={handleRotateRight}
              className="w-8 h-8 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </Tooltip>

          {(zoom !== 100 || rotation !== 0) && (
            <Tooltip content="Đặt lại góc nhìn mặc định (100%)" side="bottom">
              <button
                type="button"
                onClick={handleResetView}
                className="px-2 h-8 rounded-lg text-amber-400 hover:bg-slate-800 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </Tooltip>
          )}

          <div className="w-px h-4 bg-slate-800 mx-0.5" />

          <Tooltip
            content={isFullscreen ? "Thu nhỏ khung soi" : "Mở rộng toàn màn hình"}
            side="bottom"
          >
            <button
              type="button"
              onClick={toggleFullscreen}
              className="w-8 h-8 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
          </Tooltip>
        </div>
      </div>

      {/* 2. Vùng Canvas Soi ảnh chính (Hỗ trợ kéo rê Pan + Chuyển trang Trái/Phải) */}
      <div
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={cn(
          "relative flex-1 overflow-auto flex items-center justify-center p-4 sm:p-6 bg-[#0B1120]",
          zoom > 100
            ? isDragging
              ? "cursor-grabbing"
              : "cursor-grab"
            : "cursor-default"
        )}
      >
        {/* Chỉ dẫn kéo rê khi đang phóng to */}
        {zoom > 100 && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700 text-[11px] font-medium text-slate-300 flex items-center gap-1.5 pointer-events-none">
            <Move className="w-3 h-3 text-blue-400" />
            <span>Giữ chuột và kéo để di chuyển vùng đọc chữ</span>
          </div>
        )}

        {/* Nút lật trang trước (nếu có > 1 ảnh) */}
        {totalPhotos > 1 && (
          <button
            type="button"
            onClick={handlePrevPhoto}
            disabled={!hasPrevPhoto}
            title="Trang ảnh trước"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-slate-900/85 hover:bg-[#0A62D6] text-white border border-slate-700 flex items-center justify-center transition-all cursor-pointer shadow-lg disabled:opacity-25 disabled:pointer-events-none"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {/* Khung chứa ảnh minh chứng được biến đổi tỉ lệ & góc xoay */}
        <div
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${
              zoom / 100
            }) rotate(${rotation}deg)`,
            transformOrigin: "center center",
          }}
          className="transition-transform duration-150 ease-out max-w-full"
        >
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-700">
            <Image
              src={currentPhotoUrl}
              alt={`Bài làm của ${submission.student_name} - Trang ${
                activePhotoIndex + 1
              }`}
              width={680}
              height={880}
              unoptimized
              style={{ height: "auto" }}
              className="w-full max-w-[540px] object-contain pointer-events-none select-none"
            />
          </div>
        </div>

        {/* Nút lật trang tiếp theo (nếu có > 1 ảnh) */}
        {totalPhotos > 1 && (
          <button
            type="button"
            onClick={handleNextPhoto}
            disabled={!hasNextPhoto}
            title="Trang ảnh tiếp theo"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-slate-900/85 hover:bg-[#0A62D6] text-white border border-slate-700 flex items-center justify-center transition-all cursor-pointer shadow-lg disabled:opacity-25 disabled:pointer-events-none"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* 3. Thanh Filmstrip chọn nhanh 1 - 5 tấm ảnh ở đáy Viewer */}
      <div className="px-4 py-3 bg-slate-950/95 border-t border-slate-800 flex items-center justify-between gap-3 overflow-x-auto shrink-0">
        <div className="flex items-center gap-2">
          {photos.map((imgUrl, idx) => {
            const isCurrent = idx === activePhotoIndex;

            return (
              <button
                key={`${imgUrl}-${idx}`}
                type="button"
                onClick={() => handleSelectPhoto(idx)}
                className={cn(
                  "relative group flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shrink-0",
                  isCurrent
                    ? "bg-[#0A62D6] text-white border-blue-400 shadow-sm"
                    : "bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white"
                )}
              >
                <div className="w-6 h-7 rounded bg-white overflow-hidden shrink-0 border border-slate-700">
                  <Image
                    src={imgUrl}
                    alt={`Thumb ${idx + 1}`}
                    width={24}
                    height={28}
                    unoptimized
                    style={{ height: "auto" }}
                    className="w-full object-cover"
                  />
                </div>
                <span>Trang {idx + 1}</span>
              </button>
            );
          })}
        </div>

        <span className="text-[11px] text-slate-400 hidden sm:inline whitespace-nowrap">
          Tổng cộng: <strong className="text-slate-200">{totalPhotos}</strong> ảnh minh chứng
        </span>
      </div>
    </div>
  );
}
