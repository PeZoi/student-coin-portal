"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { TeacherRosterStudent } from "../types";
import { getMockCoinTransactions } from "../constants/mockCoinTransactions";

const PAGE_SIZE = 8;

export function useRosterCoinTransactionsInfinite(
  student: TeacherRosterStudent | null
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Sinh toàn bộ mock data cho học sinh này
  const allTransactions = useMemo(() => {
    if (!student) return [];
    return getMockCoinTransactions(student);
  }, [student]);

  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Danh sách các giao dịch được hiển thị theo phân trang hiện tại
  const transactions = useMemo(() => {
    return allTransactions.slice(0, page * PAGE_SIZE);
  }, [allTransactions, page]);

  const totalCount = allTransactions.length;
  const isReachingEnd = transactions.length >= totalCount;

  const loadMore = useCallback(() => {
    if (isLoadingMore || isReachingEnd) return;
    setIsLoadingMore(true);

    const timer = setTimeout(() => {
      setPage((prev) => prev + 1);
      setIsLoadingMore(false);
    }, 350);

    return () => clearTimeout(timer);
  }, [isLoadingMore, isReachingEnd]);

  // Thiết lập IntersectionObserver cho phần tử sentinel ở đáy danh sách
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || isReachingEnd) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
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
  }, [loadMore, isReachingEnd]);

  return {
    transactions,
    totalCount,
    isLoadingMore,
    isReachingEnd,
    containerRef,
    sentinelRef,
  };
}
