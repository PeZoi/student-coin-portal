"use client";

import { useMemo, useEffect, useRef } from "react";
import useSWRInfinite from "swr/infinite";
import { CACHE_KEYS } from "@/constants/cacheKeys";
import { WHEEL_CONSTANTS } from "@/constants/wheel";
import { WheelSpinHistoryPageData } from "../types";
import { wheelService } from "../services/wheelService";

/**
 * Micro-Hook quản lý tải lịch sử lượt quay may mắn của học sinh theo dạng Infinite Scroll (20 lượt / trang)
 * - Kết hợp useSWRInfinite với IntersectionObserver tự động tải trang tiếp theo khi cuộn gần cuối
 * - Nhận fallbackData trang 1 từ Server Component để hiển thị tức thì 0ms độ trễ
 */
export function useWheelSpinHistoryInfinite(
  initialPageData?: WheelSpinHistoryPageData
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const pageSize = WHEEL_CONSTANTS.RECENT_WINNERS_LIMIT;

  const getKey = (
    pageIndex: number,
    previousPageData: WheelSpinHistoryPageData | null
  ) => {
    if (
      previousPageData &&
      (!previousPageData.items || previousPageData.items.length === 0)
    ) {
      return null;
    }

    if (
      previousPageData?.pagination &&
      !previousPageData.pagination.has_more
    ) {
      return null;
    }

    return [CACHE_KEYS.WHEEL.SPIN_HISTORY(), pageIndex + 1] as const;
  };

  const { data, error, isLoading, isValidating, size, setSize, mutate } =
    useSWRInfinite<WheelSpinHistoryPageData>(
      getKey,
      async ([, page]: readonly [string, number]) => {
        return wheelService.getSpinHistory(page, pageSize);
      },
      {
        fallbackData: initialPageData ? [initialPageData] : undefined,
        revalidateOnMount: initialPageData ? false : true,
        revalidateIfStale: !initialPageData,
        revalidateOnFocus: false,
        revalidateFirstPage: false,
      }
    );

  // Hợp nhất toàn bộ lượt quay từ tất cả các trang đã tải
  const spinHistoryItems = useMemo(
    () => (data ? data.flatMap((page) => page.items ?? []) : []),
    [data]
  );

  // Tổng số lượt quay thực tế từ CSDL
  const totalCount =
    data?.[0]?.pagination?.total ?? spinHistoryItems.length;

  const isInitialLoading = !data && isLoading;

  const isLoadingMore =
    isLoading ||
    (size > 0 && data && typeof data[size - 1] === "undefined") ||
    (size > 1 && isValidating);

  const isEmpty = data?.[0]?.items?.length === 0;

  const isReachingEnd =
    isEmpty ||
    Boolean(data && !data[data.length - 1]?.pagination?.has_more) ||
    Boolean(
      data &&
        (data[data.length - 1]?.items?.length ?? 0) < pageSize
    );

  // Tự động kích hoạt tải thêm trang tiếp theo khi cuộn tới sentinel element
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (
          entry.isIntersecting &&
          !isReachingEnd &&
          !isLoadingMore &&
          !isInitialLoading
        ) {
          setSize((prev) => prev + 1);
        }
      },
      {
        root: containerRef.current,
        rootMargin: "80px",
        threshold: 0.1,
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [isReachingEnd, isLoadingMore, isInitialLoading, setSize]);

  return {
    spinHistoryItems,
    totalCount,
    isInitialLoading,
    isLoadingMore,
    isValidating,
    isReachingEnd,
    isEmpty,
    error,
    containerRef,
    sentinelRef,
    loadMore: () => setSize((prev) => prev + 1),
    mutate,
  };
}
