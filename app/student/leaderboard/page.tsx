import { Suspense } from "react";
import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth/guard";
import { UserRole } from "@/constants/auth";
import { getStudentLeaderboardServer } from "@/features/student/leaderboard/services/studentLeaderboardServerService";
import { LeaderboardView } from "@/features/student/leaderboard/components/LeaderboardView";
import { StudentLeaderboardSkeleton } from "@/features/student/leaderboard/components/StudentLeaderboardSkeleton";

export const metadata: Metadata = {
  title: "Bảng xếp hạng vinh danh - Student Coin Portal",
  description:
    "Bảng vinh danh Top Xu học tập và 2 bảng Tiến Bộ theo nhóm phong độ trong tháng",
};

/**
 * Server Container nạp trực tiếp dữ liệu 3 bảng xếp hạng trên máy chủ (0ms trễ mạng client)
 */
async function StudentLeaderboardDataContainer() {
  const session = await requireAuth([
    UserRole.STUDENT,
    UserRole.TEACHER,
    UserRole.SUPER_TEACHER,
    UserRole.ADMIN,
  ]);

  const initialData = await getStudentLeaderboardServer(session, {
    period: "current_month",
  });

  return <LeaderboardView initialData={initialData} />;
}

/**
 * Thin Page Pattern với Streaming Suspense & Pure Server Skeleton
 */
export default function LeaderboardPage() {
  return (
    <Suspense fallback={<StudentLeaderboardSkeleton />}>
      <StudentLeaderboardDataContainer />
    </Suspense>
  );
}
