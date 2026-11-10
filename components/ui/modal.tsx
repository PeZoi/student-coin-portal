"use client";

import * as React from "react";
import { useEffect } from "react";
import { X, Trash2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export type ModalMaxWidth = "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";

const MAX_WIDTH_CLASSES: Record<ModalMaxWidth, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
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
          title="Đóng hộp thoại"
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

export interface ModalLoadingProps {
  text?: string;
  className?: string;
}

/**
 * Trạng thái quay xoay loading chuẩn cho các Modal khi tải dữ liệu
 * - Hiệu ứng vòng xoay xanh dương thanh lịch kèm thông báo text
 */
export function ModalLoading({
  text = "Đang tải dữ liệu...",
  className,
}: ModalLoadingProps) {
  return (
    <div
      className={cn(
        "py-12 sm:py-16 flex flex-col items-center justify-center text-center",
        className
      )}
    >
      <span className="w-8 h-8 border-[3px] border-[#0A62D6]/20 border-t-[#0A62D6] rounded-full animate-spin mb-3 shrink-0" />
      <p className="text-xs sm:text-[13px] text-slate-500 font-medium">
        {text}
      </p>
    </div>
  );
}

export interface ModalFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  /** Nội dung / text hiển thị góc bên trái của footer (số lượng, ghi chú...) */
  leftNode?: React.ReactNode;
  /** Hiển thị nút Hủy / Đóng (mặc định: true) */
  showCancel?: boolean;
  /** Tiêu đề nút Hủy / Đóng (mặc định: "Đóng" khi chỉ có 1 nút, "Hủy" khi có nút xác nhận) */
  cancelLabel?: string;
  /** Hàm callback khi nhấn nút Hủy / Đóng */
  onCancel?: () => void;
  /** Vô hiệu hóa nút Cancel */
  cancelDisabled?: boolean;

  /** Hiển thị nút Xác nhận / Submit (mặc định: true nếu có onSubmit, hoặc chỉ định rõ) */
  showSubmit?: boolean;
  /** Tiêu đề nút Xác nhận / Submit (mặc định: "Xác nhận") */
  submitLabel?: string;
  /** Tiêu đề nút khi đang submit (mặc định: "Đang lưu...") */
  submittingLabel?: string;
  /** Hàm callback khi nhấn nút Xác nhận */
  onSubmit?: () => void;
  /** Trạng thái đang gửi yêu cầu (hiển thị hiệu ứng xoay spinner) */
  isSubmitting?: boolean;
  /** Vô hiệu hóa nút Submit */
  submitDisabled?: boolean;
  /** Phong cách nút submit: "primary" (xanh #0A62D6) hoặc "danger" (đỏ rose-600) */
  submitVariant?: "primary" | "danger";
  /** Loại nút submit trong HTML ("button" hoặc "submit" cho form) */
  submitType?: "button" | "submit";
}

/**
 * Phần chân chứa các nút hành động của Modal
 * - Đồng bộ 100% phong cách nút bấm (kích thước, bo góc, màu sắc, khoảng cách)
 * - Mặc định gồm 2 nút: Đóng/Hủy và Xác nhận (Submit)
 * - Cả 2 nút có thể linh hoạt ẩn/hiện và tùy biến văn bản (text)
 */
export function ModalFooter({
  className,
  children,
  leftNode,
  showCancel = true,
  cancelLabel,
  onCancel,
  cancelDisabled = false,
  showSubmit,
  submitLabel = "Xác nhận",
  submittingLabel = "Đang lưu...",
  onSubmit,
  isSubmitting = false,
  submitDisabled = false,
  submitVariant = "primary",
  submitType = "button",
  ...props
}: ModalFooterProps) {
  // Nếu có truyền children tùy biến, ưu tiên render children
  if (children) {
    return (
      <div
        className={cn(
          "p-4 sm:p-5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between gap-3 shrink-0",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }

  // Tự động suy luận hiển thị nút Submit nếu có onSubmit hoặc submitType="submit"
  const hasSubmit = showSubmit !== undefined ? showSubmit : Boolean(onSubmit || submitType === "submit");
  const resolvedCancelLabel = cancelLabel ?? (hasSubmit ? "Hủy" : "Đóng");

  return (
    <div
      className={cn(
        "p-4 sm:p-5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between gap-3 shrink-0",
        className
      )}
      {...props}
    >
      {/* Góc trái: Ghi chú / Thông tin phụ nếu có */}
      {leftNode ? (
        <div className="text-xs text-slate-500 font-medium">{leftNode}</div>
      ) : (
        <div />
      )}

      {/* Góc phải: Cụm nút bấm chuẩn hóa */}
      <div className="flex items-center gap-2.5 ml-auto">
        {showCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={cancelDisabled || isSubmitting}
            className="h-10 px-5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50"
          >
            {resolvedCancelLabel}
          </button>
        )}

        {hasSubmit && (
          <button
            type={submitType}
            onClick={submitType === "button" ? onSubmit : undefined}
            disabled={submitDisabled || isSubmitting}
            className={cn(
              "h-10 px-5 rounded-xl text-white text-sm font-semibold transition-all shadow-xs cursor-pointer active:scale-98 disabled:opacity-60 inline-flex items-center justify-center gap-2",
              submitVariant === "danger"
                ? "bg-rose-600 hover:bg-rose-700"
                : "bg-[#0A62D6] hover:bg-[#0850B0]"
            )}
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{submittingLabel}</span>
              </>
            ) : (
              <span>{submitLabel}</span>
            )}
          </button>
        )}
      </div>
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

      <ModalFooter
        showCancel
        cancelLabel="Hủy bỏ"
        onCancel={onClose}
        cancelDisabled={isSubmitting}
        showSubmit
        submitLabel={confirmLabel}
        submittingLabel="Đang xóa..."
        onSubmit={() => onConfirm()}
        isSubmitting={isSubmitting}
        submitVariant="danger"
      />
    </Modal>
  );
}

