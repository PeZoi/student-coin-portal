import { Metadata } from "next";
import { Suspense } from "react";
import { requireTeacher } from "@/lib/auth/guard";
import { TeacherManageStudentsView } from "@/features/teacher/student-management/components/ManageStudentsView";
import { StudentsSkeleton } from "@/features/teacher/student-management/components/StudentsSkeleton";
import { getManageStudentsServer } from "@/features/teacher/student-management/services/studentServerService";
import { getAuthSecurityConfig } from "@/lib/system/serverConfig";

export const metadata: Metadata = {
  title: "Quản Lý Học Sinh Toàn Trường | Quản Trị Trường",
  description: "Tra cứu học sinh, quản lý mã PIN và phân bổ chuyển lớp",
};

async function StudentsDataContainer() {
  const session = await requireTeacher();
  const [initialStudents, authSecurity] = await Promise.all([
    getManageStudentsServer(session),
    getAuthSecurityConfig(),
  ]);

  return (
    <TeacherManageStudentsView
      initialStudents={initialStudents}
      userRole={session.role}
      authSecurity={authSecurity}
    />
  );
}

export default function ManageStudentsPage() {
  return (
    <Suspense fallback={<StudentsSkeleton />}>
      <StudentsDataContainer />
    </Suspense>
  );
}
