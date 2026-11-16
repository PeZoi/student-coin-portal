"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AppRoutes } from "@/constants";
import { TeacherMissionItem } from "../types";

/**
 * Micro-Hook 2: Quản lý trạng thái đóng/mở và đối tượng mục tiêu của các Modals trong trang Giao bài tập
 */
export function useMissionModals(selectedCount: number) {
  const router = useRouter();

  // 1. Modal Thêm / Chỉnh sửa bài tập
  const [isMissionFormOpen, setIsMissionFormOpen] = useState(false);
  const [editingMission, setEditingMission] =
    useState<TeacherMissionItem | null>(null);
  const [formKey, setFormKey] = useState(0);

  // 2. Modal Xác nhận xóa bài tập (Chuyển vào thùng rác - `safe_delete_mission`)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingMission, setDeletingMission] =
    useState<TeacherMissionItem | null>(null);

  // 3. Modal Xác nhận xóa vĩnh viễn (Admin - Hard Delete)
  const [isPermanentModalOpen, setIsPermanentModalOpen] = useState(false);
  const [permanentTargetMission, setPermanentTargetMission] =
    useState<TeacherMissionItem | null>(null);
  const [isBatchPermanentModalOpen, setIsBatchPermanentModalOpen] =
    useState(false);

  // 4. Modal Danh sách tiến độ làm bài (Học sinh nào đã làm, học sinh nào chưa làm)
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [viewingProgressMission, setViewingProgressMission] =
    useState<TeacherMissionItem | null>(null);


  // --- Handlers Modal 1: Tạo / Sửa ---
  const handleOpenCreateMission = useCallback(() => {
    setEditingMission(null);
    setFormKey((prev) => prev + 1);
    setIsMissionFormOpen(true);
  }, []);

  const handleOpenEditMission = useCallback((mission: TeacherMissionItem) => {
    setEditingMission(mission);
    setFormKey((prev) => prev + 1);
    setIsMissionFormOpen(true);
  }, []);

  const handleCloseMissionForm = useCallback(() => {
    setIsMissionFormOpen(false);
    setEditingMission(null);
  }, []);

  // --- Điều hướng sang Studio Duyệt bài tập chuyên sâu (`/teacher/submissions?missionId=...`) ---
  const handleOpenSubmissionsModal = useCallback(
    (mission: TeacherMissionItem) => {
      router.push(`${AppRoutes.TEACHER.SUBMISSIONS}?missionId=${mission.id}`);
    },
    [router]
  );

  // --- Handlers Modal 3: Xóa mềm ---
  const handleOpenDeleteModal = useCallback((mission: TeacherMissionItem) => {
    setDeletingMission(mission);
    setIsDeleteModalOpen(true);
  }, []);

  const handleCloseDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(false);
    setDeletingMission(null);
  }, []);

  // --- Handlers Modal 4: Xóa vĩnh viễn ---
  const handleOpenPermanentModal = useCallback(
    (mission: TeacherMissionItem) => {
      setPermanentTargetMission(mission);
      setIsPermanentModalOpen(true);
    },
    []
  );

  const handleClosePermanentModal = useCallback(() => {
    setIsPermanentModalOpen(false);
    setPermanentTargetMission(null);
  }, []);

  const handleOpenBatchPermanentModal = useCallback(() => {
    if (selectedCount === 0) return;
    setIsBatchPermanentModalOpen(true);
  }, [selectedCount]);

  const handleCloseBatchPermanentModal = useCallback(() => {
    setIsBatchPermanentModalOpen(false);
  }, []);

  // --- Handlers Modal 5: Tiến độ làm bài (Ai đã làm, ai chưa làm) ---
  const handleOpenProgressModal = useCallback((mission: TeacherMissionItem) => {
    setViewingProgressMission(mission);
    setIsProgressModalOpen(true);
  }, []);

  const handleCloseProgressModal = useCallback(() => {
    setIsProgressModalOpen(false);
    setViewingProgressMission(null);
  }, []);

  return {
    isMissionFormOpen,
    editingMission,
    formKey,
    handleOpenCreateMission,
    handleOpenEditMission,
    handleCloseMissionForm,

    handleOpenSubmissionsModal,

    isProgressModalOpen,
    viewingProgressMission,
    handleOpenProgressModal,
    handleCloseProgressModal,

    isDeleteModalOpen,
    deletingMission,
    handleOpenDeleteModal,
    handleCloseDeleteModal,

    isPermanentModalOpen,
    permanentTargetMission,
    isBatchPermanentModalOpen,
    handleOpenPermanentModal,
    handleClosePermanentModal,
    handleOpenBatchPermanentModal,
    handleCloseBatchPermanentModal,
  };
}
