"use client";

import { useState, useCallback, useMemo } from "react";
import { ArrowRightLeft, School, Info, AlertTriangle } from "lucide-react";
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
    newClassName: string,
    resetProgress?: boolean
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
    newClassName: string,
    resetProgress?: boolean
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
  const activeClasses = useMemo(
    () => availableClasses.filter((c) => c.is_active),
    [availableClasses]
  );
  const [selectedClassId, setSelectedClassId] = useState(
    studentItem.class_id || (activeClasses[0]?.id ?? "")
  );
  const [resetProgress, setResetProgress] = useState(false);

  const classOptions: TeacherSelectOption[] = useMemo(
    () => [
      { label: "Chưa phân lớp", value: "" },
      ...activeClasses.map((c) => ({
        label: c.class_name,
        value: c.id,
        badge:
          c.student_count !== undefined ? `${c.student_count} em` : undefined,
      })),
    ],
    [activeClasses]
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

    await onSubmit(
      studentItem.id,
      selectedClassId,
      targetClassName,
      resetProgress
    );
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
            {/* Callout thông tin chính sách: Đổi nội dung linh hoạt theo tuỳ chọn Reset */}
            {resetProgress ? (
              <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/90 text-amber-900 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1 leading-relaxed text-xs">
                  <p className="font-bold text-amber-950">
                    Lưu ý khi đặt lại dữ liệu:
                  </p>
                  <ul className="list-disc pl-4 space-y-1 text-amber-800 text-[11.5px]">
                    <li>
                      Số dư xu và lượt quay sẽ được <strong>đặt lại về 0</strong>.
                    </li>
                    <li>
                      Toàn bộ lịch sử bài tập đã làm và chưa nộp sẽ được <strong>xóa sạch</strong>.
                    </li>
                    <li>
                      Học sinh tham gia lớp mới như một tài khoản mới.
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
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
            )}

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

            {/* Checkbox tùy chọn Reset dữ liệu */}
            <label
              className={`p-3 rounded-xl border transition-all cursor-pointer select-none flex items-start gap-3 ${
                resetProgress
                  ? "bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/20"
                  : "bg-slate-50 border-slate-200 hover:bg-slate-100/70"
              } ${isSubmitting ? "opacity-50 pointer-events-none" : ""}`}
            >
              <input
                type="checkbox"
                checked={resetProgress}
                onChange={(e) => setResetProgress(e.target.checked)}
                disabled={isSubmitting}
                className="mt-0.5 w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer shrink-0"
              />
              <div className="flex-1 text-xs">
                <span className="font-bold text-[#0F172A] block">
                  Đặt lại toàn bộ tiến trình học sinh
                </span>
                <p className="text-slate-500 mt-0.5 text-[11.5px]">
                  Xóa lịch sử bài tập cũ, đưa số dư xu và lượt quay về 0.
                </p>
              </div>
            </label>
          </div>
        </ModalBody>

        <ModalFooter
          showCancel
          cancelLabel="Hủy"
          onCancel={handleClose}
          cancelDisabled={isSubmitting}
          showSubmit
          submitType="submit"
          submitLabel={
            resetProgress ? "Xác nhận chuyển & Đặt lại" : "Xác nhận chuyển lớp"
          }
          submittingLabel="Đang chuyển..."
          isSubmitting={isSubmitting}
          submitVariant={resetProgress ? "warning" : "primary"}
        />
      </form>
    </Modal>
  );
}
