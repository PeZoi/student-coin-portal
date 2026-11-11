"use client";

import { useState, useMemo, useCallback } from "react";
import { X, School, Search, Check, Users, Loader2 } from "lucide-react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal";
import { TeacherStaffItem, AvailableClassItem } from "./types";
import { normalizeText } from "../classes/utils";
import { useManageTeachersContext } from "../../contexts/ManageTeachersContext";

interface AssignClassesModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  teacherItem?: TeacherStaffItem | null;
  availableClasses?: AvailableClassItem[];
  onSubmit?: (
    teacherId: string,
    assignedClassIds: string[]
  ) => Promise<boolean | void> | boolean | void;
  isSubmitting?: boolean;
  isLoadingClasses?: boolean;
}

export function AssignClassesModal(props?: AssignClassesModalProps) {
  const context = useManageTeachersContext();
  const isOpen = props?.isOpen ?? context.isAssignModalOpen;
  const onClose = props?.onClose ?? context.handleCloseAssignModal;
  const teacherItem =
    props?.teacherItem !== undefined
      ? props.teacherItem
      : context.assigningTeacher;
  const availableClasses =
    props?.availableClasses ?? context.availableClasses;
  const onSubmit = props?.onSubmit ?? context.handleAssignClassesSubmit;
  const isSubmitting = props?.isSubmitting ?? context.isSubmitting;
  const isLoadingClasses =
    props?.isLoadingClasses ?? context.isLoadingClasses;

  if (!isOpen || !teacherItem) return null;

  return (
    <AssignClassesDialogContent
      key={teacherItem.id}
      teacherItem={teacherItem}
      availableClasses={availableClasses}
      onSubmit={onSubmit}
      onClose={onClose}
      isSubmitting={isSubmitting}
      isLoadingClasses={isLoadingClasses}
    />
  );
}

interface AssignClassesDialogContentProps {
  teacherItem: TeacherStaffItem;
  availableClasses: AvailableClassItem[];
  onSubmit: (
    teacherId: string,
    assignedClassIds: string[]
  ) => Promise<boolean | void> | boolean | void;
  onClose: () => void;
  isSubmitting: boolean;
  isLoadingClasses: boolean;
}

function AssignClassesDialogContent({
  teacherItem,
  availableClasses,
  onSubmit,
  onClose,
  isSubmitting,
  isLoadingClasses,
}: AssignClassesDialogContentProps) {
  // Khởi tạo trực tiếp từ props kết hợp thuộc tính key ở component cha (Quy tắc 8)
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>(() => {
    if (teacherItem.assigned_class_ids && teacherItem.assigned_class_ids.length > 0) {
      return teacherItem.assigned_class_ids;
    }
    return availableClasses
      .filter((c) => teacherItem.assigned_classes.includes(c.class_name))
      .map((c) => c.id);
  });

  const [searchQuery, setSearchQuery] = useState("");

  const handleClose = useCallback(() => {
    setSearchQuery("");
    onClose();
  }, [onClose]);

  const activeAvailableClasses = useMemo(
    () => availableClasses.filter((c) => c.is_active),
    [availableClasses]
  );

  const classMap = useMemo(() => {
    const map = new Map<string, AvailableClassItem>();
    for (const cls of activeAvailableClasses) {
      map.set(cls.id, cls);
    }
    return map;
  }, [activeAvailableClasses]);

  const filteredClasses = useMemo(() => {
    const q = normalizeText(searchQuery);
    if (!q) return activeAvailableClasses;
    return activeAvailableClasses.filter((cls) =>
      normalizeText(cls.class_name).includes(q)
    );
  }, [activeAvailableClasses, searchQuery]);

  const handleToggleClass = (classId: string) => {
    if (isSubmitting) return;
    setSelectedClassIds((prev) => {
      if (prev.includes(classId)) {
        return prev.filter((id) => id !== classId);
      }
      return [...prev, classId];
    });
  };

  const handleRemoveClass = (classId: string) => {
    if (isSubmitting) return;
    setSelectedClassIds((prev) => prev.filter((id) => id !== classId));
  };

  const handleSave = async () => {
    if (isSubmitting) return;
    const isSuccess = await onSubmit(teacherItem.id, selectedClassIds);
    if (isSuccess !== false) {
      setSearchQuery("");
    }
  };

  return (
    <Modal maxWidth="lg" onClose={handleClose} disabled={isSubmitting}>
      <ModalHeader
        icon={<School className="w-5 h-5" />}
        title="Phân công lớp phụ trách"
        description={
          <>
            Giáo viên:{" "}
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

      <ModalBody>
        {/* 1. Thanh tìm kiếm lớp học */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên lớp học..."
            disabled={isSubmitting}
            className="w-full h-10 pl-10 pr-9 rounded-xl bg-white border border-slate-300 text-sm text-[#0F172A] placeholder-slate-400 transition-all focus:outline-none focus:border-[#0A62D6] focus:ring-2 focus:ring-[#0A62D6]/20 disabled:bg-slate-50"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              disabled={isSubmitting}
              className="w-6 h-6 absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* 2. Chip lớp học đã chọn */}
        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-[#475569] mb-2">
            <span>Đã chọn ({selectedClassIds.length} lớp học)</span>
            {selectedClassIds.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedClassIds([])}
                disabled={isSubmitting}
                className="text-[#0A62D6] hover:underline cursor-pointer disabled:opacity-50"
              >
                Bỏ chọn tất cả
              </button>
            )}
          </div>

          {selectedClassIds.length > 0 ? (
            <div className="flex items-center gap-2 flex-wrap">
              {selectedClassIds.map((classId) => {
                const cls = classMap.get(classId);
                const className = cls ? cls.class_name : "Lớp học";

                return (
                  <span
                    key={classId}
                    className="inline-flex items-center gap-1.5 pl-2.5 pr-2 py-1 rounded-full bg-[#F0F6FE] border border-[#CFE1FB] text-xs font-semibold text-slate-800 shadow-2xs transition-all"
                  >
                    <School className="w-3.5 h-3.5 text-[#0A62D6] shrink-0" />
                    <span>{className}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveClass(classId)}
                      disabled={isSubmitting}
                      className="w-4 h-4 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer ml-0.5 disabled:opacity-50"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">
              Chưa chọn lớp học nào. Vui lòng tick chọn từ danh sách bên dưới.
            </p>
          )}
        </div>

        {/* 3. Danh sách lớp học có thể chọn */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
            Danh sách lớp học {!isLoadingClasses ? `(${filteredClasses.length})` : ""}
          </label>

          {isLoadingClasses ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <Loader2 className="w-6 h-6 text-[#0A62D6] animate-spin mb-2" />
              <p className="text-xs text-slate-500 font-medium">
                Đang tải danh sách lớp học...
              </p>
            </div>
          ) : filteredClasses.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              Không tìm thấy lớp học nào phù hợp với từ khóa.
            </div>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {filteredClasses.map((cls) => {
                const isSelected = selectedClassIds.includes(cls.id);

                return (
                  <div
                    key={cls.id}
                    onClick={() => handleToggleClass(cls.id)}
                    className={`group p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? "border-[#0A62D6]/35 bg-[#F4F8FE] shadow-2xs hover:bg-[#EEF5FD]"
                        : "border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/70"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${
                          isSelected
                            ? "bg-[#EAF2FF] text-[#0A62D6] border-[#CFE1FB]"
                            : "bg-[#F1F5F9] text-[#64748B] border-slate-200/60"
                        }`}
                      >
                        <School className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p
                          className={`text-sm font-semibold truncate transition-colors ${
                            isSelected ? "text-[#0A62D6]" : "text-[#0F172A]"
                          }`}
                        >
                          {cls.class_name}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Sĩ số hiện tại: {cls.student_count} học sinh
                        </p>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all ${
                        isSelected
                          ? "bg-[#0A62D6] text-white shadow-2xs scale-105"
                          : "border-2 border-slate-300 bg-white group-hover:border-slate-400"
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </ModalBody>

      <ModalFooter
        leftNode={
          <div className="hidden sm:flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>1 giáo viên có thể phụ trách nhiều lớp học</span>
          </div>
        }
        showCancel
        cancelLabel="Hủy"
        onCancel={handleClose}
        cancelDisabled={isSubmitting}
        showSubmit
        submitLabel="Lưu phân công"
        submittingLabel="Đang lưu..."
        onSubmit={handleSave}
        isSubmitting={isSubmitting}
      />
    </Modal>
  );
}
