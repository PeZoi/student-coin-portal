import { Metadata } from "next";
import { Suspense } from "react";
import { ManageSubmissionsView } from "@/features/submission-management/components/ManageSubmissionsView";
import { SubmissionsSkeleton } from "@/features/submission-management/components/SubmissionsSkeleton";

export const metadata: Metadata = {
  title: "Duyệt Bài Tập | Góc Giáo Viên",
  description:
    "Không gian soi ảnh bài tập đa trang (1-5 ảnh), đối chiếu kết quả AI và duyệt thưởng xu Heo Đất",
};

interface SubmissionsPageProps {
  searchParams: Promise<{ missionId?: string }>;
}

async function SubmissionsDataContainer({
  searchParams,
}: SubmissionsPageProps) {
  const params = await searchParams;
  const missionId =
    typeof params?.missionId === "string" ? params.missionId : undefined;

  return <ManageSubmissionsView initialMissionId={missionId} />;
}

export default function SubmissionsPage({ searchParams }: SubmissionsPageProps) {
  return (
    <Suspense fallback={<SubmissionsSkeleton />}>
      <SubmissionsDataContainer searchParams={searchParams} />
    </Suspense>
  );
}
