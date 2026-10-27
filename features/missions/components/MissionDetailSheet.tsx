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
import React, {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { submitMission } from "../actions/submitMission";
import { checkIsMissionOverdue } from "../hooks/useMissionFilter";
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

/**
 * Component con quản lý toàn bộ state tương tác khi Sheet hiển thị.
 * Nhờ có key={mission.id}, toàn bộ state (files, dragY, v.v.) tự động reset sạch sẽ
 * khi đổi nhiệm vụ mà không cần gọi setState trong useEffect.
 */
function MissionDetailSheetModal({
  mission,
  onClose,
  onSubmittedSuccess,
}: {
  mission: MissionItem;
  onClose: () => void;
  onSubmittedSuccess?: (missionId: string) => void;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Drag-to-dismiss states
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartYRef = useRef<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Khóa cuộn trang (body scroll lock) khi Bottom Sheet đang mở
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;

    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
    };
  }, []);

  // Hỗ trợ phím Escape để đóng modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // ========================================================
  // XỬ LÝ KÉO VUỐT XUỐNG ĐỂ ĐÓNG (DRAG TO DISMISS)
  // ========================================================
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const isAtTop = (scrollContainerRef.current?.scrollTop || 0) <= 0;
    const target = e.target as HTMLElement;
    const isDragHandleArea = Boolean(target.closest("[data-drag-handle='true']"));

    if (isDragHandleArea || isAtTop) {
      dragStartYRef.current = e.clientY;
      setIsDragging(true);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || dragStartYRef.current === null) return;
    const deltaY = e.clientY - dragStartYRef.current;

    if (deltaY > 0) {
      setDragY(deltaY);
    } else {
      setDragY(0);
    }
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    dragStartYRef.current = null;

    if (dragY > 90) {
      onClose();
    } else {
      setDragY(0);
    }
  };

  // ========================================================
  // XỬ LÝ NỘP BÀI TẬP
  // ========================================================
  const handleSubmit = async () => {
    if (files.length === 0) {
      toast.warning("Vui lòng tải lên ít nhất một ảnh chụp bài làm hoặc tệp trước khi nộp nhé!");
      fileInputRef.current?.click();
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitMission(mission.id, files);
      if (res.success) {
        toast.success(res.message || "Nộp bài thành công! 🎉");
        setFiles([]);
        if (onSubmittedSuccess) {
          onSubmittedSuccess(mission.id);
        }
        onClose();
      } else {
        toast.error(res.message || "Có lỗi xảy ra khi nộp bài!");
      }
    } catch {
      toast.error("Không thể kết nối đến máy chủ. Vui lòng thử lại sau!");
    } finally {
      setIsSubmitting(false);
    }
  };

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
      className="fixed inset-0 z-50 flex flex-col justify-end items-center select-none"
    >
      {/* 1. BACKDROP ĐEN MỜ (Click để đóng) */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
      />

      {/* 2. KHUNG BOTTOM SHEET (Vuốt xuống đóng) */}
      <div
        ref={sheetRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          transform: `translate3d(0, ${dragY}px, 0)`,
          transition: isDragging ? "none" : "transform 250ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        className={cn(
          "relative w-full max-w-[480px] h-[85dvh] max-h-[85dvh] bg-[#FDF8EA] rounded-t-[28px]",
          "border-t-2 border-amber-900/20 shadow-[0_-12px_40px_rgba(0,0,0,0.35)]",
          "flex flex-col min-h-0 overflow-hidden z-10 touch-pan-y"
        )}
      >
        {/* ======================================================== */}
        {/* THANH ĐỈNH (DRAG HANDLE + TIÊU ĐỀ BIỂN GỖ + NÚT ĐÓNG X) */}
        {/* ======================================================== */}
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
              onClick={onClose}
              aria-label="Đóng chi tiết nhiệm vụ"
              className="absolute right-0 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full bg-amber-200/60 hover:bg-amber-300/80 active:scale-95 text-amber-950 transition-all shadow-xs cursor-pointer"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* THÂN BOTTOM SHEET (VÙNG CUỘN NỘI DUNG) */}
        {/* ======================================================== */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto overscroll-contain px-4 py-3 flex flex-col gap-3 min-h-0"
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
                Yêu cầu của thầy cô:
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
                Chụp ảnh bài làm trong vở hoặc chọn ảnh chụp màn hình gửi cho thầy cô chấm nhé!
              </p>

              {/* Component Upload ảnh/tệp */}
              <div className="mt-1">
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

        {/* ======================================================== */}
        {/* THANH HÀNH ĐỘNG GHIM ĐÁY (STICKY ACTION BAR) */}
        {/* ======================================================== */}
        <div className="shrink-0 w-full px-4 pt-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-[#FDF8EA]/98 backdrop-blur-xs border-t border-amber-900/15 flex items-center gap-2.5 shadow-[0_-4px_16px_rgba(78,41,12,0.08)]">
          {isCompleted ? (
            <Button3D
              variant="green"
              size="md"
              onClick={onClose}
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
                  onClick={onClose}
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

export function MissionDetailSheet({
  mission,
  isOpen,
  onClose,
  onSubmittedSuccess,
}: MissionDetailSheetProps) {
  const isMounted = useSyncExternalStore(noopSubscribe, getClientMounted, getServerMounted);

  if (!isMounted || !isOpen || !mission) {
    return null;
  }

  return (
    <MissionDetailSheetModal
      key={mission.id}
      mission={mission}
      onClose={onClose}
      onSubmittedSuccess={onSubmittedSuccess}
    />
  );
}
