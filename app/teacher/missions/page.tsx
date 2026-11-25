import { Metadata } from "next";
import { Suspense } from "react";
import { cookies } from "next/headers";
import { requireTeacher } from "@/lib/auth/guard";
import { ManageMissionsView } from "@/features/teacher/mission-management/components/ManageMissionsView";
import { MissionsSkeleton } from "@/features/teacher/mission-management/components/MissionsSkeleton";
import { getTeacherMissionsServer } from "@/features/teacher/mission-management/services/missionServerService";
import { getMyAssignedClassesServer } from "@/features/teacher/class-management/services/classServerService";
import { TEACHER_WORKSPACE_COOKIE_NAME } from "@/stores/useTeacherWorkspaceStore";

export const metadata: Metadata = {
  title: "Giao Bài Tập | Góc Giáo Viên",
  description:
    "Quản lý, giao bài tập cho học sinh và cấu hình tiêu chí chấm bài AI",
};

/**
 * Server Container nạp dữ liệu song song trực tiếp trên máy chủ
 * - Tối ưu 0ms độ trễ mạng client (Quy tắc 9 AGENTS.md)
 * - Tự động nhận diện lớp học đang chọn qua Cookie hoặc lớp phụ trách đầu tiên
 */
async function MissionsDataContainer() {
  const session = await requireTeacher();
  const cookieStore = await cookies();
  const cookieClassId = cookieStore.get(TEACHER_WORKSPACE_COOKIE_NAME)?.value;

  // 1. Tải danh sách lớp giáo viên được phân công phụ trách
  const teacherClasses = await getMyAssignedClassesServer(session);

  // 2. Xác định lớp học đang chọn: Ưu tiên cookie nếu hợp lệ, nếu không thì lấy lớp đầu tiên
  const isValidClass =
    cookieClassId && teacherClasses.some((c) => c.id === cookieClassId);
  const activeClassId = isValidClass
    ? cookieClassId
    : teacherClasses.length > 0
    ? teacherClasses[0].id
    : undefined;

  // 3. Tải bài tập của đúng lớp đó trên server
  const initialMissions = await getTeacherMissionsServer(session, {
    classId: activeClassId,
  });

  const initialClasses = teacherClasses.map((c) => ({
    id: c.id,
    class_name: c.class_name,
    student_count: c.student_count ?? 0,
    is_active: true,
  }));

  return (
    <ManageMissionsView
      initialMissions={initialMissions}
      initialClasses={initialClasses}
      userRole={session.role}
      initialClassId={activeClassId}
    />
  );
}

export default function MissionsPage() {
  return (
    <Suspense fallback={<MissionsSkeleton />}>
      <MissionsDataContainer />
    </Suspense>
  );
}
