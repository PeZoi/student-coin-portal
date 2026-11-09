"use client";

import * as React from "react";
import { useEffect } from "react";
import { X, Trash2, Loader2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export type ModalMaxWidth = "sm" | "md" | "lg" | "xl" | "2xl";

const MAX_WIDTH_CLASSES: Record<ModalMaxWidth, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
};

export interface ModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  maxWidth?: ModalMaxWidth;
  closeOnBackdrop?: boolean;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

/**
 * Khung Modal dùng chung toàn hệ thống
 * - Tự động lắng nghe phím Escape để đóng hộp thoại
 * - Đồng bộ hiệu ứng chuyển động và bo góc chuẩn thiết kế
 */
export function Modal({
  isOpen = true,
  onClose,
  maxWidth = "lg",
  closeOnBackdrop = false,
  disabled = false,
  className,
  children,
}: ModalProps) {
  useEffect(() => {
    if (!isOpen || !onClose) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !disabled) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, disabled]);

  if (!isOpen) return null;

  const handleBackdropClick = () => {
    if (closeOnBackdrop && !disabled && onClose) {
      onClose();
    }
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "w-full bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]",
          MAX_WIDTH_CLASSES[maxWidth],
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}

export interface ModalHeaderProps {
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  onClose?: () => void;
  disabled?: boolean;
  variant?: "default" | "danger";
  className?: string;
}

/**
 * Phần đầu của Modal (Icon + Tiêu đề + Mô tả phụ + Nút đóng X)
 */
export function ModalHeader({
  icon,
  title,
  description,
  onClose,
  disabled = false,
  variant = "default",
  className,
}: ModalHeaderProps) {
  return (
    <div
      className={cn(
        "p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between gap-4 shrink-0",
        className
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        {icon && (
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
              variant === "danger"
                ? "bg-rose-50 text-rose-600"
                : "bg-[#EAF2FF] text-[#0A62D6]"
            )}
          >
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <h2 className="text-lg sm:text-xl font-heading font-black text-[#0F172A] tracking-tight">
            {title}
          </h2>
          {description && (
            <div className="text-xs sm:text-[13px] text-[#475569] mt-0.5 line-clamp-1">
              {description}
            </div>
          )}
        </div>
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          disabled={disabled}
          aria-label="Đóng hộp thoại"
          className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer shrink-0 disabled:opacity-50"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export interface ModalBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/**
 * Phần thân chứa nội dung của Modal (hỗ trợ cuộn dọc tự động khi nội dung dài)
 */
export function ModalBody({ className, children, ...props }: ModalBodyProps) {
  return (
    <div
      className={cn("p-5 sm:p-6 space-y-4 overflow-y-auto", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export interface ModalFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/**
 * Phần chân chứa các nút hành động của Modal
 */
export function ModalFooter({ className, children, ...props }: ModalFooterProps) {
  return (
    <div
      className={cn(
        "p-4 sm:p-5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-end gap-3 shrink-0",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<boolean | void> | boolean | void;
  isSubmitting?: boolean;
  title?: string;
  description?: string;
  warningText?: string;
  confirmLabel?: string;
  children: React.ReactNode;
}

/**
 * Hộp thoại xác nhận xóa dùng chung cho toàn bộ các trang Quản lý (Lớp học, Giáo viên, Học sinh, Nhiệm vụ...)
 */
export function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting = false,
  title = "Xác nhận xóa",
  description = "Thao tác này không thể hoàn tác",
  warningText,
  confirmLabel = "Xác nhận xóa",
  children,
}: ConfirmDeleteModalProps) {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      closeOnBackdrop
      disabled={isSubmitting}
    >
      <ModalHeader
        variant="danger"
        icon={<Trash2 className="w-5 h-5" />}
        title={title}
        description={description}
        onClose={onClose}
        disabled={isSubmitting}
      />

      <ModalBody>
        <div className="text-sm text-slate-600 leading-relaxed">{children}</div>

        {warningText && (
          <div className="rounded-xl bg-rose-50/70 border border-rose-200/70 p-3.5 flex items-start gap-2.5 text-xs text-rose-800 leading-relaxed">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{warningText}</span>
          </div>
        )}
      </ModalBody>

      <ModalFooter>
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="h-10 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50"
        >
          Hủy bỏ
        </button>
        <button
          type="button"
          onClick={() => onConfirm()}
          disabled={isSubmitting}
          className="h-10 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold transition-colors cursor-pointer shadow-xs disabled:opacity-50 inline-flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Đang xóa...</span>
            </>
          ) : (
            <>
              <Trash2 className="w-4 h-4" />
              <span>{confirmLabel}</span>
            </>
          )}
        </button>
      </ModalFooter>
    </Modal>
  );
}

