"use client";

import { useState, useCallback } from "react";
import { KeyedMutator } from "swr";
import { toast } from "sonner";
import {
  TeacherMissionItem,
  MissionFormValues,
} from "../types";
import { missionService } from "../services/missionService";
import { useMissionModals } from "./useMissionModals";

interface UseMissionMutationsParams {
  missionsList: TeacherMissionItem[];
  mutateMissions: KeyedMutator<TeacherMissionItem[]>;
  selectedIds: string[];
  handleClearSelection: () => void;
  modals: ReturnType<typeof useMissionModals>;
  creatorName: string;
}

/**
 * Micro-Hook 3: Quản lý các thao tác tương tác API thực tế & Cập nhật lạc quan (Optimistic UI)
 */
export function useMissionMutations({
  mutateMissions,
  selectedIds,
  handleClearSelection,
  modals,
}: UseMissionMutationsParams) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [batchActionLoading, setBatchActionLoading] = useState<string | null>(
    null
  );

  // 1. Tạo mới / Chỉnh sửa bài tập qua API thực tế
  const handleMissionFormSubmit = useCallback(
    async (values: MissionFormValues) => {
      setIsSubmitting(true);
      try {
        if (modals.editingMission) {
          // Cập nhật bài tập hiện có
          await missionService.updateMission(
            modals.editingMission.id,
            values
          );
          toast.success("Đã cập nhật bài tập thành công!");
        } else {
          // Giao bài tập mới
          await missionService.createMission(values);
          toast.success("Đã giao bài tập mới thành công!");
        }

        await mutateMissions();
        modals.handleCloseMissionForm();
        return true;
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error(String(err));
        toast.error(error.message || "Không thể lưu thông tin bài tập.");
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [modals, mutateMissions]
  );

  // 2. Bật / Tắt trạng thái mở nhận bài (Optimistic Update 0ms)
  const handleToggleMissionStatus = useCallback(
    async (mission: TeacherMissionItem) => {
      const nextActive = !mission.is_active;

      // Cập nhật lạc quan ngay lập tức trên UI
      mutateMissions(
        (prev) =>
          prev?.map((m) =>
            m.id === mission.id ? { ...m, is_active: nextActive } : m
          ) ?? [],
        {
          optimisticData: (prev) =>
            prev?.map((m) =>
              m.id === mission.id ? { ...m, is_active: nextActive } : m
            ) ?? [],
          rollbackOnError: true,
          revalidate: false,
        }
      );

      try {
        await missionService.toggleMissionStatus(mission.id, nextActive);
        toast.success(
          nextActive
            ? `Đã mở nhận bài cho "${mission.title}"!`
            : `Đã tạm đóng "${mission.title}".`
        );
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error(String(err));
        toast.error(error.message || "Không thể đổi trạng thái bài tập.");
        await mutateMissions();
      }
    },
    [mutateMissions]
  );

  // 3. Xóa mềm bài tập qua RPC safe_delete_mission
  const handleConfirmDelete = useCallback(async () => {
    const target = modals.deletingMission;
    if (!target) return false;

    setIsSubmitting(true);
    try {
      const res = await missionService.deleteMission(target.id);
      await mutateMissions();

      if (res.resultType === "HARD_DELETED") {
        toast.success(`Đã xóa vĩnh viễn bài tập "${target.title}".`);
      } else {
        toast.success(`Đã chuyển bài tập "${target.title}" vào thùng rác.`);
      }

      modals.handleCloseDeleteModal();
      return true;
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(error.message || "Không thể xóa bài tập.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [modals, mutateMissions]);

  // 4. Khôi phục bài tập từ thùng rác qua RPC restore_mission
  const handleRestoreMission = useCallback(
    async (mission: TeacherMissionItem) => {
      setRestoringId(mission.id);
      try {
        await missionService.restoreMission(mission.id);
        await mutateMissions();
        toast.success(`Đã khôi phục bài tập "${mission.title}"!`);
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error(String(err));
        toast.error(error.message || "Không thể khôi phục bài tập.");
      } finally {
        setRestoringId(null);
      }
    },
    [mutateMissions]
  );

  // 5. Xóa vĩnh viễn bài tập (Admin)
  const handleConfirmPermanentDelete = useCallback(async () => {
    const target = modals.permanentTargetMission;
    if (!target) return false;

    setIsSubmitting(true);
    try {
      await missionService.permanentDeleteMission(target.id);
      await mutateMissions();
      toast.success(`Đã xóa vĩnh viễn bài tập "${target.title}".`);
      modals.handleClosePermanentModal();
      return true;
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(error.message || "Không thể xóa vĩnh viễn bài tập.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [modals, mutateMissions]);

  // 6. Các thao tác hàng loạt (Batch Actions)
  const handleBatchActivate = useCallback(async () => {
    if (selectedIds.length === 0) return;
    setBatchActionLoading("activate");
    try {
      await missionService.batchActions("activate", selectedIds);
      await mutateMissions();
      toast.success(`Đã mở nhận bài cho ${selectedIds.length} bài tập!`);
      handleClearSelection();
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(error.message || "Lỗi thao tác hàng loạt.");
    } finally {
      setBatchActionLoading(null);
    }
  }, [handleClearSelection, mutateMissions, selectedIds]);

  const handleBatchDeactivate = useCallback(async () => {
    if (selectedIds.length === 0) return;
    setBatchActionLoading("deactivate");
    try {
      await missionService.batchActions("deactivate", selectedIds);
      await mutateMissions();
      toast.success(`Đã tạm đóng ${selectedIds.length} bài tập.`);
      handleClearSelection();
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(error.message || "Lỗi thao tác hàng loạt.");
    } finally {
      setBatchActionLoading(null);
    }
  }, [handleClearSelection, mutateMissions, selectedIds]);

  const handleBatchSoftDelete = useCallback(async () => {
    if (selectedIds.length === 0) return;
    setBatchActionLoading("delete_soft");
    try {
      await missionService.batchActions("delete_soft", selectedIds);
      await mutateMissions();
      toast.success(`Đã chuyển ${selectedIds.length} bài tập vào thùng rác.`);
      handleClearSelection();
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(error.message || "Lỗi thao tác hàng loạt.");
    } finally {
      setBatchActionLoading(null);
    }
  }, [handleClearSelection, mutateMissions, selectedIds]);

  const handleBatchRestore = useCallback(async () => {
    if (selectedIds.length === 0) return;
    setBatchActionLoading("restore");
    try {
      await missionService.batchActions("restore", selectedIds);
      await mutateMissions();
      toast.success(`Đã khôi phục ${selectedIds.length} bài tập!`);
      handleClearSelection();
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(error.message || "Lỗi thao tác hàng loạt.");
    } finally {
      setBatchActionLoading(null);
    }
  }, [handleClearSelection, mutateMissions, selectedIds]);

  const handleConfirmBatchPermanentDelete = useCallback(async () => {
    if (selectedIds.length === 0) return false;
    setBatchActionLoading("delete_permanent");
    try {
      await missionService.batchActions("delete_permanent", selectedIds);
      await mutateMissions();
      toast.success(`Đã xóa vĩnh viễn ${selectedIds.length} bài tập.`);
      modals.handleCloseBatchPermanentModal();
      handleClearSelection();
      return true;
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(error.message || "Lỗi thao tác hàng loạt.");
      return false;
    } finally {
      setBatchActionLoading(null);
    }
  }, [handleClearSelection, modals, mutateMissions, selectedIds]);

  return {
    isSubmitting,
    restoringId,
    batchActionLoading,
    handleMissionFormSubmit,
    handleToggleMissionStatus,
    handleConfirmDelete,
    handleRestoreMission,
    handleConfirmPermanentDelete,
    handleBatchActivate,
    handleBatchDeactivate,
    handleBatchSoftDelete,
    handleBatchRestore,
    handleConfirmBatchPermanentDelete,
  };
}
