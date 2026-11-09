"use client";

import { useState, useMemo } from "react";
import { Plus, Search } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { MockClassItem, StatusFilter, SortField, SortDirection } from "./classes/types";
import { INITIAL_MOCK_CLASSES } from "./classes/constants";
import { normalizeText, parseDate } from "./classes/utils";
import { ClassesKpiCards } from "./classes/ClassesKpiCards";
import { ClassesToolbar } from "./classes/ClassesToolbar";
import { ClassesTable } from "./classes/ClassesTable";
import { ClassCard } from "./classes/ClassCard";
import { ClassFormModal } from "./classes/ClassFormModal";
import { AssignTeachersModal } from "./classes/AssignTeachersModal";

export function TeacherClassesView() {
  const [classesList, setClassesList] = useState<MockClassItem[]>(INITIAL_MOCK_CLASSES);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("none");

  // State quản lý modal Tạo/Chỉnh sửa lớp học
  const [isClassFormOpen, setIsClassFormOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<MockClassItem | null>(null);

  // State quản lý modal Phân công giáo viên
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assigningClass, setAssigningClass] = useState<MockClassItem | null>(null);

  // 1.1 Tính toán số liệu KPI và số đếm trong các tab lọc từ dữ liệu
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

  // 1.3 Logic chuyển đổi thứ tự sắp xếp: asc -> desc -> none (bỏ sắp xếp)
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

  // 1.2 Lọc theo trạng thái và tìm kiếm không phân biệt dấu, sau đó sắp xếp
  const filteredClasses = useMemo(() => {
    const normalizedQuery = normalizeText(searchQuery);

    // Bước 1: Lọc dữ liệu
    const list = classesList.filter((c) => {
      // Lọc trạng thái
      if (statusFilter === "active" && !c.is_active) return false;
      if (statusFilter === "inactive" && c.is_active) return false;

      // Tìm kiếm theo tên lớp hoặc tên giáo viên
      if (normalizedQuery) {
        const matchClassName = normalizeText(c.class_name).includes(normalizedQuery);
        const matchTeacher = c.teachers.some((t) => normalizeText(t).includes(normalizedQuery));
        if (!matchClassName && !matchTeacher) return false;
      }

      return true;
    });

    // Bước 2: Sắp xếp nếu có chọn cột
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

        // Nếu ngày không hợp lệ thì xếp xuống cuối
        if (timeA === -1 && timeB === -1) result = 0;
        else if (timeA === -1) return 1;
        else if (timeB === -1) return -1;
        else result = timeA - timeB;
      }

      return sortDirection === "desc" ? -result : result;
    });
  }, [classesList, statusFilter, searchQuery, sortField, sortDirection]);

  // Xóa bộ lọc (reset về tất cả và xóa tìm kiếm)
  const handleResetFilter = () => {
    setStatusFilter("all");
    setSearchQuery("");
  };

  // Xử lý mở modal tạo lớp học mới
  const handleOpenCreateClass = () => {
    setEditingClass(null);
    setIsClassFormOpen(true);
  };

  // Xử lý mở modal chỉnh sửa lớp học
  const handleOpenEditClass = (item: MockClassItem) => {
    setEditingClass(item);
    setIsClassFormOpen(true);
  };

  // Xử lý submit form tạo/chỉnh sửa lớp học
  const handleClassFormSubmit = (data: { class_name: string; is_active: boolean }) => {
    // TODO: nối API tạo/sửa lớp học vào DB
    if (editingClass) {
      setClassesList((prev) =>
        prev.map((c) =>
          c.id === editingClass.id
            ? { ...c, class_name: data.class_name, is_active: data.is_active }
            : c
        )
      );
      toast.success("Cập nhật thông tin lớp học thành công!");
    } else {
      const newClass: MockClassItem = {
        id: `c-${Date.now()}`,
        class_name: data.class_name,
        is_active: data.is_active,
        student_count: 0,
        teachers: [],
        created_at: format(new Date(), "dd/MM/yyyy"),
      };
      setClassesList((prev) => [newClass, ...prev]);
      toast.success("Tạo lớp học mới thành công!");
    }

    setIsClassFormOpen(false);
    setEditingClass(null);
  };

  // Xử lý mở modal phân công giáo viên
  const handleOpenAssignTeacher = (item: MockClassItem) => {
    setAssigningClass(item);
    setIsAssignModalOpen(true);
  };

  // Xử lý submit phân công giáo viên
  const handleAssignTeacherSubmit = (classId: string, assignedTeachers: string[]) => {
    // TODO: nối API phân công giáo viên vào DB
    setClassesList((prev) =>
      prev.map((c) => (c.id === classId ? { ...c, teachers: assignedTeachers } : c))
    );
    toast.success("Phân công giáo viên thành công!");
    setIsAssignModalOpen(false);
    setAssigningClass(null);
  };

  // Xử lý thay đổi nhanh trạng thái kích hoạt / tạm ẩn
  const handleToggleClassStatus = (item: MockClassItem) => {
    // TODO: nối API thay đổi trạng thái lớp
    const nextStatus = !item.is_active;
    setClassesList((prev) =>
      prev.map((c) => (c.id === item.id ? { ...c, is_active: nextStatus } : c))
    );
    toast.success(
      nextStatus ? "Đã hiện lại lớp học!" : "Đã chuyển lớp học sang trạng thái tạm ẩn!"
    );
  };

  const handleViewClassDetails = (item: MockClassItem) => {
    // TODO: mở chi tiết lớp
    toast.info(`Xem chi tiết lớp: ${item.class_name}`);
  };

  return (
    <div className="space-y-5">
      {/* 1. Header Trang: Đặt thẳng trên nền, không card, không viền */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] font-heading tracking-tight">
            Quản lý lớp học
          </h1>
          <p className="text-sm sm:text-[15px] text-[#475569] mt-1">
            Danh sách lớp học / ca học và phân công giáo viên phụ trách.
          </p>
        </div>

        {/* Nút Tạo lớp học mới: h-10 px-4, màu chính #0A62D6, full width trên mobile */}
        <button
          type="button"
          onClick={handleOpenCreateClass}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-[#0A62D6] hover:bg-[#0850B0] text-white text-sm font-semibold transition-all shadow-xs cursor-pointer active:scale-98 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo lớp học mới</span>
        </button>
      </div>

      {/* 2. Thẻ Thống kê KPI */}
      <ClassesKpiCards
        totalClasses={totalClasses}
        activeClasses={activeClasses}
        totalStudents={totalStudents}
        totalTeachers={totalTeachers}
      />

      {/* 3. Gộp Toolbar và Danh sách lớp vào MỘT card duy nhất */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Thanh lọc & tìm kiếm */}
        <ClassesToolbar
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          totalCount={totalClasses}
          activeCount={activeClasses}
          inactiveCount={inactiveClasses}
        />

        {/* Đường kẻ phân cách */}
        <div className="border-b border-slate-200" />

        {/* Hiển thị nội dung: Trạng thái rỗng hoặc Danh sách lớp */}
        {filteredClasses.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-[#0F172A]">
              Không tìm thấy lớp học nào
            </h3>
            <p className="text-sm text-[#475569] mt-1">
              Thử đổi từ khóa hoặc bộ lọc nhé
            </p>
            <button
              type="button"
              onClick={handleResetFilter}
              className="mt-4 inline-flex items-center justify-center h-9 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[13px] font-semibold transition-colors cursor-pointer"
            >
              Xóa bộ lọc
            </button>
          </div>
        ) : (
          <>
            {/* Desktop: Bảng dữ liệu (từ md trở lên) */}
            <div className="hidden md:block">
              <ClassesTable
                items={filteredClasses}
                sortField={sortField}
                sortDirection={sortDirection}
                onSortToggle={handleSortToggle}
                onAssignTeacher={handleOpenAssignTeacher}
                onEdit={handleOpenEditClass}
                onToggleStatus={handleToggleClassStatus}
                onViewClassDetails={handleViewClassDetails}
              />
            </div>

            {/* Mobile: Danh sách thẻ (dưới md) */}
            <div className="md:hidden p-4 space-y-3 bg-slate-50/50">
              {filteredClasses.map((item) => (
                <ClassCard
                  key={item.id}
                  item={item}
                  onAssignTeacher={handleOpenAssignTeacher}
                  onEdit={handleOpenEditClass}
                  onToggleStatus={handleToggleClassStatus}
                  onViewClassDetails={handleViewClassDetails}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* 4. Modal Tạo / Chỉnh sửa lớp học */}
      <ClassFormModal
        key={editingClass ? `edit-${editingClass.id}` : "create-new-class"}
        isOpen={isClassFormOpen}
        initialData={editingClass}
        onClose={() => {
          setIsClassFormOpen(false);
          setEditingClass(null);
        }}
        onSubmit={handleClassFormSubmit}
      />

      {/* 5. Modal Phân công giáo viên phụ trách */}
      <AssignTeachersModal
        key={assigningClass ? `assign-${assigningClass.id}` : "assign-none"}
        isOpen={isAssignModalOpen}
        classItem={assigningClass}
        onClose={() => {
          setIsAssignModalOpen(false);
          setAssigningClass(null);
        }}
        onSubmit={handleAssignTeacherSubmit}
      />
    </div>
  );
}
