"use client";

import useSWR from "swr";
import { SelectOption } from "@/components/ui/Select";
import { classService } from "../services/classService";
import { CACHE_KEYS } from "@/constants";

/**
 * Custom Hook quản lý danh sách lớp học cho form xác thực
 * - Tuân thủ Quy tắc 9 trong AGENTS.md: Dùng SWR bọc ngoài Service Layer
 * - Tự động cache: Chuyển tab hoặc mở lại form có dữ liệu ngay lập tức (0ms delay)
 * - Tự động gộp request (Request Deduplication): Nhiều component cùng dùng chỉ gọi 1 request
 */
export function useClasses() {
  const { data: classes = [], isLoading, error } = useSWR(
    CACHE_KEYS.CLASSES.ACTIVE,
    () => classService.getActiveClasses(),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  const classOptions: SelectOption[] = classes.map((item) => ({
    label: item.class_name,
    value: item.id,
  }));

  return {
    classes,
    classOptions,
    isLoading,
    error: error instanceof Error ? error.message : error ? String(error) : null,
  };
}
