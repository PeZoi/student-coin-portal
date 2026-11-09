"use client";

import { useState, useMemo, useDeferredValue } from "react";
import { toast } from "sonner";
import {
  TeacherStaffItem,
  AvailableClassItem,
  TeacherStatusFilter,
  TeacherSortField,
  SortDirection,
  TeacherFormValues,
} from "../components/teachers/types";
import {
  INITIAL_MOCK_TEACHERS,
  INITIAL_AVAILABLE_CLASSES,
} from "../components/teachers/constants";
import { normalizeText, parseDate } from "../components/classes/utils";

/**
 * Hỗ trợ phân tích chuỗi ngày giờ "HH:mm dd/MM/yyyy" hoặc "dd/MM/yyyy" sang timestamp để sắp xếp
 */
function parseDateTime(dateTimeStr: string | null): number {
  if (!dateTimeStr) return -1;
  const trimmed = dateTimeStr.trim();
  const spaceParts = trimmed.split(/\s+/);
  if (spaceParts.length === 2) {
    const [timePart, datePart] = spaceParts;
    const [hourStr, minStr] = timePart.split(":");
    const dateParts = datePart.split("/");
    if (dateParts.length === 3) {
      const day = parseInt(dateParts[0], 10);
      const month = parseInt(dateParts[1], 10) - 1;
      const year = parseInt(dateParts[2], 10);
      const hour = parseInt(hourStr || "0", 10);
      const minute = parseInt(minStr || "0", 10);
      const d = new Date(year, month, day, hour, minute);
      if (!isNaN(d.getTime())) return d.getTime();
    }
  }
  return parseDate(trimmed);
}

export function useManageTeachers(initialTeachers?: TeacherStaffItem[]) {
  // Mock data danh sách giáo viên dựa trên bảng `public.users`, `public.teacher_classes` & `public.auth_logs`
  const [teachersList] = useState<TeacherStaffItem[]>(
    initialTeachers ?? INITIAL_MOCK_TEACHERS
  );
  const [availableClasses] = useState<AvailableClassItem[]>(INITIAL_AVAILABLE_CLASSES);

  const [isLoading] = useState(false);
  const [isRefreshing] = useState(false);
  const [isError] = useState(false);
  const [isSubmitting] = useState(false);
  const [isLoadingClasses] = useState(false);

  // Bộ lọc & sắp xếp giao diện
  const [statusFilter, setStatusFilter] = useState<TeacherStatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [sortField, setSortField] = useState<TeacherSortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("none");

  // 1. State Modal Tạo / Chỉnh sửa giáo viên
  const [isTeacherFormOpen, setIsTeacherFormOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<TeacherStaffItem | null>(null);
  const [formKey, setFormKey] = useState(0);

  // 2. State Modal Phân công lớp học phụ trách
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assigningTeacher, setAssigningTeacher] = useState<TeacherStaffItem | null>(null);

  // 3. State Modal Đặt lại mật khẩu
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [resettingTeacher, setResettingTeacher] = useState<TeacherStaffItem | null>(null);

  // 4. State Modal Xác nhận xóa giáo viên
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingTeacher, setDeletingTeacher] = useState<TeacherStaffItem | null>(null);

  // Tính toán chỉ số KPI hiển thị trên thẻ thống kê
  const {
    totalTeachers,
    activeTeachers,
    inactiveTeachers,
    assignedTeachersCount,
    unassignedTeachersCount,
  } = useMemo(() => {
    const total = teachersList.length;
    let active = 0;
    let assignedCount = 0;

    for (const item of teachersList) {
      if (item.is_active) active += 1;
      if (item.assigned_classes.length > 0) {
        assignedCount += 1;
      }
    }

    return {
      totalTeachers: total,
      activeTeachers: active,
      inactiveTeachers: total - active,
      assignedTeachersCount: assignedCount,
      unassignedTeachersCount: total - assignedCount,
    };
  }, [teachersList]);

  // Chuyển trạng thái sắp xếp cột: asc -> desc -> none
  const handleSortToggle = (field: TeacherSortField) => {
    if (sortField !== field) {
      setSortField(field);
      setSortDirection("asc");
    } else if (sortDirection === "asc") {
      setSortDirection("desc");
    } else if (sortDirection === "desc") {
      setSortDirection("none");
      setSortField(null);
    } else {
      setSortDirection("asc");
    }
  };

  // Lọc và sắp xếp danh sách giáo viên để hiển thị trên bảng / thẻ mobile
  const filteredTeachers = useMemo(() => {
    const normalizedQuery = normalizeText(deferredSearchQuery);

    const list = teachersList.filter((item) => {
      if (statusFilter === "active" && !item.is_active) return false;
      if (statusFilter === "inactive" && item.is_active) return false;

      if (normalizedQuery) {
        const matchFullName = normalizeText(item.full_name).includes(normalizedQuery);
        const matchUsername = normalizeText(item.username).includes(normalizedQuery);
        const matchPhone = item.phone_zalo
          ? normalizeText(item.phone_zalo).includes(normalizedQuery)
          : false;
        const matchEmail = item.email
          ? normalizeText(item.email).includes(normalizedQuery)
          : false;
        const matchClass = item.assigned_classes.some((cls) =>
          normalizeText(cls).includes(normalizedQuery)
        );

        if (
          !matchFullName &&
          !matchUsername &&
          !matchPhone &&
          !matchEmail &&
          !matchClass
        ) {
          return false;
        }
      }

      return true;
    });

    if (!sortField || sortDirection === "none") {
      return list;
    }

    return [...list].sort((a, b) => {
      let result = 0;

      if (sortField === "full_name") {
        result = a.full_name.localeCompare(b.full_name, "vi", { numeric: true });
      } else if (sortField === "assigned_classes") {
        result = a.assigned_classes.length - b.assigned_classes.length;
      } else if (sortField === "last_login_at") {
        const timeA = parseDateTime(a.last_login_at);
        const timeB = parseDateTime(b.last_login_at);

        if (timeA === -1 && timeB === -1) result = 0;
        else if (timeA === -1) return 1;
        else if (timeB === -1) return -1;
        else result = timeA - timeB;
      } else if (sortField === "created_at") {
        const timeA = parseDate(a.created_at);
        const timeB = parseDate(b.created_at);

        if (timeA === -1 && timeB === -1) result = 0;
        else if (timeA === -1) return 1;
        else if (timeB === -1) return -1;
        else result = timeA - timeB;
      }

      return sortDirection === "desc" ? -result : result;
    });
  }, [
    teachersList,
    statusFilter,
    deferredSearchQuery,
    sortField,
    sortDirection,
  ]);

  const handleResetFilter = () => {
    setStatusFilter("all");
    setSearchQuery("");
  };

  const handleRefresh = () => {
    toast.info("Giao diện mẫu: Sẽ kết nối API làm mới danh sách giáo viên sau.");
  };

  // --- Handlers Modal Thêm / Chỉnh sửa Giáo viên ---
  const handleOpenCreateTeacher = () => {
    setEditingTeacher(null);
    setFormKey((k) => k + 1);
    setIsTeacherFormOpen(true);
  };

  const handleOpenEditTeacher = (item: TeacherStaffItem) => {
    setEditingTeacher(item);
    setIsTeacherFormOpen(true);
  };

  const handleCloseTeacherForm = () => {
    setIsTeacherFormOpen(false);
    setEditingTeacher(null);
  };

  const handleTeacherFormSubmit = (data: TeacherFormValues): boolean => {
    toast.info(
      editingTeacher
        ? `Giao diện mẫu: Lưu chỉnh sửa "${data.full_name}" (sẽ kết nối API sau).`
        : `Giao diện mẫu: Tạo tài khoản "${data.full_name}" (@${data.username}) (sẽ kết nối API sau).`
    );
    setFormKey((k) => k + 1);
    setIsTeacherFormOpen(false);
    setEditingTeacher(null);
    return true;
  };

  // --- Handlers Modal Phân công lớp học ---
  const handleOpenAssignClasses = (item: TeacherStaffItem) => {
    setAssigningTeacher(item);
    setIsAssignModalOpen(true);
  };

  const handleCloseAssignModal = () => {
    setIsAssignModalOpen(false);
    setAssigningTeacher(null);
  };

  const handleAssignClassesSubmit = (
    teacherId: string,
    selectedClassIds: string[]
  ): boolean => {
    void teacherId;
    toast.info(
      `Giao diện mẫu: Đã chọn ${selectedClassIds.length} lớp phụ trách cho "${assigningTeacher?.full_name}" (sẽ kết nối API sau).`
    );
    setIsAssignModalOpen(false);
    setAssigningTeacher(null);
    return true;
  };

  // --- Handlers Modal Đặt lại mật khẩu ---
  const handleOpenResetPassword = (item: TeacherStaffItem) => {
    setResettingTeacher(item);
    setIsResetPasswordOpen(true);
  };

  const handleCloseResetPassword = () => {
    setIsResetPasswordOpen(false);
    setResettingTeacher(null);
  };

  const handleResetPasswordSubmit = (
    teacherId: string,
    newPassword: string
  ): boolean => {
    void teacherId;
    void newPassword;
    toast.info(
      `Giao diện mẫu: Đặt lại mật khẩu cho "${resettingTeacher?.full_name}" (@${resettingTeacher?.username}) (sẽ kết nối API sau).`
    );
    setIsResetPasswordOpen(false);
    setResettingTeacher(null);
    return true;
  };

  // --- Handlers Tạm khóa / Mở khóa & Xem chi tiết ---
  const handleToggleTeacherStatus = (item: TeacherStaffItem) => {
    toast.info(
      item.is_active
        ? `Giao diện mẫu: Tạm khóa tài khoản "${item.full_name}" (sẽ kết nối API sau).`
        : `Giao diện mẫu: Mở khóa tài khoản "${item.full_name}" (sẽ kết nối API sau).`
    );
  };

  const handleViewTeacherDetails = (item: TeacherStaffItem) => {
    toast.info(`Xem thông tin giáo viên: ${item.full_name} (@${item.username})`);
  };

  // --- Handlers Modal Xóa giáo viên ---
  const handleOpenDeleteModal = (item: TeacherStaffItem) => {
    setDeletingTeacher(item);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingTeacher(null);
  };

  const handleConfirmDelete = (): boolean => {
    if (!deletingTeacher) return false;
    toast.info(
      `Giao diện mẫu: Xóa tài khoản "${deletingTeacher.full_name}" (sẽ kết nối API sau).`
    );
    handleCloseDeleteModal();
    return true;
  };

  return {
    teachersList,
    availableClasses,
    isLoading,
    isRefreshing,
    isError,
    isSubmitting,
    isLoadingClasses,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    sortField,
    sortDirection,
    handleSortToggle,
    totalTeachers,
    activeTeachers,
    inactiveTeachers,
    assignedTeachersCount,
    unassignedTeachersCount,
    filteredTeachers,
    handleResetFilter,
    handleRefresh,
    formKey,
    isTeacherFormOpen,
    editingTeacher,
    handleOpenCreateTeacher,
    handleOpenEditTeacher,
    handleCloseTeacherForm,
    handleTeacherFormSubmit,
    isAssignModalOpen,
    assigningTeacher,
    handleOpenAssignClasses,
    handleCloseAssignModal,
    handleAssignClassesSubmit,
    isResetPasswordOpen,
    resettingTeacher,
    handleOpenResetPassword,
    handleCloseResetPassword,
    handleResetPasswordSubmit,
    handleToggleTeacherStatus,
    handleViewTeacherDetails,
    isDeleteModalOpen,
    deletingTeacher,
    handleOpenDeleteModal,
    handleCloseDeleteModal,
    handleConfirmDelete,
  };
}
