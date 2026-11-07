import { Metadata } from "next";
import { TeacherMissionsView } from "@/features/teacher/components/TeacherMissionsView";

export const metadata: Metadata = {
  title: "Nhiệm Vụ Lớp Học | Góc Giáo Viên",
  description: "Quản lý và giao nhiệm vụ học tập cho học sinh",
};

export default function MissionsPage() {
  return <TeacherMissionsView />;
}
