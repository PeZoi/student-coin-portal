import { Metadata } from "next";
import { TeacherWheelConfigView } from "@/features/teacher/components/TeacherWheelConfigView";

export const metadata: Metadata = {
  title: "Cấu Hình Vòng Quay | Quản Trị Tối Cao",
  description: "Thiết lập cơ cấu 8 ô giải thưởng và tỷ lệ xác suất vòng quay may mắn",
};

export default function WheelConfigPage() {
  return <TeacherWheelConfigView />;
}
