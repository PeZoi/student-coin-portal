import { Metadata } from "next";
import { Suspense } from "react";
import { requireTeacher } from "@/lib/auth/guard";
import { ManageSubmissionsView } from "@/features/submission-management/components/ManageSubmissionsView";
import { SubmissionsSkeleton } from "@/features/submission-management/components/SubmissionsSkeleton";
import {
  getMissionSubmissionDetailServer,
  getSubmissionMissionsOverviewServer,
  resolveTeacherActiveClassIdServer,
} from "@/features/submission-management/services/submissionServerService";

export const metadata: Metadata = {
  title: "Duyệt Bài Tập | Góc Giáo Viên",
  description:
    "Không gian soi ảnh bài tập đa trang, đối chiếu kết quả AI và duyệt thưởng xu Heo Đất",
};

interface SubmissionsPageProps {
  searchParams: Promise<{ missionId?: string }>;
}

async function SubmissionsDataContainer({
  searchParams,
}: SubmissionsPageProps) {
  const [session, params] = await Promise.all([requireTeacher(), searchParams]);
  const activeClassId = await resolveTeacherActiveClassIdServer(session);
  const missionId =
    typeof params?.missionId === "string" ? params.missionId : undefined;

  if (missionId) {
    const initialDetail = await getMissionSubmissionDetailServer(
      missionId,
      session,
      activeClassId
    );
    return (
      <ManageSubmissionsView
        key={missionId}
        initialMissionId={missionId}
        initialDetail={initialDetail}
        initialClassId={activeClassId}
      />
    );
  }

  const initialMissionsOverview = await getSubmissionMissionsOverviewServer(
    session,
    activeClassId
  );

  return (
    <ManageSubmissionsView
      key="overview"
      initialMissionsOverview={initialMissionsOverview}
      initialClassId={activeClassId}
    />
  );
}

export default function SubmissionsPage({ searchParams }: SubmissionsPageProps) {
  return (
    <Suspense fallback={<SubmissionsSkeleton />}>
      <SubmissionsDataContainer searchParams={searchParams} />
    </Suspense>
  );
}
