import { useManageTeachersContext } from "@/features/teacher/teacher-management/contexts/ManageTeachersContext";
import { TeacherCard } from "./TeacherCard";

/**
 * Danh sách thẻ giáo viên hiển thị trên thiết bị di động (màn hình < md)
 * - Đọc danh sách và các hàm hành động trực tiếp từ Feature Context
 */
export function TeachersMobileList() {
  const { paginatedTeachers } = useManageTeachersContext();

  return (
    <div className="md:hidden p-4 space-y-3 bg-slate-50/50">
      {paginatedTeachers.map((item) => (
        <TeacherCard key={item.id} item={item} />
      ))}
    </div>
  );
}
