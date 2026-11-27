import { Metadata } from "next";
import { Suspense } from "react";
import { requireAuth } from "@/lib/auth/guard";
import { UserRole } from "@/constants";
import {
  AUDIT_LOGS_DEFAULT_PAGE,
  AUDIT_LOGS_DEFAULT_PAGE_SIZE,
} from "@/features/admin/audit-logs/constants";
import { getAdminAuditLogsServer } from "@/features/admin/audit-logs/services/auditLogsServerService";
import { TeacherAuditLogsView } from "@/features/admin/audit-logs/components/TeacherAuditLogsView";
import { AuditLogsPageSkeleton } from "@/features/admin/audit-logs/components/AuditLogsSkeleton";

export const metadata: Metadata = {
  title: "Nhật ký an ninh | Góc Giáo Viên",
  description:
    "Theo dõi lịch sử đăng nhập, cảnh báo khóa tài khoản và các thao tác thay đổi dữ liệu quan trọng.",
};

/**
 * Server Container tải trực tiếp trang đầu tiên của Nhật ký an ninh từ Supabase (0ms độ trễ client)
 */
async function AuditLogsDataContainer() {
  await requireAuth([UserRole.ADMIN]);
  const initialData = await getAdminAuditLogsServer({
    tab: "auth",
    page: AUDIT_LOGS_DEFAULT_PAGE,
    pageSize: AUDIT_LOGS_DEFAULT_PAGE_SIZE,
  });

  return <TeacherAuditLogsView initialData={initialData} />;
}

/**
 * Thin Page Pattern với Streaming Suspense & Pure Server Skeleton
 */
export default function AuditLogsPage() {
  return (
    <Suspense fallback={<AuditLogsPageSkeleton />}>
      <AuditLogsDataContainer />
    </Suspense>
  );
}
