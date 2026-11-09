"use client";

import { useState, useCallback } from "react";
import { UserCog, Eye, EyeOff } from "lucide-react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal";
import { TeacherStaffItem, TeacherFormValues } from "./types";
import { useManageTeachersContext } from "../../contexts/ManageTeachersContext";

interface TeacherFormModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  initialData?: TeacherStaffItem | null;
  onSubmit?: (
    data: TeacherFormValues
  ) => Promise<boolean | void> | boolean | void;
  isSubmitting?: boolean;
}

export function TeacherFormModal(props?: TeacherFormModalProps) {
  const context = useManageTeachersContext();
  const isOpen = props?.isOpen ?? context.isTeacherFormOpen;
  const onClose = props?.onClose ?? context.handleCloseTeacherForm;
  const initialData =
    props?.initialData !== undefined
      ? props.initialData
      : context.editingTeacher;
  const onSubmit = props?.onSubmit ?? context.handleTeacherFormSubmit;
  const isSubmitting = props?.isSubmitting ?? context.isSubmitting;
  const formKey = context.formKey;

  if (!isOpen) return null;

  return (
    <TeacherFormDialogContent
      key={initialData ? `edit-${initialData.id}` : `create-${formKey}`}
      initialData={initialData}
      onClose={onClose}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
    />
  );
}

interface TeacherFormDialogContentProps {
  initialData?: TeacherStaffItem | null;
  onClose: () => void;
  onSubmit: (
    data: TeacherFormValues
  ) => Promise<boolean | void> | boolean | void;
  isSubmitting: boolean;
}

function TeacherFormDialogContent({
  initialData,
  onClose,
  onSubmit,
  isSubmitting,
}: TeacherFormDialogContentProps) {
  const isEdit = Boolean(initialData);

  // Khởi tạo trực tiếp từ props kết hợp thuộc tính key (Quy tắc 8 - 0 dòng useEffect đồng bộ state)
  const [fullName, setFullName] = useState(initialData?.full_name || "");
  const [username, setUsername] = useState(initialData?.username || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phoneZalo, setPhoneZalo] = useState(initialData?.phone_zalo || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [errorMessage, setErrorMessage] = useState("");

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      onClose();
    }
  }, [isSubmitting, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = fullName.trim();
    const trimmedUsername = username.trim().toLowerCase();

    if (!trimmedName) {
      setErrorMessage("Vui lòng nhập họ và tên giáo viên.");
      return;
    }

    if (!trimmedUsername) {
      setErrorMessage("Vui lòng nhập tên đăng nhập (username).");
      return;
    }

    if (!isEdit && password.trim().length < 6) {
      setErrorMessage("Mật khẩu khởi tạo phải có ít nhất 6 ký tự.");
      return;
    }

    setErrorMessage("");
    const isSuccess = await onSubmit({
      full_name: trimmedName,
      username: trimmedUsername,
      password: password.trim() || undefined,
      phone_zalo: phoneZalo.trim(),
      email: email.trim(),
    });

    if (isSuccess !== false) {
      setFullName("");
      setUsername("");
      setPassword("");
      setPhoneZalo("");
      setEmail("");
      setErrorMessage("");
    }
  };

  return (
    <Modal maxWidth="lg" onClose={handleClose} disabled={isSubmitting}>
      <ModalHeader
        icon={<UserCog className="w-5 h-5" />}
        title={isEdit ? "Chỉnh sửa thông tin giáo viên" : "Thêm tài khoản giáo viên"}
        description={
          isEdit
            ? "Cập nhật họ tên, tài khoản đăng nhập và thông tin liên hệ"
            : "Tạo tài khoản mới cho giáo viên phụ trách lớp học"
        }
        onClose={handleClose}
        disabled={isSubmitting}
      />

      <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
        <ModalBody>
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-600">
              {errorMessage}
            </div>
          )}

          {/* 1. Họ và tên & Username */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">
                Họ và tên <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errorMessage) setErrorMessage("");
                }}
                placeholder="Ví dụ: Cô Trần Thị Lan"
                className="w-full h-11 px-3.5 rounded-xl bg-white border border-slate-300 text-sm text-[#0F172A] placeholder-slate-400 transition-all focus:outline-none focus:border-[#0A62D6] focus:ring-2 focus:ring-[#0A62D6]/20"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">
                Tên đăng nhập (Username) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (errorMessage) setErrorMessage("");
                }}
                placeholder="Ví dụ: teacher_lan"
                className="w-full h-11 px-3.5 rounded-xl bg-white border border-slate-300 text-sm font-mono text-[#0F172A] placeholder-slate-400 transition-all focus:outline-none focus:border-[#0A62D6] focus:ring-2 focus:ring-[#0A62D6]/20"
              />
            </div>
          </div>

          {/* 2. Mật khẩu khởi tạo (Chỉ hiển thị khi thêm mới) */}
          {!isEdit && (
            <div>
              <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">
                Mật khẩu khởi tạo <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage("");
                  }}
                  placeholder="Nhập mật khẩu tối thiểu 6 ký tự..."
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
              <p className="text-xs text-slate-500 mt-1.5">
                Giáo viên sẽ dùng username và mật khẩu này để đăng nhập vào cổng quản trị.
              </p>
            </div>
          )}

          {/* 3. Số điện thoại Zalo & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">
                Số điện thoại / Zalo
              </label>
              <input
                type="text"
                value={phoneZalo}
                onChange={(e) => setPhoneZalo(e.target.value)}
                placeholder="Ví dụ: 0912 345 678"
                className="w-full h-11 px-3.5 rounded-xl bg-white border border-slate-300 text-sm text-[#0F172A] placeholder-slate-400 transition-all focus:outline-none focus:border-[#0A62D6] focus:ring-2 focus:ring-[#0A62D6]/20"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">
                Địa chỉ Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ví dụ: lan.tran@studentcoin.edu.vn"
                className="w-full h-11 px-3.5 rounded-xl bg-white border border-slate-300 text-sm text-[#0F172A] placeholder-slate-400 transition-all focus:outline-none focus:border-[#0A62D6] focus:ring-2 focus:ring-[#0A62D6]/20"
              />
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="h-10 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-10 px-5 rounded-xl bg-[#0A62D6] hover:bg-[#0850B0] text-white text-sm font-semibold transition-all shadow-xs cursor-pointer active:scale-98 disabled:opacity-60 inline-flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Đang lưu...</span>
              </>
            ) : (
              <span>{isEdit ? "Lưu thay đổi" : "Tạo tài khoản"}</span>
            )}
          </button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
