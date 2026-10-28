import { RewardsView } from "@/features/rewards/components/RewardsView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đổi quà nhận thưởng | Spark the Present",
  description: "Đổi xu tích lũy lấy tiền mặt trực tiếp hoặc quà tặng Shopee tùy chọn",
};

export default function RewardsPage() {
  return <RewardsView />;
}
