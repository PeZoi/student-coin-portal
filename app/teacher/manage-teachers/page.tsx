import { Suspense } from "react";
import { Metadata } from "next";
import { requireTeacher } from "@/lib/auth/guard";
import { TeacherManageTeachersView } from "@/features/teacher/components/TeacherManageTeachersView";
import { TeachersSkeleton } from "@/features/teacher/components/teachers/TeachersSkeleton";
import { getManageTeachersServer } from "@/features/teacher/services/teacherStaffServerService";

export const metadata: Metadata = {
  title: "Quản Lý Giáo Viên | Quản Trị Hệ Thống",
  description: "Quản lý nhân sự giáo viên, phân công lớp và phân quyền hệ thống",
};

async function TeachersDataContainer() {
  const session = await requireTeacher();
  const initialTeachers = await getManageTeachersServer(session);
  return (
    <TeacherManageTeachersView
      initialTeachers={initialTeachers}
      userRole={session.role}
    />
  );
}

export default function ManageTeachersPage() {
  return (
    <Suspense fallback={<TeachersSkeleton />}>
      <TeachersDataContainer />
    </Suspense>
  );
}
