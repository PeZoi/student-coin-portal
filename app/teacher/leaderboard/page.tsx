import { Metadata } from "next";
import { TeacherLeaderboardView } from "@/features/teacher/leaderboard/components/TeacherLeaderboardView";

export const metadata: Metadata = {
  title: "Bảng xếp hạng thi đua | Góc Giáo Viên",
  description:
    "Bảng xếp hạng Top xu tích lũy tháng và 2 bảng xếp hạng Tiến bộ theo nhóm phong độ.",
};

export default function LeaderboardPage() {
  return <TeacherLeaderboardView />;
}
