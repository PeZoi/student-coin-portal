"use client";

import { useState, useCallback } from "react";
import { TeacherClassItem } from "../../components/classes/types";

/**
 * Micro-hook chuyên trách: Quản lý trạng thái đóng/mở và dữ liệu của các hộp thoại (Modals)
 */
export function useClassModals(selectedIdsCount: number) {
  // 1. Modal Thêm mới / Chỉnh sửa lớp học
  const [isClassFormOpen, setIsClassFormOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<TeacherClassItem | null>(null);
  const [formKey, setFormKey] = useState(0);

  const handleOpenCreateClass = useCallback(() => {
    setEditingClass(null);
    setFormKey((k) => k + 1);
    setIsClassFormOpen(true);
  }, []);

  const handleOpenEditClass = useCallback((item: TeacherClassItem) => {
    setEditingClass(item);
    setIsClassFormOpen(true);
  }, []);

  const handleCloseClassForm = useCallback(() => {
    setIsClassFormOpen(false);
    setEditingClass(null);
  }, []);

  // 2. Modal Phân công giáo viên
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assigningClass, setAssigningClass] = useState<TeacherClassItem | null>(null);

  const handleOpenAssignTeacher = useCallback((item: TeacherClassItem) => {
    setAssigningClass(item);
    setIsAssignModalOpen(true);
  }, []);

  const handleCloseAssignModal = useCallback(() => {
    setIsAssignModalOpen(false);
    setAssigningClass(null);
  }, []);

  // 3. Modal Xác nhận xóa lớp học (Xóa mềm chuyển thùng rác / Xóa vĩnh viễn nếu 0 học sinh)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingClass, setDeletingClass] = useState<TeacherClassItem | null>(null);

  const handleOpenDeleteModal = useCallback((item: TeacherClassItem) => {
    setDeletingClass(item);
    setIsDeleteModalOpen(true);
  }, []);

  const handleCloseDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(false);
    setDeletingClass(null);
  }, []);

  // 4. Modal Xác nhận Xóa vĩnh viễn đơn lẻ (Tầng 2 - Admin từ tab Đã xóa)
  const [isPermanentModalOpen, setIsPermanentModalOpen] = useState(false);
  const [permanentTargetClass, setPermanentTargetClass] = useState<TeacherClassItem | null>(null);

  const handleOpenPermanentModal = useCallback((item: TeacherClassItem) => {
    setPermanentTargetClass(item);
    setIsPermanentModalOpen(true);
  }, []);

  const handleClosePermanentModal = useCallback(() => {
    setIsPermanentModalOpen(false);
    setPermanentTargetClass(null);
  }, []);

  // 5. Modal Xóa vĩnh viễn hàng loạt (Batch Permanent Delete)
  const [isBatchPermanentModalOpen, setIsBatchPermanentModalOpen] = useState(false);

  const handleOpenBatchPermanentModal = useCallback(() => {
    if (selectedIdsCount === 0) return;
    setIsBatchPermanentModalOpen(true);
  }, [selectedIdsCount]);

  const handleCloseBatchPermanentModal = useCallback(() => {
    setIsBatchPermanentModalOpen(false);
  }, []);

  return {
    // Form Modal
    isClassFormOpen,
    editingClass,
    formKey,
    setFormKey,
    setIsClassFormOpen,
    setEditingClass,
    handleOpenCreateClass,
    handleOpenEditClass,
    handleCloseClassForm,

    // Assign Modal
    isAssignModalOpen,
    assigningClass,
    setIsAssignModalOpen,
    setAssigningClass,
    handleOpenAssignTeacher,
    handleCloseAssignModal,

    // Delete Modal
    isDeleteModalOpen,
    deletingClass,
    setIsDeleteModalOpen,
    setDeletingClass,
    handleOpenDeleteModal,
    handleCloseDeleteModal,

    // Permanent Delete Single Modal
    isPermanentModalOpen,
    permanentTargetClass,
    setIsPermanentModalOpen,
    setPermanentTargetClass,
    handleOpenPermanentModal,
    handleClosePermanentModal,

    // Batch Permanent Delete Modal
    isBatchPermanentModalOpen,
    setIsBatchPermanentModalOpen,
    handleOpenBatchPermanentModal,
    handleCloseBatchPermanentModal,
  };
}
