"use client";

import { useState, useEffect } from "react";
import { X, School, Check } from "lucide-react";
import { MockClassItem } from "./types";

interface ClassFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: MockClassItem | null;
  onSubmit: (data: { class_name: string; is_active: boolean }) => void;
}

export function ClassFormModal({
  isOpen,
  onClose,
  initialData,
  onSubmit,
}: ClassFormModalProps) {
  const isEdit = Boolean(initialData);
  const [className, setClassName] = useState(initialData?.class_name || "");
  const [isActive, setIsActive] = useState(initialData ? initialData.is_active : true);
  const [errorMessage, setErrorMessage] = useState("");

  // Đóng modal khi bấm Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = className.trim();
    if (!trimmed) {
      setErrorMessage("Vui lòng nhập tên lớp học hoặc ca học.");
      return;
    }

    onSubmit({
      class_name: trimmed,
      is_active: isActive,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header Modal */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EAF2FF] text-[#0A62D6] flex items-center justify-center shrink-0">
              <School className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-heading font-black text-[#0F172A] tracking-tight">
                {isEdit ? "Chỉnh sửa lớp học" : "Tạo lớp học mới"}
              </h2>
              <p className="text-xs sm:text-[13px] text-[#475569] mt-0.5">
                {isEdit
                  ? "Cập nhật tên lớp và trạng thái hoạt động"
                  : "Thêm lớp học hoặc ca học mới vào hệ thống"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-5 sm:p-6 space-y-5">
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
                <p className="text-xs text-rose-500 font-medium mt-1.5">{errorMessage}</p>
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
          </div>

          {/* Footer Modal */}
          <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-sm font-semibold transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="h-10 px-5 rounded-xl bg-[#0A62D6] hover:bg-[#0850B0] text-white text-sm font-semibold transition-all shadow-xs cursor-pointer active:scale-98"
            >
              {isEdit ? "Lưu thay đổi" : "Tạo lớp học"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
