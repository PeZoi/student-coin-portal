import { Metadata } from "next";
import { TeacherLeaderboardView } from "@/features/teacher/components/TeacherLeaderboardView";

export const metadata: Metadata = {
  title: "Bảng Vàng Thi Đua | Góc Giáo Viên",
  description: "Bảng xếp hạng thi đua tích lũy xu và rèn luyện học tập",
};

export default function LeaderboardPage() {
  return <TeacherLeaderboardView />;
}
