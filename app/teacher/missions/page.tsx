import { Metadata } from "next";
import { Suspense } from "react";
import { ManageMissionsView } from "@/features/mission-management/components/ManageMissionsView";
import { MissionsSkeleton } from "@/features/mission-management/components/MissionsSkeleton";

export const metadata: Metadata = {
  title: "Giao Bài Tập | Góc Giáo Viên",
  description:
    "Quản lý, giao bài tập cho học sinh và cấu hình tiêu chí chấm bài AI",
};

export default function MissionsPage() {
  return (
    <Suspense fallback={<MissionsSkeleton />}>
      <ManageMissionsView />
    </Suspense>
  );
}
