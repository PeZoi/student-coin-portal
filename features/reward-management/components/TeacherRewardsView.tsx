"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { Pagination } from "@/components/ui/Pagination";
import {
  TeacherExchangeRequestItem,
  ExchangeFilterStatus,
  ExchangeFilterChoiceType,
  ExchangeViewMode,
  ExchangeSortField,
  SortOrder,
} from "../types";
import { MOCK_EXCHANGE_REQUESTS } from "../data/mockExchangeRequests";
import { ExchangeRequestStatus, ExchangeChoiceType } from "@/constants/rewards";
import { TeacherRewardsHeader } from "./TeacherRewardsHeader";
import { TeacherRewardsKpiCards } from "./TeacherRewardsKpiCards";
import { TeacherRewardsToolbar } from "./TeacherRewardsToolbar";
import { TeacherRewardsTable } from "./TeacherRewardsTable";
import { TeacherRewardsGrid } from "./TeacherRewardsGrid";

const TeacherRewardDetailModal = dynamic(
  () =>
    import("./TeacherRewardDetailModal").then(
      (m) => m.TeacherRewardDetailModal
    ),
  { ssr: false }
);

export function TeacherRewardsView() {
  const [requests, setRequests] = useState<TeacherExchangeRequestItem[]>(
    MOCK_EXCHANGE_REQUESTS
  );
  const [selectedMonth, setSelectedMonth] = useState<number>(11);
  const [selectedYear] = useState<number>(2026);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ExchangeFilterStatus>("all");
  const [choiceTypeFilter, setChoiceTypeFilter] =
    useState<ExchangeFilterChoiceType>("all");
  const [viewMode, setViewMode] = useState<ExchangeViewMode>("table");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sorting state
  const [sortField, setSortField] = useState<ExchangeSortField | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<SortOrder>("none");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal chi tiết
  const [selectedRequest, setSelectedRequest] =
    useState<TeacherExchangeRequestItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // 1. Lọc dữ liệu theo kỳ, trạng thái, hình thức và tìm kiếm
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      // Lọc theo tháng & năm
      if (r.month !== selectedMonth || r.year !== selectedYear) return false;

      // Lọc theo trạng thái (chỉ còn 3 trạng thái: pending, completed, rejected)
      if (statusFilter !== "all" && r.status !== statusFilter) return false;

      // Lọc theo hình thức (tiền mặt / shopee)
      if (choiceTypeFilter !== "all" && r.choice_type !== choiceTypeFilter)
        return false;

      // Tìm kiếm theo tên học sinh hoặc ghi chú
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const studentNameMatch = r.student_name.toLowerCase().includes(query);
        const noteMatch = r.shopee_note?.toLowerCase().includes(query);
        if (!studentNameMatch && !noteMatch) return false;
      }

      return true;
    });
  }, [
    requests,
    selectedMonth,
    selectedYear,
    statusFilter,
    choiceTypeFilter,
    searchQuery,
  ]);

  // 2. Sắp xếp danh sách (Sorting)
  const sortedRequests = useMemo(() => {
    if (!sortField || sortOrder === "none") return filteredRequests;

    return [...filteredRequests].sort((a, b) => {
      let comparison = 0;
      if (sortField === "student_name") {
        comparison = a.student_name.localeCompare(b.student_name, "vi");
      } else if (sortField === "amount_vnd") {
        comparison = a.amount_vnd - b.amount_vnd;
      } else if (sortField === "choice_type") {
        comparison = a.choice_type.localeCompare(b.choice_type);
      } else if (sortField === "status") {
        const statusWeight: Record<string, number> = {
          pending: 1,
          completed: 2,
          rejected: 3,
        };
        comparison = (statusWeight[a.status] || 99) - (statusWeight[b.status] || 99);
      } else if (sortField === "created_at") {
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [filteredRequests, sortField, sortOrder]);

  // 3. Phân trang dữ liệu (Pagination)
  const totalPages = Math.ceil(sortedRequests.length / pageSize) || 1;

  const paginatedRequests = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedRequests.slice(start, start + pageSize);
  }, [sortedRequests, currentPage, pageSize]);

  // Danh sách yêu cầu trong kỳ chốt sổ hiện tại (để tính KPI)
  const periodRequests = useMemo(() => {
    return requests.filter(
      (r) => r.month === selectedMonth && r.year === selectedYear
    );
  }, [requests, selectedMonth, selectedYear]);

  // Đếm số lượng theo 3 trạng thái chuẩn: pending, completed, rejected
  const counts = useMemo(() => {
    return {
      all: periodRequests.length,
      pending: periodRequests.filter(
        (r) => r.status === ExchangeRequestStatus.PENDING
      ).length,
      completed: periodRequests.filter(
        (r) => r.status === ExchangeRequestStatus.COMPLETED
      ).length,
      rejected: periodRequests.filter(
        (r) => r.status === ExchangeRequestStatus.REJECTED
      ).length,
    };
  }, [periodRequests]);

  // Tổng xu và tổng tiền VNĐ trong kỳ
  const totalCoinsExchanged = useMemo(() => {
    return periodRequests.reduce((sum, r) => sum + r.coins_to_exchange, 0);
  }, [periodRequests]);

  const totalVndAmount = useMemo(() => {
    return periodRequests.reduce((sum, r) => sum + r.amount_vnd, 0);
  }, [periodRequests]);

  // Thao tác sắp xếp
  const handleSortToggle = (field: ExchangeSortField) => {
    if (sortField !== field) {
      setSortField(field);
      setSortOrder("asc");
    } else if (sortOrder === "asc") {
      setSortOrder("desc");
    } else {
      setSortField(undefined);
      setSortOrder("none");
    }
    setCurrentPage(1);
  };

  // Mở modal xem chi tiết
  const handleOpenDetail = (req: TeacherExchangeRequestItem) => {
    setSelectedRequest(req);
    setIsDetailModalOpen(true);
  };

  // Thao tác: Duyệt & Trao quà trực tiếp (UX 1-Click)
  const handleApproveAndDeliver = (req: TeacherExchangeRequestItem) => {
    setRequests((prev) =>
      prev.map((item) =>
        item.id === req.id
          ? {
              ...item,
              status: ExchangeRequestStatus.COMPLETED,
              processed_by: "current-teacher",
              processor_name: "Cô giáo",
              processed_at: new Date().toISOString(),
            }
          : item
      )
    );
    toast.success(
      `Đã duyệt và trao ${
        req.choice_type === ExchangeChoiceType.CASH ? "tiền mặt" : "quà Shopee"
      } cho học sinh ${req.student_name} thành công!`
    );
  };

  // Thao tác: Từ chối yêu cầu (Hoàn xu Heo Đất)
  const handleReject = (req: TeacherExchangeRequestItem) => {
    setRequests((prev) =>
      prev.map((item) =>
        item.id === req.id
          ? {
              ...item,
              status: ExchangeRequestStatus.REJECTED,
              processed_by: "current-teacher",
              processor_name: "Cô giáo",
              processed_at: new Date().toISOString(),
            }
          : item
      )
    );
    toast.info(
      `Đã từ chối yêu cầu của học sinh ${req.student_name} và hoàn lại ${req.coins_to_exchange.toLocaleString(
        "vi-VN"
      )} xu vào Heo Đất.`
    );
  };

  // Thao tác: Làm mới
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Đã đồng bộ danh sách đổi thưởng mới nhất!");
    }, 400);
  };

  return (
    <div className="space-y-5">
      {/* 1. Header Trang (Đồng bộ typography với StudentRosterHeader & MissionsHeader) */}
      <TeacherRewardsHeader
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onMonthChange={(m) => {
          setSelectedMonth(m);
          setCurrentPage(1);
        }}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      {/* 2. Thẻ KPI Thống Kê (4 thẻ đồng bộ chuẩn hệ thống) */}
      <TeacherRewardsKpiCards
        totalRequests={counts.all}
        pendingRequests={counts.pending}
        completedRequests={counts.completed}
        totalCoinsExchanged={totalCoinsExchanged}
        totalVndAmount={totalVndAmount}
      />

      {/* 3. Card Đồng bộ chứa Toolbar, Table/Grid và Pagination */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Toolbar nằm bên trong Card */}
        <TeacherRewardsToolbar
          searchQuery={searchQuery}
          onSearchChange={(q) => {
            setSearchQuery(q);
            setCurrentPage(1);
          }}
          statusFilter={statusFilter}
          onStatusChange={(s) => {
            setStatusFilter(s);
            setCurrentPage(1);
          }}
          choiceTypeFilter={choiceTypeFilter}
          onChoiceTypeChange={(c) => {
            setChoiceTypeFilter(c);
            setCurrentPage(1);
          }}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          counts={counts}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />

        {/* Nội dung danh sách: Dạng Bảng hoặc Dạng Thẻ */}
        {viewMode === "table" ? (
          <TeacherRewardsTable
            requests={paginatedRequests}
            sortField={sortField}
            sortOrder={sortOrder}
            onSortToggle={handleSortToggle}
            onSelectRequest={handleOpenDetail}
            onApproveAndDeliver={handleApproveAndDeliver}
            onReject={handleReject}
          />
        ) : (
          <TeacherRewardsGrid
            requests={paginatedRequests}
            onSelectRequest={handleOpenDetail}
            onApproveAndDeliver={handleApproveAndDeliver}
            onReject={handleReject}
          />
        )}

        {/* Phân trang Pagination chuẩn hệ thống (giống StudentRoster và Missions) */}
        <div className="border-t border-slate-200">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={sortedRequests.length}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
            pageSizeOptions={[5, 10, 20]}
            itemLabel="yêu cầu"
          />
        </div>
      </div>

      {/* 4. Modal Chi Tiết Yêu Cầu */}
      <TeacherRewardDetailModal
        key={selectedRequest?.id ?? "empty"}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedRequest(null);
        }}
        request={selectedRequest}
        onApproveAndDeliver={handleApproveAndDeliver}
        onReject={handleReject}
      />
    </div>
  );
}
