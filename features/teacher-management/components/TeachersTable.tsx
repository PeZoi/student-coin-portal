import {
  Phone,
  Mail,
  Clock,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import { TeacherStaffItem, TeacherSortField, SortDirection } from "@/features/teacher-management/types";
import { TeacherStatusBadge, AssignedClassesList } from "./TeacherBadges";
import { TeacherRowActions } from "./TeacherRowActions";
import { getTeacherColor, getTeacherInitial } from "@/features/class-management/utils";
import { formatDate } from "@/lib/date";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { useManageTeachersContext } from "@/features/teacher-management/contexts/ManageTeachersContext";

interface TeachersTableProps {
  items?: TeacherStaffItem[];
  sortField?: TeacherSortField | null;
  sortDirection?: SortDirection;
  onSortToggle?: (field: TeacherSortField) => void;
  onAssignClasses?: (item: TeacherStaffItem) => void;
  onEdit?: (item: TeacherStaffItem) => void;
  onResetPassword?: (item: TeacherStaffItem) => void;
  onToggleStatus?: (item: TeacherStaffItem) => void;
  onViewDetails?: (item: TeacherStaffItem) => void;
  onDelete?: (item: TeacherStaffItem) => void;
  onRestore?: (item: TeacherStaffItem) => void;
  onPermanentDelete?: (item: TeacherStaffItem) => void;
}

export function TeachersTable(props?: TeachersTableProps) {
  const context = useManageTeachersContext();
  const items = props?.items ?? context.filteredTeachers;
  const sortField =
    props?.sortField !== undefined ? props.sortField : context.sortField;
  const sortDirection = props?.sortDirection ?? context.sortDirection;
  const onSortToggle = props?.onSortToggle ?? context.handleSortToggle;
  const onAssignClasses =
    props?.onAssignClasses ?? context.handleOpenAssignClasses;
  const onEdit = props?.onEdit ?? context.handleOpenEditTeacher;
  const onResetPassword =
    props?.onResetPassword ?? context.handleOpenResetPassword;
  const onToggleStatus =
    props?.onToggleStatus ?? context.handleToggleTeacherStatus;
  const onDelete = props?.onDelete ?? context.handleOpenDeleteModal;
  const onRestore = props?.onRestore ?? context.handleRestoreTeacher;
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

  const renderSortIcon = (field: TeacherSortField) => {
    if (sortField !== field || sortDirection === "none") {
      return (
        <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400 ml-1 shrink-0" />
      );
    }
    if (sortDirection === "asc") {
      return (
        <ChevronUp className="w-3.5 h-3.5 text-[#0A62D6] ml-1 shrink-0" />
      );
    }
    return (
      <ChevronDown className="w-3.5 h-3.5 text-[#0A62D6] ml-1 shrink-0" />
    );
  };

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          {/* Cột Checkbox chọn tất cả (Chỉ Quản trị viên tối cao) */}
          {context.isAdmin && (
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
          )}

          {/* 1. Giáo viên & Tài khoản (Sắp xếp) */}
          <TableHead>
            <button
              type="button"
              onClick={() => onSortToggle("full_name")}
              className="inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer select-none"
            >
              <span>Giáo viên</span>
              {renderSortIcon("full_name")}
            </button>
          </TableHead>

          {/* 2. Liên hệ (phone_zalo, email) */}
          <TableHead>Thông tin liên hệ</TableHead>

          {/* 3. Lớp đang phụ trách (Sắp xếp) */}
          <TableHead>
            <button
              type="button"
              onClick={() => onSortToggle("assigned_classes")}
              className="inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer select-none"
            >
              <span>Lớp phụ trách</span>
              {renderSortIcon("assigned_classes")}
            </button>
          </TableHead>

          {/* 4. Trạng thái */}
          <TableHead>Trạng thái</TableHead>

          {/* 5. Đăng nhập lần cuối (Sắp xếp) */}
          <TableHead>
            <button
              type="button"
              onClick={() => onSortToggle("last_login_at")}
              className="inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer select-none whitespace-nowrap"
            >
              <span>Lần cuối đăng nhập</span>
              {renderSortIcon("last_login_at")}
            </button>
          </TableHead>

          {/* 6. Ngày tạo (Sắp xếp) */}
          <TableHead>
            <button
              type="button"
              onClick={() => onSortToggle("created_at")}
              className="inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer select-none whitespace-nowrap"
            >
              <span>Ngày tạo</span>
              {renderSortIcon("created_at")}
            </button>
          </TableHead>

          {/* 7. Thao tác */}
          <TableHead align="right">Thao tác</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {items.map((item) => {
          const color = getTeacherColor(item.full_name);
          const initial = getTeacherInitial(item.full_name);
          const checked = isSelected(item.id);

          return (
            <TableRow
              key={item.id}
              className={`transition-colors ${
                item.is_deleted
                  ? "bg-rose-50/20 hover:bg-rose-50/40"
                  : checked
                  ? "bg-[#EAF2FF]/40 hover:bg-[#EAF2FF]/60"
                  : "hover:bg-slate-50/70"
              }`}
            >
              {/* Checkbox chọn dòng (Chỉ Quản trị viên tối cao) */}
              {context.isAdmin && (
                <TableCell className="w-12 px-4">
                  <div className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleToggleSelect(item.id)}
                      className="w-4 h-4 rounded border-slate-300 text-[#0A62D6] focus:ring-[#0A62D6] cursor-pointer"
                    />
                  </div>
                </TableCell>
              )}

              {/* 1. Giáo viên (full_name + username) */}
              <TableCell>
                <div className="flex items-center gap-3">
                  <div
                    style={{ backgroundColor: color.bg, color: color.text }}
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-bold text-xs ${
                      !item.is_active || item.is_deleted ? "opacity-60" : ""
                    }`}
                  >
                    {initial}
                  </div>
                  <div className="min-w-0">
                    {item.is_deleted ? (
                      <span className="text-left font-semibold text-sm block truncate text-slate-400 line-through">
                        {item.full_name}
                      </span>
                    ) : (
                      <Tooltip content={`Click để chỉnh sửa thông tin`} side="top">
                        <button
                          type="button"
                          onClick={() => onEdit(item)}
                          className={`text-left font-semibold text-sm transition-colors cursor-pointer hover:underline hover:text-[#0A62D6] block truncate ${
                            item.is_active
                              ? "text-[#0F172A]"
                              : "text-slate-500"
                          }`}
                        >
                          {item.full_name}
                        </button>
                      </Tooltip>
                    )}
                    <p className="text-xs font-mono text-slate-500 mt-0.5">
                      @{item.username}
                    </p>
                  </div>
                </div>
              </TableCell>

              {/* 2. Liên hệ (`phone_zalo`, `email`) */}
              <TableCell>
                {item.phone_zalo || item.email ? (
                  <div className="space-y-1 text-[13px]">
                    {item.phone_zalo && (
                      <div className="flex items-center gap-1.5 text-slate-700 font-medium tabular-nums whitespace-nowrap">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{item.phone_zalo}</span>
                      </div>
                    )}
                    {item.email && (
                      <div className="flex items-center gap-1.5 text-slate-500 text-xs whitespace-nowrap">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{item.email}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-slate-400 text-[13px] italic">
                    Chưa cập nhật
                  </span>
                )}
              </TableCell>

              {/* 3. Lớp phụ trách (`assigned_classes`) */}
              <TableCell>
                <AssignedClassesList
                  classes={item.assigned_classes}
                  role={item.role}
                />
              </TableCell>

              {/* 4. Trạng thái (`is_active`, `is_locked`, `is_deleted`) */}
              <TableCell>
                <TeacherStatusBadge
                  isActive={item.is_active}
                  isLocked={item.is_locked}
                  isDeleted={item.is_deleted}
                />
              </TableCell>

              {/* 5. Đăng nhập lần cuối (`last_login_at`) */}
              <TableCell className="whitespace-nowrap">
                {item.last_login_at ? (
                  <div className="inline-flex items-center gap-1.5 text-[13px] font-sans font-medium text-slate-700 tabular-nums">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{item.last_login_at}</span>
                  </div>
                ) : (
                  <span className="text-slate-400 text-[13px] italic">
                    Chưa đăng nhập
                  </span>
                )}
              </TableCell>

              {/* 6. Ngày tạo (`created_at`) */}
              <TableCell className="text-[13px] font-sans font-medium text-slate-600 tabular-nums whitespace-nowrap">
                {formatDate(item.created_at)}
              </TableCell>

              {/* 7. Thao tác */}
              <TableCell align="right" className="whitespace-nowrap">
                <TeacherRowActions
                  item={item}
                  onAssignClasses={onAssignClasses}
                  onEdit={onEdit}
                  onResetPassword={onResetPassword}
                  onToggleStatus={onToggleStatus}
                  onDelete={onDelete}
                  onRestore={onRestore}
                  onPermanentDelete={onPermanentDelete}
                  isRestoring={restoringId === item.id}
                />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
