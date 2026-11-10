"use client";

import { useState, useCallback } from "react";

/**
 * Micro-hook chuyên trách: Quản lý chọn checkbox nhiều dòng (Batch Selection)
 */
export function useClassSelection() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  const handleSelectAll = useCallback((idsToSelect: string[]) => {
    setSelectedIds((prev) => (prev.length === idsToSelect.length ? [] : idsToSelect));
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  return {
    selectedIds,
    setSelectedIds,
    handleToggleSelect,
    handleSelectAll,
    handleClearSelection,
  };
}
