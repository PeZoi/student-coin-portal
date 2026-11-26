/**
 * Header của trang Teacher Dashboard
 * - Pure Server / Presentational Component, đồng bộ phong cách toàn hệ thống Teacher Portal
 */
export function TeacherDashboardHeader() {
  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] font-heading tracking-tight">
        Tổng quan
      </h1>
      <p className="text-sm sm:text-[15px] text-[#475569] mt-1">
        Theo dõi tiến độ nộp bài tập, yêu cầu đổi quà Heo Đất và bảng xếp hạng thi đua tích xu.
      </p>
    </div>
  );
}
