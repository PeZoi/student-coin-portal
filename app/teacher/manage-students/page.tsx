import { Metadata } from "next";
import { TeacherManageStudentsView } from "@/features/teacher/components/TeacherManageStudentsView";

export const metadata: Metadata = {
  title: "Quản Lý Học Sinh Toàn Trường | Quản Trị Trường",
  description: "Tra cứu học sinh, quản lý mã PIN và phân bổ chuyển lớp",
};

export default function ManageStudentsPage() {
  return <TeacherManageStudentsView />;
}
