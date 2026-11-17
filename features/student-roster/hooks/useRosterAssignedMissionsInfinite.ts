"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  TeacherRosterStudent,
  RosterMissionProgressStatus,
  RosterAssignedMissionItem,
} from "../types";
import { getMockAssignedMissions } from "../constants/mockAssignedMissions";

export type MissionFilterTab = "all" | RosterMissionProgressStatus;

const PAGE_SIZE = 6;

export function useRosterAssignedMissionsInfinite(
  student: TeacherRosterStudent | null
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Danh sách bài tập có state để hỗ trợ giáo viên chuyển trạng thái "Miễn làm (ngoại lệ)"
  const [missionsList, setMissionsList] = useState<RosterAssignedMissionItem[]>(
    () => (student ? getMockAssignedMissions(student) : [])
  );

  const [activeTab, setActiveTab] = useState<MissionFilterTab>("all");
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Thao tác chuyển đổi Miễn làm ngoại lệ (exempt)
  const toggleExemptMission = useCallback(
    (missionId: string): { status: RosterMissionProgressStatus; title: string } | null => {
      let result: { status: RosterMissionProgressStatus; title: string } | null = null;

      setMissionsList((prev) =>
        prev.map((item) => {
          if (item.id === missionId) {
            const nextStatus: RosterMissionProgressStatus =
              item.status === "exempt" ? "assigned" : "exempt";
            result = { status: nextStatus, title: item.title };
            return {
              ...item,
              status: nextStatus,
            };
          }
          return item;
        })
      );

      return result;
    },
    []
  );

  // Thống kê nhanh
  const stats = useMemo(() => {
    const total = missionsList.length;
    const approved = missionsList.filter((m) => m.status === "approved").length;
    const submitted = missionsList.filter((m) => m.status === "submitted").length;
    const assigned = missionsList.filter((m) => m.status === "assigned").length;
    const rejected = missionsList.filter((m) => m.status === "rejected").length;
    const exempt = missionsList.filter((m) => m.status === "exempt").length;
    const totalCoins = missionsList
      .filter((m) => m.status === "approved")
      .reduce((sum, m) => sum + (m.earned_coins || m.reward_coins || 0), 0);

    return {
      total,
      approved,
      submitted,
      assigned,
      rejected,
      exempt,
      totalCoins,
      progressPercent: total > 0 ? Math.round((approved / total) * 100) : 0,
    };
  }, [missionsList]);

  // Lọc bài tập theo tab hiện tại
  const filteredMissions = useMemo(() => {
    if (activeTab === "all") return missionsList;
    return missionsList.filter((m) => m.status === activeTab);
  }, [missionsList, activeTab]);

  // Reset trang khi đổi tab
  const handleTabChange = useCallback((tab: MissionFilterTab) => {
    setActiveTab(tab);
    setPage(1);
  }, []);

  // Danh sách bài tập hiển thị theo trang
  const visibleMissions = useMemo(() => {
    return filteredMissions.slice(0, page * PAGE_SIZE);
  }, [filteredMissions, page]);

  const totalFilteredCount = filteredMissions.length;
  const isReachingEnd = visibleMissions.length >= totalFilteredCount;

  const loadMore = useCallback(() => {
    if (isLoadingMore || isReachingEnd) return;
    setIsLoadingMore(true);

    const timer = setTimeout(() => {
      setPage((prev) => prev + 1);
      setIsLoadingMore(false);
    }, 350);

    return () => clearTimeout(timer);
  }, [isLoadingMore, isReachingEnd]);

  // IntersectionObserver cho sentinel ở cuối danh sách
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
        rootMargin: "100px",
        threshold: 0.1,
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore, isReachingEnd]);

  return {
    activeTab,
    handleTabChange,
    visibleMissions,
    totalFilteredCount,
    stats,
    isLoadingMore,
    isReachingEnd,
    containerRef,
    sentinelRef,
    toggleExemptMission,
  };
}
