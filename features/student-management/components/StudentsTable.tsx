import Image from "next/image";
import {
  Phone,
  Calendar,
  Clock,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from "lucide-react";
import { StudentItem, StudentSortField, SortDirection } from "@/features/student-management/types";
import {
  StudentStatusBadge,
  StudentClassBadge,
  StudentCoinsBadge,
} from "@/features/student-management/components/StudentBadges";
import { StudentRowActions } from "./StudentRowActions";
import { getStudentInitial } from "@/features/student-management/constants";
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
import { useManageStudentsContext } from "@/features/student-management/contexts/ManageStudentsContext";

interface StudentsTableProps {
  items?: StudentItem[];
  sortField?: StudentSortField | null;
  sortDirection?: SortDirection;
  onSortToggle?: (field: StudentSortField) => void;
  onChangeClass?: (item: StudentItem) => void;
  onEdit?: (item: StudentItem) => void;
  onAdjustCoins?: (item: StudentItem) => void;
  onOpenTransactions?: (item: StudentItem) => void;
  onResetPin?: (item: StudentItem) => void;
  onToggleStatus?: (item: StudentItem) => void;
  onDelete?: (item: StudentItem) => void;
  onRestore?: (item: StudentItem) => void;
  onPermanentDelete?: (item: StudentItem) => void;
}

export function StudentsTable(props?: StudentsTableProps) {
  const context = useManageStudentsContext();
  const items = props?.items ?? context.paginatedStudents;
  const sortField =
    props?.sortField !== undefined ? props.sortField : context.sortField;
  const sortDirection = props?.sortDirection ?? context.sortDirection;
  const onSortToggle = props?.onSortToggle ?? context.handleSortToggle;
  const onChangeClass = props?.onChangeClass ?? context.handleOpenChangeClass;
  const onEdit = props?.onEdit ?? context.handleOpenEditStudent;
  const onAdjustCoins = props?.onAdjustCoins ?? context.handleOpenAdjustCoins;
  const onOpenTransactions =
    props?.onOpenTransactions ?? context.handleOpenTransactions;
  const onResetPin = props?.onResetPin ?? context.handleOpenResetPin;
  const onToggleStatus =
    props?.onToggleStatus ?? context.handleToggleStudentStatus;
  const onDelete = props?.onDelete ?? context.handleOpenDeleteModal;
  const onRestore = props?.onRestore ?? context.handleRestoreStudent;
  const onPermanentDelete =
    props?.onPermanentDelete ?? context.handleOpenPermanentModal;

  const {
    handleToggleSelect,
    handleSelectAll,
    isSelected,
    isAllSelected,
    restoringId,
  } = context;

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
                    <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 shadow-2xs border border-slate-200 bg-slate-100 flex items-center justify-center">
                      <Image
                        src={student.avatar_url}
                        alt={student.full_name}
                        width={36}
                        height={36}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                      {avatarLetter}
                    </div>
                  )}
                  <div className="min-w-0">
                    {student.is_deleted ? (
                      <span className="font-bold text-[13px] text-slate-400 line-through block truncate">
                        {student.full_name}
                      </span>
                    ) : (
                      <Tooltip content={`Click để chỉnh sửa thông tin học sinh ${student.full_name}`} side="top">
                        <button
                          type="button"
                          onClick={() => onEdit?.(student)}
                          className="text-left font-bold text-[13px] text-[#0F172A] hover:text-[#0A62D6] hover:underline transition-colors block truncate cursor-pointer"
                        >
                          {student.full_name}
                        </button>
                      </Tooltip>
                    )}
                    <div className="text-[11px] text-[#64748B] flex items-center gap-1 font-mono mt-0.5">
                      <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{student.phone_zalo}</span>
                    </div>
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
                <StudentRowActions
                  item={student}
                  onChangeClass={onChangeClass}
                  onEdit={onEdit}
                  onAdjustCoins={onAdjustCoins}
                  onResetPin={onResetPin}
                  onToggleStatus={onToggleStatus}
                  onDelete={onDelete}
                  onRestore={onRestore}
                  onPermanentDelete={onPermanentDelete}
                  isRestoring={restoringId === student.id}
                />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

