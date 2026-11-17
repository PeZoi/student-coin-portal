import { Metadata } from "next";
import { StudentRosterView } from "@/features/student-roster/components/StudentRosterView";

export const metadata: Metadata = {
  title: "Hồ Sơ Học Sinh | Góc Giáo Viên",
  description: "Quản lý danh sách học sinh, Heo Đất và mã PIN",
};

export default function StudentsPage() {
  return <StudentRosterView />;
}
