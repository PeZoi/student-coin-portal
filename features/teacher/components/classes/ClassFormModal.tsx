"use client";

import { useState, useCallback } from "react";
import { School, Check } from "lucide-react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal";
import { MockClassItem } from "./types";
import { useTeacherClassesContext } from "../../contexts/TeacherClassesContext";

interface ClassFormModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  initialData?: MockClassItem | null;
  onSubmit?: (
    data: { class_name: string; is_active: boolean }
  ) => Promise<boolean | void> | boolean | void;
  isSubmitting?: boolean;
}

export function ClassFormModal(props?: ClassFormModalProps) {
  const context = useTeacherClassesContext();
  const isOpen = props?.isOpen ?? context.isClassFormOpen;
  const onClose = props?.onClose ?? context.handleCloseClassForm;
  const initialData =
    props?.initialData !== undefined ? props.initialData : context.editingClass;
  const onSubmit = props?.onSubmit ?? context.handleClassFormSubmit;
  const isSubmitting = props?.isSubmitting ?? context.isSubmitting;
  const formKey = context.formKey;

  if (!isOpen) return null;

  return (
    <ClassFormDialogContent
      key={initialData ? `edit-${initialData.id}` : `create-${formKey}`}
      initialData={initialData}
      onClose={onClose}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
    />
  );
}

interface ClassFormDialogContentProps {
  initialData?: MockClassItem | null;
  onClose: () => void;
  onSubmit: (
    data: { class_name: string; is_active: boolean }
  ) => Promise<boolean | void> | boolean | void;
  isSubmitting: boolean;
}

function ClassFormDialogContent({
  initialData,
  onClose,
  onSubmit,
  isSubmitting,
}: ClassFormDialogContentProps) {
  const isEdit = Boolean(initialData);
  const [className, setClassName] = useState(initialData?.class_name || "");
  const [isActive, setIsActive] = useState(
    initialData ? initialData.is_active : true
  );
  const [errorMessage, setErrorMessage] = useState("");

  const handleClose = useCallback(() => {
    setClassName(initialData?.class_name || "");
    setIsActive(initialData ? initialData.is_active : true);
    setErrorMessage("");
    onClose();
  }, [initialData, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = className.trim();
    if (!trimmed) {
      setErrorMessage("Vui lòng nhập tên lớp học hoặc ca học.");
      return;
    }

    setErrorMessage("");
    const isSuccess = await onSubmit({
      class_name: trimmed,
      is_active: isActive,
    });

    // Chỉ khi submit THÀNH CÔNG mới reset form!
    if (isSuccess !== false) {
      setClassName("");
      setIsActive(true);
      setErrorMessage("");
    }
  };

  return (
    <Modal maxWidth="lg" onClose={handleClose} disabled={isSubmitting}>
      <ModalHeader
        icon={<School className="w-5 h-5" />}
        title={isEdit ? "Chỉnh sửa lớp học" : "Tạo lớp học mới"}
        description={
          isEdit
            ? "Cập nhật tên lớp và trạng thái hoạt động"
            : "Thêm lớp học hoặc ca học mới vào hệ thống"
        }
        onClose={handleClose}
        disabled={isSubmitting}
      />

      <form onSubmit={handleSubmit}>
        <ModalBody className="space-y-5">
          {/* 1. Tên lớp học / Ca học */}
          <div>
            <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">
              Tên lớp học / Ca học <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={className}
              onChange={(e) => {
                setClassName(e.target.value);
                if (errorMessage) setErrorMessage("");
              }}
              placeholder="Ví dụ: Ca 17:30 - 19:00 (Thứ 2 - 4 - 6)"
              className={`w-full h-11 px-3.5 rounded-xl bg-white border text-sm text-[#0F172A] placeholder-slate-400 transition-all focus:outline-none focus:ring-2 ${
                errorMessage
                  ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/20"
                  : "border-slate-300 focus:border-[#0A62D6] focus:ring-[#0A62D6]/20"
              }`}
            />
            {errorMessage ? (
              <p className="text-xs text-rose-500 font-medium mt-1.5">
                {errorMessage}
              </p>
            ) : (
              <p className="text-xs text-slate-500 mt-1.5">
                Tên lớp học hoặc khung giờ ca học để học sinh và giáo viên dễ nhận biết.
              </p>
            )}
          </div>

          {/* 2. Trạng thái hoạt động */}
          <div>
            <label className="block text-sm font-semibold text-[#0F172A] mb-2">
              Trạng thái hoạt động
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Lựa chọn Đang hoạt động */}
              <div
                onClick={() => setIsActive(true)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                  isActive
                    ? "border-[#0A62D6]/40 bg-[#F4F8FE] shadow-2xs"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                    isActive
                      ? "bg-[#0A62D6] text-white shadow-2xs scale-105"
                      : "border-2 border-slate-300 bg-white"
                  }`}
                >
                  {isActive && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
                    <span
                      className={`text-sm font-semibold transition-colors ${
                        isActive ? "text-[#0A62D6]" : "text-[#0F172A]"
                      }`}
                    >
                      Đang hoạt động
                    </span>
                  </div>
                  <p className="text-xs text-[#475569] mt-0.5 leading-relaxed">
                    Lớp mở bình thường, học sinh và giáo viên có thể tham gia.
                  </p>
                </div>
              </div>

              {/* Lựa chọn Tạm ẩn */}
              <div
                onClick={() => setIsActive(false)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                  !isActive
                    ? "border-[#0A62D6]/40 bg-[#F4F8FE] shadow-2xs"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                    !isActive
                      ? "bg-[#0A62D6] text-white shadow-2xs scale-105"
                      : "border-2 border-slate-300 bg-white"
                  }`}
                >
                  {!isActive && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#94A3B8]" />
                    <span
                      className={`text-sm font-semibold transition-colors ${
                        !isActive ? "text-[#0A62D6]" : "text-[#0F172A]"
                      }`}
                    >
                      Tạm ẩn
                    </span>
                  </div>
                  <p className="text-xs text-[#475569] mt-0.5 leading-relaxed">
                    Tạm ẩn lớp học, không hiển thị cho học sinh.
                  </p>
                </div>
              </div>
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
              <span>{isEdit ? "Lưu thay đổi" : "Tạo lớp học"}</span>
            )}
          </button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
