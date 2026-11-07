import { Metadata } from "next";
import { TeacherStudentsView } from "@/features/teacher/components/TeacherStudentsView";

export const metadata: Metadata = {
  title: "Hồ Sơ Học Sinh | Góc Giáo Viên",
  description: "Quản lý danh sách học sinh, Heo Đất và mã PIN",
};

export default function StudentsPage() {
  return <TeacherStudentsView />;
}
