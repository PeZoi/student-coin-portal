"use client";

import dynamic from "next/dynamic";
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
import { StudentItem, AdjustCoinsValues } from "@/features/student-management/types";

// Tách nhỏ Bundle Size qua dynamic imports (Tối ưu tốc độ tải trang ban đầu)
const StudentExchangeGiftsModal = dynamic(
  () =>
    import("./modals/StudentExchangeGiftsModal").then(
      (m) => m.StudentExchangeGiftsModal
    ),
  { ssr: false }
);

const StudentCoinTransactionsModal = dynamic(
  () =>
    import("./modals/StudentCoinTransactionsModal").then(
      (m) => m.StudentCoinTransactionsModal
    ),
  { ssr: false }
);

const StudentAssignedMissionsModal = dynamic(
  () =>
    import("./modals/StudentAssignedMissionsModal").then(
      (m) => m.StudentAssignedMissionsModal
    ),
  { ssr: false }
);

const AdjustStudentCoinsModal = dynamic(
  () =>
    import(
      "@/features/student-management/components/modals/AdjustStudentCoinsModal"
    ).then((m) => m.AdjustStudentCoinsModal),
  { ssr: false }
);

const ResetStudentPinModal = dynamic(
  () =>
    import(
      "@/features/student-management/components/modals/ResetStudentPinModal"
    ).then((m) => m.ResetStudentPinModal),
  { ssr: false }
);

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
    useState<StudentRosterSortField>("current_coins");
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

  // State Modal xem lịch sử giao dịch ví xu
  const [historyStudent, setHistoryStudent] =
    useState<TeacherRosterStudent | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // State Modal xem danh sách bài tập đã giao
  const [missionsStudent, setMissionsStudent] =
    useState<TeacherRosterStudent | null>(null);
  const [isMissionsModalOpen, setIsMissionsModalOpen] = useState(false);

  // State Modal Thưởng nóng / Trừ xu học sinh (Tái sử dụng AdjustStudentCoinsModal)
  const [awardStudent, setAwardStudent] =
    useState<TeacherRosterStudent | null>(null);
  const [isAwardModalOpen, setIsAwardModalOpen] = useState(false);
  const [isAwardSubmitting, setIsAwardSubmitting] = useState(false);

  // State Modal Đặt lại mã PIN học sinh (Tái sử dụng ResetStudentPinModal)
  const [resetPinStudent, setResetPinStudent] =
    useState<TeacherRosterStudent | null>(null);
  const [isResetPinModalOpen, setIsResetPinModalOpen] = useState(false);
  const [isResetPinSubmitting, setIsResetPinSubmitting] = useState(false);

  // Dữ liệu học sinh (tạm dùng MockData có state để cập nhật tức thì khi thưởng xu hoặc reset PIN)
  const [studentsList, setStudentsList] =
    useState<TeacherRosterStudent[]>(MOCK_ROSTER_STUDENTS);
  const students = studentsList;

  // 1. Thống kê KPI tổng quan
  const kpiData = useMemo(() => {
    const totalStudents = students.length;
    const totalCoins = students.reduce((sum, s) => sum + s.current_coins, 0);
    const lockedPinCount = students.filter(
      (s) => s.pin_status === "locked" || s.pin_status === "failed_attempts"
    ).length;

    const totalMissionsAll = students.reduce(
      (sum, s) => sum + s.total_missions_count,
      0
    );
    const completedMissionsAll = students.reduce(
      (sum, s) => sum + s.completed_missions_count,
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
          s.full_name.toLowerCase().includes(q) ||
          (s.phone_zalo && s.phone_zalo.replace(/\s+/g, "").includes(q))
      );
    }

    // Lọc theo trạng thái PIN / hoạt động
    if (statusFilter === "active") {
      result = result.filter((s) => s.pin_status === "ok");
    } else if (statusFilter === "locked") {
      result = result.filter(
        (s) => s.pin_status === "locked" || s.pin_status === "failed_attempts"
      );
    }

    // Sắp xếp
    if (sortOrder !== "none") {
      result.sort((a, b) => {
        let diff = 0;
        if (sortField === "full_name") {
          diff = a.full_name.localeCompare(b.full_name, "vi");
        } else if (sortField === "current_coins") {
          diff = a.current_coins - b.current_coins;
        } else if (sortField === "redeemed_rewards_count") {
          diff = a.redeemed_rewards_count - b.redeemed_rewards_count;
        } else if (sortField === "completed_missions_count") {
          diff = a.completed_missions_count - b.completed_missions_count;
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
    setSortField("current_coins");
    setSortOrder("desc");
    setCurrentPage(1);
  }, []);

  const hasActiveFilters =
    searchQuery.trim().length > 0 || statusFilter !== "all";

  // Thao tác giao diện giả lập (UI feedback)
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setStudentsList([...MOCK_ROSTER_STUDENTS]);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Đã làm mới danh sách học sinh");
    }, 600);
  }, []);

  const handleExportExcel = useCallback(() => {
    toast.success("Đang xuất danh sách học sinh ra file Excel...");
  }, []);

  // Helper chuyển đổi TeacherRosterStudent sang StudentItem để tái sử dụng modals
  const toStudentItem = useCallback(
    (student: TeacherRosterStudent | null): StudentItem | null => {
      if (!student) return null;
      return {
        id: student.id,
        full_name: student.full_name,
        phone_zalo: student.phone_zalo || "Chưa cập nhật",
        class_id: student.class_id || null,
        class_name: student.class_name || "Lớp học",
        avatar_url: student.avatar_url,
        current_coins: student.current_coins,
        total_earned_coins: student.total_earned_coins ?? student.current_coins,
        free_spins: 0,
        is_active: student.is_active,
        is_deleted: student.is_deleted,
        failed_login_attempts: student.failed_login_attempts || 0,
        locked_until: student.locked_until || null,
        last_login_at: student.last_login_at,
        created_at: new Date().toISOString(),
      };
    },
    []
  );

  // 1. Thao tác Thưởng nóng / Trừ xu học sinh
  const handleQuickAward = useCallback(
    (student?: TeacherRosterStudent) => {
      if (student) {
        setAwardStudent(student);
        setIsAwardModalOpen(true);
      } else if (selectedIds.length === 1) {
        const found = studentsList.find((s) => s.id === selectedIds[0]);
        if (found) {
          setAwardStudent(found);
          setIsAwardModalOpen(true);
        }
      } else {
        toast.info("Vui lòng bấm vào icon thưởng xu ở từng học sinh trong bảng");
      }
    },
    [selectedIds, studentsList]
  );

  const handleCloseAwardModal = useCallback(() => {
    setIsAwardModalOpen(false);
    setAwardStudent(null);
  }, []);

  const handleAwardSubmit = useCallback(async (values: AdjustCoinsValues) => {
    setIsAwardSubmitting(true);
    // Giả lập network delay 350ms
    await new Promise((r) => setTimeout(r, 350));

    setStudentsList((prev) =>
      prev.map((s) => {
        if (s.id === values.student_id) {
          const nextCoins =
            values.type === "add"
              ? s.current_coins + values.amount
              : Math.max(0, s.current_coins - values.amount);
          const nextTotal =
            values.type === "add"
              ? (s.total_earned_coins ?? s.current_coins) + values.amount
              : s.total_earned_coins;
          return {
            ...s,
            current_coins: nextCoins,
            total_earned_coins: nextTotal,
          };
        }
        return s;
      })
    );

    setIsAwardSubmitting(false);
    setIsAwardModalOpen(false);
    setAwardStudent(null);

    if (values.type === "add") {
      toast.success(
        `Đã thưởng nóng +${values.amount.toLocaleString("vi-VN")} xu cho học sinh ${values.student_name}!`
      );
    } else {
      toast.success(
        `Đã trừ ${values.amount.toLocaleString("vi-VN")} xu của học sinh ${values.student_name}.`
      );
    }
  }, []);

  // 2. Thao tác Đặt lại mã PIN học sinh
  const handleResetPin = useCallback((student: TeacherRosterStudent) => {
    setResetPinStudent(student);
    setIsResetPinModalOpen(true);
  }, []);

  const handleCloseResetPinModal = useCallback(() => {
    setIsResetPinModalOpen(false);
    setResetPinStudent(null);
  }, []);

  const handleResetPinSubmit = useCallback(
    async (studentId: string, newPin: string) => {
      setIsResetPinSubmitting(true);
      // Giả lập network delay 350ms
      await new Promise((r) => setTimeout(r, 350));

      setStudentsList((prev) =>
        prev.map((s) => {
          if (s.id === studentId) {
            return {
              ...s,
              pin_status: "ok",
              failed_login_attempts: 0,
              locked_until: null,
            };
          }
          return s;
        })
      );

      setIsResetPinSubmitting(false);
      setIsResetPinModalOpen(false);
      setResetPinStudent(null);

      toast.success(
        `Đã đặt lại mã PIN thành công (${newPin}) cho học sinh. Tài khoản đã hoạt động bình thường!`
      );
    },
    []
  );

  const handleViewHistory = useCallback((student: TeacherRosterStudent) => {
    setHistoryStudent(student);
    setIsHistoryModalOpen(true);
  }, []);

  const handleCloseHistoryModal = useCallback(() => {
    setIsHistoryModalOpen(false);
    setHistoryStudent(null);
  }, []);

  const handleViewMissions = useCallback((student: TeacherRosterStudent) => {
    setMissionsStudent(student);
    setIsMissionsModalOpen(true);
  }, []);

  const handleCloseMissionsModal = useCallback(() => {
    setIsMissionsModalOpen(false);
    setMissionsStudent(null);
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
          activeCount={students.filter((s) => s.pin_status === "ok").length}
          lockedCount={
            students.filter(
              (s) =>
                s.pin_status === "locked" || s.pin_status === "failed_attempts"
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
          onViewMissions={handleViewMissions}
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

      {/* 6. Modal xem lịch sử biến động sổ cái xu Heo Đất */}
      <StudentCoinTransactionsModal
        isOpen={isHistoryModalOpen}
        onClose={handleCloseHistoryModal}
        student={historyStudent}
      />

      {/* 7. Modal xem danh sách bài tập đã giao cho học sinh */}
      <StudentAssignedMissionsModal
        isOpen={isMissionsModalOpen}
        onClose={handleCloseMissionsModal}
        student={missionsStudent}
      />

      {/* 8. Modal Thưởng nóng / Trừ xu học sinh (Tái sử dụng từ student-management) */}
      <AdjustStudentCoinsModal
        isOpen={isAwardModalOpen}
        onClose={handleCloseAwardModal}
        studentItem={toStudentItem(awardStudent)}
        onSubmit={handleAwardSubmit}
        isSubmitting={isAwardSubmitting}
      />

      {/* 9. Modal Đặt lại mã PIN học sinh (Tái sử dụng từ student-management) */}
      <ResetStudentPinModal
        isOpen={isResetPinModalOpen}
        onClose={handleCloseResetPinModal}
        studentItem={toStudentItem(resetPinStudent)}
        onSubmit={handleResetPinSubmit}
        isSubmitting={isResetPinSubmitting}
      />
    </div>
  );
}
