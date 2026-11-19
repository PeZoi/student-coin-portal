import { Suspense } from "react";
import { Metadata } from "next";
import { cookies } from "next/headers";
import { requireTeacher } from "@/lib/auth/guard";
import { getTeacherRewardRequestsServer } from "@/features/reward-management/services/rewardServerService";
import { getMyAssignedClassesServer } from "@/features/class-management/services/classServerService";
import { TEACHER_WORKSPACE_COOKIE_NAME } from "@/stores/useTeacherWorkspaceStore";
import { TeacherRewardsView } from "@/features/reward-management";
import { RewardsSkeleton } from "@/features/reward-management/components/RewardsSkeleton";

export const metadata: Metadata = {
  title: "Đổi Quà | Góc Giáo Viên",
  description: "Duyệt yêu cầu đổi quà và quản lý danh mục quà tặng trong lớp học",
};

interface RewardsPageProps {
  searchParams?: Promise<{
    month?: string;
    year?: string;
  }>;
}

/**
 * Server Container nạp dữ liệu ban đầu trực tiếp trên máy chủ
 * - Tối ưu 0ms độ trễ mạng client (Quy tắc 9 AGENTS.md)
 * - Tự động nhận diện lớp học đang chọn qua Cookie hoặc lớp phụ trách đầu tiên
 * - Tự động nhận diện tháng / năm hiện tại theo thời gian thực hoặc đọc từ searchParams
 * - Xác thực quyền giáo viên qua requireTeacher()
 */
async function RewardsDataContainer({ searchParams }: RewardsPageProps) {
  const session = await requireTeacher();
  const cookieStore = await cookies();
  const cookieClassId = cookieStore.get(TEACHER_WORKSPACE_COOKIE_NAME)?.value;

  // Lấy tháng và năm động theo searchParams hoặc thời gian thực hiện tại (tối đa là tháng hiện tại)
  const resolvedParams = searchParams ? await searchParams : {};
  const now = new Date();
  const currentYear: number | "all" =
    resolvedParams.year === "all"
      ? "all"
      : resolvedParams.year
      ? parseInt(resolvedParams.year, 10) || now.getFullYear()
      : now.getFullYear();
  const maxAllowedMonth =
    currentYear === "all" || currentYear === now.getFullYear()
      ? now.getMonth() + 1
      : 12;
  const currentMonth: number | "all" =
    resolvedParams.month === "all"
      ? "all"
      : resolvedParams.month
      ? Math.min(
          maxAllowedMonth,
          Math.max(1, parseInt(resolvedParams.month, 10) || maxAllowedMonth)
        )
      : maxAllowedMonth;

  // 1. Tải danh sách lớp giáo viên được phân công phụ trách
  const teacherClasses = await getMyAssignedClassesServer(session);

  // 2. Xác định lớp học đang chọn: Ưu tiên cookie nếu hợp lệ, nếu không thì lấy lớp đầu tiên
  const isValidClass =
    cookieClassId && teacherClasses.some((c) => c.id === cookieClassId);
  const activeClassId = isValidClass
    ? cookieClassId
    : teacherClasses.length > 0
    ? teacherClasses[0].id
    : undefined;

  // 3. Tải danh sách yêu cầu đổi quà của đúng lớp đó trên server
  const initialRequests = await getTeacherRewardRequestsServer(session, {
    month: currentMonth === "all" ? undefined : currentMonth,
    year: currentYear === "all" ? undefined : currentYear,
    classId: activeClassId,
  });

  return (
    <TeacherRewardsView
      initialRequests={initialRequests}
      initialMonth={currentMonth}
      initialYear={currentYear}
      initialClassId={activeClassId}
    />
  );
}

/**
 * Page Component siêu mỏng (Thin Page Pattern - Quy tắc 1 AGENTS.md)
 * - Sử dụng Streaming Suspense với pure Server Component Skeleton
 */
export default function RewardsPage(props: RewardsPageProps) {
  return (
    <Suspense fallback={<RewardsSkeleton />}>
      <RewardsDataContainer searchParams={props.searchParams} />
    </Suspense>
  );
}
