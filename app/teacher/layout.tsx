import { Metadata } from "next";
import { TeacherLayoutShell } from "@/features/teacher/components/layout/TeacherLayoutShell";

export const metadata: Metadata = {
  title: "Góc Giáo Viên | Student Coin Portal",
  description: "Bàn làm việc quản lý bài tập, lớp học và khen thưởng học sinh",
};

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TeacherLayoutShell>{children}</TeacherLayoutShell>;
}
