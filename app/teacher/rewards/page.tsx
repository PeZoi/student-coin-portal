import { Metadata } from "next";
import { TeacherRewardsView } from "@/features/teacher/components/TeacherRewardsView";

export const metadata: Metadata = {
  title: "Kho Quà & Đổi Quà | Góc Giáo Viên",
  description: "Duyệt yêu cầu đổi quà và quản lý danh mục quà tặng trong lớp học",
};

export default function RewardsPage() {
  return <TeacherRewardsView />;
}
