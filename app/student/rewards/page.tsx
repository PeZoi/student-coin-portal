import { Suspense } from "react";
import { Metadata } from "next";
import { connection } from "next/server";
import { RewardsView } from "@/features/student/rewards/components/RewardsView";
import { getExchangeSettingConfig } from "@/lib/system/serverConfig";
import { getCurrentVietnamDayOfMonth } from "@/lib/date";

export const metadata: Metadata = {
  title: "Đổi quà nhận thưởng | Spark the Present",
  description:
    "Đổi xu tích lũy lấy tiền mặt trực tiếp hoặc quà tặng tùy chọn",
};

function RewardsPageSkeleton() {
  return (
    <div className="relative w-full flex-1 flex flex-col items-center justify-start px-3 sm:px-6 lg:px-8 pt-2 pb-8 animate-pulse">
      <div className="w-full max-w-5xl flex items-center justify-between mb-6 pt-0.5 px-1 sm:px-2">
        <div className="h-9 w-28 rounded-full bg-white/30" />
        <div className="h-9 w-36 rounded-full bg-white/30" />
      </div>
      <div className="w-full max-w-3xl mx-auto my-auto min-h-[380px] rounded-[32px] bg-white/25 border-2 border-white/30 p-5 flex flex-col justify-between gap-4">
        <div className="h-12 w-2/3 mx-auto rounded-2xl bg-white/30" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
          <div className="rounded-[26px] bg-white/30 min-h-[220px]" />
          <div className="rounded-[26px] bg-white/30 min-h-[220px]" />
        </div>
        <div className="h-5 w-3/4 mx-auto rounded-lg bg-white/25" />
      </div>
    </div>
  );
}

async function RewardsDataContainer() {
  await connection();
  const [exchangeConfig, currentVietnamDay] = await Promise.all([
    getExchangeSettingConfig(),
    Promise.resolve(getCurrentVietnamDayOfMonth()),
  ]);

  return (
    <RewardsView
      initialExchangeConfig={exchangeConfig}
      currentVietnamDay={currentVietnamDay}
    />
  );
}

export default function RewardsPage() {
  return (
    <Suspense fallback={<RewardsPageSkeleton />}>
      <RewardsDataContainer />
    </Suspense>
  );
}
