import { Metadata } from "next";
import { TeacherClassesView } from "@/features/teacher/components/TeacherClassesView";

export const metadata: Metadata = {
  title: "Quản Lý Lớp Học | Quản Trị Trung Tâm",
  description: "Quản lý danh sách ca học và phân công giáo viên phụ trách tại trung tâm",
};

export default function ClassesPage() {
  return <TeacherClassesView />;
}
