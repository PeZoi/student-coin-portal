"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { submitMission } from "../actions/submitMission";
import { MissionItem } from "../types";

export interface UseMissionDetailModalProps {
  mission: MissionItem;
  isExiting: boolean;
  onRequestClose: () => void;
  onSubmittedSuccess?: (missionId: string) => void;
}

/**
 * Custom hook quản lý vòng đời hiển thị (render, enter, exit) của Bottom Sheet.
 * Sử dụng pattern chuẩn của React để điều chỉnh state khi props thay đổi trong render pass,
 * loại bỏ hoàn toàn các lỗi setState trong effect và ref access trong render.
 */
export function useMissionDetailSheetLifecycle(
  isOpen: boolean,
  mission: MissionItem | null,
  onClose: () => void
) {
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const [activeMission, setActiveMission] = useState<MissionItem | null>(mission);
  const [isExiting, setIsExiting] = useState(false);

  // Điều chỉnh state khi prop isOpen thay đổi trong render pass (React standard pattern)
  if (prevIsOpen !== isOpen) {
    setPrevIsOpen(isOpen);
    if (!isOpen) {
      setIsExiting(true);
    } else {
      setIsExiting(false);
    }
  }

  // Cập nhật nhiệm vụ hiển thị khi có mission mới
  if (isOpen && mission && activeMission?.id !== mission.id) {
    setActiveMission(mission);
    setIsExiting(false);
  }

  // Hẹn giờ kết thúc exit animation khi isOpen chuyển thành false từ bên ngoài (ví dụ popstate)
  useEffect(() => {
    if (!isExiting) return;

    const timer = setTimeout(() => {
      setIsExiting(false);
      setActiveMission(null);
    }, 260);

    return () => clearTimeout(timer);
  }, [isExiting]);

  // Đóng chủ động từ bên trong modal (bấm X, backdrop, hoặc vuốt xuống)
  const handleRequestClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      setIsExiting(false);
      setActiveMission(null);
      onClose();
    }, 260);
  }, [onClose]);

  const shouldRender = (isOpen && Boolean(activeMission)) || isExiting;

  return {
    activeMission,
    shouldRender,
    isExiting,
    handleRequestClose,
  };
}

/**
 * Custom hook quản lý toàn bộ tương tác người dùng bên trong Detail Sheet:
 * - Kéo vuốt xuống đóng (Drag to dismiss) trực tiếp trên GPU DOM layer qua requestAnimationFrame (60/120 FPS).
 * - Khóa cuộn trang (body scroll lock).
 * - Phím Escape để đóng.
 * - Quản lý tệp tải lên và gọi Server Action nộp bài.
 */
export function useMissionDetailModal({
  mission,
  isExiting,
  onRequestClose,
  onSubmittedSuccess,
}: UseMissionDetailModalProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Drag-to-dismiss refs (Tối ưu GPU - zero re-render khi đang vuốt ngón tay)
  const dragStartYRef = useRef<number | null>(null);
  const currentDeltaYRef = useRef(0);
  const isDraggingRef = useRef(false);
  const rafDragIdRef = useRef<number | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Khóa cuộn trang (body scroll lock) khi Bottom Sheet đang mở
  useEffect(() => {
    if (isExiting) return;

    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;

    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
    };
  }, [isExiting]);

  // Hỗ trợ phím Escape để đóng modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onRequestClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onRequestClose]);

  // ========================================================
  // XỬ LÝ KÉO VUỐT XUỐNG ĐỂ ĐÓNG (DRAG TO DISMISS - 60/120 FPS)
  // ========================================================
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (
      isSubmitting ||
      isExiting ||
      target.closest("button") ||
      target.closest("input") ||
      target.closest("[data-prevent-drag='true']")
    ) {
      return;
    }

    const isAtTop = (scrollContainerRef.current?.scrollTop || 0) <= 0;
    const isDragHandleArea = Boolean(target.closest("[data-drag-handle='true']"));

    if (isDragHandleArea || isAtTop) {
      dragStartYRef.current = e.clientY;
      currentDeltaYRef.current = 0;
      isDraggingRef.current = true;
      if (sheetRef.current) {
        sheetRef.current.style.animation = "none";
        sheetRef.current.style.transition = "none";
      }
      if (backdropRef.current) {
        backdropRef.current.style.animation = "none";
        backdropRef.current.style.transition = "none";
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || dragStartYRef.current === null) return;
    const deltaY = Math.max(0, e.clientY - dragStartYRef.current);
    currentDeltaYRef.current = deltaY;

    if (deltaY > 0) {
      if (rafDragIdRef.current) {
        cancelAnimationFrame(rafDragIdRef.current);
      }
      rafDragIdRef.current = requestAnimationFrame(() => {
        if (sheetRef.current) {
          sheetRef.current.style.transform = `translate3d(0, ${deltaY}px, 0)`;
        }
        if (backdropRef.current) {
          const opacity = Math.max(0.15, 1 - deltaY / 350);
          backdropRef.current.style.opacity = `${opacity}`;
        }
      });
    } else {
      if (sheetRef.current) {
        sheetRef.current.style.transform = "translate3d(0, 0, 0)";
      }
    }
  };

  const handlePointerUp = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    dragStartYRef.current = null;
    const deltaY = currentDeltaYRef.current;
    currentDeltaYRef.current = 0;

    if (rafDragIdRef.current) {
      cancelAnimationFrame(rafDragIdRef.current);
    }

    if (deltaY > 80) {
      // Vuốt quá 80px: trượt mượt mà từ vị trí hiện tại xuống đáy và đóng modal
      if (sheetRef.current) {
        sheetRef.current.style.transition = "transform 250ms cubic-bezier(0.32, 0, 0.67, 0)";
        sheetRef.current.style.transform = "translate3d(0, 100%, 0)";
      }
      if (backdropRef.current) {
        backdropRef.current.style.transition = "opacity 250ms ease-out";
        backdropRef.current.style.opacity = "0";
      }
      onRequestClose();
    } else {
      // Vuốt chưa đủ: nảy trở lại vị trí ban đầu êm ái
      if (sheetRef.current) {
        sheetRef.current.style.transition = "transform 260ms cubic-bezier(0.16, 1, 0.3, 1)";
        sheetRef.current.style.transform = "translate3d(0, 0, 0)";
      }
      if (backdropRef.current) {
        backdropRef.current.style.transition = "opacity 260ms ease-out";
        backdropRef.current.style.opacity = "1";
      }
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
        onRequestClose();
      } else {
        toast.error(res.message || "Có lỗi xảy ra khi nộp bài!");
      }
    } catch {
      toast.error("Không thể kết nối đến máy chủ. Vui lòng thử lại sau!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
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
  };
}
