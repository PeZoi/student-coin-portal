"use client";

import { useState, useMemo, useCallback, useDeferredValue } from "react";
import useSWR, { mutate as globalMutate } from "swr";
import { toast } from "sonner";
import {
  TeacherClassItem,
  StatusFilter,
  SortField,
  SortDirection,
} from "../components/classes/types";
import { teacherClassService } from "../services/teacherClassService";
import { normalizeText, parseDate } from "../components/classes/utils";

const SWR_KEY_CLASSES = "teacher-classes";
const SWR_KEY_TEACHERS = "available-teachers";

export function useTeacherClasses(initialClasses?: TeacherClassItem[]) {
  // 1. Quản lý danh sách lớp học qua SWR (Quy tắc 9): 0 dòng useEffect, tự động cache
  const {
    data: classesList = initialClasses ?? [],
    isLoading,
    isValidating: isRefreshing,
    error,
    mutate,
  } = useSWR(SWR_KEY_CLASSES, () => teacherClassService.getClasses(), {
    fallbackData: initialClasses,
    revalidateOnMount: initialClasses ? false : true,
    revalidateIfStale: !initialClasses,
    revalidateOnFocus: false,
    dedupingInterval: 30000,
  });

  // State Modal Phân công giáo viên
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assigningClass, setAssigningClass] = useState<TeacherClassItem | null>(null);

  // 2. Lazy-load giáo viên qua SWR: chỉ gọi API khi modal phân công được mở
  const { data: availableTeachers = [], isLoading: isLoadingTeachers } = useSWR(
    isAssignModalOpen ? SWR_KEY_TEACHERS : null,
    () => teacherClassService.getAvailableTeachers(),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Bộ lọc và sắp xếp
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  // Tối ưu gõ phím: Giữ ô input phản hồi 120fps tức thì, hoãn tác vụ tính toán lọc sang luồng phụ
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("none");

  // State Modal Tạo / Chỉnh sửa
  const [isClassFormOpen, setIsClassFormOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<TeacherClassItem | null>(null);
  const [formKey, setFormKey] = useState(0);

  // Làm mới dữ liệu lớp học khi bấm nút Refresh trên Toolbar
  const handleRefresh = useCallback(async () => {
    try {
      await Promise.all([mutate(), globalMutate(SWR_KEY_TEACHERS)]);
      toast.success("Đã làm mới danh sách lớp học!");
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error("Lỗi khi làm mới dữ liệu lớp học:", error.message);
      toast.error(error.message || "Không thể làm mới danh sách.");
    }
  }, [mutate]);

  // Tính toán KPI phái sinh
  const { totalClasses, activeClasses, inactiveClasses, totalStudents, totalTeachers } =
    useMemo(() => {
      const total = classesList.length;
      let active = 0;
      let students = 0;
      const teacherSet = new Set<string>();

      for (const c of classesList) {
        if (c.is_active) active += 1;
        students += c.student_count;
        for (const t of c.teachers) {
          teacherSet.add(t);
        }
      }

      return {
        totalClasses: total,
        activeClasses: active,
        inactiveClasses: total - active,
        totalStudents: students,
        totalTeachers: teacherSet.size,
      };
    }, [classesList]);

  // Toggle sắp xếp: asc -> desc -> none
  const handleSortToggle = (field: SortField) => {
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

  // Lọc và sắp xếp danh sách lớp
  const filteredClasses = useMemo(() => {
    const normalizedQuery = normalizeText(deferredSearchQuery);

    const list = classesList.filter((c) => {
      if (statusFilter === "active" && !c.is_active) return false;
      if (statusFilter === "inactive" && c.is_active) return false;

      if (normalizedQuery) {
        const matchClassName = normalizeText(c.class_name).includes(normalizedQuery);
        const matchTeacher = c.teachers.some((t) => normalizeText(t).includes(normalizedQuery));
        if (!matchClassName && !matchTeacher) return false;
      }

      return true;
    });

    if (!sortField || sortDirection === "none") {
      return list;
    }

    return [...list].sort((a, b) => {
      let result = 0;

      if (sortField === "class_name") {
        result = a.class_name.localeCompare(b.class_name, "vi", { numeric: true });
      } else if (sortField === "student_count") {
        result = a.student_count - b.student_count;
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
  }, [classesList, statusFilter, deferredSearchQuery, sortField, sortDirection]);

  const handleResetFilter = () => {
    setStatusFilter("all");
    setSearchQuery("");
  };

  const handleOpenCreateClass = () => {
    setEditingClass(null);
    setFormKey((k) => k + 1);
    setIsClassFormOpen(true);
  };

  const handleOpenEditClass = (item: TeacherClassItem) => {
    setEditingClass(item);
    setIsClassFormOpen(true);
  };

  const handleCloseClassForm = () => {
    setIsClassFormOpen(false);
    setEditingClass(null);
  };

  // Submit tạo / sửa lớp qua API (Cập nhật trực tiếp vào SWR cache, không nháy UI)
  const handleClassFormSubmit = async (
    data: { class_name: string; is_active: boolean }
  ): Promise<boolean> => {
    try {
      setIsSubmitting(true);
      if (editingClass) {
        const updated = await teacherClassService.updateClass(editingClass.id, data);
        const nextList = classesList.map((c) =>
          c.id === editingClass.id
            ? { ...c, class_name: updated.class_name, is_active: updated.is_active }
            : c
        );
        await mutate(nextList, false);
        toast.success("Cập nhật thông tin lớp học thành công!");
      } else {
        const newClass = await teacherClassService.createClass(data);
        await mutate([newClass, ...classesList], false);
        toast.success("Tạo lớp học mới thành công!");
      }
      setFormKey((k) => k + 1);
      setIsClassFormOpen(false);
      setEditingClass(null);
      return true;
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(error.message || "Thao tác không thành công.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenAssignTeacher = (item: TeacherClassItem) => {
    setAssigningClass(item);
    setIsAssignModalOpen(true);
  };

  const handleCloseAssignModal = () => {
    setIsAssignModalOpen(false);
    setAssigningClass(null);
  };

  // Submit phân công giáo viên (Cập nhật trực tiếp SWR cache và revalidate danh sách giáo viên)
  const handleAssignTeacherSubmit = async (
    classId: string,
    assignedTeacherIds: string[]
  ): Promise<boolean> => {
    try {
      setIsSubmitting(true);
      const res = await teacherClassService.assignTeachers(classId, assignedTeacherIds);
      const nextList = classesList.map((c) =>
        c.id === classId
          ? { ...c, teachers: res.teachers, teacher_ids: res.teacher_ids }
          : c
      );
      await mutate(nextList, false);
      // Làm mới dữ liệu số lớp đang dạy của giáo viên ngầm
      void globalMutate(SWR_KEY_TEACHERS);

      toast.success("Phân công giáo viên thành công!");
      setIsAssignModalOpen(false);
      setAssigningClass(null);
      return true;
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(error.message || "Không thể phân công giáo viên.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Bật / tắt trạng thái kích hoạt qua API (Cập nhật lạc quan vào SWR cache)
  const handleToggleClassStatus = async (item: TeacherClassItem) => {
    const nextStatus = !item.is_active;
    const optimisticList = classesList.map((c) =>
      c.id === item.id ? { ...c, is_active: nextStatus } : c
    );

    try {
      // Cập nhật lạc quan
      await mutate(optimisticList, false);

      await teacherClassService.updateClass(item.id, { is_active: nextStatus });
      toast.success(
        nextStatus ? "Đã hiện lại lớp học!" : "Đã chuyển lớp học sang trạng thái tạm ẩn!"
      );
    } catch (err: unknown) {
      // Rollback nếu thất bại
      await mutate(classesList, false);
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(error.message || "Không thể cập nhật trạng thái lớp học.");
    }
  };

  const handleViewClassDetails = (item: TeacherClassItem) => {
    toast.info(`Xem chi tiết lớp: ${item.class_name}`);
  };

  // State Modal Xác nhận Xóa lớp học
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingClass, setDeletingClass] = useState<TeacherClassItem | null>(null);

  const handleOpenDeleteModal = (item: TeacherClassItem) => {
    setDeletingClass(item);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingClass(null);
  };

  // Xóa mềm lớp học qua API (Cập nhật lạc quan vào SWR cache)
  const handleConfirmDelete = async (): Promise<boolean> => {
    if (!deletingClass) return false;

    try {
      setIsSubmitting(true);
      await teacherClassService.deleteClass(deletingClass.id);
      const nextList = classesList.filter((c) => c.id !== deletingClass.id);
      await mutate(nextList, false);
      toast.success(`Đã xóa lớp "${deletingClass.class_name}" thành công!`);
      handleCloseDeleteModal();
      return true;
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(error.message || "Không thể xóa lớp học.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    classesList,
    availableTeachers,
    isLoading,
    isRefreshing,
    isError: Boolean(error),
    isSubmitting,
    isLoadingTeachers,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    sortField,
    sortDirection,
    handleSortToggle,
    totalClasses,
    activeClasses,
    inactiveClasses,
    totalStudents,
    totalTeachers,
    filteredClasses,
    handleResetFilter,
    handleRefresh,
    formKey,
    isClassFormOpen,
    editingClass,
    handleOpenCreateClass,
    handleOpenEditClass,
    handleCloseClassForm,
    handleClassFormSubmit,
    isAssignModalOpen,
    assigningClass,
    handleOpenAssignTeacher,
    handleCloseAssignModal,
    handleAssignTeacherSubmit,
    handleToggleClassStatus,
    handleViewClassDetails,
    isDeleteModalOpen,
    deletingClass,
    handleOpenDeleteModal,
    handleCloseDeleteModal,
    handleConfirmDelete,
  };
}
