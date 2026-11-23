import { Metadata } from "next";
import { Suspense } from "react";
import { ManageSubmissionsView } from "@/features/submission-management/components/ManageSubmissionsView";
import { SubmissionDetailSkeleton } from "@/features/submission-management/components/SubmissionsSkeleton";

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
  const { id, studentId } = await params;

  return (
    <ManageSubmissionsView
      key={`${id}-${studentId}`}
      initialMissionId={id}
      initialStudentId={studentId}
      initialViewMode="studio"
    />
  );
}

export default function StudentGradingPage({
  params,
}: StudentGradingPageProps) {
  return (
    <Suspense fallback={<SubmissionDetailSkeleton />}>
      <StudentGradingDataContainer params={params} />
    </Suspense>
  );
}
