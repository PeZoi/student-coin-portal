import { useState, useMemo } from "react";
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
 */
export function useMissionFilter(initialMissions: MissionItem[]) {
  const [selectedFilter, setSelectedFilter] = useState<MissionFilter>("pending");
  const [selectedMissionId, setSelectedMissionId] = useState<string>(
    initialMissions[0]?.id || "m1"
  );
  const [mobileTab, setMobileTab] = useState<"list" | "detail">("list");

  // Lọc nhiệm vụ tương ứng với 3 tab
  const filteredMissions = useMemo(() => {
    return initialMissions.filter((mission) => {
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

  // Chọn nhiệm vụ
  const handleSelectMission = (mission: MissionItem) => {
    setSelectedMissionId(mission.id);
    setMobileTab("detail");
  };

  // Đổi tab lọc
  const handleSelectFilter = (filter: MissionFilter) => {
    setSelectedFilter(filter);
  };

  // Quay lại màn hình danh sách trên điện thoại
  const handleBackToMobileList = () => {
    setMobileTab("list");
  };

  return {
    selectedFilter,
    setSelectedFilter: handleSelectFilter,
    selectedMissionId: activeMission?.id || selectedMissionId,
    activeMission,
    filteredMissions,
    filterCounts,
    mobileTab,
    setMobileTab,
    handleSelectMission,
    handleBackToMobileList,
  };
}
