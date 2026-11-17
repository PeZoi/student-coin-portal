"use client";

import { Pagination } from "@/components/ui/Pagination";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { MOCK_ROSTER_STUDENTS } from "../constants";
import {
  SortOrder,
  StudentRosterSortField,
  StudentRosterStatusFilter,
  TeacherRosterStudent,
} from "../types";
import { StudentRosterBatchBar } from "./StudentRosterBatchBar";
import { StudentRosterHeader } from "./StudentRosterHeader";
import { StudentRosterKpiCards } from "./StudentRosterKpiCards";
import { StudentRosterTable } from "./StudentRosterTable";
import { StudentRosterToolbar } from "./StudentRosterToolbar";
import { StudentExchangeGiftsModal } from "./modals/StudentExchangeGiftsModal";

/**
 * Giao diện Hồ sơ & Danh sách học sinh theo lớp học (Góc giáo viên)
 * - Tách thành Feature độc lập `features/student-roster/` theo kiến trúc Feature-based
 * - Đồng bộ 100% phong cách thiết kế với Quản lý học sinh, Quản lý lớp học và Giao bài tập
 * - Tự động đồng bộ với Lớp học đang chọn tại Header Workspace
 * - Đã tinh gọn: Bỏ cột cấp bậc Heo, bỏ cột hoạt động gần nhất, bỏ mã học sinh (ID)
 */
export function StudentRosterView() {
  // State lọc & tìm kiếm
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<StudentRosterStatusFilter>("all");
  const [sortField, setSortField] =
    useState<StudentRosterSortField>("coins");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // State phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // State Modal xem chi tiết quà đã đổi
  const [rewardsStudent, setRewardsStudent] =
    useState<TeacherRosterStudent | null>(null);
  const [isRewardsModalOpen, setIsRewardsModalOpen] = useState(false);

  // Dữ liệu học sinh (tạm dùng MockData, sẵn sàng kết nối SWR khi tích hợp DB)
  const students: TeacherRosterStudent[] = useMemo(() => {
    return MOCK_ROSTER_STUDENTS;
  }, []);

  // 1. Thống kê KPI tổng quan
  const kpiData = useMemo(() => {
    const totalStudents = students.length;
    const totalCoins = students.reduce((sum, s) => sum + s.coins, 0);
    const lockedPinCount = students.filter(
      (s) => s.pinStatus === "locked" || s.pinStatus === "failed_attempts"
    ).length;

    const totalMissionsAll = students.reduce(
      (sum, s) => sum + s.missions.total,
      0
    );
    const completedMissionsAll = students.reduce(
      (sum, s) => sum + s.missions.completed,
      0
    );
    const completionRate = totalMissionsAll
      ? Math.round((completedMissionsAll / totalMissionsAll) * 1000) / 10
      : 0;

    return {
      totalStudents,
      totalCoins,
      completionRate,
      lockedPinCount,
    };
  }, [students]);

  // 2. Lọc học sinh theo từ khóa, trạng thái
  const filteredStudents = useMemo(() => {
    let result = [...students];

    // Lọc theo từ khóa tìm kiếm (họ tên hoặc SĐT phụ huynh)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (s) =>
          s.fullName.toLowerCase().includes(q) ||
          (s.parentPhone && s.parentPhone.replace(/\s+/g, "").includes(q))
      );
    }

    // Lọc theo trạng thái PIN / hoạt động
    if (statusFilter === "active") {
      result = result.filter((s) => s.pinStatus === "ok");
    } else if (statusFilter === "locked") {
      result = result.filter(
        (s) => s.pinStatus === "locked" || s.pinStatus === "failed_attempts"
      );
    }

    // Sắp xếp
    if (sortOrder !== "none") {
      result.sort((a, b) => {
        let diff = 0;
        if (sortField === "fullName") {
          diff = a.fullName.localeCompare(b.fullName, "vi");
        } else if (sortField === "coins") {
          diff = a.coins - b.coins;
        } else if (sortField === "redeemedRewards") {
          diff = a.redeemedRewards - b.redeemedRewards;
        } else if (sortField === "completedMissions") {
          diff = a.missions.completed - b.missions.completed;
        }
        return sortOrder === "asc" ? diff : -diff;
      });
    }

    return result;
  }, [students, searchQuery, statusFilter, sortField, sortOrder]);

  // 3. Phân trang
  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1;
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, currentPage, pageSize]);

  // Xử lý chuyển đổi sort
  const handleSortToggle = useCallback(
    (field: StudentRosterSortField) => {
      if (sortField !== field) {
        setSortField(field);
        setSortOrder("asc");
      } else {
        if (sortOrder === "asc") setSortOrder("desc");
        else if (sortOrder === "desc") setSortOrder("none");
        else setSortOrder("asc");
      }
    },
    [sortField, sortOrder]
  );

  // Chọn/bỏ chọn checkbox
  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    const currentIds = paginatedStudents.map((s) => s.id);
    const isAllChecked =
      currentIds.length > 0 &&
      currentIds.every((id) => selectedIds.includes(id));

    if (isAllChecked) {
      setSelectedIds((prev) => prev.filter((id) => !currentIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...currentIds])));
    }
  }, [paginatedStudents, selectedIds]);

  const handleClearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  // Reset toàn bộ bộ lọc
  const handleResetFilters = useCallback(() => {
    setSearchQuery("");
    setStatusFilter("all");
    setSortField("coins");
    setSortOrder("desc");
    setCurrentPage(1);
  }, []);

  const hasActiveFilters =
    searchQuery.trim().length > 0 || statusFilter !== "all";

  // Thao tác giao diện giả lập (UI feedback)
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Đã làm mới danh sách học sinh");
    }, 600);
  }, []);

  const handleExportExcel = useCallback(() => {
    toast.success("Đang xuất danh sách học sinh ra file Excel...");
  }, []);

  const handleQuickAward = useCallback((student?: TeacherRosterStudent) => {
    if (student) {
      toast.success(`Mở hộp thoại thưởng xu cho em: ${student.fullName}`);
    } else {
      toast.info("Chọn học sinh bên dưới để thưởng xu nhanh");
    }
  }, []);

  const handleResetPin = useCallback((student: TeacherRosterStudent) => {
    toast.success(`Đã cấp lại mã PIN tạm thời cho học sinh: ${student.fullName}`);
  }, []);

  const handleViewHistory = useCallback((student: TeacherRosterStudent) => {
    toast.info(`Xem sao kê lịch sử Heo Đất của em: ${student.fullName}`);
  }, []);

  const handleViewRedeemedRewards = useCallback(
    (student: TeacherRosterStudent) => {
      setRewardsStudent(student);
      setIsRewardsModalOpen(true);
    },
    []
  );

  const handleCloseRewardsModal = useCallback(() => {
    setIsRewardsModalOpen(false);
    setRewardsStudent(null);
  }, []);

  return (
    <div className="space-y-5">
      {/* 1. Header Trang */}
      <StudentRosterHeader
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        onExportExcel={handleExportExcel}
        onQuickAward={() => handleQuickAward()}
      />

      {/* 2. Thẻ Thống kê KPI */}
      <StudentRosterKpiCards
        totalStudents={kpiData.totalStudents}
        totalCoins={kpiData.totalCoins}
        completionRate={kpiData.completionRate}
        lockedPinCount={kpiData.lockedPinCount}
      />

      {/* 3. Toolbar và Table cùng nằm trong Card đồng bộ */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Toolbar */}
        <StudentRosterToolbar
          searchQuery={searchQuery}
          onSearchQueryChange={(q: string) => {
            setSearchQuery(q);
            setCurrentPage(1);
          }}
          statusFilter={statusFilter}
          onStatusFilterChange={(f: StudentRosterStatusFilter) => {
            setStatusFilter(f);
            setCurrentPage(1);
          }}
          totalStudents={students.length}
          activeCount={students.filter((s) => s.pinStatus === "ok").length}
          lockedCount={
            students.filter(
              (s) =>
                s.pinStatus === "locked" || s.pinStatus === "failed_attempts"
            ).length
          }
          onResetFilters={handleResetFilters}
          hasActiveFilters={hasActiveFilters}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />

        {/* Bảng danh sách học sinh */}
        <StudentRosterTable
          students={paginatedStudents}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onSelectAll={handleSelectAll}
          sortField={sortField}
          sortOrder={sortOrder}
          onSortToggle={handleSortToggle}
          onQuickAward={handleQuickAward}
          onResetPin={handleResetPin}
          onViewHistory={handleViewHistory}
          onViewRedeemedRewards={handleViewRedeemedRewards}
        />

        {/* Phân trang Pagination */}
        <div className="border-t border-slate-200">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={filteredStudents.length}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
            pageSizeOptions={[10, 20, 50]}
            itemLabel="học sinh"
          />
        </div>
      </div>

      {/* 4. Thanh thao tác hàng loạt nổi khi chọn checkbox */}
      <StudentRosterBatchBar
        selectedCount={selectedIds.length}
        onClearSelection={handleClearSelection}
        onBatchAward={() =>
          toast.info(`Thưởng xu cùng lúc cho ${selectedIds.length} học sinh`)
        }
        onBatchResetPin={() =>
          toast.info(
            `Cấp lại mã PIN cùng lúc cho ${selectedIds.length} học sinh`
          )
        }
      />

      {/* 5. Modal chi tiết danh sách quà và tiền mặt đã đổi */}
      <StudentExchangeGiftsModal
        isOpen={isRewardsModalOpen}
        onClose={handleCloseRewardsModal}
        student={rewardsStudent}
      />
    </div>
  );
}
