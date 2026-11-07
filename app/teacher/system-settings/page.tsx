import { Metadata } from "next";
import { TeacherSystemSettingsView } from "@/features/teacher/components/TeacherSystemSettingsView";

export const metadata: Metadata = {
  title: "Cấu Hình Hệ Thống & Bảo Mật | Quản Trị Tối Cao",
  description: "Cấu hình bảo mật mã PIN, tỷ giá kinh tế xu và động cơ AI chấm bài",
};

export default function SystemSettingsPage() {
  return <TeacherSystemSettingsView />;
}
