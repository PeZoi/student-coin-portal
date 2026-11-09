import { useTeacherClassesContext } from "../../contexts/TeacherClassesContext";
import { ClassCard } from "./ClassCard";

/**
 * Danh sách thẻ lớp học hiển thị trên thiết bị di động (màn hình < md)
 * - Đọc danh sách và các hàm hành động trực tiếp từ Feature Context
 */
export function ClassesMobileList() {
  const {
    filteredClasses,
    handleOpenAssignTeacher,
    handleOpenEditClass,
    handleToggleClassStatus,
    handleViewClassDetails,
    handleOpenDeleteModal,
  } = useTeacherClassesContext();

  return (
    <div className="md:hidden p-4 space-y-3 bg-slate-50/50">
      {filteredClasses.map((item) => (
        <ClassCard
          key={item.id}
          item={item}
          onAssignTeacher={handleOpenAssignTeacher}
          onEdit={handleOpenEditClass}
          onToggleStatus={handleToggleClassStatus}
          onViewClassDetails={handleViewClassDetails}
          onDelete={handleOpenDeleteModal}
        />
      ))}
    </div>
  );
}
