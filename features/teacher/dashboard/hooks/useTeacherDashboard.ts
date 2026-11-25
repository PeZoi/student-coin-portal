"use client";

import { useState, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { SubmissionApprovalStatus } from "@/constants";
import { useTeacherWorkspaceStore } from "@/stores/useTeacherWorkspaceStore";
import {
  MOCK_DASHBOARD_KPIS,
  MOCK_RECENT_SUBMISSIONS,
  MOCK_PENDING_REWARDS,
  MOCK_ACTIVE_MISSIONS,
  MOCK_STUDENTS_FOR_QUICK_AWARD,
  MOCK_TOP_STUDENTS_MONTHLY,
  MOCK_CLASS_ACTIVITIES,
  MOCK_STUDENTS_NEEDING_ATTENTION,
  MOCK_COIN_BREAKDOWN,
} from "../data/mockTeacherDashboardData";
import {
  TeacherDashboardKpiStats,
  DashboardRecentSubmissionItem,
  DashboardPendingRewardItem,
  DashboardActiveMissionItem,
  DashboardStudentQuickAwardItem,
  DashboardTopStudentItem,
  DashboardClassActivityItem,
  DashboardStudentAttentionItem,
  DashboardCoinBreakdownStats,
} from "../types";

export interface UseTeacherDashboardReturn {
  // Lớp học đang active từ Header
  activeClassName: string | null;

  // Thống kê KPIs theo lớp
  kpis: TeacherDashboardKpiStats;

  // Danh sách bài nộp gần nhất theo lớp
  recentSubmissions: DashboardRecentSubmissionItem[];
  handleQuickApproveSubmission: (submissionId: string) => void;

  // Bảng vàng thi đua Top 5 học sinh tháng này
  topStudents: DashboardTopStudentItem[];

  // Học sinh cần nhắc nhở học tập
  attentionStudents: DashboardStudentAttentionItem[];

  // Cơ cấu nguồn xu & Quỹ đổi thưởng tháng này
  coinBreakdown: DashboardCoinBreakdownStats;

  // Dòng sự kiện hoạt động lớp học gần nhất
  activities: DashboardClassActivityItem[];

  // Danh sách đổi quà chờ trao theo lớp
  pendingRewards: DashboardPendingRewardItem[];
  handleHandoverReward: (rewardId: string) => void;
  handleRejectReward: (rewardId: string) => void;

  // Danh sách bài tập đang theo dõi tiến độ theo lớp
  activeMissions: DashboardActiveMissionItem[];

  // Widget Thưởng nóng xu theo lớp
  studentsForAward: DashboardStudentQuickAwardItem[];
  selectedStudentId: string;
  setSelectedStudentId: (studentId: string) => void;
  selectedCoinAmount: number;
  setSelectedCoinAmount: (amount: number) => void;
  awardReason: string;
  setAwardReason: (reason: string) => void;
  isSubmittingAward: boolean;
  handleAwardCoins: () => void;
}

export function useTeacherDashboard(): UseTeacherDashboardReturn {
  // Lấy lớp học đang active từ Header Workspace Store
  const { classes, selectedClassId } = useTeacherWorkspaceStore();

  const activeClass = useMemo(() => {
    if (!classes.length) return null;
    return classes.find((c) => c.id === selectedClassId) || classes[0] || null;
  }, [classes, selectedClassId]);

  const activeClassName = activeClass ? activeClass.class_name : null;

  // State cục bộ dữ liệu
  const [submissions, setSubmissions] = useState<DashboardRecentSubmissionItem[]>(
    MOCK_RECENT_SUBMISSIONS
  );
  const [rewards, setRewards] = useState<DashboardPendingRewardItem[]>(
    MOCK_PENDING_REWARDS
  );
  const [students, setStudents] = useState<DashboardStudentQuickAwardItem[]>(
    MOCK_STUDENTS_FOR_QUICK_AWARD
  );

  // Quick coin award state
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [selectedCoinAmount, setSelectedCoinAmount] = useState<number>(20);
  const [awardReason, setAwardReason] = useState<string>("Phát biểu hăng hái xây dựng bài");
  const [isSubmittingAward, setIsSubmittingAward] = useState<boolean>(false);

  // Helper hàm so khớp item với lớp học đang active trên Header
  const matchesActiveClass = useCallback(
    (itemClassId?: string, itemClassName?: string) => {
      if (!activeClass) return true;
      if (itemClassId && itemClassId === activeClass.id) return true;
      if (!itemClassName) return false;

      const normItem = itemClassName.toLowerCase().replace(/\s+/g, "");
      const normActive = activeClass.class_name.toLowerCase().replace(/\s+/g, "");
      return normItem === normActive || normItem.includes(normActive) || normActive.includes(normItem);
    },
    [activeClass]
  );

  // 1. Lọc bài nộp theo lớp đang active
  const filteredSubmissions = useMemo(() => {
    if (!activeClass) return submissions;
    const matched = submissions.filter((s) => matchesActiveClass(s.class_id, s.class_name));
    return matched.length > 0 ? matched : submissions;
  }, [submissions, activeClass, matchesActiveClass]);

  // 2. Lọc quà tặng theo lớp đang active
  const filteredRewards = useMemo(() => {
    if (!activeClass) return rewards;
    const matched = rewards.filter((r) => matchesActiveClass(r.class_id, r.class_name));
    return matched.length > 0 ? matched : rewards;
  }, [rewards, activeClass, matchesActiveClass]);

  // 3. Lọc học sinh để thưởng nóng xu theo lớp đang active
  const filteredStudents = useMemo(() => {
    if (!activeClass) return students;
    const matched = students.filter((st) => matchesActiveClass(st.class_id, st.class_name));
    return matched.length > 0 ? matched : students;
  }, [students, activeClass, matchesActiveClass]);

  // 4. Lọc bài tập đang mở theo lớp đang active
  const filteredMissions = useMemo(() => {
    if (!activeClass) return MOCK_ACTIVE_MISSIONS;
    const matched = MOCK_ACTIVE_MISSIONS.filter((m) =>
      m.assigned_class_names.some((cName) => matchesActiveClass(undefined, cName))
    );
    return matched.length > 0 ? matched : MOCK_ACTIVE_MISSIONS;
  }, [activeClass, matchesActiveClass]);

  // 5. Bảng vàng thi đua Top 3 tháng này (tự động cập nhật thứ hạng theo lớp hoặc toàn khối)
  const topStudents = useMemo(() => {
    const source = !activeClass
      ? MOCK_TOP_STUDENTS_MONTHLY
      : (() => {
          const matched = MOCK_TOP_STUDENTS_MONTHLY.filter((st) =>
            matchesActiveClass(undefined, st.class_name)
          );
          return matched.length > 0 ? matched : MOCK_TOP_STUDENTS_MONTHLY;
        })();

    return source.slice(0, 3).map((st, index) => ({
      ...st,
      rank: index + 1,
    }));
  }, [activeClass, matchesActiveClass]);

  // 6. Hoạt động lớp học gần nhất
  const activities = useMemo(() => {
    if (!activeClass) return MOCK_CLASS_ACTIVITIES;
    const matched = MOCK_CLASS_ACTIVITIES.filter((act) =>
      matchesActiveClass(undefined, act.class_name)
    );
    return matched.length > 0 ? matched : MOCK_CLASS_ACTIVITIES;
  }, [activeClass, matchesActiveClass]);

  // 6b. Học sinh cần nhắc nhở theo lớp đang active
  const attentionStudents = useMemo(() => {
    if (!activeClass) return MOCK_STUDENTS_NEEDING_ATTENTION;
    const matched = MOCK_STUDENTS_NEEDING_ATTENTION.filter((st) =>
      matchesActiveClass(st.class_id, st.class_name)
    );
    return matched.length > 0 ? matched : MOCK_STUDENTS_NEEDING_ATTENTION;
  }, [activeClass, matchesActiveClass]);

  // 7. Derived KPIs tương ứng theo lớp học đang active
  const kpis: TeacherDashboardKpiStats = useMemo(() => {
    const pendingSubs = filteredSubmissions.filter(
      (s) => s.approval_status === SubmissionApprovalStatus.PENDING_APPROVAL
    ).length;
    const pendingRews = filteredRewards.filter((r) => r.status === "pending").length;
    const activeMissionsCount = filteredMissions.filter((m) => !m.is_expired).length;

    return {
      ...MOCK_DASHBOARD_KPIS,
      pending_submissions_count: pendingSubs,
      pending_rewards_count: pendingRews,
      active_missions_count: activeMissionsCount,
      total_students_count: activeClass?.student_count ?? MOCK_DASHBOARD_KPIS.total_students_count,
    };
  }, [filteredSubmissions, filteredRewards, filteredMissions, activeClass]);

  // Xử lý duyệt nhanh bài tập trực tiếp ngay tại Dashboard
  const handleQuickApproveSubmission = useCallback(
    (submissionId: string) => {
      const target = submissions.find((s) => s.id === submissionId);
      if (!target) return;

      const coinsToAward = target.ai_suggested_coins || 30;

      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === submissionId
            ? {
                ...s,
                approval_status: SubmissionApprovalStatus.APPROVED,
                final_coins: coinsToAward,
                final_score: s.ai_score,
              }
            : s
        )
      );

      toast.success(
        `Đã duyệt bài của học sinh ${target.student_name}! +${coinsToAward} xu đã được cộng vào Heo Đất.`
      );
    },
    [submissions]
  );

  // Xử lý xác nhận đã trao quà cho học sinh tại lớp
  const handleHandoverReward = useCallback(
    (rewardId: string) => {
      const target = rewards.find((r) => r.id === rewardId);
      if (!target) return;

      setRewards((prev) =>
        prev.map((r) =>
          r.id === rewardId ? { ...r, status: "completed" } : r
        )
      );

      toast.success(`Đã xác nhận trao phần quà "${target.item_name}" cho học sinh ${target.student_name}! 🎉`);
    },
    [rewards]
  );

  // Xử lý từ chối yêu cầu đổi quà
  const handleRejectReward = useCallback(
    (rewardId: string) => {
      const target = rewards.find((r) => r.id === rewardId);
      if (!target) return;

      setRewards((prev) =>
        prev.map((r) =>
          r.id === rewardId ? { ...r, status: "rejected" } : r
        )
      );

      toast.info(`Đã từ chối yêu cầu đổi quà của học sinh ${target.student_name}.`);
    },
    [rewards]
  );

  // Xử lý thưởng nóng xu tại lớp học
  const handleAwardCoins = useCallback(() => {
    if (!selectedStudentId) {
      toast.error("Vui lòng chọn học sinh được khen thưởng!");
      return;
    }

    const student = students.find((s) => s.id === selectedStudentId);
    if (!student) return;

    setIsSubmittingAward(true);

    setTimeout(() => {
      setStudents((prev) =>
        prev.map((s) =>
          s.id === selectedStudentId
            ? { ...s, current_coins: s.current_coins + selectedCoinAmount }
            : s
        )
      );

      setIsSubmittingAward(false);
      setSelectedStudentId("");
      toast.success(
        `Đã thưởng nóng +${selectedCoinAmount} xu Heo Đất cho em ${student.full_name} (${student.class_name})! 🌟`
      );
    }, 300);
  }, [selectedStudentId, selectedCoinAmount, students]);

  return {
    activeClassName,
    kpis,
    recentSubmissions: filteredSubmissions,
    handleQuickApproveSubmission,
    topStudents,
    attentionStudents,
    coinBreakdown: MOCK_COIN_BREAKDOWN,
    activities,
    pendingRewards: filteredRewards,
    handleHandoverReward,
    handleRejectReward,
    activeMissions: filteredMissions,
    studentsForAward: filteredStudents,
    selectedStudentId,
    setSelectedStudentId,
    selectedCoinAmount,
    setSelectedCoinAmount,
    awardReason,
    setAwardReason,
    isSubmittingAward,
    handleAwardCoins,
  };
}
