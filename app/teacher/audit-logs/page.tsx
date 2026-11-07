import { Metadata } from "next";
import { TeacherAuditLogsView } from "@/features/teacher/components/TeacherAuditLogsView";

export const metadata: Metadata = {
  title: "Nhật Ký An Ninh & Kiểm Toán | Quản Trị Tối Cao",
  description: "Theo dõi lịch sử xác thực auth_logs và biến động dữ liệu audit_logs",
};

export default function AuditLogsPage() {
  return <TeacherAuditLogsView />;
}
