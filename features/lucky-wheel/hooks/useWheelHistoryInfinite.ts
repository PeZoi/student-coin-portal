"use client";

import { useMemo, useEffect, useRef } from "react";
import useSWRInfinite from "swr/infinite";
import { CACHE_KEYS } from "@/constants/cacheKeys";
import { WHEEL_CONSTANTS } from "@/constants/wheel";
import { WheelHistoryPageData } from "../types";
import { luckyWheelService } from "../services/luckyWheelService";

interface UseWheelHistoryInfiniteProps {
  isOpen: boolean;
  tab: "all" | "personal";
}

/**
 * Micro-Hook quản lý tải lịch sử lượt quay may mắn cho học sinh dạng Infinite Scroll:
 * - Lazy Load: CHỈ GỌI API KHI POPUP ĐƯỢC MỞ (isOpen = true), đóng popup là 0 network request
 * - Tự động kích hoạt tải thêm trang kế tiếp qua IntersectionObserver khi cuộn gần cuối
 * - Bộ nhớ đệm SWR tự động cache dữ liệu theo tab và page
 */
export function useWheelHistoryInfinite({
  isOpen,
  tab,
}: UseWheelHistoryInfiniteProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const pageSize = WHEEL_CONSTANTS.RECENT_WINNERS_LIMIT;

  const getKey = (
    pageIndex: number,
    previousPageData: WheelHistoryPageData | null
  ) => {
    // Chỉ gọi API khi popup đang được mở!
    if (!isOpen) {
      return null;
    }

    // Nếu trang trước không có dữ liệu, dừng lại
    if (
      previousPageData &&
      (!previousPageData.items || previousPageData.items.length === 0)
    ) {
      return null;
    }

    // Nếu trang trước báo đã hết dữ liệu (has_more = false), dừng lại
    if (
      previousPageData?.pagination &&
      !previousPageData.pagination.has_more
    ) {
      return null;
    }

    return CACHE_KEYS.WHEEL.STUDENT_HISTORY(tab, pageIndex + 1);
  };

  const { data, error, isLoading, isValidating, size, setSize, mutate } =
    useSWRInfinite<WheelHistoryPageData>(
      getKey,
      async ([, currentTab, page]: readonly [string, "all" | "personal", number]) => {
        return luckyWheelService.getSpinHistory({
          tab: currentTab,
          page,
          limit: pageSize,
        });
      },
      {
        revalidateOnMount: true,
        revalidateIfStale: false,
        revalidateOnFocus: false,
        revalidateFirstPage: false,
      }
    );

  // Hợp nhất toàn bộ lượt quay từ các trang đã tải
  const items = useMemo(
    () => (data ? data.flatMap((page) => page.items ?? []) : []),
    [data]
  );

  // Tổng số bản ghi thực tế từ CSDL
  const totalCount =
    data?.[0]?.pagination?.total ?? (data ? items.length : 0);

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

  // IntersectionObserver kích hoạt tải trang kế tiếp khi cuộn tới sentinel element
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !isOpen) return;

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
        rootMargin: "120px",
        threshold: 0.1,
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [isOpen, isReachingEnd, isLoadingMore, isInitialLoading, setSize]);

  return {
    items,
    totalCount,
    isInitialLoading,
    isLoadingMore,
    isEmpty,
    isReachingEnd,
    containerRef,
    sentinelRef,
    mutate,
    error,
  };
}
