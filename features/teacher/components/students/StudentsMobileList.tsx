import { useManageStudentsContext } from "../../contexts/ManageStudentsContext";
import { StudentCard } from "./StudentCard";

/**
 * Danh sách thẻ học sinh hiển thị trên thiết bị di động (màn hình < md)
 * - Đọc danh sách và các hàm hành động trực tiếp từ Feature Context
 */
export function StudentsMobileList() {
  const {
    filteredStudents,
    isSelected,
    handleToggleSelect,
    handleOpenChangeClass,
    handleOpenEditStudent,
    handleOpenAdjustCoins,
    handleOpenResetPin,
    handleToggleStudentStatus,
    handleOpenDeleteModal,
    handleRestoreStudent,
    handleOpenPermanentModal,
    restoringId,
  } = useManageStudentsContext();

  return (
    <div className="md:hidden p-4 space-y-3 bg-slate-50/50">
      {filteredStudents.map((item) => (
        <StudentCard
          key={item.id}
          item={item}
          isSelected={isSelected(item.id)}
          onToggleSelect={handleToggleSelect}
          onChangeClass={handleOpenChangeClass}
          onEdit={handleOpenEditStudent}
          onAdjustCoins={handleOpenAdjustCoins}
          onResetPin={handleOpenResetPin}
          onToggleStatus={handleToggleStudentStatus}
          onDelete={handleOpenDeleteModal}
          onRestore={handleRestoreStudent}
          onPermanentDelete={handleOpenPermanentModal}
          isRestoring={restoringId === item.id}
        />
      ))}
    </div>
  );
}

