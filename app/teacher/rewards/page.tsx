import { Metadata } from "next";
import { TeacherRewardsView } from "@/features/reward-management";

export const metadata: Metadata = {
  title: "Đổi Quà | Góc Giáo Viên",
  description: "Duyệt yêu cầu đổi quà và quản lý danh mục quà tặng trong lớp học",
};

export default function RewardsPage() {
  return <TeacherRewardsView />;
}
