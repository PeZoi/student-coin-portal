"use client";

import { useState, useCallback, useMemo } from "react";
import { ArrowRightLeft, School, Info } from "lucide-react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal";
import { TeacherSelect, TeacherSelectOption } from "@/components/ui/TeacherSelect";
import { StudentItem } from "./types";
import { useManageStudentsContext } from "../../contexts/ManageStudentsContext";

interface ChangeStudentClassModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  studentItem?: StudentItem | null;
  onSubmit?: (
    studentId: string,
    newClassId: string,
    newClassName: string
  ) => Promise<boolean | void> | boolean | void;
  isSubmitting?: boolean;
}

export function ChangeStudentClassModal(props?: ChangeStudentClassModalProps) {
  const context = useManageStudentsContext();
  const isOpen = props?.isOpen ?? context.isChangeClassOpen;
  const onClose = props?.onClose ?? context.handleCloseChangeClass;
  const studentItem =
    props?.studentItem !== undefined
      ? props.studentItem
      : context.changingClassStudent;
  const onSubmit = props?.onSubmit ?? context.handleChangeClassSubmit;
  const isSubmitting = props?.isSubmitting ?? context.isSubmitting;

  if (!isOpen || !studentItem) return null;

  return (
    <ChangeStudentClassDialogContent
      key={studentItem.id}
      studentItem={studentItem}
      onClose={onClose}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
    />
  );
}

interface ChangeStudentClassDialogContentProps {
  studentItem: StudentItem;
  onClose: () => void;
  onSubmit: (
    studentId: string,
    newClassId: string,
    newClassName: string
  ) => Promise<boolean | void> | boolean | void;
  isSubmitting: boolean;
}

function ChangeStudentClassDialogContent({
  studentItem,
  onClose,
  onSubmit,
  isSubmitting,
}: ChangeStudentClassDialogContentProps) {
  const { availableClasses } = useManageStudentsContext();
  const [selectedClassId, setSelectedClassId] = useState(
    studentItem.class_id || (availableClasses[0]?.id ?? "")
  );

  const classOptions: TeacherSelectOption[] = useMemo(
    () => [
      { label: "Chưa phân lớp", value: "" },
      ...availableClasses.map((c) => ({
        label: c.class_name,
        value: c.id,
        badge:
          c.student_count !== undefined ? `${c.student_count} em` : undefined,
      })),
    ],
    [availableClasses]
  );

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      onClose();
    }
  }, [isSubmitting, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const matchedClass = availableClasses.find((c) => c.id === selectedClassId);
    const targetClassName = matchedClass?.class_name || "Chưa phân lớp";

    await onSubmit(studentItem.id, selectedClassId, targetClassName);
  };

  return (
    <Modal maxWidth="md" onClose={handleClose} disabled={isSubmitting}>
      <ModalHeader
        icon={<ArrowRightLeft className="w-5 h-5 text-[#0A62D6]" />}
        title="Chuyển lớp học cho học sinh"
        description={
          <>
            Học sinh:{" "}
            <span className="font-bold text-[#0F172A]">
              {studentItem.full_name}
            </span>{" "}
            • Hiện tại:{" "}
            <span className="font-bold text-[#0A62D6]">
              {studentItem.class_name}
            </span>
          </>
        }
        onClose={handleClose}
        disabled={isSubmitting}
      />

      <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
        <ModalBody>
          <div className="space-y-4">
            {/* Callout thông tin chính sách bảo lưu */}
            <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100/90 text-blue-900 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-[#0A62D6] shrink-0 mt-0.5" />
              <div className="space-y-1 leading-relaxed text-xs">
                <p className="font-bold text-[#0F172A]">
                  Chính sách bảo lưu bài tập & số xu:
                </p>
                <ul className="list-disc pl-4 space-y-1 text-slate-600 text-[11.5px]">
                  <li>
                    Toàn bộ số xu Heo Đất và các bài tập <strong>đã nộp</strong> ở
                    lớp cũ được giữ nguyên 100%.
                  </li>
                  <li>
                    Học sinh sẽ nhận các bài tập <strong>đang mở</strong> của lớp mới để làm và nhận thưởng xu.
                  </li>
                  <li>
                    Các bài tập chưa làm ở lớp cũ sẽ tự động ẩn để tránh gây nợ bài tập.
                  </li>
                </ul>
              </div>
            </div>

            {/* Dropdown chọn lớp tiếp nhận */}
            <TeacherSelect
              label="Chọn lớp học tiếp nhận"
              required
              icon={<School className="w-4 h-4 text-slate-400" />}
              options={classOptions}
              value={selectedClassId}
              onChange={setSelectedClassId}
              placeholder="Chọn lớp học..."
              searchable={true}
              searchPlaceholder="Tìm kiếm tên lớp..."
              disabled={isSubmitting}
            />
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
                <span>Đang chuyển...</span>
              </>
            ) : (
              <span>Xác nhận chuyển lớp</span>
            )}
          </button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
