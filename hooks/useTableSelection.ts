"use client";

import { useState, useCallback } from "react";

/**
 * Hook dùng chung quản lý chọn checkbox nhiều dòng trong bảng dữ liệu (Batch / Table Selection)
 * - Tái sử dụng linh hoạt cho mọi bảng: Lớp học, Giáo viên, Học sinh, Nhiệm vụ...
 * - Type-safe với Generic Type <T = string>
 */
export function useTableSelection<T extends string = string>(initialSelected: T[] = []) {
  const [selectedIds, setSelectedIds] = useState<T[]>(initialSelected);

  // Chọn hoặc bỏ chọn 1 phần tử
  const handleToggleSelect = useCallback((id: T) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  // Chọn tất cả hoặc bỏ chọn tất cả
  const handleSelectAll = useCallback((idsToSelect: T[]) => {
    setSelectedIds((prev) => (prev.length === idsToSelect.length ? [] : idsToSelect));
  }, []);

  // Xóa sạch danh sách đã chọn
  const handleClearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  // Kiểm tra 1 ID có đang được chọn không
  const isSelected = useCallback(
    (id: T) => selectedIds.includes(id),
    [selectedIds]
  );

  // Kiểm tra danh sách hiển thị đã được chọn toàn bộ chưa
  const isAllSelected = useCallback(
    (visibleIds: T[]) =>
      visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id)),
    [selectedIds]
  );

  return {
    selectedIds,
    setSelectedIds,
    handleToggleSelect,
    handleSelectAll,
    handleClearSelection,
    isSelected,
    isAllSelected,
  };
}
