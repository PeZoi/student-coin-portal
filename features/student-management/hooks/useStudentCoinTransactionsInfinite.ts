"use client";

import { useMemo, useEffect, useRef } from "react";
import useSWRInfinite from "swr/infinite";
import { StudentCoinTransactionsData } from "../types";
import { teacherStudentService } from "../services/studentService";
import { CACHE_KEYS } from "@/constants/cacheKeys";

/** Số lượng giao dịch trên mỗi trang khi cuộn vô tận */
export const COIN_TRANSACTIONS_PAGE_SIZE = 15;

/**
 * Custom Hook quản lý tải lịch sử giao dịch xu Heo Đất dạng Infinite Scroll
 * - Kết hợp useSWRInfinite với IntersectionObserver tự động tải trang kế tiếp khi cuộn gần cuối danh sách
 * - Tối ưu hiệu năng, tự động ngắt kết nối observer khi chạm đáy dữ liệu
 */
export function useStudentCoinTransactionsInfinite(studentId?: string | null) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Hàm tạo key cho từng trang
  const getKey = (
    pageIndex: number,
    previousPageData: StudentCoinTransactionsData | null
  ) => {
    if (!studentId) return null;

    // Nếu trang trước không có giao dịch hoặc đã hết trang
    if (
      previousPageData &&
      (!previousPageData.transactions ||
        previousPageData.transactions.length === 0)
    ) {
      return null;
    }

    if (
      previousPageData?.pagination &&
      !previousPageData.pagination.has_more
    ) {
      return null;
    }

    return [
      CACHE_KEYS.STUDENTS.TRANSACTIONS(studentId),
      pageIndex + 1,
    ] as const;
  };

  const { data, error, isLoading, isValidating, size, setSize, mutate } =
    useSWRInfinite<StudentCoinTransactionsData>(
      getKey,
      async ([, page]: readonly [string, number]) => {
        return teacherStudentService.getCoinTransactions(
          studentId!,
          page,
          COIN_TRANSACTIONS_PAGE_SIZE
        );
      },
      {
        revalidateOnFocus: false,
        revalidateFirstPage: false,
      }
    );

  // Hợp nhất toàn bộ giao dịch từ tất cả các trang đã tải
  const transactions = useMemo(
    () => (data ? data.flatMap((page) => page.transactions ?? []) : []),
    [data]
  );

  // Tổng số lượng giao dịch từ database (hoặc số lượng đã tải)
  const totalCount = data?.[0]?.pagination?.total ?? transactions.length;

  // Trạng thái đang tải lần đầu
  const isInitialLoading = !data && isLoading;

  // Trạng thái đang tải thêm trang tiếp theo
  const isLoadingMore =
    isLoading ||
    (size > 0 && data && typeof data[size - 1] === "undefined") ||
    (size > 1 && isValidating);

  // Danh sách rỗng
  const isEmpty = data?.[0]?.transactions?.length === 0;

  // Đã chạm đáy dữ liệu (hết toàn bộ trang)
  const isReachingEnd =
    isEmpty ||
    (data && !data[data.length - 1]?.pagination?.has_more) ||
    (data &&
      (data[data.length - 1]?.transactions?.length ?? 0) <
        COIN_TRANSACTIONS_PAGE_SIZE);

  // Thống kê nhanh từ danh sách giao dịch đã tải
  const stats = useMemo(() => {
    let totalPlus = 0;
    let totalMinus = 0;

    for (const tx of transactions) {
      if (tx.amount > 0) {
        totalPlus += tx.amount;
      } else {
        totalMinus += Math.abs(tx.amount);
      }
    }

    return {
      totalPlus,
      totalMinus,
      count: totalCount,
    };
  }, [transactions, totalCount]);

  // Tự động kích hoạt tải thêm trang khi cuộn tới sentinel element
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
        rootMargin: "80px", // Kích hoạt sớm 80px trước khi chạm đáy để tạo cảm giác mượt mà
        threshold: 0.1,
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [isReachingEnd, isLoadingMore, isInitialLoading, setSize]);

  return {
    transactions,
    totalCount,
    isInitialLoading,
    isLoadingMore,
    isReachingEnd,
    isEmpty,
    error,
    stats,
    containerRef,
    sentinelRef,
    loadMore: () => setSize((prev) => prev + 1),
    mutate,
  };
}
