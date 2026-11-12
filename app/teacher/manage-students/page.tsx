import { Metadata } from "next";
import { Suspense } from "react";
import { requireTeacher } from "@/lib/auth/guard";
import { TeacherManageStudentsView } from "@/features/student-management/components/ManageStudentsView";
import { StudentsSkeleton } from "@/features/student-management/components/StudentsSkeleton";
import { getManageStudentsServer } from "@/features/student-management/services/studentServerService";

export const metadata: Metadata = {
  title: "Quản Lý Học Sinh Toàn Trường | Quản Trị Trường",
  description: "Tra cứu học sinh, quản lý mã PIN và phân bổ chuyển lớp",
};

async function StudentsDataContainer() {
  const session = await requireTeacher();
  const initialStudents = await getManageStudentsServer(session);

  return (
    <TeacherManageStudentsView
      initialStudents={initialStudents}
      userRole={session.role}
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
