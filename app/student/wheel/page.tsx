import { LuckyWheelView } from "@/features/lucky-wheel/components/LuckyWheelView";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vòng quay may mắn - Student Coin Portal",
  description: "Vòng quay may mắn thử vận may nhận xu thưởng và quà tặng hấp dẫn",
};

export default function LuckyWheelPage() {
  return <LuckyWheelView />;
}
