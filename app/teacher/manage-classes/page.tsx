import { Suspense } from "react";
import { Metadata } from "next";
import { requireTeacher } from "@/lib/auth/guard";
import { TeacherClassesView } from "@/features/teacher/components/TeacherClassesView";
import { ClassesSkeleton } from "@/features/teacher/components/classes/ClassesSkeleton";
import { getTeacherClassesServer } from "@/features/teacher/services/teacherClassServerService";

export const metadata: Metadata = {
  title: "Quản Lý Lớp Học | Quản Trị Trung Tâm",
  description: "Quản lý danh sách ca học và phân công giáo viên phụ trách tại trung tâm",
};

async function ClassesDataContainer() {
  const session = await requireTeacher();
  const initialClasses = await getTeacherClassesServer(session);
  return <TeacherClassesView initialClasses={initialClasses} userRole={session.role} />;
}

export default function ClassesPage() {
  return (
    <Suspense fallback={<ClassesSkeleton />}>
      <ClassesDataContainer />
    </Suspense>
  );
}
