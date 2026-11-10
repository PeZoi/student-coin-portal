import { useManageTeachersContext } from "../../contexts/ManageTeachersContext";
import { TeacherCard } from "./TeacherCard";

/**
 * Danh sách thẻ giáo viên hiển thị trên thiết bị di động (màn hình < md)
 * - Đọc danh sách và các hàm hành động trực tiếp từ Feature Context
 */
export function TeachersMobileList() {
  const {
    filteredTeachers,
    handleOpenAssignClasses,
    handleOpenEditTeacher,
    handleOpenResetPassword,
    handleToggleTeacherStatus,
    handleViewTeacherDetails,
    handleOpenDeleteModal,
    handleRestoreTeacher,
    handleOpenPermanentModal,
    restoringId,
  } = useManageTeachersContext();

  return (
    <div className="md:hidden p-4 space-y-3 bg-slate-50/50">
      {filteredTeachers.map((item) => (
        <TeacherCard
          key={item.id}
          item={item}
          onAssignClasses={handleOpenAssignClasses}
          onEdit={handleOpenEditTeacher}
          onResetPassword={handleOpenResetPassword}
          onToggleStatus={handleToggleTeacherStatus}
          onViewDetails={handleViewTeacherDetails}
          onDelete={handleOpenDeleteModal}
          onRestore={handleRestoreTeacher}
          onPermanentDelete={handleOpenPermanentModal}
          isRestoring={restoringId === item.id}
        />
      ))}
    </div>
  );
}
