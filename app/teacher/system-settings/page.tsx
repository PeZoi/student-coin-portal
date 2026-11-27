import { Metadata } from "next";
import { Suspense } from "react";
import { requireAuth } from "@/lib/auth/guard";
import { UserRole } from "@/constants";
import { getAdminSystemSettingsServer } from "@/features/admin/system-settings/services/systemSettingsServerService";
import { TeacherSystemSettingsView } from "@/features/admin/system-settings/components/TeacherSystemSettingsView";
import { SystemSettingsSkeleton } from "@/features/admin/system-settings/components/SystemSettingsSkeleton";

export const metadata: Metadata = {
  title: "Cài đặt hệ thống | Góc Giáo Viên",
  description:
    "Thiết lập bảo mật đăng nhập, quy đổi xu Heo Đất, lịch mở đổi quà và hỗ trợ chấm bài AI.",
};

/**
 * Server Container tải trực tiếp 5 nhóm cấu hình từ Supabase (0ms độ trễ client)
 */
async function SystemSettingsDataContainer() {
  await requireAuth([UserRole.ADMIN]);
  const initialData = await getAdminSystemSettingsServer();

  return <TeacherSystemSettingsView initialData={initialData} />;
}

/**
 * Thin Page Pattern với Streaming Suspense & Pure Server Skeleton
 */
export default function SystemSettingsPage() {
  return (
    <Suspense fallback={<SystemSettingsSkeleton />}>
      <SystemSettingsDataContainer />
    </Suspense>
  );
}
