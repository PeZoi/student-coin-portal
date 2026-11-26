"use client";

import { ConfirmDeleteModal } from "@/components/ui/modal";
import { useManageMissionsContext } from "../../contexts/ManageMissionsContext";

export function DeleteMissionModal() {
  const {
    isDeleteModalOpen,
    deletingMission,
    handleCloseDeleteModal,
    handleConfirmDelete,
    isSubmitting,
  } = useManageMissionsContext();

  if (!isDeleteModalOpen || !deletingMission) return null;

  const hasSubmissions = deletingMission.submitted_count > 0;

  return (
    <ConfirmDeleteModal
      isOpen={isDeleteModalOpen}
      onClose={handleCloseDeleteModal}
      onConfirm={handleConfirmDelete}
      isSubmitting={isSubmitting}
      title="Xoá bài tập"
      warningText={
        hasSubmissions
          ? `Bài tập này đã có ${deletingMission.submitted_count} học sinh nộp bài (${deletingMission.total_coins_awarded} xu đã thưởng). Hệ thống sẽ chuyển bài tập vào thùng rác để bảo toàn 100% lịch sử bài nộp và số dư Heo Đất của học sinh.`
          : "Bài tập này chưa có học sinh nộp bài và sẽ được chuyển vào thùng rác. Bạn có thể khôi phục bất kỳ lúc nào."
      }
    >
      Bạn có chắc chắn muốn chuyển bài tập{" "}
      <span className="font-semibold text-slate-900">
        &quot;{deletingMission.title}&quot;
      </span>{" "}
      vào thùng rác không?
    </ConfirmDeleteModal>
  );
}
