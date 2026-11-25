"use client";

/**
 * Header của trang Teacher Dashboard
 * - Style Title phẳng đồng bộ với các trang khác trong hệ thống Teacher Portal
 * - Chỉ giữ tiêu đề trang và mô tả phụ gọn gàng
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
