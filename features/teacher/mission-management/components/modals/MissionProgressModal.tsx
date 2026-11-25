"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  X,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Phone,
  GraduationCap,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { AppRoutes, CACHE_KEYS, SubmissionApprovalStatus } from "@/constants";
import { formatDate } from "@/lib/date";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal";
import {
  TeacherSelect,
  TeacherSelectOption,
} from "@/components/ui/TeacherSelect";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  TeacherMissionItem,
  MissionProgressFilterTab,
} from "../../types";
import useSWR from "swr";
import { missionService } from "../../services/missionService";
import { MissionStackedProgressBar } from "../MissionBadges";
import { useManageMissionsContext } from "../../contexts/ManageMissionsContext";
import {
  getMissionDeadlineMeta,
  normalizeText,
  getInitials,
} from "../../utils";

/**
 * Modal hiển thị chi tiết tiến độ làm bài của học sinh (ai làm rồi, ai chưa làm)
 * - Tự động bóc tách và phân loại 2 nhóm: "Đã nộp bài" và "Chưa nộp bài"
 * - Hỗ trợ lọc theo Lớp, lọc theo Trạng thái duyệt bài (Chờ duyệt / Đã duyệt)
 * - Tìm kiếm nhanh theo tên học sinh và số điện thoại phụ huynh
 * - Nút sao chép danh sách học sinh chưa nộp gửi nhóm Zalo phụ huynh tiện lợi
 * - Nút chuyển tiếp nhanh sang Studio Duyệt bài tập
 */
export function MissionProgressModal() {
  const {
    isProgressModalOpen: isOpen,
    handleCloseProgressModal: onClose,
    viewingProgressMission: mission,
  } = useManageMissionsContext();

  if (!isOpen || !mission) return null;

  return (
    <MissionProgressModalContent
      key={mission.id}
      mission={mission}
      onClose={onClose}
    />
  );
}

interface MissionProgressModalContentProps {
  mission: TeacherMissionItem;
  onClose: () => void;
}

function MissionProgressModalContent({
  mission,
  onClose,
}: MissionProgressModalContentProps) {
  const router = useRouter();

  // 1. Tải danh sách tiến độ làm bài thực tế từ database qua SWR
  const {
    data: allStudents = [],
    isLoading,
    mutate,
  } = useSWR(
    CACHE_KEYS.MISSIONS.PROGRESS(mission.id),
    () => missionService.getMissionProgress(mission.id),
    {
      revalidateOnFocus: false,
    }
  );

  // 2. Quản lý bộ lọc & tìm kiếm
  const [activeTab, setActiveTab] =
    useState<MissionProgressFilterTab>("all");
  const [selectedClassId, setSelectedClassId] = useState<string>("all");
  const [approvalFilter, setApprovalFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Quản lý sắp xếp các cột 3 cấp độ: Bình thường (none) ➔ Tăng dần (asc) ➔ Giảm dần (desc) ➔ Bình thường (none)
  type StudentSortField =
    | "student_name"
    | "submission_status"
    | "approval_status";
  type SortDirection = "asc" | "desc" | "none";

  const [sortField, setSortField] = useState<StudentSortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("none");

  const handleSortToggle = (field: StudentSortField) => {
    if (sortField !== field) {
      setSortField(field);
      setSortDirection("asc");
    } else if (sortDirection === "asc") {
      setSortDirection("desc");
    } else if (sortDirection === "desc") {
      setSortField(null);
      setSortDirection("none");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortHint = (field: StudentSortField) => {
    if (sortField !== field || sortDirection === "none") {
      return "Click để sắp xếp tăng dần";
    }
    if (sortDirection === "asc") {
      return "Đang tăng dần • Click để chuyển sang giảm dần";
    }
    return "Đang giảm dần • Click để trở về mặc định";
  };

  const renderSortIcon = (field: StudentSortField) => {
    if (sortField !== field || sortDirection === "none") {
      return (
        <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400 ml-1 shrink-0" />
      );
    }
    return sortDirection === "asc" ? (
      <ChevronUp className="w-3.5 h-3.5 text-[#0A62D6] ml-1 shrink-0" />
    ) : (
      <ChevronDown className="w-3.5 h-3.5 text-[#0A62D6] ml-1 shrink-0" />
    );
  };

  // 3. Tính toán các chỉ số KPI
  const totalCount = allStudents.length;
  const exemptCount = allStudents.filter((s) => s.is_exempt).length;
  const submittedCount = allStudents.filter(
    (s) => s.submission_status === "submitted"
  ).length;
  const notSubmittedCount = allStudents.filter(
    (s) => s.submission_status === "not_submitted" && !s.is_exempt
  ).length;

  const approvedCount = allStudents.filter(
    (s) => s.approval_status === SubmissionApprovalStatus.APPROVED
  ).length;
  const pendingCount = allStudents.filter(
    (s) => s.approval_status === SubmissionApprovalStatus.PENDING_APPROVAL
  ).length;
  const lateCount = allStudents.filter((s) => s.is_late).length;

  const effectiveTotal = Math.max(0, totalCount - exemptCount);
  const percentSubmitted =
    effectiveTotal > 0 ? Math.round((submittedCount / effectiveTotal) * 100) : 0;
  const percentApproved =
    effectiveTotal > 0 ? Math.round((approvedCount / effectiveTotal) * 100) : 0;
  const percentPending = Math.max(0, percentSubmitted - percentApproved);

  // State theo dõi học sinh đang được xử lý miễn bài tập (loading button)
  const [exemptingStudentId, setExemptingStudentId] = useState<string | null>(
    null
  );

  // Xử lý bật/tắt miễn bài tập cho học sinh
  const handleToggleExempt = async (
    studentId: string,
    currentExempt: boolean
  ) => {
    if (exemptingStudentId) return;
    setExemptingStudentId(studentId);
    try {
      const nextExempt = !currentExempt;
      await mutate(
        (prev) =>
          prev
            ? prev.map((s) =>
                s.id === studentId ? { ...s, is_exempt: nextExempt } : s
              )
            : [],
        false
      );
      await missionService.toggleExemptStudent(
        mission.id,
        studentId,
        nextExempt
      );
      mutate();
      toast.success(
        nextExempt
          ? "Đã đánh dấu miễn bài tập cho học sinh!"
          : "Đã hủy đánh dấu miễn bài tập!"
      );
    } catch {
      toast.error("Không thể cập nhật trạng thái miễn bài tập.");
      mutate();
    } finally {
      setExemptingStudentId(null);
    }
  };

  // 4. Lọc và Sắp xếp danh sách học sinh theo các tiêu chí
  const filteredStudents = useMemo(() => {
    const list = allStudents.filter((student) => {
      // Lọc theo Tab (Tất cả / Đã làm / Chưa làm)
      if (activeTab === "submitted" && student.submission_status !== "submitted") {
        return false;
      }
      if (
        activeTab === "not_submitted" &&
        student.submission_status !== "not_submitted"
      ) {
        return false;
      }

      // Lọc theo Lớp học
      if (selectedClassId !== "all" && student.class_id !== selectedClassId) {
        return false;
      }

      // Lọc theo Trạng thái duyệt (chỉ áp dụng cho bài đã nộp)
      if (
        approvalFilter !== "all" &&
        student.submission_status === "submitted" &&
        student.approval_status !== approvalFilter
      ) {
        return false;
      }

      // Lọc theo từ khóa tìm kiếm (Tên học sinh hoặc SĐT)
      if (searchQuery.trim()) {
        const query = normalizeText(searchQuery);
        const matchName = normalizeText(student.student_name).includes(query);
        const matchPhone = student.student_phone
          ? normalizeText(student.student_phone).includes(query)
          : false;
        if (!matchName && !matchPhone) return false;
      }

      return true;
    });

    if (!sortField || sortDirection === "none") return list;

    return [...list].sort((a, b) => {
      let comparison = 0;

      if (sortField === "student_name") {
        const getLastName = (name: string) => {
          const parts = name.trim().split(/\s+/);
          return parts[parts.length - 1] || name;
        };
        const lastA = getLastName(a.student_name);
        const lastB = getLastName(b.student_name);
        comparison =
          lastA.localeCompare(lastB, "vi") ||
          a.student_name.localeCompare(b.student_name, "vi");
      } else if (sortField === "submission_status") {
        const getStatusRank = (s: typeof a) => {
          if (s.submission_status !== "submitted") return 0;
          return s.is_late ? 1 : 2;
        };
        comparison = getStatusRank(b) - getStatusRank(a);
        if (comparison === 0 && a.submitted_at && b.submitted_at) {
          comparison =
            new Date(b.submitted_at).getTime() -
            new Date(a.submitted_at).getTime();
        }
      } else if (sortField === "approval_status") {
        const getApprovalRank = (s: typeof a) => {
          if (s.submission_status !== "submitted") return 0;
          if (s.approval_status === SubmissionApprovalStatus.PENDING_APPROVAL) return 3;
          if (s.approval_status === SubmissionApprovalStatus.APPROVED) return 2;
          return 1;
        };
        comparison = getApprovalRank(b) - getApprovalRank(a);
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [
    allStudents,
    activeTab,
    selectedClassId,
    approvalFilter,
    searchQuery,
    sortField,
    sortDirection,
  ]);

  // Danh sách các lớp được phân công
  const assignedClasses = mission.assigned_classes || [];

  // Thông tin hạn nộp
  const deadlineMeta = getMissionDeadlineMeta(
    mission.due_at,
    mission.is_active,
    mission.is_deleted
  );

  // Danh sách tùy chọn cho TeacherSelect lọc theo lớp
  const classFilterOptions: TeacherSelectOption[] = useMemo(
    () => [
      {
        label: "Tất cả các lớp",
        value: "all",
        badge: `${totalCount}`,
      },
      ...assignedClasses.map((cls) => ({
        label: cls.class_name,
        value: cls.id,
        badge: `${cls.student_count} HS`,
      })),
    ],
    [assignedClasses, totalCount]
  );

  // Danh sách tùy chọn cho TeacherSelect lọc trạng thái duyệt
  const approvalFilterOptions: TeacherSelectOption[] = useMemo(
    () => [
      {
        label: "Tất cả trạng thái duyệt",
        value: "all",
      },
      {
        label: "Chờ cô duyệt",
        value: SubmissionApprovalStatus.PENDING_APPROVAL,
        badge: `${pendingCount}`,
      },
      {
        label: "Đã duyệt",
        value: SubmissionApprovalStatus.APPROVED,
        badge: `${approvedCount}`,
      },
    ],
    [pendingCount, approvedCount]
  );

  // 5. Điều hướng sang Studio Duyệt bài
  const handleGoToStudio = (studentId?: string) => {
    onClose();
    const query = studentId
      ? `missionId=${mission.id}&studentId=${studentId}`
      : `missionId=${mission.id}`;
    router.push(`${AppRoutes.TEACHER.SUBMISSIONS}?${query}`);
  };

  return (
    <Modal isOpen onClose={onClose} maxWidth="4xl">
      {/* Header Modal */}
      <ModalHeader
        icon={<GraduationCap className="w-5 h-5 text-[#0A62D6]" />}
        title={
          <div className="flex items-center gap-2 flex-wrap">
            <span>Tiến độ làm bài:</span>
            <span className="text-[#0A62D6] font-bold">{mission.title}</span>
          </div>
        }
        description={
          <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500 mt-0.5">
            <span>
              Lớp:{" "}
              <strong className="text-slate-700">
                {assignedClasses.map((c) => c.class_name).join(", ") ||
                  "Chưa gán lớp"}
              </strong>
            </span>
            <span>•</span>
            <span>
              Hạn nộp:{" "}
              <strong
                className={
                  deadlineMeta.urgency === "expired"
                    ? "text-rose-600"
                    : "text-slate-700"
                }
              >
                {deadlineMeta.formattedTime} ngày {deadlineMeta.formattedDate} (
                {deadlineMeta.relativeLabel})
              </strong>
            </span>
          </div>
        }
        onClose={onClose}
      />

      <ModalBody className="p-5 space-y-4 max-h-[calc(90vh-140px)] overflow-y-auto">
        {/* Khối KPI Tổng quan & Thanh tiến độ 2 màu */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/80">
          {/* Card 1: Tổng học sinh */}
          <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Sĩ số được giao</span>
              <Users className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-xl font-bold text-[#0F172A] tabular-nums">
              {totalCount}{" "}
              <span className="text-xs font-semibold text-slate-500">
                học sinh
              </span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {assignedClasses.length} lớp học tham gia
            </div>
          </div>

          {/* Card 2: Đã nộp bài */}
          <div className="p-3 bg-white rounded-xl border border-emerald-200/70 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-emerald-700 mb-1">
              <span className="font-semibold">Đã nộp bài</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-emerald-700 tabular-nums">
                {submittedCount}/{totalCount}
              </span>
              <span className="text-xs font-bold text-emerald-600">
                ({percentSubmitted}%)
              </span>
            </div>
            {/* Thanh tiến độ mini 2 màu tái sử dụng */}
            <MissionStackedProgressBar
              percentApproved={percentApproved}
              percentPending={percentPending}
              heightClass="h-1.5"
              className="mt-1.5"
            />
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
              <span>Đã duyệt: {approvedCount}</span>
              <span className="text-amber-700 font-medium">
                Chờ duyệt: {pendingCount}
              </span>
            </div>
          </div>

          {/* Card 3: Chưa nộp bài */}
          <div className="p-3 bg-white rounded-xl border border-rose-200/70 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-rose-700 mb-1">
              <span className="font-semibold">Chưa nộp bài</span>
              <Clock className="w-4 h-4 text-rose-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-rose-700 tabular-nums">
                {notSubmittedCount}
              </span>
              <span className="text-xs font-semibold text-rose-600">
                học sinh (
                {totalCount > 0
                  ? Math.round((notSubmittedCount / totalCount) * 100)
                  : 0}
                %)
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] mt-1">
              <span
                className={
                  deadlineMeta.urgency === "expired"
                    ? "text-rose-600 font-semibold"
                    : "text-slate-500"
                }
              >
                {deadlineMeta.relativeLabel}
              </span>
              {lateCount > 0 && (
                <span className="text-rose-600 text-[10px] font-bold bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200/80">
                  {lateCount} nộp trễ
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Thanh công cụ & Tabs chuyển đổi */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            {/* Tabs chính: Tất cả / Đã làm / Chưa làm */}
            <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200/80 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === "all"
                    ? "bg-white text-[#0F172A] shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Tất cả ({totalCount})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("submitted")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === "submitted"
                    ? "bg-white text-emerald-700 shadow-xs"
                    : "text-slate-600 hover:text-emerald-700"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Đã làm ({submittedCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("not_submitted")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === "not_submitted"
                    ? "bg-white text-rose-700 shadow-xs"
                    : "text-slate-600 hover:text-rose-700"
                }`}
              >
                <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                <span>Chưa làm ({notSubmittedCount})</span>
                {exemptCount > 0 && (
                  <span className="text-[10px] px-1 py-0.2 rounded bg-purple-100 text-purple-700 font-bold">
                    {exemptCount} miễn
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Bộ lọc chi tiết: Lọc theo lớp, Lọc theo duyệt, Ô tìm kiếm */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* 1. Lọc theo lớp học */}
            {assignedClasses.length > 1 && (
              <div className="w-full sm:w-48 shrink-0">
                <TeacherSelect
                  size="sm"
                  options={classFilterOptions}
                  value={selectedClassId}
                  onChange={setSelectedClassId}
                  placeholder="Chọn lớp học"
                  className="h-8.5 text-xs font-medium border-slate-200"
                />
              </div>
            )}

            {/* 2. Lọc theo trạng thái duyệt bài (nếu ở tab Đã làm hoặc Tất cả) */}
            {activeTab !== "not_submitted" && (
              <div className="w-full sm:w-52 shrink-0">
                <TeacherSelect
                  size="sm"
                  options={approvalFilterOptions}
                  value={approvalFilter}
                  onChange={setApprovalFilter}
                  placeholder="Trạng thái duyệt"
                  className="h-8.5 text-xs font-medium border-slate-200"
                />
              </div>
            )}

            {/* 3. Ô tìm kiếm học sinh */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm tên học sinh hoặc số điện thoại..."
                className="w-full h-8.5 pl-8 pr-7 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0A62D6]/20"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bảng danh sách học sinh */}
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/80">
                <TableHead className="w-12 text-center text-xs">#</TableHead>
                <TableHead
                  onClick={() => handleSortToggle("student_name")}
                  title={getSortHint("student_name")}
                  className="text-xs cursor-pointer select-none hover:bg-slate-100/90 transition-colors"
                >
                  <div className="inline-flex items-center">
                    <span>Học sinh</span>
                    {renderSortIcon("student_name")}
                  </div>
                </TableHead>
                <TableHead
                  onClick={() => handleSortToggle("submission_status")}
                  title={getSortHint("submission_status")}
                  className="text-xs cursor-pointer select-none hover:bg-slate-100/90 transition-colors"
                >
                  <div className="inline-flex items-center">
                    <span>Trạng thái làm bài</span>
                    {renderSortIcon("submission_status")}
                  </div>
                </TableHead>
                <TableHead
                  onClick={() => handleSortToggle("approval_status")}
                  title={getSortHint("approval_status")}
                  className="text-xs cursor-pointer select-none hover:bg-slate-100/90 transition-colors"
                >
                  <div className="inline-flex items-center">
                    <span>Duyệt & Thưởng xu</span>
                    {renderSortIcon("approval_status")}
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <TableRow key={i} className="animate-pulse">
                    <TableCell className="w-12 text-center text-xs text-slate-300">
                      -
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5 py-1">
                        <div className="w-8.5 h-8.5 rounded-full bg-slate-200" />
                        <div className="space-y-1.5 flex-1">
                          <div className="h-3.5 w-28 bg-slate-200 rounded" />
                          <div className="h-2.5 w-20 bg-slate-100 rounded" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="h-5 w-24 bg-slate-200 rounded-full" />
                    </TableCell>
                    <TableCell>
                      <div className="h-5 w-20 bg-slate-100 rounded-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-12 text-center text-slate-500"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-2 text-slate-400">
                        <Search className="w-5 h-5" />
                      </div>
                      <p className="text-sm font-semibold text-slate-700">
                        Không tìm thấy học sinh nào phù hợp
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Thử điều chỉnh lại bộ lọc hoặc từ khóa tìm kiếm
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student, idx) => {
                  const isSubmitted = student.submission_status === "submitted";
                  const isPending =
                    student.approval_status === SubmissionApprovalStatus.PENDING_APPROVAL;
                  const isApproved =
                    student.approval_status === SubmissionApprovalStatus.APPROVED;

                  return (
                    <TableRow
                      key={student.id}
                      className={
                        !isSubmitted
                          ? "bg-rose-50/15 hover:bg-rose-50/30"
                          : isPending
                          ? "bg-amber-50/15 hover:bg-amber-50/30"
                          : "hover:bg-slate-50/70"
                      }
                    >
                      {/* Cột 1: STT */}
                      <TableCell className="w-12 text-center text-xs text-slate-500 tabular-nums">
                        {idx + 1}
                      </TableCell>

                      {/* Cột 2: Thông tin Học sinh (Có thể click vào để xem bài nộp nếu đã nộp) */}
                      <TableCell>
                        <div className="flex items-center gap-2.5 py-0.5">
                          {student.student_avatar ? (
                            <Image
                              src={student.student_avatar}
                              alt={student.student_name}
                              width={34}
                              height={34}
                              unoptimized
                              style={{ height: "auto" }}
                              className="w-8.5 h-8.5 rounded-full object-cover border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="w-8.5 h-8.5 rounded-full bg-[#EAF2FF] text-[#0A62D6] font-bold text-xs flex items-center justify-center border border-blue-200 shrink-0">
                              {getInitials(student.student_name, "H")}
                            </div>
                          )}
                          <div className="min-w-0">
                            {isSubmitted ? (
                              <button
                                type="button"
                                onClick={() => handleGoToStudio(student.id)}
                                title="Bấm để xem bài nộp trong Studio Duyệt bài"
                                className="font-semibold text-xs text-[#0F172A] hover:text-[#0A62D6] hover:underline text-left block truncate cursor-pointer"
                              >
                                {student.student_name}
                              </button>
                            ) : (
                              <span className="font-semibold text-xs text-[#0F172A] block truncate">
                                {student.student_name}
                              </span>
                            )}
                            {student.student_phone && (
                              <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 truncate">
                                <Phone className="w-2.5 h-2.5 text-slate-400" />
                                <span>{student.student_phone}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Cột 3: Trạng thái nộp bài */}
                      <TableCell className="whitespace-nowrap">
                        {isSubmitted ? (
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-[11px] font-bold">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Đã nộp bài</span>
                              </span>
                              {student.is_late ? (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200/80 text-[10px] font-bold">
                                  Nộp trễ
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200/80 text-[10px] font-medium">
                                  Đúng hạn
                                </span>
                              )}
                            </div>
                            {student.submitted_at && (
                              <span className="text-[10px] text-slate-500 block tabular-nums">
                                {formatDate(student.submitted_at, "dd/MM/yyyy HH:mm")}
                              </span>
                            )}
                          </div>
                        ) : student.is_exempt ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 border border-purple-200/80 text-[11px] font-bold">
                              <ShieldCheck className="w-3 h-3 text-purple-600" />
                              <span>Được miễn bài</span>
                            </span>
                            <span className="text-[10px] block font-medium text-purple-600">
                              Không tính nợ bài
                            </span>
                          </div>
                        ) : (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 border border-rose-200/80 text-[11px] font-bold">
                              <AlertCircle className="w-3 h-3 text-rose-500" />
                              <span>Chưa nộp</span>
                            </span>
                            <span
                              className={`text-[10px] block font-medium ${
                                deadlineMeta.urgency === "expired"
                                  ? "text-rose-600"
                                  : "text-slate-500"
                              }`}
                            >
                              {deadlineMeta.relativeLabel}
                            </span>
                          </div>
                        )}
                      </TableCell>

                      {/* Cột 4: Duyệt bài & Thưởng xu */}
                      <TableCell className="whitespace-nowrap">
                        {isSubmitted ? (
                          isApproved ? (
                            <div className="space-y-0.5">
                              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-[11px] font-bold">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>
                                  Đã duyệt (+
                                  {student.final_coins ??
                                    mission.max_reward_coins}{" "}
                                  xu)
                                </span>
                              </div>
                              {student.ai_score !== null &&
                                student.ai_score !== undefined && (
                                  <span className="text-[10px] text-slate-500 block">
                                    Điểm AI: {student.ai_score}/10
                                  </span>
                                )}
                            </div>
                          ) : isPending ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/80 text-[11px] font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                              <span>Chờ cô duyệt</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-semibold">
                              Cần làm lại
                            </span>
                          )
                        ) : (
                          <button
                            type="button"
                            disabled={exemptingStudentId === student.id}
                            onClick={() =>
                              handleToggleExempt(
                                student.id,
                                Boolean(student.is_exempt)
                              )
                            }
                            title={
                              student.is_exempt
                                ? "Click để hủy miễn bài tập cho học sinh này"
                                : "Click để miễn bài tập này cho học sinh"
                            }
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                              student.is_exempt
                                ? "bg-purple-100 hover:bg-purple-200 text-purple-800 border border-purple-300"
                                : "bg-slate-100 hover:bg-purple-50 text-slate-600 hover:text-purple-700 border border-slate-200 hover:border-purple-200"
                            }`}
                          >
                            {exemptingStudentId === student.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-600" />
                            ) : (
                              <ShieldCheck className="w-3.5 h-3.5" />
                            )}
                            <span>
                              {exemptingStudentId === student.id
                                ? "Đang xử lý..."
                                : student.is_exempt
                                ? "Bỏ miễn"
                                : "Miễn bài"}
                            </span>
                          </button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </ModalBody>

      {/* Footer Modal */}
      <ModalFooter className="flex items-center justify-between p-4 bg-slate-50/80 border-t border-slate-200">
        <span className="text-xs text-slate-500">
          Hiển thị <strong>{filteredStudents.length}</strong> /{" "}
          <strong>{totalCount}</strong> học sinh
        </span>

        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center justify-center h-9 px-5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors cursor-pointer"
        >
          Đóng
        </button>
      </ModalFooter>
    </Modal>
  );
}
