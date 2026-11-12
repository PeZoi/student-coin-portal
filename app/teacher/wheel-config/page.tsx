import { Suspense } from "react";
import { Metadata } from "next";
import { requireTeacher } from "@/lib/auth/guard";
import { WheelConfigView } from "@/features/wheel-management/components/WheelConfigView";
import { WheelConfigSkeleton } from "@/features/wheel-management/components/WheelConfigSkeleton";
import { getInitialWheelConfigServer } from "@/features/wheel-management/services/wheelServerService";

export const metadata: Metadata = {
  title: "Cấu Hình Vòng Quay | Quản Trị Tối Cao",
  description: "Thiết lập cơ cấu ô giải thưởng, tỷ lệ xác suất RTP và mô phỏng vòng quay may mắn",
};

async function WheelConfigDataContainer() {
  const session = await requireTeacher();
  const initialConfig = await getInitialWheelConfigServer(session);
  return <WheelConfigView initialData={initialConfig} />;
}

export default function WheelConfigPage() {
  return (
    <Suspense fallback={<WheelConfigSkeleton />}>
      <WheelConfigDataContainer />
    </Suspense>
  );
}
