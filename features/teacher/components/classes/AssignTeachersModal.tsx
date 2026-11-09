"use client";

import { useState, useEffect, useMemo } from "react";
import { X, UserPlus, Search, Check, Users } from "lucide-react";
import { MockClassItem } from "./types";
import { AVAILABLE_TEACHERS } from "./constants";
import { getTeacherColor, getTeacherInitial, normalizeText } from "./utils";

interface AssignTeachersModalProps {
  isOpen: boolean;
  onClose: () => void;
  classItem: MockClassItem | null;
  availableTeachers?: string[];
  onSubmit: (classId: string, assignedTeachers: string[]) => void;
}

export function AssignTeachersModal({
  isOpen,
  onClose,
  classItem,
  availableTeachers = AVAILABLE_TEACHERS,
  onSubmit,
}: AssignTeachersModalProps) {
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>(
    classItem?.teachers || []
  );
  const [searchQuery, setSearchQuery] = useState("");

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

  // Lọc danh sách giáo viên theo ô tìm kiếm (chuẩn hóa không dấu)
  const filteredTeachers = useMemo(() => {
    const q = normalizeText(searchQuery);
    if (!q) return availableTeachers;
    return availableTeachers.filter((t) => normalizeText(t).includes(q));
  }, [availableTeachers, searchQuery]);

  if (!isOpen || !classItem) return null;

  const handleToggleTeacher = (teacherName: string) => {
    setSelectedTeachers((prev) => {
      if (prev.includes(teacherName)) {
        return prev.filter((t) => t !== teacherName);
      }
      return [...prev, teacherName];
    });
  };

  const handleRemoveTeacher = (teacherName: string) => {
    setSelectedTeachers((prev) => prev.filter((t) => t !== teacherName));
  };

  const handleSave = () => {
    onSubmit(classItem.id, selectedTeachers);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
      >
        {/* Header Modal */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EAF2FF] text-[#0A62D6] flex items-center justify-center shrink-0">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-heading font-black text-[#0F172A] tracking-tight">
                Phân công giáo viên
              </h2>
              <p className="text-xs sm:text-[13px] text-[#475569] mt-0.5 line-clamp-1">
                Lớp: <span className="font-semibold text-slate-800">{classItem.class_name}</span>
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

        {/* Thân Modal */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          {/* 1. Thanh tìm kiếm giáo viên */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên giáo viên..."
              className="w-full h-10 pl-10 pr-9 rounded-xl bg-white border border-slate-300 text-sm text-[#0F172A] placeholder-slate-400 transition-all focus:outline-none focus:border-[#0A62D6] focus:ring-2 focus:ring-[#0A62D6]/20"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="w-6 h-6 absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* 2. Chip giáo viên đã chọn */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-[#475569] mb-2">
              <span>Đã chọn ({selectedTeachers.length} giáo viên)</span>
              {selectedTeachers.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedTeachers([])}
                  className="text-[#0A62D6] hover:underline cursor-pointer"
                >
                  Bỏ chọn tất cả
                </button>
              )}
            </div>

            {selectedTeachers.length > 0 ? (
              <div className="flex items-center gap-2 flex-wrap">
                {selectedTeachers.map((teacherName) => {
                  const color = getTeacherColor(teacherName);
                  const initial = getTeacherInitial(teacherName);

                  return (
                    <span
                      key={teacherName}
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
                        onClick={() => handleRemoveTeacher(teacherName)}
                        className="w-4 h-4 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer ml-0.5"
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
              Danh sách giáo viên ({filteredTeachers.length})
            </label>

            {filteredTeachers.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                Không tìm thấy giáo viên nào phù hợp với từ khóa.
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {filteredTeachers.map((teacherName) => {
                  const isSelected = selectedTeachers.includes(teacherName);
                  const color = getTeacherColor(teacherName);
                  const initial = getTeacherInitial(teacherName);
                  const isAssistant = teacherName.toLowerCase().includes("trợ giảng");

                  return (
                    <div
                      key={teacherName}
                      onClick={() => handleToggleTeacher(teacherName)}
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
                            isSelected ? "scale-105 shadow-2xs ring-2 ring-white" : ""
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
                            {teacherName}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {isAssistant ? "Trợ giảng lớp học" : "Giáo viên giảng dạy chính"}
                          </p>
                        </div>
                      </div>

                      {/* Checkbox tròn hiện đại */}
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
        </div>

        {/* Footer Modal */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 hidden sm:flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>1 lớp có thể có nhiều giáo viên phụ trách</span>
          </div>

          <div className="flex items-center gap-2.5 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-sm font-semibold transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="h-10 px-5 rounded-xl bg-[#0A62D6] hover:bg-[#0850B0] text-white text-sm font-semibold transition-all shadow-xs cursor-pointer active:scale-98"
            >
              Lưu phân công
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
