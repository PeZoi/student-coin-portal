import { MissionsView } from "@/features/missions/components/MissionsView";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nhiệm vụ nhận xu - Student Coin Portal",
  description: "Danh sách nhiệm vụ học tập tích lũy xu thưởng",
};

export default function MissionsPage() {
  return <MissionsView />;
}
