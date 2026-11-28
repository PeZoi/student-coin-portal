import { Metadata } from "next";
import { Suspense } from "react";
import { cookies } from "next/headers";
import { requireTeacher } from "@/lib/auth/guard";
import { UserRole } from "@/constants/auth";
import { getMyAssignedClassesServer } from "@/features/teacher/class-management/services/classServerService";
import { TEACHER_WORKSPACE_COOKIE_NAME } from "@/stores/useTeacherWorkspaceStore";
import { getTeacherLeaderboardServer } from "@/features/teacher/leaderboard/services/leaderboardServerService";
import { TeacherLeaderboardView } from "@/features/teacher/leaderboard/components/TeacherLeaderboardView";
import { LeaderboardPageSkeleton } from "@/features/teacher/leaderboard/components/LeaderboardSkeleton";

export const metadata: Metadata = {
  title: "Bảng xếp hạng thi đua | Góc Giáo Viên",
  description:
    "Bảng xếp hạng Top xu tích lũy tháng và 2 bảng xếp hạng Tiến bộ theo nhóm phong độ.",
};

/**
 * Server Container nạp trực tiếp 3 bảng xếp hạng trên máy chủ theo lớp đang chọn ở Header Workspace
 * - Tối ưu 0ms độ trễ mạng client (Quy tắc 9 AGENTS.md)
 */
async function LeaderboardDataContainer() {
  const session = await requireTeacher();
  const cookieStore = await cookies();
  const cookieClassId = cookieStore.get(TEACHER_WORKSPACE_COOKIE_NAME)?.value;

  const isHighPrivilege =
    session.role === UserRole.ADMIN || session.role === UserRole.SUPER_TEACHER;

  const teacherClasses = await getMyAssignedClassesServer(session);

  let activeClassId = "all";
  if (cookieClassId === "all" && isHighPrivilege) {
    activeClassId = "all";
  } else if (
    cookieClassId &&
    teacherClasses.some((c) => c.id === cookieClassId)
  ) {
    activeClassId = cookieClassId;
  } else if (!isHighPrivilege && teacherClasses.length > 0) {
    activeClassId = teacherClasses[0].id;
  }

  const initialData = await getTeacherLeaderboardServer(session, {
    classId: activeClassId,
  });

  return (
    <TeacherLeaderboardView
      initialData={initialData}
      initialClassId={activeClassId}
    />
  );
}

/**
 * Thin Page Pattern với Streaming Suspense & Pure Server Skeleton
 */
export default function LeaderboardPage() {
  return (
    <Suspense fallback={<LeaderboardPageSkeleton />}>
      <LeaderboardDataContainer />
    </Suspense>
  );
}
