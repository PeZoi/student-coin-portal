"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useUserStore } from "@/stores/useUserStore";
import { UserRole } from "@/constants/auth";
import { useTableSelection } from "@/hooks/useTableSelection";
import {
  TeacherMissionItem,
  MissionAvailableClass,
  MissionSubmissionItem,
} from "../types";
import {
  MOCK_TEACHER_MISSIONS,
  MOCK_AVAILABLE_CLASSES,
  MOCK_MISSION_SUBMISSIONS,
} from "../constants";
import { useMissionFilters } from "./useMissionFilters";
import { useMissionModals } from "./useMissionModals";
import { useMissionMutations } from "./useMissionMutations";

/**
 * Root Orchestrator Hook: Quản lý toàn bộ tính năng Giao bài tập (Mission Management)
 * - Áp dụng kiến trúc Micro-Hooks (Quy tắc 12): Tách biệt Filters, Modals, Mutations và Selection
 * - Giữ độ dài dưới 100 dòng code, trong sáng và sẵn sàng tích hợp SWR / Server Actions
 */
export function useManageMissions(
  initialMissions?: TeacherMissionItem[],
  userRole?: string
) {
  const { student } = useUserStore();
  const currentRole = userRole || student?.role || UserRole.TEACHER;
  const isAdmin = currentRole === UserRole.ADMIN;
  const canSoftDelete = true; // Giáo viên có toàn quyền tạo, sửa và chuyển bài tập vào thùng rác

  // 1. State danh sách bài tập, lớp học & bài nộp (Dùng dữ liệu Mock chuẩn DB trong giai đoạn UI)
  const [missionsList, setMissionsList] = useState<TeacherMissionItem[]>(
    () => initialMissions ?? MOCK_TEACHER_MISSIONS
  );
  const [availableClasses] = useState<MissionAvailableClass[]>(
    () => MOCK_AVAILABLE_CLASSES
  );
  const [submissionsByMission, setSubmissionsByMission] = useState<
    Record<string, MissionSubmissionItem[]>
  >(() => MOCK_MISSION_SUBMISSIONS);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 2. Chọn checkbox hàng loạt (Batch Selection)
  const selection = useTableSelection<string>();

  // 3. Micro-Hook 1: Bộ lọc, Tìm kiếm, Sắp xếp, Phân trang và KPIs
  const filters = useMissionFilters({
    missionsList,
    onFilterChange: selection.handleClearSelection,
  });

  // 4. Micro-Hook 2: Quản lý đóng/mở 5 Modals
  const modals = useMissionModals(selection.selectedIds.length);

  // 5. Micro-Hook 3: Các thao tác thêm/sửa/xóa/phân công trên UI
  const mutations = useMissionMutations({
    missionsList,
    setMissionsList,
    availableClasses,
    submissionsByMission,
    setSubmissionsByMission,
    selectedIds: selection.selectedIds,
    handleClearSelection: selection.handleClearSelection,
    modals,
    creatorName: student?.full_name || "Cô Mai Anh",
  });

  // 6. Làm mới danh sách bài tập
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Đã đồng bộ danh sách bài tập mới nhất!");
    }, 350);
  }, []);

  return {
    isAdmin,
    canSoftDelete,
    userRole: currentRole,
    missionsList,
    availableClasses,
    submissionsByMission,
    isLoading: false,
    isRefreshing,
    isError: false,
    handleRefresh,

    // Gộp trực tiếp kết quả từ các Micro-Hooks
    ...filters,
    ...selection,
    ...modals,
    ...mutations,
  };
}
