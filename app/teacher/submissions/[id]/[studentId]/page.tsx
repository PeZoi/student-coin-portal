import { Metadata } from "next";
import { Suspense } from "react";
import { requireTeacher } from "@/lib/auth/guard";
import { ManageSubmissionsView } from "@/features/teacher/submission-management/components/ManageSubmissionsView";
import { SubmissionStudioSkeleton } from "@/features/teacher/submission-management/components/SubmissionsSkeleton";
import {
  getMissionSubmissionDetailServer,
  resolveTeacherActiveClassIdServer,
} from "@/features/teacher/submission-management/services/submissionServerService";

export const metadata: Metadata = {
  title: "Studio Chấm Bài Học Sinh | Duyệt Bài Tập | Góc Giáo Viên",
  description:
    "Chấm điểm AI, soi ảnh bài làm và thưởng xu Heo Đất cho học sinh theo từng bài tập",
};

interface StudentGradingPageProps {
  params: Promise<{ id: string; studentId: string }>;
}

async function StudentGradingDataContainer({
  params,
}: StudentGradingPageProps) {
  const [session, { id, studentId }] = await Promise.all([
    requireTeacher(),
    params,
  ]);
  const activeClassId = await resolveTeacherActiveClassIdServer(session);
  const initialDetail = await getMissionSubmissionDetailServer(
    id,
    session,
    activeClassId
  );

  return (
    <ManageSubmissionsView
      key={`${id}-${studentId}`}
      initialMissionId={id}
      initialStudentId={studentId}
      initialViewMode="studio"
      initialDetail={initialDetail}
      initialClassId={activeClassId}
    />
  );
}

export default function StudentGradingPage({
  params,
}: StudentGradingPageProps) {
  return (
    <Suspense fallback={<SubmissionStudioSkeleton />}>
      <StudentGradingDataContainer params={params} />
    </Suspense>
  );
}
