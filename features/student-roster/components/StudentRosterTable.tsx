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

interface StudentRosterTableProps {
  students: TeacherRosterStudent[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  sortField: StudentRosterSortField;
  sortOrder: SortOrder;
  onSortToggle: (field: StudentRosterSortField) => void;
  onQuickAward?: (student: TeacherRosterStudent) => void;
  onResetPin?: (student: TeacherRosterStudent) => void;
  onViewHistory?: (student: TeacherRosterStudent) => void;
  onViewRedeemedRewards?: (student: TeacherRosterStudent) => void;
}

export function StudentRosterTable({
  students,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  sortField,
  sortOrder,
  onSortToggle,
  onQuickAward,
  onResetPin,
  onViewHistory,
  onViewRedeemedRewards,
}: StudentRosterTableProps) {
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
              onClick={() => onSortToggle("fullName")}
              className="flex items-center text-xs font-bold text-slate-700 hover:text-[#0A62D6] transition-colors cursor-pointer select-none"
            >
              <span>Học sinh</span>
              {renderSortIcon("fullName")}
            </button>
          </TableHead>

          {/* Cột Số dư Heo Đất */}
          <TableHead className="min-w-[150px]">
            <button
              type="button"
              onClick={() => onSortToggle("coins")}
              className="flex items-center text-xs font-bold text-slate-700 hover:text-[#0A62D6] transition-colors cursor-pointer select-none"
            >
              <span>Số dư Heo Đất</span>
              {renderSortIcon("coins")}
            </button>
          </TableHead>

          {/* Cột Đã đổi bao nhiêu quà */}
          <TableHead className="min-w-[130px]">
            <button
              type="button"
              onClick={() => onSortToggle("redeemedRewards")}
              className="flex items-center text-xs font-bold text-slate-700 hover:text-[#0A62D6] transition-colors cursor-pointer select-none"
            >
              <span>Đã đổi quà</span>
              {renderSortIcon("redeemedRewards")}
            </button>
          </TableHead>

          {/* Cột Bài hoàn thành */}
          <TableHead className="min-w-[180px]">
            <button
              type="button"
              onClick={() => onSortToggle("completedMissions")}
              className="flex items-center text-xs font-bold text-slate-700 hover:text-[#0A62D6] transition-colors cursor-pointer select-none"
            >
              <span>Tiến độ bài tập</span>
              {renderSortIcon("completedMissions")}
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
            const progressPercent = Math.min(
              100,
              Math.round((st.missions.completed / st.missions.total) * 100)
            );

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

                {/* 2. Thông tin Học sinh (Avatar chibi + Họ tên + SĐT phụ huynh, đã bỏ mã học sinh) */}
                <TableCell className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center shadow-2xs relative">
                      {st.avatar ? (
                        <Image
                          src={st.avatar}
                          alt={st.fullName}
                          width={40}
                          height={40}
                          unoptimized
                          style={{ height: "auto" }}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-bold text-slate-600 uppercase">
                          {st.fullName.slice(0, 2)}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-xs sm:text-sm text-[#0F172A] truncate">
                        {st.fullName}
                      </div>
                      {st.parentPhone ? (
                        <div className="inline-flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{st.parentPhone}</span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </TableCell>

                {/* 3. Số dư Heo Đất (Badge xu bóng bẩy) */}
                <TableCell className="py-3.5 px-4">
                  <StudentCoinsBadge
                    currentCoins={st.coins}
                    totalEarnedCoins={st.coins + 350}
                    onClick={() => onViewHistory?.(st)}
                  />
                </TableCell>

                {/* 4. Đã đổi bao nhiêu quà */}
                <TableCell className="py-3.5 px-4">
                  {st.redeemedRewards > 0 ? (
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
                      <span>{st.redeemedRewards} phần quà</span>
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400 italic">
                      Chưa từng đổi quà
                    </span>
                  )}
                </TableCell>

                {/* 4. Tiến độ bài tập */}
                <TableCell className="py-3.5 px-4">
                  <div className="space-y-1.5 max-w-[140px]">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#0F172A]">
                        {st.missions.completed}/{st.missions.total} bài
                      </span>
                      <span className="text-[11px] font-semibold text-emerald-600">
                        {progressPercent}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                </TableCell>

                {/* 5. Trạng thái mã PIN */}
                <TableCell className="py-3.5 px-4">
                  {st.pinStatus === "ok" ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Hoạt động</span>
                    </span>
                  ) : st.pinStatus === "locked" ? (
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
                      content={`Đã nhập sai ${st.failedAttempts || 3}/5 lần`}
                      side="top"
                    >
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 whitespace-nowrap cursor-default">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                        <span>Sai {st.failedAttempts || 3}/5 lần</span>
                      </span>
                    </Tooltip>
                  )}
                </TableCell>

                {/* 6. Cột Thao tác */}
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
                          st.pinStatus === "locked"
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
