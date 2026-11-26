import { Metadata } from "next";
import { Suspense } from "react";
import { requireTeacher } from "@/lib/auth/guard";
import { resolveTeacherActiveClassIdServer } from "@/features/teacher/submission-management/services/submissionServerService";
import { getTeacherDashboardServer } from "@/features/teacher/dashboard/services/dashboardServerService";
import { TeacherDashboardView } from "@/features/teacher/dashboard/components/TeacherDashboardView";
import { TeacherDashboardSkeleton } from "@/features/teacher/dashboard/components/TeacherDashboardSkeleton";

export const metadata: Metadata = {
  title: "Tổng quan | Góc Giáo Viên",
  description:
    "Theo dõi tiến độ nộp bài tập, yêu cầu đổi quà Heo Đất và bảng xếp hạng thi đua tích xu.",
};

/**
 * Server Container tải toàn bộ dữ liệu Dashboard trực tiếp từ Supabase trên máy chủ
 * - Tự động nhận diện lớp đang chọn qua Cookie (teacher_selected_class_id)
 * - 0ms độ trễ chờ mạng Client khi mở trang (Quy tắc 9 & Quy tắc 11 AGENTS.md)
 */
async function TeacherDashboardDataContainer() {
  const session = await requireTeacher();
  const activeClassId = await resolveTeacherActiveClassIdServer(session);
  const initialData = await getTeacherDashboardServer(session, activeClassId);

  return (
    <TeacherDashboardView
      initialData={initialData}
      initialClassId={activeClassId}
    />
  );
}

/**
 * Page Component siêu mỏng (Thin Page Pattern - Quy tắc 1 AGENTS.md)
 * - Streaming Suspense kèm Pure Server Component Skeleton
 */
export default function TeacherPage() {
  return (
    <Suspense fallback={<TeacherDashboardSkeleton />}>
      <TeacherDashboardDataContainer />
    </Suspense>
  );
}
