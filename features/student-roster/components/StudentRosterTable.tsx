"use client";

import Image from "next/image";
import {
  Phone,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  KeyRound,
  History,
  CheckCircle2,
  ShieldAlert,
  Award,
} from "lucide-react";
import {
  TeacherRosterStudent,
  StudentRosterSortField,
  SortOrder,
} from "../types";
import { Tooltip } from "@/components/ui/tooltip";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { StudentCoinsBadge } from "@/features/student-management/components/StudentBadges";
import { useOptionalStudentRosterContext } from "../contexts/StudentRosterContext";

interface StudentRosterTableProps {
  students?: TeacherRosterStudent[];
  selectedIds?: string[];
  onToggleSelect?: (id: string) => void;
  onSelectAll?: () => void;
  sortField?: StudentRosterSortField;
  sortOrder?: SortOrder;
  onSortToggle?: (field: StudentRosterSortField) => void;
  onQuickAward?: (student: TeacherRosterStudent) => void;
  onResetPin?: (student: TeacherRosterStudent) => void;
  onViewHistory?: (student: TeacherRosterStudent) => void;
  onViewRedeemedRewards?: (student: TeacherRosterStudent) => void;
  onViewMissions?: (student: TeacherRosterStudent) => void;
}

export function StudentRosterTable(props?: StudentRosterTableProps) {
  const context = useOptionalStudentRosterContext();

  const students = props?.students ?? context?.paginatedStudents ?? [];
  const selectedIds = props?.selectedIds ?? context?.selectedIds ?? [];
  const onToggleSelect =
    props?.onToggleSelect ?? context?.handleToggleSelect ?? (() => {});
  const onSelectAll =
    props?.onSelectAll ??
    (() => {
      context?.handleSelectAll(students.map((s) => s.id));
    });
  const sortField =
    props?.sortField ?? context?.sortField ?? "current_coins";
  const sortOrder = props?.sortOrder ?? context?.sortOrder ?? "desc";
  const onSortToggle =
    props?.onSortToggle ?? context?.handleSortToggle ?? (() => {});
  const onQuickAward = props?.onQuickAward ?? context?.handleQuickAward;
  const onResetPin = props?.onResetPin ?? context?.handleResetPin;
  const onViewHistory = props?.onViewHistory ?? context?.handleViewHistory;
  const onViewRedeemedRewards =
    props?.onViewRedeemedRewards ?? context?.handleViewRedeemedRewards;
  const onViewMissions = props?.onViewMissions ?? context?.handleViewMissions;
  const isAllChecked =
    students.length > 0 && selectedIds.length === students.length;

  const renderSortIcon = (field: StudentRosterSortField) => {
    if (sortField !== field || sortOrder === "none") {
      return (
        <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400 ml-1 shrink-0" />
      );
    }
    if (sortOrder === "asc") {
      return <ChevronUp className="w-3.5 h-3.5 text-[#0A62D6] ml-1 shrink-0" />;
    }
    return <ChevronDown className="w-3.5 h-3.5 text-[#0A62D6] ml-1 shrink-0" />;
  };

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          {/* Cột Checkbox chọn tất cả */}
          <TableHead className="w-12 px-4">
            <div className="flex items-center justify-center">
              <input
                type="checkbox"
                checked={isAllChecked}
                onChange={onSelectAll}
                className="w-4 h-4 rounded border-slate-300 text-[#0A62D6] focus:ring-[#0A62D6] cursor-pointer"
              />
            </div>
          </TableHead>

          {/* Cột Học sinh */}
          <TableHead className="min-w-[220px]">
            <button
              type="button"
              onClick={() => onSortToggle("full_name")}
              className="flex items-center text-xs font-bold text-slate-700 hover:text-[#0A62D6] transition-colors cursor-pointer select-none"
            >
              <span>Học sinh</span>
              {renderSortIcon("full_name")}
            </button>
          </TableHead>

          {/* Cột Số dư Heo Đất */}
          <TableHead className="min-w-[150px]">
            <button
              type="button"
              onClick={() => onSortToggle("current_coins")}
              className="flex items-center text-xs font-bold text-slate-700 hover:text-[#0A62D6] transition-colors cursor-pointer select-none"
            >
              <span>Số dư Heo Đất</span>
              {renderSortIcon("current_coins")}
            </button>
          </TableHead>

          {/* Cột Đã đổi bao nhiêu quà */}
          <TableHead className="min-w-[130px]">
            <button
              type="button"
              onClick={() => onSortToggle("redeemed_rewards_count")}
              className="flex items-center text-xs font-bold text-slate-700 hover:text-[#0A62D6] transition-colors cursor-pointer select-none"
            >
              <span>Đã đổi quà</span>
              {renderSortIcon("redeemed_rewards_count")}
            </button>
          </TableHead>

          {/* Cột Bài hoàn thành */}
          <TableHead className="min-w-[195px]">
            <button
              type="button"
              onClick={() => onSortToggle("completed_missions_count")}
              className="flex items-center text-xs font-bold text-slate-700 hover:text-[#0A62D6] transition-colors cursor-pointer select-none"
            >
              <span>Tiến độ bài tập</span>
              {renderSortIcon("completed_missions_count")}
            </button>
          </TableHead>

          {/* Cột Trạng thái PIN */}
          <TableHead className="min-w-[150px]">
            <span className="text-xs font-bold text-slate-700 select-none">
              Mã PIN
            </span>
          </TableHead>

          {/* Cột Thao tác */}
          <TableHead align="right" className="min-w-[140px]">
            <span className="text-xs font-bold text-slate-700 select-none">
              Thao tác
            </span>
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {students.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="py-12 text-center text-slate-500">
              <div className="flex flex-col items-center justify-center gap-2">
                <span className="text-sm font-semibold text-slate-700">
                  Không tìm thấy học sinh nào phù hợp
                </span>
                <span className="text-xs text-slate-400">
                  Thử thay đổi từ khóa tìm kiếm hoặc đặt lại bộ lọc
                </span>
              </div>
            </TableCell>
          </TableRow>
        ) : (
          students.map((st) => {
            const isSelected = selectedIds.includes(st.id);
            const totalMissions = st.total_missions_count || 0;
            const completedMissions = st.completed_missions_count || 0;
            const pendingMissions = st.pending_missions_count ?? 0;
            const unsubmittedMissions = Math.max(
              0,
              totalMissions - completedMissions - pendingMissions
            );

            const percentApproved = totalMissions > 0
              ? Math.min(100, Math.round((completedMissions / totalMissions) * 100))
              : 0;

            const percentPending = totalMissions > 0
              ? Math.min(
                  100 - percentApproved,
                  Math.round((pendingMissions / totalMissions) * 100)
                )
              : 0;

            return (
              <TableRow
                key={st.id}
                className={isSelected ? "bg-[#F0F6FE]/60" : undefined}
              >
                {/* 1. Checkbox chọn học sinh */}
                <TableCell className="w-12 px-4">
                  <div className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(st.id)}
                      className="w-4 h-4 rounded border-slate-300 text-[#0A62D6] focus:ring-[#0A62D6] cursor-pointer"
                    />
                  </div>
                </TableCell>

                {/* 2. Thông tin Học sinh (Avatar chibi + Họ tên + SĐT Zalo) */}
                <TableCell className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center shadow-2xs relative">
                      {st.avatar_url ? (
                        <Image
                          src={st.avatar_url}
                          alt={st.full_name}
                          width={40}
                          height={40}
                          unoptimized
                          style={{ height: "auto" }}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-bold text-slate-600 uppercase">
                          {st.full_name.slice(0, 2)}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-xs sm:text-sm text-[#0F172A] truncate">
                        {st.full_name}
                      </div>
                      {st.phone_zalo ? (
                        <div className="inline-flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{st.phone_zalo}</span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </TableCell>

                {/* 3. Số dư Heo Đất (Badge xu bóng bẩy) */}
                <TableCell className="py-3.5 px-4">
                  <StudentCoinsBadge
                    currentCoins={st.current_coins}
                    totalEarnedCoins={st.total_earned_coins ?? st.current_coins}
                    onClick={() => onViewHistory?.(st)}
                  />
                </TableCell>

                {/* 4. Đã đổi bao nhiêu quà */}
                <TableCell className="py-3.5 px-4">
                  {st.redeemed_rewards_count > 0 ? (
                    <button
                      type="button"
                      onClick={() => onViewRedeemedRewards?.(st)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#EAF2FF] text-[#0A62D6] border border-[#BFDBFE] hover:bg-[#D8E8FE] hover:border-[#93C5FD] shadow-2xs hover:shadow-xs active:scale-95 transition-all cursor-pointer whitespace-nowrap group"
                      title="Bấm để xem chi tiết các món quà và tiền mặt đã đổi"
                    >
                      <Image
                        src="/rewards/shopee_gift.png"
                        alt="Quà Heo Đất"
                        width={20}
                        height={20}
                        unoptimized
                        style={{ height: "auto" }}
                        className="w-4.5 h-4.5 object-contain group-hover:scale-110 transition-transform shrink-0"
                      />
                      <span>{st.redeemed_rewards_count} phần quà</span>
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400 italic">
                      Chưa từng đổi quà
                    </span>
                  )}
                </TableCell>

                {/* 5. Tiến độ bài tập */}
                <TableCell className="py-3.5 px-4">
                  <button
                    type="button"
                    onClick={() => onViewMissions?.(st)}
                    className="w-full text-left p-1.5 -m-1.5 rounded-lg hover:bg-slate-100/80 active:bg-slate-200/70 transition-all cursor-pointer group"
                    title="Bấm để xem danh sách bài tập đã giao của học sinh"
                  >
                    <div className="space-y-1.5 min-w-[155px] max-w-[185px]">
                      {/* Dòng 1: Số bài / Tổng bài + Tỷ lệ % */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#0F172A] group-hover:text-[#0A62D6] transition-colors">
                          {completedMissions}/{totalMissions} bài
                        </span>
                        <span className="text-[11px] font-bold text-emerald-600">
                          {percentApproved}%
                        </span>
                      </div>

                      {/* Dòng 2: Thanh tiến độ theo màu (Stacked Progress Bar: Xanh lá = Đã duyệt, Cam = Chờ duyệt) */}
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60 flex">
                        {percentApproved > 0 && (
                          <div
                            className="h-full bg-emerald-500 transition-all duration-300"
                            style={{ width: `${percentApproved}%` }}
                            title={`Đã duyệt: ${completedMissions} bài (${percentApproved}%)`}
                          />
                        )}
                        {percentPending > 0 && (
                          <div
                            className="h-full bg-amber-400 transition-all duration-300"
                            style={{ width: `${percentPending}%` }}
                            title={`Chờ duyệt: ${pendingMissions} bài (${percentPending}%)`}
                          />
                        )}
                      </div>

                      {/* Dòng 3: Badges nếu có bài chờ duyệt hoặc có bài chưa làm */}
                      {(pendingMissions > 0 || unsubmittedMissions > 0) && (
                        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                          {/* Badge nếu có bài chờ duyệt */}
                          {pendingMissions > 0 && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200/80 shrink-0">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                              <span>Chờ duyệt: {pendingMissions}</span>
                            </span>
                          )}

                          {/* Badge nếu có bài chưa làm */}
                          {unsubmittedMissions > 0 && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200/80 shrink-0">
                              <span>Chưa làm: {unsubmittedMissions}</span>
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </button>
                </TableCell>

                {/* 6. Trạng thái mã PIN */}
                <TableCell className="py-3.5 px-4">
                  {st.pin_status === "ok" ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Hoạt động</span>
                    </span>
                  ) : st.pin_status === "locked" ? (
                    <Tooltip
                      content="Tài khoản tạm khóa do nhập sai PIN quá 5 lần. Bấm Đặt lại PIN để cấp mã mới."
                      side="top"
                    >
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 whitespace-nowrap cursor-default">
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                        <span>Tạm khóa</span>
                      </span>
                    </Tooltip>
                  ) : (
                    <Tooltip
                      content={`Đã nhập sai ${st.failed_login_attempts || 3}/5 lần`}
                      side="top"
                    >
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 whitespace-nowrap cursor-default">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                        <span>Sai {st.failed_login_attempts || 3}/5 lần</span>
                      </span>
                    </Tooltip>
                  )}
                </TableCell>

                {/* 7. Cột Thao tác */}
                <TableCell align="right" className="py-3.5 px-4">
                  <div className="inline-flex items-center gap-1">
                    <Tooltip content="Thưởng nóng xu Heo Đất" side="top">
                      <button
                        type="button"
                        onClick={() => onQuickAward?.(st)}
                        className="p-2 rounded-xl bg-slate-50 hover:bg-amber-50 hover:text-amber-700 border border-slate-200 text-slate-600 transition-colors shadow-2xs cursor-pointer active:scale-95"
                      >
                        <Award className="w-4 h-4" />
                      </button>
                    </Tooltip>

                    <Tooltip content="Cấp lại mã PIN cho học sinh" side="top">
                      <button
                        type="button"
                        onClick={() => onResetPin?.(st)}
                        className={`p-2 rounded-xl border transition-colors shadow-2xs cursor-pointer active:scale-95 ${
                          st.pin_status === "locked"
                            ? "bg-rose-50 border-rose-300 text-rose-700 hover:bg-rose-100"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        <KeyRound className="w-4 h-4" />
                      </button>
                    </Tooltip>

                    <Tooltip content="Xem lịch sử sao kê xu" side="top">
                      <button
                        type="button"
                        onClick={() => onViewHistory?.(st)}
                        className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 transition-colors shadow-2xs cursor-pointer active:scale-95"
                      >
                        <History className="w-4 h-4" />
                      </button>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
}
