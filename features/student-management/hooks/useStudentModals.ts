"use client";

import { useState, useCallback } from "react";
import { StudentItem } from "@/features/student-management/types";
import { toast } from "sonner";

interface UseStudentModalsProps {
  isAdmin: boolean;
}

/**
 * Micro-hook chuyên trách: Quản lý trạng thái đóng/mở và dữ liệu của các Modals Học sinh
 */
export function useStudentModals({ isAdmin }: UseStudentModalsProps) {
  // 1. Modal Thêm / Chỉnh sửa học sinh
  const [isStudentFormOpen, setIsStudentFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentItem | null>(null);
  const [formKey, setFormKey] = useState(0);

  const handleOpenCreateStudent = useCallback(() => {
    setEditingStudent(null);
    setFormKey((k) => k + 1);
    setIsStudentFormOpen(true);
  }, []);

  const handleOpenEditStudent = useCallback((item: StudentItem) => {
    setEditingStudent(item);
    setFormKey((k) => k + 1);
    setIsStudentFormOpen(true);
  }, []);

  const handleCloseStudentForm = useCallback(() => {
    setIsStudentFormOpen(false);
    setEditingStudent(null);
  }, []);

  // 2. Modal Chuyển lớp 1 học sinh
  const [isChangeClassOpen, setIsChangeClassOpen] = useState(false);
  const [changingClassStudent, setChangingClassStudent] =
    useState<StudentItem | null>(null);

  const handleOpenChangeClass = useCallback((item: StudentItem) => {
    setChangingClassStudent(item);
    setIsChangeClassOpen(true);
  }, []);

  const handleCloseChangeClass = useCallback(() => {
    setIsChangeClassOpen(false);
    setChangingClassStudent(null);
  }, []);

  // 3. Modal Chuyển lớp hàng loạt
  const [isBatchChangeClassOpen, setIsBatchChangeClassOpen] = useState(false);

  const handleOpenBatchChangeClass = useCallback(() => {
    setIsBatchChangeClassOpen(true);
  }, []);

  const handleCloseBatchChangeClass = useCallback(() => {
    setIsBatchChangeClassOpen(false);
  }, []);

  // 4. Modal Đặt lại mã PIN
  const [isResetPinOpen, setIsResetPinOpen] = useState(false);
  const [resettingPinStudent, setResettingPinStudent] =
    useState<StudentItem | null>(null);

  const handleOpenResetPin = useCallback((item: StudentItem) => {
    setResettingPinStudent(item);
    setIsResetPinOpen(true);
  }, []);

  const handleCloseResetPin = useCallback(() => {
    setIsResetPinOpen(false);
    setResettingPinStudent(null);
  }, []);

  // 5. Modal Thưởng / Trừ xu Heo Đất & Lượt quay
  const [isAdjustCoinsOpen, setIsAdjustCoinsOpen] = useState(false);
  const [adjustingCoinsStudent, setAdjustingCoinsStudent] =
    useState<StudentItem | null>(null);

  const handleOpenAdjustCoins = useCallback((item: StudentItem) => {
    setAdjustingCoinsStudent(item);
    setIsAdjustCoinsOpen(true);
  }, []);

  const handleCloseAdjustCoins = useCallback(() => {
    setIsAdjustCoinsOpen(false);
    setAdjustingCoinsStudent(null);
  }, []);

  // 6. Modal Xóa mềm (Thùng rác - Chỉ Admin)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingStudent, setDeletingStudent] = useState<StudentItem | null>(
    null
  );

  const handleOpenDeleteModal = useCallback(
    (item: StudentItem) => {
      if (!isAdmin) {
        toast.error("Chỉ Quản trị viên tối cao (Admin) mới có quyền xóa học sinh.");
        return;
      }
      setDeletingStudent(item);
      setIsDeleteModalOpen(true);
    },
    [isAdmin]
  );

  const handleCloseDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(false);
    setDeletingStudent(null);
  }, []);

  // 7. Modal Xóa vĩnh viễn 1 học sinh (Chỉ Admin)
  const [isPermanentModalOpen, setIsPermanentModalOpen] = useState(false);
  const [permanentTargetStudent, setPermanentTargetStudent] =
    useState<StudentItem | null>(null);

  const handleOpenPermanentModal = useCallback(
    (item: StudentItem) => {
      if (!isAdmin) {
        toast.error("Chỉ Quản trị viên tối cao (Admin) mới có quyền xóa vĩnh viễn học sinh.");
        return;
      }
      setPermanentTargetStudent(item);
      setIsPermanentModalOpen(true);
    },
    [isAdmin]
  );

  const handleClosePermanentModal = useCallback(() => {
    setIsPermanentModalOpen(false);
    setPermanentTargetStudent(null);
  }, []);

  // 8. Modal Xóa vĩnh viễn hàng loạt (Chỉ Admin)
  const [isBatchPermanentModalOpen, setIsBatchPermanentModalOpen] =
    useState(false);

  const handleOpenBatchPermanentModal = useCallback(() => {
    if (!isAdmin) {
      toast.error("Chỉ Quản trị viên tối cao (Admin) mới có quyền xóa vĩnh viễn học sinh.");
      return;
    }
    setIsBatchPermanentModalOpen(true);
  }, [isAdmin]);

  const handleCloseBatchPermanentModal = useCallback(() => {
    setIsBatchPermanentModalOpen(false);
  }, []);

  // 8. Modal Lịch sử giao dịch ví xu
  const [isTransactionsOpen, setIsTransactionsOpen] = useState(false);
  const [viewingTransactionsStudent, setViewingTransactionsStudent] =
    useState<StudentItem | null>(null);

  const handleOpenTransactions = useCallback((item: StudentItem) => {
    setViewingTransactionsStudent(item);
    setIsTransactionsOpen(true);
  }, []);

  const handleCloseTransactions = useCallback(() => {
    setIsTransactionsOpen(false);
    setViewingTransactionsStudent(null);
  }, []);

  return {
    // Form thêm/sửa
    isStudentFormOpen,
    setIsStudentFormOpen,
    editingStudent,
    setEditingStudent,
    formKey,
    setFormKey,
    handleOpenCreateStudent,
    handleOpenEditStudent,
    handleCloseStudentForm,

    // Chuyển lớp đơn lẻ
    isChangeClassOpen,
    setIsChangeClassOpen,
    changingClassStudent,
    setChangingClassStudent,
    handleOpenChangeClass,
    handleCloseChangeClass,

    // Chuyển lớp hàng loạt
    isBatchChangeClassOpen,
    setIsBatchChangeClassOpen,
    handleOpenBatchChangeClass,
    handleCloseBatchChangeClass,

    // Đặt lại PIN
    isResetPinOpen,
    setIsResetPinOpen,
    resettingPinStudent,
    setResettingPinStudent,
    handleOpenResetPin,
    handleCloseResetPin,

    // Thưởng/trừ xu & lượt quay
    isAdjustCoinsOpen,
    setIsAdjustCoinsOpen,
    adjustingCoinsStudent,
    setAdjustingCoinsStudent,
    handleOpenAdjustCoins,
    handleCloseAdjustCoins,

    // Xóa mềm
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    deletingStudent,
    setDeletingStudent,
    handleOpenDeleteModal,
    handleCloseDeleteModal,

    // Xóa vĩnh viễn 1 em
    isPermanentModalOpen,
    setIsPermanentModalOpen,
    permanentTargetStudent,
    setPermanentTargetStudent,
    handleOpenPermanentModal,
    handleClosePermanentModal,

    // Xóa vĩnh viễn hàng loạt
    isBatchPermanentModalOpen,
    setIsBatchPermanentModalOpen,
    handleOpenBatchPermanentModal,
    handleCloseBatchPermanentModal,

    // Lịch sử giao dịch ví xu
    isTransactionsOpen,
    setIsTransactionsOpen,
    viewingTransactionsStudent,
    setViewingTransactionsStudent,
    handleOpenTransactions,
    handleCloseTransactions,
  };
}

export type UseStudentModalsReturn = ReturnType<typeof useStudentModals>;
