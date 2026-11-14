import { Suspense } from "react";
import type { Metadata } from "next";
import { getAuthSession } from "@/lib/auth/jwt";
import { LuckyWheelView } from "@/features/lucky-wheel/components/LuckyWheelView";
import { getStudentWheelInitialDataServer } from "@/features/lucky-wheel/services/luckyWheelServerService";

export const metadata: Metadata = {
  title: "Vòng quay may mắn - Student Coin Portal",
  description:
    "Vòng quay may mắn thử vận may nhận xu thưởng và quà tặng hấp dẫn",
};

function StudentWheelSkeleton() {
  return (
    <div className="relative w-full h-full flex-1 flex flex-col items-center justify-center px-4 py-6 select-none animate-pulse">
      <div className="w-full max-w-5xl flex items-center justify-between mb-6">
        <div className="h-9 w-28 rounded-full bg-white/30" />
        <div className="flex items-center gap-2">
          <div className="h-9 w-32 rounded-full bg-white/30" />
          <div className="h-9 w-24 rounded-full bg-white/30" />
          <div className="h-9 w-28 rounded-full bg-white/30" />
        </div>
      </div>
      <div className="w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-white/25 border-8 border-amber-300/40 shadow-xl" />
    </div>
  );
}

async function StudentWheelDataContainer() {
  const session = await getAuthSession();
  const initialData = await getStudentWheelInitialDataServer(session);

  return <LuckyWheelView initialData={initialData} />;
}

export default function LuckyWheelPage() {
  return (
    <Suspense fallback={<StudentWheelSkeleton />}>
      <StudentWheelDataContainer />
    </Suspense>
  );
}
