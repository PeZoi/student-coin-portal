import { Metadata } from "next";
import { TeacherClassesView } from "@/features/teacher/components/TeacherClassesView";

export const metadata: Metadata = {
  title: "Quản Lý Lớp Học | Quản Trị Trường",
  description: "Quản lý danh sách lớp học và phân công giáo viên phụ trách",
};

export default function ClassesPage() {
  return <TeacherClassesView />;
}
