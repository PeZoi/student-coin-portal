import { Metadata } from "next";
import { Suspense } from "react";
import { ManageSubmissionsView } from "@/features/submission-management/components/ManageSubmissionsView";
import { SubmissionDetailSkeleton } from "@/features/submission-management/components/SubmissionsSkeleton";

export const metadata: Metadata = {
  title: "Danh Sách Học Sinh | Duyệt Bài Tập | Góc Giáo Viên",
  description:
    "Danh sách học sinh nộp bài, theo dõi trạng thái chấm điểm AI và duyệt thưởng xu Heo Đất theo từng bài tập",
};

interface SubmissionDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ studentId?: string; submissionId?: string }>;
}

async function SubmissionDetailDataContainer({
  params,
  searchParams,
}: SubmissionDetailPageProps) {
  const { id } = await params;
  const search = searchParams ? await searchParams : {};
  const studentId = search.studentId || search.submissionId;

  return (
    <ManageSubmissionsView
      key={`${id}-${studentId || "roster"}`}
      initialMissionId={id}
      initialStudentId={studentId}
      initialViewMode={studentId ? "studio" : "roster"}
    />
  );
}

export default function SubmissionDetailPage({
  params,
  searchParams,
}: SubmissionDetailPageProps) {
  return (
    <Suspense fallback={<SubmissionDetailSkeleton />}>
      <SubmissionDetailDataContainer
        params={params}
        searchParams={searchParams}
      />
    </Suspense>
  );
}
