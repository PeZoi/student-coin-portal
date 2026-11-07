import { Metadata } from "next";
import { TeacherManageTeachersView } from "@/features/teacher/components/TeacherManageTeachersView";

export const metadata: Metadata = {
  title: "Quản Lý Giáo Viên | Quản Trị Trường",
  description: "Quản lý nhân sự giáo viên, phân công lớp và phân quyền hệ thống",
};

export default function ManageTeachersPage() {
  return <TeacherManageTeachersView />;
}
