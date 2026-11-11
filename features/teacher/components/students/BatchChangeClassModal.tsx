"use client";

import { useState, useCallback, useMemo } from "react";
import { ArrowRightLeft, School, Users, Info, AlertTriangle } from "lucide-react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal";
import { TeacherSelect, TeacherSelectOption } from "@/components/ui/TeacherSelect";
import { useManageStudentsContext } from "../../contexts/ManageStudentsContext";

interface BatchChangeClassModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  selectedIds?: string[];
  onSubmit?: (
    newClassId: string,
    newClassName: string,
    resetProgress?: boolean
  ) => Promise<boolean | void> | boolean | void;
  isSubmitting?: boolean;
}

export function BatchChangeClassModal(props?: BatchChangeClassModalProps) {
  const context = useManageStudentsContext();
  const isOpen = props?.isOpen ?? context.isBatchChangeClassOpen;
  const onClose = props?.onClose ?? context.handleCloseBatchChangeClass;
  const selectedIds = props?.selectedIds ?? context.selectedIds;
  const onSubmit = props?.onSubmit ?? context.handleBatchChangeClassSubmit;
  const isSubmitting = props?.isSubmitting ?? context.isSubmitting;

  if (!isOpen || selectedIds.length === 0) return null;

  return (
    <BatchChangeClassDialogContent
      key={`batch-change-${selectedIds.length}`}
      selectedIds={selectedIds}
      onClose={onClose}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
    />
  );
}

interface BatchChangeClassDialogContentProps {
  selectedIds: string[];
  onClose: () => void;
  onSubmit: (
    newClassId: string,
    newClassName: string,
    resetProgress?: boolean
  ) => Promise<boolean | void> | boolean | void;
  isSubmitting: boolean;
}

function BatchChangeClassDialogContent({
  selectedIds,
  onClose,
  onSubmit,
  isSubmitting,
}: BatchChangeClassDialogContentProps) {
  const { availableClasses, studentsList } = useManageStudentsContext();
  const [selectedClassId, setSelectedClassId] = useState(
    availableClasses[0]?.id ?? ""
  );
  const [resetProgress, setResetProgress] = useState(false);

  const selectedStudents = useMemo(
    () => studentsList.filter((s) => selectedIds.includes(s.id)),
    [studentsList, selectedIds]
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

    await onSubmit(selectedClassId, targetClassName, resetProgress);
  };

  const previewCount = 4;
  const visibleStudents = selectedStudents.slice(0, previewCount);
  const remainingCount = selectedStudents.length - previewCount;

  return (
    <Modal maxWidth="md" onClose={handleClose} disabled={isSubmitting}>
      <ModalHeader
        icon={<ArrowRightLeft className="w-5 h-5 text-[#0A62D6]" />}
        title="Chuyển lớp học hàng loạt"
        description={
          <>
            Đang chọn:{" "}
            <span className="font-bold text-[#0A62D6]">
              {selectedStudents.length} học sinh
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
                      Số dư xu và lượt quay của {selectedStudents.length} học sinh sẽ được <strong>đặt lại về 0</strong>.
                    </li>
                    <li>
                      Toàn bộ bài tập đã làm và chưa nộp ở lớp cũ sẽ được <strong>xóa sạch</strong>.
                    </li>
                    <li>
                      Các em sẽ tham gia lớp mới như các tài khoản mới.
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
                      Các bài tập chưa làm ở lớp cũ sẽ tự động ẩn để tránh gây nợ bài
                      tập cho các em.
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* Danh sách preview học sinh được chọn */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                <Users className="w-3.5 h-3.5 text-slate-500" />
                <span>Danh sách học sinh được chuyển ({selectedStudents.length}):</span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                {visibleStudents.map((s) => (
                  <span
                    key={s.id}
                    className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium"
                  >
                    <span>{s.full_name}</span>
                    <span className="text-[10px] text-slate-400">({s.class_name})</span>
                  </span>
                ))}
                {remainingCount > 0 && (
                  <span className="inline-flex items-center text-xs px-2 py-1 rounded-lg bg-slate-200/80 text-slate-600 font-semibold">
                    +{remainingCount} học sinh khác
                  </span>
                )}
              </div>
            </div>

            {/* Dropdown chọn lớp mới */}
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
            <div
              onClick={() => !isSubmitting && setResetProgress((prev) => !prev)}
              className={`p-3 rounded-xl border transition-all cursor-pointer select-none flex items-start gap-3 ${
                resetProgress
                  ? "bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/20"
                  : "bg-slate-50 border-slate-200 hover:bg-slate-100/70"
              }`}
            >
              <input
                type="checkbox"
                id="reset-batch-student-progress-checkbox"
                checked={resetProgress}
                onChange={(e) => setResetProgress(e.target.checked)}
                disabled={isSubmitting}
                className="mt-0.5 w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer shrink-0"
              />
              <div className="flex-1 text-xs">
                <label
                  htmlFor="reset-batch-student-progress-checkbox"
                  className="font-bold text-[#0F172A] cursor-pointer block"
                >
                  Đặt lại toàn bộ tiến trình học sinh
                </label>
                <p className="text-slate-500 mt-0.5 text-[11.5px]">
                  Xóa lịch sử bài tập cũ, đưa số dư xu và lượt quay về 0 cho tất cả {selectedStudents.length} em.
                </p>
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
            className={`h-10 px-5 rounded-xl text-white text-sm font-semibold transition-all shadow-xs cursor-pointer active:scale-98 disabled:opacity-60 inline-flex items-center gap-2 ${
              resetProgress
                ? "bg-amber-600 hover:bg-amber-700"
                : "bg-[#0A62D6] hover:bg-[#0850B0]"
            }`}
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Đang chuyển...</span>
              </>
            ) : (
              <span>
                {resetProgress ? "Xác nhận chuyển & Đặt lại" : "Xác nhận chuyển lớp"}
              </span>
            )}
          </button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
