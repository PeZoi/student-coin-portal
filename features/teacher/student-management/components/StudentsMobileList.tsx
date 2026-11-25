import { useManageStudentsContext } from "@/features/teacher/student-management/contexts/ManageStudentsContext";
import { StudentCard } from "./StudentCard";

/**
 * Danh sách thẻ học sinh hiển thị trên thiết bị di động (màn hình < md)
 * - Đọc danh sách và các hàm hành động trực tiếp từ Feature Context
 */
export function StudentsMobileList() {
  const { paginatedStudents } = useManageStudentsContext();

  return (
    <div className="md:hidden p-4 space-y-3 bg-slate-50/50">
      {paginatedStudents.map((item) => (
        <StudentCard key={item.id} item={item} />
      ))}
    </div>
  );
}

