import { LeaderboardView } from "@/features/leaderboard/components/LeaderboardView";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bảng xếp hạng vinh danh - Student Coin Portal",
  description: "Bảng vinh danh top học sinh tích lũy nhiều xu nhất và có tiến bộ vượt bậc nhất trong tháng",
};

export default function LeaderboardPage() {
  return <LeaderboardView />;
}

