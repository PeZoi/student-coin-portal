import { Metadata } from "next";
import { TeacherSystemSettingsView } from "@/features/admin/system-settings/components/TeacherSystemSettingsView";

export const metadata: Metadata = {
  title: "Cài đặt hệ thống | Góc Giáo Viên",
  description:
    "Thiết lập bảo mật đăng nhập, quy đổi xu Heo Đất, lịch mở đổi quà và hỗ trợ chấm bài AI.",
};

export default function SystemSettingsPage() {
  return <TeacherSystemSettingsView />;
}
