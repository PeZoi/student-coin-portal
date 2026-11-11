"use client";

import { useState, useCallback } from "react";
import { KeyRound, Eye, EyeOff } from "lucide-react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal";
import { TeacherStaffItem } from "./types";
import { useManageTeachersContext } from "../../contexts/ManageTeachersContext";

interface ResetPasswordModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  teacherItem?: TeacherStaffItem | null;
  onSubmit?: (
    teacherId: string,
    newPassword: string
  ) => Promise<boolean | void> | boolean | void;
  isSubmitting?: boolean;
}

export function ResetPasswordModal(props?: ResetPasswordModalProps) {
  const context = useManageTeachersContext();
  const isOpen = props?.isOpen ?? context.isResetPasswordOpen;
  const onClose = props?.onClose ?? context.handleCloseResetPassword;
  const teacherItem =
    props?.teacherItem !== undefined
      ? props.teacherItem
      : context.resettingTeacher;
  const onSubmit = props?.onSubmit ?? context.handleResetPasswordSubmit;
  const isSubmitting = props?.isSubmitting ?? context.isSubmitting;

  if (!isOpen || !teacherItem) return null;

  return (
    <ResetPasswordDialogContent
      key={teacherItem.id}
      teacherItem={teacherItem}
      onClose={onClose}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
    />
  );
}

interface ResetPasswordDialogContentProps {
  teacherItem: TeacherStaffItem;
  onClose: () => void;
  onSubmit: (
    teacherId: string,
    newPassword: string
  ) => Promise<boolean | void> | boolean | void;
  isSubmitting: boolean;
}

function ResetPasswordDialogContent({
  teacherItem,
  onClose,
  onSubmit,
  isSubmitting,
}: ResetPasswordDialogContentProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      onClose();
    }
  }, [isSubmitting, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newPassword.trim();
    if (trimmed.length < 6) {
      setErrorMessage("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }

    if (trimmed !== confirmPassword.trim()) {
      setErrorMessage("Mật khẩu xác nhận không khớp.");
      return;
    }

    setErrorMessage("");
    const isSuccess = await onSubmit(teacherItem.id, trimmed);
    if (isSuccess !== false) {
      setNewPassword("");
      setConfirmPassword("");
      setErrorMessage("");
    }
  };

  return (
    <Modal maxWidth="md" onClose={handleClose} disabled={isSubmitting}>
      <ModalHeader
        icon={<KeyRound className="w-5 h-5" />}
        title="Đặt lại mật khẩu"
        description={
          <>
            Tài khoản:{" "}
            <span className="font-semibold text-slate-800">
              {teacherItem.full_name}
            </span>{" "}
            <span className="font-mono text-slate-500">
              (@{teacherItem.username})
            </span>
          </>
        }
        onClose={handleClose}
        disabled={isSubmitting}
      />

      <form onSubmit={handleSubmit}>
        <ModalBody>
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-600">
              {errorMessage}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">
              Mật khẩu mới <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (errorMessage) setErrorMessage("");
                }}
                placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                className="w-full h-11 pl-3.5 pr-10 rounded-xl bg-white border border-slate-300 text-sm text-[#0F172A] placeholder-slate-400 transition-all focus:outline-none focus:border-[#0A62D6] focus:ring-2 focus:ring-[#0A62D6]/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="w-8 h-8 absolute right-2 top-1/2 -translate-y-1/2 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">
              Xác nhận mật khẩu mới <span className="text-rose-500">*</span>
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errorMessage) setErrorMessage("");
              }}
              placeholder="Nhập lại mật khẩu mới"
              className="w-full h-11 px-3.5 rounded-xl bg-white border border-slate-300 text-sm text-[#0F172A] placeholder-slate-400 transition-all focus:outline-none focus:border-[#0A62D6] focus:ring-2 focus:ring-[#0A62D6]/20"
            />
          </div>
        </ModalBody>

        <ModalFooter
          showCancel
          cancelLabel="Hủy"
          onCancel={handleClose}
          cancelDisabled={isSubmitting}
          showSubmit
          submitType="submit"
          submitLabel="Cập nhật mật khẩu"
          submittingLabel="Đang cập nhật..."
          isSubmitting={isSubmitting}
        />
      </form>
    </Modal>
  );
}
