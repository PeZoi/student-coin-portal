import { Metadata } from "next";
import { TeacherSubmissionsView } from "@/features/teacher/components/TeacherSubmissionsView";

export const metadata: Metadata = {
  title: "Duyệt Bài Tập | Góc Giáo Viên",
  description: "Duyệt bài tập và chấm thưởng xu Heo Đất cho học sinh",
};

export default function SubmissionsPage() {
  return <TeacherSubmissionsView />;
}
