"use client";

import { useMemo, useCallback } from "react";
import { toast } from "sonner";
import { useTableSelection } from "@/hooks/useTableSelection";
import { ExchangeRequestStatus } from "@/constants/rewards";
import { TeacherExchangeRequestItem } from "../types";
import { rewardExcelService } from "../services/rewardExcelService";
import { useTeacherWorkspaceStore } from "@/stores/useTeacherWorkspaceStore";

export interface UseRewardSelectionProps {
  requests: TeacherExchangeRequestItem[];
  paginatedRequests: TeacherExchangeRequestItem[];
  sortedRequests: TeacherExchangeRequestItem[];
  activeClassId: string | null;
  selectedMonth: number | "all";
  selectedYear: number | "all";
  onBatchApprove: (
    selectedIds: string[],
    onClearSelection?: () => void
  ) => Promise<void>;
}

/**
 * Micro-hook chuyên trách: Quản lý chọn dòng (Table Row Selection), Duyệt hàng loạt và Xuất Excel
 * - Quản lý trạng thái checkbox từng dòng và checkbox header
 * - Lọc ra các đơn đang ở trạng thái 'pending' để duyệt đồng loạt an toàn
 * - Tính tổng tiền VNĐ các đơn được chọn
 * - Xuất file Excel nhóm được chọn hoặc toàn bộ danh sách hiện tại
 * - Tuân thủ Quy tắc 6, 7 & 12 AGENTS.md (Micro-Hooks Architecture)
 */
export function useRewardSelection({
  requests,
  paginatedRequests,
  sortedRequests,
  activeClassId,
  selectedMonth,
  selectedYear,
  onBatchApprove,
}: UseRewardSelectionProps) {
  // 1. Quản lý trạng thái checkbox qua hook dùng chung useTableSelection
  const selection = useTableSelection<string>();

  // 2. Danh sách toàn bộ ID hiển thị trên trang hiện tại (cho checkbox Header)
  const allVisibleIds = useMemo(
    () => paginatedRequests.map((r) => r.id),
    [paginatedRequests]
  );

  // 3. Danh sách ID các đơn đang ở trạng thái 'pending' trong số những đơn được chọn
  const selectedPendingIds = useMemo(() => {
    if (selection.selectedIds.length === 0) return [];
    const selectedSet = new Set(selection.selectedIds);
    return requests
      .filter(
        (r) => selectedSet.has(r.id) && r.status === ExchangeRequestStatus.PENDING
      )
      .map((r) => r.id);
  }, [requests, selection.selectedIds]);

  // 4. Tổng tiền VNĐ của các đơn đang được chọn
  const selectedTotalVnd = useMemo(() => {
    if (selection.selectedIds.length === 0) return 0;
    const selectedSet = new Set(selection.selectedIds);
    return requests
      .filter((r) => selectedSet.has(r.id))
      .reduce((sum, r) => sum + (r.amount_vnd || 0), 0);
  }, [requests, selection.selectedIds]);

  // 5. Handler duyệt hàng loạt các đơn chờ duyệt trong danh sách đã chọn
  const handleBatchApproveSelected = useCallback(async () => {
    if (selectedPendingIds.length === 0) {
      toast.info("Các yêu cầu bạn chọn đều đã được duyệt hoặc từ chối trước đó.");
      return;
    }
    await onBatchApprove(selectedPendingIds, selection.handleClearSelection);
  }, [selectedPendingIds, selection.handleClearSelection, onBatchApprove]);

  // 6. Handler xuất Excel (Chỉ xuất danh sách những học sinh đã được thầy cô duyệt)
  const handleExportExcel = useCallback(() => {
    try {
      const currentClass = useTeacherWorkspaceStore
        .getState()
        .classes.find((c) => c.id === activeClassId);

      const baseList = sortedRequests.length > 0 ? sortedRequests : requests;
      // Chỉ lọc những đơn đã được duyệt & trao (status === COMPLETED)
      const approvedList = baseList.filter(
        (r) => r.status === ExchangeRequestStatus.COMPLETED
      );

      if (approvedList.length === 0) {
        toast.info("Không có yêu cầu đổi quà nào đã được duyệt để xuất Excel.");
        return;
      }

      rewardExcelService.exportRewardsToExcel(approvedList, {
        className: currentClass?.class_name,
        month: selectedMonth,
        year: selectedYear,
      });

      toast.success(
        `Đã xuất danh sách ${approvedList.length} học sinh được duyệt sang file Excel!`
      );
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(`Lỗi xuất Excel: ${error.message}`);
    }
  }, [sortedRequests, requests, activeClassId, selectedMonth, selectedYear]);

  return {
    selection,
    allVisibleIds,
    selectedPendingIds,
    selectedTotalVnd,
    handleBatchApproveSelected,
    handleExportExcel,
  };
}
