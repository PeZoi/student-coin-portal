import { useTeacherClassesContext } from "@/features/class-management/contexts/TeacherClassesContext";
import { ClassCard } from "./ClassCard";

/**
 * Danh sách thẻ lớp học hiển thị trên thiết bị di động (màn hình < md)
 * - Đọc danh sách và các hàm hành động trực tiếp từ Feature Context
 */
export function ClassesMobileList() {
  const {
    paginatedClasses,
    handleOpenAssignTeacher,
    handleOpenEditClass,
    handleToggleClassStatus,
    handleOpenDeleteModal,
    handleRestoreClass,
    handleOpenPermanentModal,
    handleOpenStudentsModal,
    isAdmin,
    selectedIds,
    handleToggleSelect,
  } = useTeacherClassesContext();

  return (
    <div className="md:hidden p-4 space-y-3 bg-slate-50/50">
      {paginatedClasses.map((item) => (
        <ClassCard
          key={item.id}
          item={item}
          onAssignTeacher={handleOpenAssignTeacher}
          onEdit={handleOpenEditClass}
          onToggleStatus={handleToggleClassStatus}
          onDelete={handleOpenDeleteModal}
          onRestore={handleRestoreClass}
          onPermanentDelete={handleOpenPermanentModal}
          onOpenStudents={handleOpenStudentsModal}
          isSelected={selectedIds.includes(item.id)}
          onToggleSelect={isAdmin ? handleToggleSelect : undefined}
        />
      ))}
    </div>
  );
}
