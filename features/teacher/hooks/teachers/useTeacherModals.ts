"use client";

import { useState, useCallback } from "react";
import { TeacherStaffItem } from "../../components/teachers/types";

/**
 * Micro-hook chuyên trách: Quản lý trạng thái đóng/mở và dữ liệu của các Modals Giáo viên
 */
export function useTeacherModals() {
  // 1. Modal Thêm / Chỉnh sửa Giáo viên
  const [isTeacherFormOpen, setIsTeacherFormOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<TeacherStaffItem | null>(null);
  const [formKey, setFormKey] = useState(0);

  const handleOpenCreateTeacher = useCallback(() => {
    setEditingTeacher(null);
    setFormKey((k) => k + 1);
    setIsTeacherFormOpen(true);
  }, []);

  const handleOpenEditTeacher = useCallback((item: TeacherStaffItem) => {
    setEditingTeacher(item);
    setIsTeacherFormOpen(true);
  }, []);

  const handleCloseTeacherForm = useCallback(() => {
    setIsTeacherFormOpen(false);
    setEditingTeacher(null);
  }, []);

  // 2. Modal Phân công lớp học phụ trách
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assigningTeacher, setAssigningTeacher] = useState<TeacherStaffItem | null>(null);

  const handleOpenAssignClasses = useCallback((item: TeacherStaffItem) => {
    setAssigningTeacher(item);
    setIsAssignModalOpen(true);
  }, []);

  const handleCloseAssignModal = useCallback(() => {
    setIsAssignModalOpen(false);
    setAssigningTeacher(null);
  }, []);

  // 3. Modal Đặt lại mật khẩu
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [resettingTeacher, setResettingTeacher] = useState<TeacherStaffItem | null>(null);

  const handleOpenResetPassword = useCallback((item: TeacherStaffItem) => {
    setResettingTeacher(item);
    setIsResetPasswordOpen(true);
  }, []);

  const handleCloseResetPassword = useCallback(() => {
    setIsResetPasswordOpen(false);
    setResettingTeacher(null);
  }, []);

  // 4. Modal Xác nhận xóa giáo viên
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingTeacher, setDeletingTeacher] = useState<TeacherStaffItem | null>(null);

  const handleOpenDeleteModal = useCallback((item: TeacherStaffItem) => {
    setDeletingTeacher(item);
    setIsDeleteModalOpen(true);
  }, []);

  const handleCloseDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(false);
    setDeletingTeacher(null);
  }, []);

  return {
    isTeacherFormOpen,
    editingTeacher,
    formKey,
    setFormKey,
    setIsTeacherFormOpen,
    setEditingTeacher,
    handleOpenCreateTeacher,
    handleOpenEditTeacher,
    handleCloseTeacherForm,

    isAssignModalOpen,
    assigningTeacher,
    setIsAssignModalOpen,
    setAssigningTeacher,
    handleOpenAssignClasses,
    handleCloseAssignModal,

    isResetPasswordOpen,
    resettingTeacher,
    setIsResetPasswordOpen,
    setResettingTeacher,
    handleOpenResetPassword,
    handleCloseResetPassword,

    isDeleteModalOpen,
    deletingTeacher,
    setIsDeleteModalOpen,
    setDeletingTeacher,
    handleOpenDeleteModal,
    handleCloseDeleteModal,
  };
}
