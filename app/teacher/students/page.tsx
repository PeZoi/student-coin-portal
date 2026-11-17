import { Metadata } from "next";
import { Suspense } from "react";
import { cookies } from "next/headers";
import { requireTeacher } from "@/lib/auth/guard";
import { StudentRosterView } from "@/features/student-roster/components/StudentRosterView";
import { StudentRosterSkeleton } from "@/features/student-roster/components/StudentRosterSkeleton";
import { getTeacherStudentRosterServer } from "@/features/student-roster/services/studentRosterServerService";
import { getMyAssignedClassesServer } from "@/features/class-management/services/classServerService";
import { TEACHER_WORKSPACE_COOKIE_NAME } from "@/stores/useTeacherWorkspaceStore";

export const metadata: Metadata = {
  title: "Hồ Sơ Học Sinh | Góc Giáo Viên",
  description: "Quản lý danh sách học sinh theo lớp, tiến độ bài tập, Heo Đất và mã PIN",
};

/**
 * Server Container nạp dữ liệu song song trực tiếp trên máy chủ
 * - Tối ưu 0ms độ trễ mạng client (Quy tắc 9 AGENTS.md)
 * - Tự động nhận diện lớp học đang chọn qua Cookie hoặc lớp phụ trách đầu tiên
 */
async function StudentsDataContainer() {
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

  // 3. Tải danh sách học sinh của đúng lớp đó trên server
  const initialStudents = activeClassId
    ? await getTeacherStudentRosterServer(session, { classId: activeClassId })
    : [];

  const initialClasses = teacherClasses.map((c) => ({
    id: c.id,
    class_name: c.class_name,
    student_count: c.student_count ?? 0,
    is_active: true,
  }));

  return (
    <StudentRosterView
      initialStudents={initialStudents}
      initialClasses={initialClasses}
      initialClassId={activeClassId}
      userRole={session.role}
    />
  );
}

export default function StudentsPage() {
  return (
    <Suspense fallback={<StudentRosterSkeleton />}>
      <StudentsDataContainer />
    </Suspense>
  );
}
