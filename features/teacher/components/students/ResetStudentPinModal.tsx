"use client";

import { useState, useCallback } from "react";
import { KeyRound, ShieldAlert, Sparkles } from "lucide-react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal";
import { StudentItem } from "./types";
import { useManageStudentsContext } from "../../contexts/ManageStudentsContext";

interface ResetStudentPinModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  studentItem?: StudentItem | null;
  onSubmit?: (
    studentId: string,
    newPin: string
  ) => Promise<boolean | void> | boolean | void;
  isSubmitting?: boolean;
}

export function ResetStudentPinModal(props?: ResetStudentPinModalProps) {
  const context = useManageStudentsContext();
  const isOpen = props?.isOpen ?? context.isResetPinOpen;
  const onClose = props?.onClose ?? context.handleCloseResetPin;
  const studentItem =
    props?.studentItem !== undefined
      ? props.studentItem
      : context.resettingPinStudent;
  const onSubmit = props?.onSubmit ?? context.handleResetPinSubmit;
  const isSubmitting = props?.isSubmitting ?? context.isSubmitting;

  if (!isOpen || !studentItem) return null;

  return (
    <ResetStudentPinDialogContent
      key={studentItem.id}
      studentItem={studentItem}
      onClose={onClose}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
    />
  );
}

interface ResetStudentPinDialogContentProps {
  studentItem: StudentItem;
  onClose: () => void;
  onSubmit: (
    studentId: string,
    newPin: string
  ) => Promise<boolean | void> | boolean | void;
  isSubmitting: boolean;
}

function ResetStudentPinDialogContent({
  studentItem,
  onClose,
  onSubmit,
  isSubmitting,
}: ResetStudentPinDialogContentProps) {
  const [newPin, setNewPin] = useState("0000");
  const [errorMessage, setErrorMessage] = useState("");

  const isLocked = Boolean(
    studentItem.locked_until &&
      new Date(studentItem.locked_until).getTime() > Date.now()
  );

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      onClose();
    }
  }, [isSubmitting, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedPin = newPin.trim();

    if (!trimmedPin || trimmedPin.length !== 4 || !/^\d{4}$/.test(trimmedPin)) {
      setErrorMessage("Mã PIN mới phải gồm đúng 4 chữ số (ví dụ: 0000 hoặc 1234).");
      return;
    }

    setErrorMessage("");
    await onSubmit(studentItem.id, trimmedPin);
  };

  const handleQuickPin = (pin: string) => {
    setNewPin(pin);
    if (errorMessage) setErrorMessage("");
  };

  return (
    <Modal maxWidth="md" onClose={handleClose} disabled={isSubmitting}>
      <ModalHeader
        icon={<KeyRound className="w-5 h-5 text-[#0A62D6]" />}
        title="Đặt lại mã PIN học sinh"
        description={
          <>
            Học sinh:{" "}
            <span className="font-bold text-[#0F172A]">
              {studentItem.full_name}
            </span>{" "}
            • SĐT Zalo:{" "}
            <span className="font-mono font-semibold text-[#0A62D6]">
              {studentItem.phone_zalo}
            </span>
          </>
        }
        onClose={handleClose}
        disabled={isSubmitting}
      />

      <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
        <ModalBody>
          {/* Thông báo nếu tài khoản đang bị khóa do nhập sai nhiều lần */}
          {isLocked && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Tài khoản này đang bị khóa tạm thời</span>
                <p className="mt-0.5 text-rose-600">
                  Do nhập sai mã PIN quá 5 lần. Thao tác đặt lại mã PIN sẽ tự động mở khóa tài khoản ngay lập tức cho học sinh!
                </p>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-600">
              {errorMessage}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">
              Nhập mã PIN mới (4 chữ số) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                maxLength={4}
                value={newPin}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setNewPin(val);
                  if (errorMessage) setErrorMessage("");
                }}
                placeholder="0000"
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-white border border-slate-300 text-base font-mono font-bold tracking-widest text-[#0F172A] placeholder-slate-400 transition-all focus:outline-none focus:border-[#0A62D6] focus:ring-2 focus:ring-[#0A62D6]/20"
              />
            </div>
          </div>

          {/* Gợi ý PIN nhanh */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Gợi ý mã PIN nhanh tiện lợi:</span>
            </label>
            <div className="flex items-center gap-2">
              {["0000", "1234", "9999", "1111"].map((quickPin) => (
                <button
                  key={quickPin}
                  type="button"
                  onClick={() => handleQuickPin(quickPin)}
                  className={`flex-1 h-9 rounded-xl font-mono text-xs font-bold border transition-colors cursor-pointer ${
                    newPin === quickPin
                      ? "bg-[#0A62D6] text-white border-[#0A62D6] shadow-2xs"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                  }`}
                >
                  {quickPin}
                </button>
              ))}
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
                <span>Đang xử lý...</span>
              </>
            ) : (
              <span>Cập nhật mã PIN</span>
            )}
          </button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

