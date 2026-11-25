import { useState, useMemo, useEffect, useCallback } from "react";
import { MissionFilter, MissionItem } from "../types";

/**
 * Kiểm tra xem một nhiệm vụ có ở trạng thái quá hạn hay không
 * Dựa trực tiếp vào trường `status` của Database ('overdue')
 * Không sử dụng Date.now() trong render pass để tránh lỗi unstable value trong Next.js 16
 */
export function checkIsMissionOverdue(mission: MissionItem): boolean {
  if (mission.isCompleted || mission.status === "completed") {
    return false;
  }
  return mission.status === "overdue";
}

/**
 * Custom hook quản lý logic bộ lọc 3 tab: Chưa xong (pending), Đã xong (completed), Quá hạn (overdue)
 * và điều hướng Bottom Sheet chi tiết trên mobile (hỗ trợ nút Back vật lý popstate)
 */
export function useMissionFilter(initialMissions: MissionItem[]) {
  const [selectedFilter, setSelectedFilter] = useState<MissionFilter>("pending");
  const [selectedMissionId, setSelectedMissionId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      const missionIdInUrl = url.searchParams.get("mission");
      if (missionIdInUrl && initialMissions.some((m) => m.id === missionIdInUrl)) {
        return missionIdInUrl;
      }
    }
    return initialMissions[0]?.id || "m1";
  });
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      const missionIdInUrl = url.searchParams.get("mission");
      return Boolean(missionIdInUrl && initialMissions.some((m) => m.id === missionIdInUrl));
    }
    return false;
  });
  const [mobileTab, setMobileTab] = useState<"list" | "detail">(() => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      return url.searchParams.has("mission") ? "detail" : "list";
    }
    return "list";
  });

  // Lọc và sắp xếp nhiệm vụ tương ứng với 3 tab
  const filteredMissions = useMemo(() => {
    const list = initialMissions.filter((mission) => {
      const isCompleted = mission.status === "completed" || Boolean(mission.isCompleted);
      const isOverdueMission = checkIsMissionOverdue(mission);

      if (selectedFilter === "completed") {
        return isCompleted;
      }
      if (selectedFilter === "overdue") {
        return !isCompleted && isOverdueMission;
      }
      // Tab 'pending' (Chưa xong): Chưa hoàn thành và không ở trạng thái quá hạn
      return !isCompleted && !isOverdueMission;
    });

    // Sắp xếp:
    // - Tab 'overdue': Quá hạn lâu nhất lên đầu (dueAt nhỏ nhất trong quá khứ)
    // - Tab 'pending': Hạn gần nhất lên đầu (dueAt nhỏ nhất)
    // - Tab 'completed': Mới nộp/hoàn thành gần nhất lên đầu
    return [...list].sort((a, b) => {
      const timeA = new Date(a.dueAt).getTime();
      const timeB = new Date(b.dueAt).getTime();

      if (selectedFilter === "completed") {
        const compA = a.completedAt ? new Date(a.completedAt).getTime() : timeA;
        const compB = b.completedAt ? new Date(b.completedAt).getTime() : timeB;
        return compB - compA;
      }
      if (selectedFilter === "overdue") {
        return timeA - timeB; // Quá hạn lâu nhất trước
      }
      return timeA - timeB; // Hạn chót sắp tới nhất trước
    });
  }, [initialMissions, selectedFilter]);

  // Đếm số lượng cho từng tab
  const filterCounts = useMemo(() => {
    let pendingCount = 0;
    let completedCount = 0;
    let overdueCount = 0;

    for (const mission of initialMissions) {
      const isCompleted = mission.status === "completed" || Boolean(mission.isCompleted);
      const isOverdueMission = checkIsMissionOverdue(mission);

      if (isCompleted) {
        completedCount++;
      } else if (isOverdueMission) {
        overdueCount++;
      } else {
        pendingCount++;
      }
    }

    return {
      pending: pendingCount,
      completed: completedCount,
      overdue: overdueCount,
    };
  }, [initialMissions]);

  // Nhiệm vụ đang được kích hoạt (active)
  const activeMission = useMemo(() => {
    const foundInFiltered = filteredMissions.find((m) => m.id === selectedMissionId);
    if (foundInFiltered) return foundInFiltered;
    return (
      filteredMissions[0] ||
      initialMissions.find((m) => m.id === selectedMissionId) ||
      initialMissions[0]
    );
  }, [filteredMissions, initialMissions, selectedMissionId]);

  // Đổi tab lọc
  const handleSelectFilter = (filter: MissionFilter) => {
    setSelectedFilter(filter);
  };

  // Mở Bottom Sheet chi tiết nhiệm vụ và cập nhật URL query
  const handleOpenDetailSheet = useCallback((mission: MissionItem) => {
    setSelectedMissionId(mission.id);
    setIsDetailSheetOpen(true);
    setMobileTab("detail");

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (url.searchParams.get("mission") !== mission.id) {
        url.searchParams.set("mission", mission.id);
        window.history.pushState({ missionSheetOpen: true, missionId: mission.id }, "", url.toString());
      }
    }
  }, []);

  // Đóng Bottom Sheet chi tiết nhiệm vụ và xóa query param
  const handleCloseDetailSheet = useCallback(() => {
    setIsDetailSheetOpen(false);
    setMobileTab("list");

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (url.searchParams.has("mission")) {
        url.searchParams.delete("mission");
        window.history.replaceState({}, "", url.toString());
      }
    }
  }, []);

  // Chọn nhiệm vụ chung (cho desktop và mobile)
  const handleSelectMission = useCallback((mission: MissionItem) => {
    handleOpenDetailSheet(mission);
  }, [handleOpenDetailSheet]);

  // Quay lại màn hình danh sách trên điện thoại
  const handleBackToMobileList = useCallback(() => {
    handleCloseDetailSheet();
  }, [handleCloseDetailSheet]);

  // Lắng nghe sự kiện popstate khi bấm nút Back của điện thoại
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handlePopState = () => {
      const currentUrl = new URL(window.location.href);
      const missionIdInUrl = currentUrl.searchParams.get("mission");
      if (missionIdInUrl) {
        const target = initialMissions.find((m) => m.id === missionIdInUrl);
        if (target) {
          setSelectedMissionId(target.id);
          setIsDetailSheetOpen(true);
          setMobileTab("detail");
        }
      } else {
        setIsDetailSheetOpen(false);
        setMobileTab("list");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [initialMissions]);

  return {
    selectedFilter,
    setSelectedFilter: handleSelectFilter,
    selectedMissionId: activeMission?.id || selectedMissionId,
    activeMission,
    filteredMissions,
    filterCounts,
    mobileTab,
    setMobileTab,
    isDetailSheetOpen,
    setIsDetailSheetOpen,
    handleOpenDetailSheet,
    handleCloseDetailSheet,
    handleSelectMission,
    handleBackToMobileList,
  };
}
