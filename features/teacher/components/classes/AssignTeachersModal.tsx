"use client";

import { useState, useMemo, useCallback } from "react";
import { X, UserPlus, Search, Check, Users, Loader2 } from "lucide-react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal";
import { MockClassItem, AvailableTeacherItem } from "./types";
import { getTeacherColor, getTeacherInitial, normalizeText } from "./utils";
import { useTeacherClassesContext } from "../../contexts/TeacherClassesContext";

interface AssignTeachersModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  classItem?: MockClassItem | null;
  availableTeachers?: AvailableTeacherItem[];
  onSubmit?: (
    classId: string,
    assignedTeacherIds: string[]
  ) => Promise<boolean | void> | boolean | void;
  isSubmitting?: boolean;
  isLoadingTeachers?: boolean;
}

export function AssignTeachersModal(props?: AssignTeachersModalProps) {
  const context = useTeacherClassesContext();
  const isOpen = props?.isOpen ?? context.isAssignModalOpen;
  const onClose = props?.onClose ?? context.handleCloseAssignModal;
  const classItem =
    props?.classItem !== undefined ? props.classItem : context.assigningClass;
  const availableTeachers =
    props?.availableTeachers ?? context.availableTeachers;
  const onSubmit = props?.onSubmit ?? context.handleAssignTeacherSubmit;
  const isSubmitting = props?.isSubmitting ?? context.isSubmitting;
  const isLoadingTeachers =
    props?.isLoadingTeachers ?? context.isLoadingTeachers;

  if (!isOpen || !classItem) return null;

  return (
    <AssignTeachersDialogContent
      key={classItem.id}
      classItem={classItem}
      availableTeachers={availableTeachers}
      onSubmit={onSubmit}
      onClose={onClose}
      isSubmitting={isSubmitting}
      isLoadingTeachers={isLoadingTeachers}
    />
  );
}

interface AssignTeachersDialogContentProps {
  classItem: MockClassItem;
  availableTeachers: AvailableTeacherItem[];
  onSubmit: (
    classId: string,
    assignedTeacherIds: string[]
  ) => Promise<boolean | void> | boolean | void;
  onClose: () => void;
  isSubmitting: boolean;
  isLoadingTeachers: boolean;
}

function AssignTeachersDialogContent({
  classItem,
  availableTeachers,
  onSubmit,
  onClose,
  isSubmitting,
  isLoadingTeachers,
}: AssignTeachersDialogContentProps) {
  // Khởi tạo trực tiếp từ props kết hợp thuộc tính key ở component cha (Quy tắc 8)
  const [selectedTeacherIds, setSelectedTeacherIds] = useState<string[]>(() => {
    if (!classItem) return [];
    if (classItem.teacher_ids && classItem.teacher_ids.length > 0) {
      return classItem.teacher_ids;
    }
    return availableTeachers
      .filter((t) => classItem.teachers.includes(t.full_name))
      .map((t) => t.id);
  });

  const [searchQuery, setSearchQuery] = useState("");

  const handleClose = useCallback(() => {
    setSearchQuery("");
    onClose();
  }, [onClose]);

  const teacherMap = useMemo(() => {
    const map = new Map<string, AvailableTeacherItem>();
    for (const t of availableTeachers) {
      map.set(t.id, t);
    }
    return map;
  }, [availableTeachers]);

  const filteredTeachers = useMemo(() => {
    const q = normalizeText(searchQuery);
    if (!q) return availableTeachers;
    return availableTeachers.filter((t) =>
      normalizeText(t.full_name).includes(q)
    );
  }, [availableTeachers, searchQuery]);

  const handleToggleTeacher = (teacherId: string) => {
    if (isSubmitting) return;
    setSelectedTeacherIds((prev) => {
      if (prev.includes(teacherId)) {
        return prev.filter((id) => id !== teacherId);
      }
      return [...prev, teacherId];
    });
  };

  const handleRemoveTeacher = (teacherId: string) => {
    if (isSubmitting) return;
    setSelectedTeacherIds((prev) => prev.filter((id) => id !== teacherId));
  };

  const handleSave = async () => {
    if (isSubmitting) return;
    const isSuccess = await onSubmit(classItem.id, selectedTeacherIds);
    if (isSuccess !== false) {
      setSearchQuery("");
    }
  };

  return (
    <Modal maxWidth="lg" onClose={handleClose} disabled={isSubmitting}>
      <ModalHeader
        icon={<UserPlus className="w-5 h-5" />}
        title="Phân công giáo viên"
        description={
          <>
            Lớp:{" "}
            <span className="font-semibold text-slate-800">
              {classItem.class_name}
            </span>
          </>
        }
        onClose={handleClose}
        disabled={isSubmitting}
      />

      <ModalBody>
        {/* 1. Thanh tìm kiếm giáo viên */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên giáo viên..."
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

        {/* 2. Chip giáo viên đã chọn */}
        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-[#475569] mb-2">
            <span>Đã chọn ({selectedTeacherIds.length} giáo viên)</span>
            {selectedTeacherIds.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedTeacherIds([])}
                disabled={isSubmitting}
                className="text-[#0A62D6] hover:underline cursor-pointer disabled:opacity-50"
              >
                Bỏ chọn tất cả
              </button>
            )}
          </div>

          {selectedTeacherIds.length > 0 ? (
            <div className="flex items-center gap-2 flex-wrap">
              {selectedTeacherIds.map((teacherId) => {
                const teacher = teacherMap.get(teacherId);
                const teacherName = teacher ? teacher.full_name : "Giáo viên";
                const color = getTeacherColor(teacherName);
                const initial = getTeacherInitial(teacherName);

                return (
                  <span
                    key={teacherId}
                    className="inline-flex items-center gap-1.5 pl-1.5 pr-2 py-1 rounded-full bg-[#F0F6FE] border border-[#CFE1FB] text-xs font-semibold text-slate-800 shadow-2xs transition-all"
                  >
                    <span
                      style={{ backgroundColor: color.bg, color: color.text }}
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                    >
                      {initial}
                    </span>
                    <span>{teacherName}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTeacher(teacherId)}
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
              Chưa chọn giáo viên nào. Vui lòng tick chọn từ danh sách bên dưới.
            </p>
          )}
        </div>

        {/* 3. Danh sách giáo viên có thể chọn */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
            Danh sách giáo viên{" "}
            {!isLoadingTeachers ? `(${filteredTeachers.length})` : ""}
          </label>

          {isLoadingTeachers ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <Loader2 className="w-6 h-6 text-[#0A62D6] animate-spin mb-2" />
              <p className="text-xs text-slate-500 font-medium">
                Đang tải danh sách giáo viên...
              </p>
            </div>
          ) : filteredTeachers.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              Không tìm thấy giáo viên nào phù hợp với từ khóa.
            </div>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {filteredTeachers.map((teacher) => {
                const isSelected = selectedTeacherIds.includes(teacher.id);
                const color = getTeacherColor(teacher.full_name);
                const initial = getTeacherInitial(teacher.full_name);
                const classCount = teacher.assigned_class_count || 0;

                return (
                  <div
                    key={teacher.id}
                    onClick={() => handleToggleTeacher(teacher.id)}
                    className={`group p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? "border-[#0A62D6]/35 bg-[#F4F8FE] shadow-2xs hover:bg-[#EEF5FD]"
                        : "border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/70"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        style={{ backgroundColor: color.bg, color: color.text }}
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-transform ${
                          isSelected
                            ? "scale-105 shadow-2xs ring-2 ring-white"
                            : ""
                        }`}
                      >
                        {initial}
                      </span>
                      <div className="min-w-0">
                        <p
                          className={`text-sm font-semibold truncate transition-colors ${
                            isSelected ? "text-[#0A62D6]" : "text-[#0F172A]"
                          }`}
                        >
                          {teacher.full_name}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {classCount > 0
                            ? `Đang dạy ${classCount} lớp`
                            : "Chưa phụ trách lớp nào"}
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

      <ModalFooter className="justify-between">
        <div className="text-xs text-slate-500 hidden sm:flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-slate-400" />
          <span>1 lớp có thể có nhiều giáo viên phụ trách</span>
        </div>

        <div className="flex items-center gap-2.5 ml-auto">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="h-10 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSubmitting}
            className="h-10 px-5 rounded-xl bg-[#0A62D6] hover:bg-[#0850B0] text-white text-sm font-semibold transition-all shadow-xs cursor-pointer active:scale-98 disabled:opacity-60 inline-flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Đang lưu...</span>
              </>
            ) : (
              <span>Lưu phân công</span>
            )}
          </button>
        </div>
      </ModalFooter>
    </Modal>
  );
}
