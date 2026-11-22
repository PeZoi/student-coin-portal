import { Metadata } from "next";
import { Suspense } from "react";
import { ManageSubmissionsView } from "@/features/submission-management/components/ManageSubmissionsView";
import { SubmissionsSkeleton } from "@/features/submission-management/components/SubmissionsSkeleton";

export const metadata: Metadata = {
  title: "Danh Sách Học Sinh | Duyệt Bài Tập | Góc Giáo Viên",
  description:
    "Danh sách học sinh nộp bài, theo dõi trạng thái chấm điểm AI và duyệt thưởng xu Heo Đất theo từng bài tập",
};

interface SubmissionDetailPageProps {
  params: Promise<{ id: string }>;
}

async function SubmissionDetailDataContainer({
  params,
}: SubmissionDetailPageProps) {
  const { id } = await params;

  return (
    <ManageSubmissionsView
      key={id}
      initialMissionId={id}
      initialViewMode="roster"
    />
  );
}

export default function SubmissionDetailPage({
  params,
}: SubmissionDetailPageProps) {
  return (
    <Suspense fallback={<SubmissionsSkeleton />}>
      <SubmissionDetailDataContainer params={params} />
    </Suspense>
  );
}
