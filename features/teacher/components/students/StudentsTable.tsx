import {
  Phone,
  Calendar,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from "lucide-react";
import { StudentItem, StudentSortField, SortDirection } from "./types";
import {
  StudentStatusBadge,
  StudentClassBadge,
  StudentPinBadge,
  StudentCoinsBadge,
} from "./StudentBadges";
import { StudentRowActions } from "./StudentRowActions";
import { getStudentInitial } from "./constants";
import { formatDate } from "@/lib/date";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { useManageStudentsContext } from "../../contexts/ManageStudentsContext";

interface StudentsTableProps {
  items?: StudentItem[];
  sortField?: StudentSortField | null;
  sortDirection?: SortDirection;
  onSortToggle?: (field: StudentSortField) => void;
  onChangeClass?: (item: StudentItem) => void;
  onEdit?: (item: StudentItem) => void;
  onAdjustCoins?: (item: StudentItem) => void;
  onResetPin?: (item: StudentItem) => void;
  onToggleStatus?: (item: StudentItem) => void;
  onDelete?: (item: StudentItem) => void;
  onRestore?: (item: StudentItem) => void;
  onPermanentDelete?: (item: StudentItem) => void;
}

export function StudentsTable(props?: StudentsTableProps) {
  const context = useManageStudentsContext();
  const items = props?.items ?? context.filteredStudents;
  const sortField =
    props?.sortField !== undefined ? props.sortField : context.sortField;
  const sortDirection = props?.sortDirection ?? context.sortDirection;
  const onSortToggle = props?.onSortToggle ?? context.handleSortToggle;
  const onChangeClass = props?.onChangeClass ?? context.handleOpenChangeClass;
  const onEdit = props?.onEdit ?? context.handleOpenEditStudent;
  const onAdjustCoins = props?.onAdjustCoins ?? context.handleOpenAdjustCoins;
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
                aria-label="Chọn tất cả học sinh"
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

          {/* Cột Trạng thái PIN */}
          <TableHead className="min-w-[150px]">
            <button
              type="button"
              onClick={() => onSortToggle("pin_status")}
              className="flex items-center text-xs font-bold text-slate-700 hover:text-[#0A62D6] transition-colors cursor-pointer select-none"
            >
              <span>Bảo mật PIN</span>
              {renderSortIcon("pin_status")}
            </button>
          </TableHead>

          {/* Cột Trạng thái tài khoản */}
          <TableHead className="min-w-[110px]">
            <span className="text-xs font-bold text-slate-700 select-none">
              Trạng thái
            </span>
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
          <TableHead className="w-36 text-right pr-6">
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
                    aria-label={`Chọn học sinh ${student.full_name}`}
                  />
                </div>
              </TableCell>

              {/* Tên & SĐT phụ huynh */}
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                    {avatarLetter}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-[13px] text-[#0F172A] truncate">
                      {student.full_name}
                    </div>
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
                />
              </TableCell>

              {/* Bảo mật PIN */}
              <TableCell>
                <StudentPinBadge
                  failedAttempts={student.failed_login_attempts}
                  lockedUntil={student.locked_until}
                />
              </TableCell>

              {/* Trạng thái tài khoản */}
              <TableCell>
                <StudentStatusBadge
                  isActive={student.is_active}
                  isDeleted={student.is_deleted}
                />
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

