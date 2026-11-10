"use client";

import { useTableSelection } from "@/hooks/useTableSelection";

/**
 * Micro-hook chuyên trách: Quản lý chọn checkbox nhiều dòng lớp học (Batch Selection)
 * - Tái sử dụng hook dùng chung @/hooks/useTableSelection (DRY)
 */
export function useClassSelection() {
  return useTableSelection<string>();
}
