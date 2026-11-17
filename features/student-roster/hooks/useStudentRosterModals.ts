"use client";

import { useState, useCallback } from "react";
import { TeacherRosterStudent } from "../types";
import { StudentItem } from "@/features/student-management/types";

/**
 * Micro-Hook 2: Quản lý trạng thái đóng/mở và dữ liệu của 5 Modals trong trang Roster
 */
export function useStudentRosterModals() {
  // 1. Modal xem chi tiết quà đã đổi
  const [rewardsStudent, setRewardsStudent] =
    useState<TeacherRosterStudent | null>(null);
  const [isRewardsModalOpen, setIsRewardsModalOpen] = useState(false);

  // 2. Modal xem lịch sử giao dịch ví xu (sao kê)
  const [historyStudent, setHistoryStudent] =
    useState<TeacherRosterStudent | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // 3. Modal xem danh sách bài tập đã giao
  const [missionsStudent, setMissionsStudent] =
    useState<TeacherRosterStudent | null>(null);
  const [isMissionsModalOpen, setIsMissionsModalOpen] = useState(false);

  // 4. Modal Thưởng nóng / Trừ xu học sinh (Tái sử dụng AdjustStudentCoinsModal)
  const [awardStudent, setAwardStudent] =
    useState<TeacherRosterStudent | null>(null);
  const [isAwardModalOpen, setIsAwardModalOpen] = useState(false);

  // 5. Modal Đặt lại mã PIN học sinh (Tái sử dụng ResetStudentPinModal)
  const [resetPinStudent, setResetPinStudent] =
    useState<TeacherRosterStudent | null>(null);
  const [isResetPinModalOpen, setIsResetPinModalOpen] = useState(false);

  // Helper chuyển đổi TeacherRosterStudent sang StudentItem để tái sử dụng modals
  const toStudentItem = useCallback(
    (student: TeacherRosterStudent | null): StudentItem | null => {
      if (!student) return null;
      return {
        id: student.id,
        full_name: student.full_name,
        avatar_url: student.avatar_url,
        phone_zalo: student.phone_zalo || "",
        class_id: null,
        class_name: student.class_name || "",
        current_coins: student.current_coins,
        free_spins: 0,
        total_earned_coins: student.total_earned_coins,
        pin_number: null,
        is_active: student.is_active,
        is_deleted: false,
        failed_login_attempts: 0,
        locked_until: null,
        created_at: "",
      };
    },
    []
  );

  // Handlers mở / đóng Modal Thưởng xu
  const handleQuickAward = useCallback(
    (student?: TeacherRosterStudent) => {
      setAwardStudent(student ?? null);
      setIsAwardModalOpen(true);
    },
    []
  );

  const handleCloseAwardModal = useCallback(() => {
    setIsAwardModalOpen(false);
    setAwardStudent(null);
  }, []);

  // Handlers mở / đóng Modal Đặt lại PIN
  const handleResetPin = useCallback((student: TeacherRosterStudent) => {
    setResetPinStudent(student);
    setIsResetPinModalOpen(true);
  }, []);

  const handleCloseResetPinModal = useCallback(() => {
    setIsResetPinModalOpen(false);
    setResetPinStudent(null);
  }, []);

  // Handlers mở / đóng Modal Lịch sử sao kê xu
  const handleViewHistory = useCallback((student: TeacherRosterStudent) => {
    setHistoryStudent(student);
    setIsHistoryModalOpen(true);
  }, []);

  const handleCloseHistoryModal = useCallback(() => {
    setIsHistoryModalOpen(false);
    setHistoryStudent(null);
  }, []);

  // Handlers mở / đóng Modal Bài tập đã giao
  const handleViewMissions = useCallback((student: TeacherRosterStudent) => {
    setMissionsStudent(student);
    setIsMissionsModalOpen(true);
  }, []);

  const handleCloseMissionsModal = useCallback(() => {
    setIsMissionsModalOpen(false);
    setMissionsStudent(null);
  }, []);

  // Handlers mở / đóng Modal Quà đã đổi
  const handleViewRedeemedRewards = useCallback(
    (student: TeacherRosterStudent) => {
      setRewardsStudent(student);
      setIsRewardsModalOpen(true);
    },
    []
  );

  const handleCloseRewardsModal = useCallback(() => {
    setIsRewardsModalOpen(false);
    setRewardsStudent(null);
  }, []);

  return {
    rewardsStudent,
    isRewardsModalOpen,
    handleViewRedeemedRewards,
    handleCloseRewardsModal,

    historyStudent,
    isHistoryModalOpen,
    handleViewHistory,
    handleCloseHistoryModal,

    missionsStudent,
    isMissionsModalOpen,
    handleViewMissions,
    handleCloseMissionsModal,

    awardStudent,
    isAwardModalOpen,
    handleQuickAward,
    handleCloseAwardModal,

    resetPinStudent,
    isResetPinModalOpen,
    handleResetPin,
    handleCloseResetPinModal,

    toStudentItem,
  };
}
