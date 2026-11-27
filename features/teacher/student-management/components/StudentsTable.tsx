import Image from "next/image";
import {
  Phone,
  Calendar,
  Clock,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from "lucide-react";
import { StudentSortField } from "@/features/teacher/student-management/types";
import {
  StudentStatusBadge,
  StudentClassBadge,
  StudentCoinsBadge,
} from "@/features/teacher/student-management/components/StudentBadges";
import { StudentRowActions } from "./StudentRowActions";
import { getStudentInitial } from "@/features/teacher/student-management/constants";
import { formatDate } from "@/lib/date";
import { Tooltip } from "@/components/ui/tooltip";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { useManageStudentsContext } from "@/features/teacher/student-management/contexts/ManageStudentsContext";

export function StudentsTable() {
  const {
    paginatedStudents: items,
    sortField,
    sortDirection,
    handleSortToggle: onSortToggle,
    handleOpenEditStudent: onEdit,
    handleOpenTransactions: onOpenTransactions,
    handleToggleSelect,
    handleSelectAll,
    isSelected,
    isAllSelected,
    maxFailedAttempts,
  } = useManageStudentsContext();

  const allVisibleIds = items.map((i) => i.id);
  const isAllChecked = isAllSelected(allVisibleIds);

  const renderSortIcon = (field: StudentSortField) => {
    if (sortField !== field || sortDirection === "none") {
      return (
        <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400 ml-1 shrink-0" />
      );
    }
    if (sortDirection === "asc") {
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
                onChange={() => handleSelectAll(allVisibleIds)}
                className="w-4 h-4 rounded border-slate-300 text-[#0A62D6] focus:ring-[#0A62D6] cursor-pointer"
              />
            </div>
          </TableHead>

          {/* Cột Học sinh & SĐT phụ huynh */}
          <TableHead className="min-w-[200px]">
            <button
              type="button"
              onClick={() => onSortToggle("full_name")}
              className="flex items-center text-xs font-bold text-slate-700 hover:text-[#0A62D6] transition-colors cursor-pointer select-none"
            >
              <span>Học sinh</span>
              {renderSortIcon("full_name")}
            </button>
          </TableHead>

          {/* Cột Lớp học */}
          <TableHead className="min-w-[130px]">
            <button
              type="button"
              onClick={() => onSortToggle("class_name")}
              className="flex items-center text-xs font-bold text-slate-700 hover:text-[#0A62D6] transition-colors cursor-pointer select-none"
            >
              <span>Lớp học</span>
              {renderSortIcon("class_name")}
            </button>
          </TableHead>

          {/* Cột Số xu (Ví / Tổng) */}
          <TableHead className="min-w-[140px]" align="center">
            <button
              type="button"
              onClick={() => onSortToggle("current_coins")}
              className="flex items-center text-xs font-bold text-slate-700 hover:text-[#0A62D6] transition-colors cursor-pointer select-none mx-auto"
            >
              <span>Số xu (Ví / Tổng)</span>
              {renderSortIcon("current_coins")}
            </button>
          </TableHead>

          {/* Cột Trạng thái tài khoản & Bảo mật PIN (Đã gộp) */}
          <TableHead className="min-w-[140px]">
            <span className="text-xs font-bold text-slate-700 select-none">
              Trạng thái
            </span>
          </TableHead>

          {/* Cột Đăng nhập lần cuối */}
          <TableHead className="min-w-[150px]">
            <button
              type="button"
              onClick={() => onSortToggle("last_login_at")}
              className="flex items-center text-xs font-bold text-slate-700 hover:text-[#0A62D6] transition-colors cursor-pointer select-none"
            >
              <span>Lần cuối đăng nhập</span>
              {renderSortIcon("last_login_at")}
            </button>
          </TableHead>

          {/* Cột Ngày tham gia */}
          <TableHead className="min-w-[110px]">
            <button
              type="button"
              onClick={() => onSortToggle("created_at")}
              className="flex items-center text-xs font-bold text-slate-700 hover:text-[#0A62D6] transition-colors cursor-pointer select-none"
            >
              <span>Ngày vào lớp</span>
              {renderSortIcon("created_at")}
            </button>
          </TableHead>

          {/* Cột Thao tác */}
          <TableHead className="w-20 text-right pr-6">
            <span className="text-xs font-bold text-slate-700 select-none">
              Thao tác
            </span>
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {items.map((student) => {
          const checked = isSelected(student.id);
          const avatarLetter = getStudentInitial(student.full_name);

          return (
            <TableRow
              key={student.id}
              className={`transition-colors ${
                checked
                  ? "bg-[#EAF2FF]/40 hover:bg-[#EAF2FF]/60"
                  : "hover:bg-slate-50/70"
              }`}
            >
              {/* Checkbox dòng */}
              <TableCell className="w-12 px-4">
                <div className="flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleToggleSelect(student.id)}
                    className="w-4 h-4 rounded border-slate-300 text-[#0A62D6] focus:ring-[#0A62D6] cursor-pointer"
                  />
                </div>
              </TableCell>

              {/* Tên & SĐT phụ huynh */}
              <TableCell>
                <div className="flex items-center gap-3">
                  {student.avatar_url ? (
                    <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 shadow-2xs border border-slate-200 bg-slate-100 flex items-center justify-center relative">
                      <Image
                        src={student.avatar_url}
                        alt={student.full_name}
                        width={40}
                        height={40}
                        unoptimized
                        style={{ height: "auto" }}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                      {avatarLetter}
                    </div>
                  )}
                  <div className="min-w-0">
                    {student.is_deleted ? (
                      <span className="font-bold text-xs sm:text-sm text-slate-400 line-through block truncate">
                        {student.full_name}
                      </span>
                    ) : (
                      <Tooltip content={`Click để chỉnh sửa thông tin học sinh ${student.full_name}`} side="top">
                        <button
                          type="button"
                          onClick={() => onEdit?.(student)}
                          className="text-left font-bold text-xs sm:text-sm text-[#0F172A] hover:text-[#0A62D6] hover:underline transition-colors block truncate cursor-pointer"
                        >
                          {student.full_name}
                        </button>
                      </Tooltip>
                    )}
                    {student.phone_zalo ? (
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{student.phone_zalo}</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              </TableCell>

              {/* Lớp học */}
              <TableCell>
                <StudentClassBadge className={student.class_name} />
              </TableCell>

              {/* Số xu (Ví / Tổng) */}
              <TableCell align="center">
                <StudentCoinsBadge
                  currentCoins={student.current_coins}
                  totalEarnedCoins={student.total_earned_coins}
                  onClick={() => onOpenTransactions(student)}
                />
              </TableCell>

              {/* Trạng thái học sinh (Gộp trạng thái tài khoản & Bảo mật PIN) */}
              <TableCell>
                <StudentStatusBadge
                  isActive={student.is_active}
                  isDeleted={student.is_deleted}
                  failedAttempts={student.failed_login_attempts}
                  maxFailedAttempts={maxFailedAttempts}
                  lockedUntil={student.locked_until}
                  lockRemainingText={student.lock_remaining_text}
                />
              </TableCell>

              {/* Đăng nhập lần cuối */}
              <TableCell className="whitespace-nowrap">
                {student.last_login_at ? (
                  <div className="inline-flex items-center gap-1.5 text-xs font-sans font-medium text-slate-700 tabular-nums">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{student.last_login_at}</span>
                  </div>
                ) : (
                  <span className="text-slate-400 text-xs italic">
                    Chưa đăng nhập
                  </span>
                )}
              </TableCell>

              {/* Ngày vào lớp */}
              <TableCell>
                <span className="text-xs text-[#475569] flex items-center gap-1 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{formatDate(student.created_at)}</span>
                </span>
              </TableCell>

              {/* Cột Hành động */}
              <TableCell className="text-right pr-6">
                <StudentRowActions item={student} />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

