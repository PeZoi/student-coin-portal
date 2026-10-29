"use client";

import { useMemo, useState } from "react";
import {
  currentMonthLeaderboard,
  previousMonthLeaderboard,
} from "../data/mockLeaderboardData";
import { MonthlyLeaderboardData, PeriodType, TopCoinStudent, TopProgressStudent } from "../types";

export function useLeaderboard() {
  const [activePeriod, setActivePeriod] = useState<PeriodType>("current_month");
  const [selectedClass, setSelectedClass] = useState<string>("all");

  // Dữ liệu thô theo chu kỳ tháng
  const rawData: MonthlyLeaderboardData = useMemo(() => {
    return activePeriod === "current_month"
      ? currentMonthLeaderboard
      : previousMonthLeaderboard;
  }, [activePeriod]);

  // Danh sách các lớp có sẵn được trích xuất tự động và sắp xếp chuẩn
  const availableClasses = useMemo(() => {
    const classSet = new Set<string>();
    rawData.topCoins.forEach((item) => classSet.add(item.classGroup));
    rawData.topProgress.forEach((item) => classSet.add(item.classGroup));

    // Đảm bảo có đầy đủ các lớp tiêu biểu
    ["Lớp 5A", "Lớp 5B", "Lớp 5C", "Lớp 5D", "Lớp 5E"].forEach((c) =>
      classSet.add(c)
    );

    const sorted = Array.from(classSet).sort((a, b) =>
      a.localeCompare(b, "vi")
    );

    return [
      { id: "all", label: "Tất cả các lớp" },
      ...sorted.map((cls) => ({ id: cls, label: cls })),
    ];
  }, [rawData]);

  // Dữ liệu bảng xếp hạng sau khi áp dụng bộ lọc theo lớp
  const data: MonthlyLeaderboardData = useMemo(() => {
    if (selectedClass === "all") {
      return rawData;
    }

    // Lọc và xếp lại thứ hạng cho Top Xu theo lớp được chọn
    const filteredCoins: TopCoinStudent[] = rawData.topCoins
      .filter((item) => item.classGroup === selectedClass)
      .map((item, index) => ({
        ...item,
        rank: index + 1,
        bonusCoins: index === 0 ? 150 : index === 1 ? 100 : index === 2 ? 50 : undefined,
      }));

    // Lọc và xếp lại thứ hạng cho Top Tiến Bộ theo lớp được chọn
    const filteredProgress: TopProgressStudent[] = rawData.topProgress
      .filter((item) => item.classGroup === selectedClass)
      .map((item, index) => ({
        ...item,
        rank: index + 1,
        bonusPoints: index === 0 ? 300 : index === 1 ? 200 : index === 2 ? 100 : undefined,
      }));

    return {
      ...rawData,
      topCoins: filteredCoins,
      topProgress: filteredProgress,
    };
  }, [rawData, selectedClass]);

  // Thông tin thứ hạng của học sinh hiện tại (Gia Bảo) trong Top Xu
  const currentUserCoinRank = useMemo(() => {
    return data.topCoins.find((item) => item.isCurrentUser);
  }, [data.topCoins]);

  // Thông tin thứ hạng của học sinh hiện tại (Gia Bảo) trong Top Tiến Bộ
  const currentUserProgressRank = useMemo(() => {
    return data.topProgress.find((item) => item.isCurrentUser);
  }, [data.topProgress]);

  return {
    activePeriod,
    setActivePeriod,
    selectedClass,
    setSelectedClass,
    availableClasses,
    data,
    currentUserCoinRank,
    currentUserProgressRank,
  };
}
