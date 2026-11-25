import { useTeacherClassesContext } from "@/features/teacher/class-management/contexts/TeacherClassesContext";
import { ClassCard } from "./ClassCard";

/**
 * Danh sách thẻ lớp học hiển thị trên thiết bị di động (màn hình < md)
 * - Đọc danh sách và các hàm hành động trực tiếp từ Feature Context
 */
export function ClassesMobileList() {
  const { paginatedClasses } = useTeacherClassesContext();

  return (
    <div className="md:hidden p-4 space-y-3 bg-slate-50/50">
      {paginatedClasses.map((item) => (
        <ClassCard key={item.id} item={item} />
      ))}
    </div>
  );
}
