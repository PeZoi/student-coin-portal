"use client";

import { useState, useCallback, Dispatch, SetStateAction } from "react";
import { toast } from "sonner";
import { useTeacherWorkspaceStore } from "@/stores/useTeacherWorkspaceStore";
import {
  TeacherMissionItem,
  MissionFormValues,
  MissionAvailableClass,
  MissionSubmissionItem,
} from "../types";
import { useMissionModals } from "./useMissionModals";

interface UseMissionMutationsParams {
  missionsList: TeacherMissionItem[];
  setMissionsList: Dispatch<SetStateAction<TeacherMissionItem[]>>;
  availableClasses: MissionAvailableClass[];
  submissionsByMission: Record<string, MissionSubmissionItem[]>;
  setSubmissionsByMission: Dispatch<
    SetStateAction<Record<string, MissionSubmissionItem[]>>
  >;
  selectedIds: string[];
  handleClearSelection: () => void;
  modals: ReturnType<typeof useMissionModals>;
  creatorName: string;
}

/**
 * Micro-Hook 3: Quản lý các thao tác cập nhật giao diện (Mock UI Mutations)
 */
export function useMissionMutations({
  setMissionsList,
  setSubmissionsByMission,
  selectedIds,
  handleClearSelection,
  modals,
  creatorName,
}: UseMissionMutationsParams) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [batchActionLoading, setBatchActionLoading] = useState<string | null>(
    null
  );

  // 1. Tạo mới / Chỉnh sửa bài tập
  const handleMissionFormSubmit = useCallback(
    async (values: MissionFormValues) => {
      setIsSubmitting(true);
      try {
        const nowIso = new Date().toISOString();

        if (modals.editingMission) {
          // Chỉnh sửa bài tập hiện có
          const targetId = modals.editingMission.id;
          setMissionsList((prev) =>
            prev.map((m) =>
              m.id === targetId
                ? {
                    ...m,
                    title: values.title,
                    description: values.description,
                    submission_type: values.submission_type,
                    min_reward_coins: values.min_reward_coins,
                    max_reward_coins: values.max_reward_coins,
                    due_at: values.due_at
                      ? new Date(values.due_at).toISOString()
                      : m.due_at,
                    is_active: values.is_active,
                    grading_focus: values.grading_focus,
                    custom_ai_prompt: values.custom_ai_prompt,
                    allow_late_submission: values.allow_late_submission,
                    ai_prompt_template_id:
                      values.ai_prompt_template_id ?? m.ai_prompt_template_id,
                    updated_at: nowIso,
                  }
                : m
            )
          );
          toast.success("Đã cập nhật bài tập thành công!");
        } else {
          // Tạo mới bài tập: Tự động phân công vào lớp đang chọn ở Header (Workspace)
          const currentWorkspaceClass =
            useTeacherWorkspaceStore.getState().getSelectedClass();
          const assignedClassIds = currentWorkspaceClass
            ? [currentWorkspaceClass.id]
            : values.assigned_class_ids.length > 0
            ? values.assigned_class_ids
            : [];
          const assignedClasses = currentWorkspaceClass
            ? [
                {
                  id: currentWorkspaceClass.id,
                  class_name: currentWorkspaceClass.class_name,
                  student_count: currentWorkspaceClass.student_count ?? 0,
                },
              ]
            : [];
          const totalStudents = currentWorkspaceClass?.student_count ?? 24;

          const newMission: TeacherMissionItem = {
            id: `msn-${Date.now()}`,
            title: values.title,
            description: values.description,
            submission_type: values.submission_type || "subjective_writing",
            min_reward_coins: values.min_reward_coins,
            max_reward_coins: values.max_reward_coins,
            due_at: values.due_at
              ? new Date(values.due_at).toISOString()
              : new Date(Date.now() + 86400000).toISOString(),
            created_by: "usr-current",
            creator_name: creatorName,
            is_active: values.is_active,
            is_deleted: false,
            deleted_at: null,
            deleted_by: null,
            updated_by: null,
            updated_at: nowIso,
            created_at: nowIso,
            assigned_class_ids: assignedClassIds,
            assigned_classes: assignedClasses,
            total_students: totalStudents,
            submitted_count: 0,
            pending_review_count: 0,
            approved_count: 0,
            rejected_count: 0,
            late_count: 0,
            total_coins_awarded: 0,
            avg_ai_score: null,
            grading_focus: values.grading_focus,
            custom_ai_prompt: values.custom_ai_prompt,
            allow_late_submission: values.allow_late_submission,
            ai_prompt_template_id: values.ai_prompt_template_id ?? null,
          };

          setMissionsList((prev) => [newMission, ...prev]);
          toast.success(
            currentWorkspaceClass
              ? `Đã giao bài tập mới cho ${currentWorkspaceClass.class_name} thành công!`
              : "Đã giao bài tập mới thành công!"
          );
        }

        modals.handleCloseMissionForm();
        return true;
      } finally {
        setIsSubmitting(false);
      }
    },
    [creatorName, modals, setMissionsList]
  );

  // 2. Bật / Tắt trạng thái mở nhận bài (`is_active`)
  const handleToggleMissionStatus = useCallback(
    (mission: TeacherMissionItem) => {
      const nextActive = !mission.is_active;
      setMissionsList((prev) =>
        prev.map((m) =>
          m.id === mission.id ? { ...m, is_active: nextActive } : m
        )
      );
      toast.success(
        nextActive
          ? `Đã mở nhận bài cho "${mission.title}"!`
          : `Đã tạm đóng "${mission.title}".`
      );
    },
    [setMissionsList]
  );

  // 3. Xóa mềm bài tập (`safe_delete_mission`)
  const handleConfirmDelete = useCallback(async () => {
    const target = modals.deletingMission;
    if (!target) return false;

    setIsSubmitting(true);
    try {
      setMissionsList((prev) =>
        prev.map((m) =>
          m.id === target.id
            ? {
                ...m,
                is_deleted: true,
                is_active: false,
                deleted_at: new Date().toISOString(),
              }
            : m
        )
      );
      toast.success(`Đã chuyển bài tập "${target.title}" vào thùng rác.`);
      modals.handleCloseDeleteModal();
      return true;
    } finally {
      setIsSubmitting(false);
    }
  }, [modals, setMissionsList]);

  // 4. Khôi phục bài tập từ thùng rác (`restore_mission`)
  const handleRestoreMission = useCallback(
    async (mission: TeacherMissionItem) => {
      setRestoringId(mission.id);
      try {
        setMissionsList((prev) =>
          prev.map((m) =>
            m.id === mission.id
              ? {
                  ...m,
                  is_deleted: false,
                  is_active: true,
                  deleted_at: null,
                }
              : m
          )
        );
        toast.success(`Đã khôi phục bài tập "${mission.title}"!`);
      } finally {
        setRestoringId(null);
      }
    },
    [setMissionsList]
  );

  // 5. Xóa vĩnh viễn bài tập (Hard delete - Admin)
  const handleConfirmPermanentDelete = useCallback(async () => {
    const target = modals.permanentTargetMission;
    if (!target) return false;

    setIsSubmitting(true);
    try {
      setMissionsList((prev) => prev.filter((m) => m.id !== target.id));
      toast.success(`Đã xóa vĩnh viễn bài tập "${target.title}".`);
      modals.handleClosePermanentModal();
      return true;
    } finally {
      setIsSubmitting(false);
    }
  }, [modals, setMissionsList]);

  // 6. Duyệt nhanh bài nộp của học sinh ngay trong Modal Bài nộp
  const handleQuickApproveSubmission = useCallback(
    (missionId: string, submissionId: string, finalCoins: number) => {
      setSubmissionsByMission((prev) => {
        const list = prev[missionId] || [];
        return {
          ...prev,
          [missionId]: list.map((sub) =>
            sub.id === submissionId
              ? {
                  ...sub,
                  approval_status: "approved",
                  final_coins: finalCoins,
                  reviewed_at: new Date().toISOString(),
                }
              : sub
          ),
        };
      });

      setMissionsList((prev) =>
        prev.map((m) =>
          m.id === missionId
            ? {
                ...m,
                pending_review_count: Math.max(0, m.pending_review_count - 1),
                approved_count: m.approved_count + 1,
                total_coins_awarded: m.total_coins_awarded + finalCoins,
              }
            : m
        )
      );

      toast.success(`Đã duyệt bài và cộng +${finalCoins} xu vào Heo Đất!`);
    },
    [setMissionsList, setSubmissionsByMission]
  );

  // 7. Các thao tác hàng loạt (Batch Actions)
  const handleBatchActivate = useCallback(() => {
    if (selectedIds.length === 0) return;
    setBatchActionLoading("activate");
    setMissionsList((prev) =>
      prev.map((m) =>
        selectedIds.includes(m.id) ? { ...m, is_active: true } : m
      )
    );
    toast.success(`Đã mở nhận bài cho ${selectedIds.length} bài tập!`);
    handleClearSelection();
    setBatchActionLoading(null);
  }, [handleClearSelection, selectedIds, setMissionsList]);

  const handleBatchDeactivate = useCallback(() => {
    if (selectedIds.length === 0) return;
    setBatchActionLoading("deactivate");
    setMissionsList((prev) =>
      prev.map((m) =>
        selectedIds.includes(m.id) ? { ...m, is_active: false } : m
      )
    );
    toast.success(`Đã tạm đóng ${selectedIds.length} bài tập.`);
    handleClearSelection();
    setBatchActionLoading(null);
  }, [handleClearSelection, selectedIds, setMissionsList]);

  const handleBatchSoftDelete = useCallback(() => {
    if (selectedIds.length === 0) return;
    setBatchActionLoading("delete_soft");
    const nowIso = new Date().toISOString();
    setMissionsList((prev) =>
      prev.map((m) =>
        selectedIds.includes(m.id)
          ? { ...m, is_deleted: true, is_active: false, deleted_at: nowIso }
          : m
      )
    );
    toast.success(`Đã chuyển ${selectedIds.length} bài tập vào thùng rác.`);
    handleClearSelection();
    setBatchActionLoading(null);
  }, [handleClearSelection, selectedIds, setMissionsList]);

  const handleBatchRestore = useCallback(() => {
    if (selectedIds.length === 0) return;
    setBatchActionLoading("restore");
    setMissionsList((prev) =>
      prev.map((m) =>
        selectedIds.includes(m.id)
          ? { ...m, is_deleted: false, is_active: true, deleted_at: null }
          : m
      )
    );
    toast.success(`Đã khôi phục ${selectedIds.length} bài tập!`);
    handleClearSelection();
    setBatchActionLoading(null);
  }, [handleClearSelection, selectedIds, setMissionsList]);

  const handleConfirmBatchPermanentDelete = useCallback(async () => {
    if (selectedIds.length === 0) return false;
    setBatchActionLoading("delete_permanent");
    setMissionsList((prev) =>
      prev.filter((m) => !selectedIds.includes(m.id))
    );
    toast.success(`Đã xóa vĩnh viễn ${selectedIds.length} bài tập.`);
    modals.handleCloseBatchPermanentModal();
    handleClearSelection();
    setBatchActionLoading(null);
    return true;
  }, [handleClearSelection, modals, selectedIds, setMissionsList]);

  return {
    isSubmitting,
    restoringId,
    batchActionLoading,
    handleMissionFormSubmit,
    handleToggleMissionStatus,
    handleConfirmDelete,
    handleRestoreMission,
    handleConfirmPermanentDelete,
    handleQuickApproveSubmission,
    handleBatchActivate,
    handleBatchDeactivate,
    handleBatchSoftDelete,
    handleBatchRestore,
    handleConfirmBatchPermanentDelete,
  };
}
