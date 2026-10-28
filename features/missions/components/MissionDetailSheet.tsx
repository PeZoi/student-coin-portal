"use client";

import { Button3D } from "@/components/ui/Button3D";
import { formatShortDateTime } from "@/lib/date";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  Award,
  CheckCircle2,
  Clock,
  Sparkles,
  X,
} from "lucide-react";
import Image from "next/image";
import React, { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { checkIsMissionOverdue } from "../hooks/useMissionFilter";
import {
  useMissionDetailModal,
  useMissionDetailSheetLifecycle,
} from "../hooks/useMissionDetailModal";
import { MissionItem } from "../types";
import { formatDueLabel, URGENCY_STYLES } from "../utils/formatDueLabel";
import { EvidenceUploader } from "./EvidenceUploader";
import { MissionWoodBanner } from "./MissionWoodBanner";

export interface MissionDetailSheetProps {
  mission: MissionItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmittedSuccess?: (missionId: string) => void;
}

const noopSubscribe = () => () => {};
const getClientMounted = () => true;
const getServerMounted = () => false;

interface MissionDetailSheetModalProps {
  mission: MissionItem;
  isExiting: boolean;
  onRequestClose: () => void;
  onSubmittedSuccess?: (missionId: string) => void;
}

/**
 * Presentational Component: Render giao diện Bottom Sheet chi tiết nhiệm vụ và nộp bài.
 * Toàn bộ state và logic kéo vuốt / nộp bài được quản lý bởi hook useMissionDetailModal.
 */
function MissionDetailSheetModal({
  mission,
  isExiting,
  onRequestClose,
  onSubmittedSuccess,
}: MissionDetailSheetModalProps) {
  const {
    files,
    setFiles,
    isSubmitting,
    scrollContainerRef,
    sheetRef,
    backdropRef,
    fileInputRef,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleSubmit,
  } = useMissionDetailModal({
    mission,
    isExiting,
    onRequestClose,
    onSubmittedSuccess,
  });

  const isCompleted = mission.status === "completed" || Boolean(mission.isCompleted);
  const isOverdue = checkIsMissionOverdue(mission);
  const dueInfo = formatDueLabel(mission.dueAt, {
    isCompleted,
    status: mission.status,
  });
  const urgencyStyle = URGENCY_STYLES[dueInfo.urgency];
  const assignedText = formatShortDateTime(mission.assignedAt);

  const sheetContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="mission-sheet-title"
      className={cn(
        "fixed inset-0 z-50 flex flex-col justify-end items-center select-none",
        isExiting ? "pointer-events-none" : "pointer-events-auto"
      )}
    >
      {/* 1. BACKDROP ĐEN MỜ (Click để đóng) */}
      <div
        ref={backdropRef}
        onClick={onRequestClose}
        aria-hidden="true"
        className={cn(
          "absolute inset-0 bg-black/60 backdrop-blur-xs",
          isExiting ? "animate-backdrop-exit" : "animate-backdrop-enter"
        )}
      />

      {/* 2. KHUNG BOTTOM SHEET (Hardware Accelerated CSS transform translate3d) */}
      <div
        ref={sheetRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={cn(
          "relative w-full max-w-[480px] h-[85dvh] max-h-[85dvh] bg-[#FDF8EA] rounded-t-[28px]",
          "border-t-2 border-amber-900/20 shadow-[0_-12px_40px_rgba(0,0,0,0.35)]",
          "flex flex-col min-h-0 overflow-hidden z-10 touch-pan-y",
          "transform-gpu motion-reduce:transition-none",
          isExiting ? "animate-sheet-exit" : "animate-sheet-enter"
        )}
      >
        {/* THANH ĐỈNH (DRAG HANDLE + TIÊU ĐỀ BIỂN GỖ + NÚT ĐÓNG X) */}
        <div
          data-drag-handle="true"
          className="w-full shrink-0 pt-2.5 pb-2 px-4 flex flex-col items-center bg-[#FDF8EA] border-b border-amber-900/10 cursor-grab active:cursor-grabbing"
        >
          {/* Tay cầm kéo vuốt (Pill bar) */}
          <div className="w-12 h-1.5 rounded-full bg-amber-900/30 mb-2" />

          {/* Hàng Header: Nút đóng X (phải) và Biển gỗ (giữa) */}
          <div className="relative w-full flex items-center justify-center min-h-[36px]">
            <MissionWoodBanner title="CHI TIẾT NHIỆM VỤ" />

            {/* Nút X đóng to bản (Touch target >= 44x44px) */}
            <button
              type="button"
              onClick={onRequestClose}
              aria-label="Đóng chi tiết nhiệm vụ"
              className="absolute right-0 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full bg-amber-200/60 hover:bg-amber-300/80 active:scale-95 text-amber-950 transition-all shadow-xs cursor-pointer"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* THÂN BOTTOM SHEET (VÙNG CUỘN NỘI DUNG) */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto overscroll-contain px-4 py-3 flex flex-col gap-3 min-h-0 [scrollbar-width:thin] [scrollbar-color:rgba(180,83,9,0.3)_transparent]"
        >
          {/* 1. KHỐI TIÊU ĐỀ, HẠN NỘP & HUY HIỆU XU */}
          <div className="bg-[#FFFDF7] border border-amber-300/80 rounded-2xl p-3.5 shadow-xs flex flex-col gap-2.5">
            <div className="flex items-start justify-between gap-3">
              {/* Tiêu đề nhiệm vụ */}
              <h2
                id="mission-sheet-title"
                className="font-heading font-black text-amber-950 text-base sm:text-lg leading-snug [text-shadow:_0_1px_1px_rgba(255,255,255,0.9)] flex-1 min-w-0"
              >
                {mission.title}
              </h2>

              {/* Huy hiệu nhận xu vàng */}
              <div className="shrink-0 flex items-center gap-1 bg-gradient-to-r from-amber-100 to-amber-200/90 border border-amber-300 rounded-full px-2.5 py-1 shadow-xs">
                <div className="relative w-4 h-4 shrink-0">
                  <Image
                    src="/coin.png"
                    alt="Coin"
                    fill
                    sizes="16px"
                    unoptimized
                    className="object-contain"
                  />
                </div>
                <span className="font-heading font-black text-[#D97706] text-xs sm:text-sm leading-none">
                  +{mission.rewardCoins} xu
                </span>
              </div>
            </div>

            {/* Dòng thời gian giao bài & Hạn nộp thông minh */}
            <div className="flex flex-wrap items-center gap-2 pt-0.5 border-t border-amber-900/10 text-xs font-heading">
              <span className="text-amber-950/70 font-semibold">
                Giao: <strong className="text-amber-950 font-bold">{assignedText}</strong>
              </span>
              <span className="text-amber-900/30">•</span>
              <div
                className={cn(
                  "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border shadow-2xs font-bold text-xs",
                  urgencyStyle.bg,
                  urgencyStyle.text,
                  urgencyStyle.border
                )}
              >
                {dueInfo.urgency === "overdue" ? (
                  <AlertTriangle className="w-3.5 h-3.5 stroke-[2.5]" />
                ) : (
                  <Clock className="w-3.5 h-3.5 stroke-[2.5]" />
                )}
                <span>{dueInfo.text}</span>
              </div>
            </div>

            {/* Nội dung mô tả chi tiết bài tập */}
            <div className="pt-2 border-t border-amber-900/10">
              <h3 className="font-heading font-bold text-xs text-amber-900/80 uppercase tracking-wider mb-1">
                Yêu cầu của cô:
              </h3>
              <p className="font-heading font-medium text-[#451A03] text-sm leading-relaxed whitespace-pre-line">
                {mission.description}
              </p>
            </div>
          </div>

          {/* 2. KHỐI NỘP BÀI / TRẠNG THÁI HOÀN THÀNH */}
          {isCompleted ? (
            /* TRẠNG THÁI: ĐÃ HOÀN THÀNH */
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300/80 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2.5 shadow-xs">
              <div className="w-14 h-14 rounded-full bg-emerald-100 border-2 border-emerald-400 flex items-center justify-center text-emerald-600 shadow-xs animate-bounce motion-reduce:animate-none">
                <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
              </div>

              <div>
                <h4 className="font-heading font-black text-emerald-950 text-base flex items-center justify-center gap-1.5">
                  <span>Đã Hoàn Thành Xuất Sắc!</span>
                  <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
                </h4>
                <p className="font-heading font-semibold text-emerald-800 text-xs mt-1">
                  Em đã hoàn thành bài tập này và nhận được{" "}
                  <strong className="text-amber-600 font-black">+{mission.rewardCoins} xu</strong> vào ví!
                </p>
              </div>

              {mission.completedAt && (
                <div className="text-[11px] font-heading font-bold text-emerald-700/80 bg-emerald-100/60 px-3 py-1 rounded-full border border-emerald-200">
                  Hoàn thành: {formatShortDateTime(mission.completedAt)}
                </div>
              )}
            </div>
          ) : (
            /* TRẠNG THÁI: CHƯA NỘP -> KHU VỰC TẢI LÊN MINH CHỨNG */
            <div className="bg-[#FFFDF7] border border-amber-300/80 rounded-2xl p-3.5 shadow-xs flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-700" />
                  <h4 className="font-heading font-black text-amber-950 text-sm">
                    Bài làm & Minh chứng của em
                  </h4>
                </div>
                <span className="text-[11px] font-heading font-bold text-amber-800/70">
                  Tối đa 5 tệp (≤ 10MB)
                </span>
              </div>

              <p className="font-heading font-medium text-xs text-amber-900/75">
                Chụp ảnh bài làm trong vở hoặc chọn ảnh chụp màn hình gửi cho cô chấm nhé!
              </p>

              {/* Component Upload ảnh/tệp */}
              <div className="mt-1" data-prevent-drag="true">
                <EvidenceUploader
                  files={files}
                  onFilesChange={setFiles}
                  disabled={isSubmitting}
                  inputRef={fileInputRef}
                  maxFiles={5}
                  maxSizeMB={10}
                />
              </div>
            </div>
          )}
        </div>

        {/* THANH HÀNH ĐỘNG GHIM ĐÁY (STICKY ACTION BAR) */}
        <div className="shrink-0 w-full px-4 pt-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-[#FDF8EA]/98 backdrop-blur-xs border-t border-amber-900/15 flex items-center gap-2.5 shadow-[0_-4px_16px_rgba(78,41,12,0.08)]">
          {isCompleted ? (
            <Button3D
              variant="green"
              size="md"
              onClick={onRequestClose}
              className="w-full text-sm font-heading font-black tracking-wide py-2.5"
            >
              <CheckCircle2 className="w-4 h-4 stroke-[3]" />
              <span>ĐÓNG CHI TIẾT</span>
            </Button3D>
          ) : (
            <>
              {/* Nút hành động chính: Nộp Bài Ngay / Nộp bài bù */}
              <Button3D
                variant={isOverdue ? "yellow" : "green"}
                size="md"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 text-sm font-heading font-black tracking-wide py-2.5 uppercase"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />
                    <span>Đang nộp bài...</span>
                  </span>
                ) : files.length === 0 ? (
                  <span>Chọn ảnh bài làm</span>
                ) : isOverdue ? (
                  <span>Nộp bài bù ngay! ({files.length} tệp)</span>
                ) : (
                  <span>Nộp Bài Ngay! ({files.length} tệp)</span>
                )}
              </Button3D>

              {/* Nút phụ: Xóa hết nếu đã chọn ảnh, hoặc nút Đóng nếu chưa có ảnh */}
              {files.length > 0 ? (
                <Button3D
                  variant="slate"
                  size="md"
                  disabled={isSubmitting}
                  onClick={() => setFiles([])}
                  className="px-3.5 text-xs font-heading font-bold py-2.5 shrink-0"
                >
                  <span>Xóa hết</span>
                </Button3D>
              ) : (
                <Button3D
                  variant="slate"
                  size="md"
                  onClick={onRequestClose}
                  className="px-4 text-xs font-heading font-bold py-2.5 shrink-0"
                >
                  <span>Để sau</span>
                </Button3D>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(sheetContent, document.body);
}

/**
 * Bottom Sheet Chi Tiết Nhiệm Vụ & Nộp Bài trên Mobile.
 * Quản lý vòng đời mount/unmount kèm animation xuất hiện & biến mất mượt mà (60/120 FPS).
 */
export function MissionDetailSheet({
  mission,
  isOpen,
  onClose,
  onSubmittedSuccess,
}: MissionDetailSheetProps) {
  const isMounted = useSyncExternalStore(noopSubscribe, getClientMounted, getServerMounted);

  // Custom hook quản lý vòng đời mount/exit animation
  const { activeMission, shouldRender, isExiting, handleRequestClose } =
    useMissionDetailSheetLifecycle(isOpen, mission, onClose);

  if (!isMounted || !shouldRender || !activeMission) {
    return null;
  }

  return (
    <MissionDetailSheetModal
      key={activeMission.id}
      mission={activeMission}
      isExiting={isExiting}
      onRequestClose={handleRequestClose}
      onSubmittedSuccess={onSubmittedSuccess}
    />
  );
}
