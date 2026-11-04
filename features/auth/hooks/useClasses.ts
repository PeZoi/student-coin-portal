"use client";

import { useEffect, useState } from "react";
import { SelectOption } from "@/components/ui/Select";
import { classService } from "../services/classService";
import { ClassItem } from "../types";

/**
 * Custom Hook quản lý trạng thái tải danh sách lớp học
 * - Tuân thủ Separation of Concerns: Hook chỉ quản lý State & Lifecycle
 * - Toàn bộ tác vụ Network được ủy thác cho Service Layer (`classService`)
 */
export function useClasses() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadClasses() {
      try {
        setIsLoading(true);
        const data = await classService.getActiveClasses();
        if (isMounted) {
          setClasses(data);
          setError(null);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const e = err instanceof Error ? err : new Error(String(err));
          setError(e.message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadClasses();

    return () => {
      isMounted = false;
    };
  }, []);

  // Chuyển đổi định dạng phù hợp cho Select component
  const classOptions: SelectOption[] = classes.map((item) => ({
    label: item.class_name,
    value: item.id,
  }));

  return {
    classes,
    classOptions,
    isLoading,
    error,
  };
}
