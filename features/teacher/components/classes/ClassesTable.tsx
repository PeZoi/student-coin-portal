import Image from "next/image";
import { School, Users, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import { MockClassItem, SortField, SortDirection } from "./types";
import { StatusBadge } from "./StatusBadge";
import { TeacherList } from "./TeacherList";
import { RowActions } from "./RowActions";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { useTeacherClassesContext } from "../../contexts/TeacherClassesContext";

interface ClassesTableProps {
  items?: MockClassItem[];
  sortField?: SortField | null;
  sortDirection?: SortDirection;
  onSortToggle?: (field: SortField) => void;
  onAssignTeacher?: (item: MockClassItem) => void;
  onEdit?: (item: MockClassItem) => void;
  onToggleStatus?: (item: MockClassItem) => void;
  onViewClassDetails?: (item: MockClassItem) => void;
  onDelete?: (item: MockClassItem) => void;
  onRestore?: (item: MockClassItem) => void;
  onPermanentDelete?: (item: MockClassItem) => void;
  onOpenStudents?: (item: MockClassItem) => void;
}

export function ClassesTable(props?: ClassesTableProps) {
  const context = useTeacherClassesContext();
  const items = props?.items ?? context.filteredClasses;
  const sortField = props?.sortField !== undefined ? props.sortField : context.sortField;
  const sortDirection = props?.sortDirection ?? context.sortDirection;
  const onSortToggle = props?.onSortToggle ?? context.handleSortToggle;
  const onAssignTeacher = props?.onAssignTeacher ?? context.handleOpenAssignTeacher;
  const onEdit = props?.onEdit ?? context.handleOpenEditClass;
  const onToggleStatus = props?.onToggleStatus ?? context.handleToggleClassStatus;
  const onDelete = props?.onDelete ?? context.handleOpenDeleteModal;
  const onRestore = props?.onRestore ?? context.handleRestoreClass;
  const onPermanentDelete = props?.onPermanentDelete ?? context.handleOpenPermanentModal;
  const onOpenStudents = props?.onOpenStudents ?? context.handleOpenStudentsModal;

  const isAdmin = context.isAdmin;
  const selectedIds = context.selectedIds;
  const handleToggleSelect = context.handleToggleSelect;
  const handleSelectAll = context.handleSelectAll;

  const allVisibleSelected =
    items.length > 0 && items.every((i) => selectedIds.includes(i.id));

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field || sortDirection === "none") {
      return <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400 ml-1 shrink-0" />;
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
          {/* Checkbox chọn tất cả (Chỉ Admin mới có) */}
          {isAdmin && (
            <TableHead className="w-10 px-3 text-center">
              <input
                type="checkbox"
                checked={allVisibleSelected}
                onChange={() => handleSelectAll(items.map((i) => i.id))}
                className="w-4 h-4 rounded border-slate-300 text-[#0A62D6] focus:ring-[#0A62D6] cursor-pointer accent-[#0A62D6]"
              />
            </TableHead>
          )}

          {/* Tên lớp học (Sắp xếp) */}
          <TableHead>
            <button
              type="button"
              onClick={() => onSortToggle("class_name")}
              className="inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer select-none"
            >
              <span>Tên lớp học</span>
              {renderSortIcon("class_name")}
            </button>
          </TableHead>

          {/* Sĩ số (Căn giữa, Sắp xếp) */}
          <TableHead align="center">
            <button
              type="button"
              onClick={() => onSortToggle("student_count")}
              className="inline-flex items-center justify-center gap-1 font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer select-none"
            >
              <span>Sĩ số</span>
              {renderSortIcon("student_count")}
            </button>
          </TableHead>

          {/* Tổng xu của cả lớp (Căn giữa, Sắp xếp) */}
          <TableHead align="center">
            <button
              type="button"
              onClick={() => onSortToggle("total_coins")}
              className="inline-flex items-center justify-center gap-1 font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer select-none"
            >
              <span>Tổng xu</span>
              {renderSortIcon("total_coins")}
            </button>
          </TableHead>

          {/* Giáo viên phụ trách */}
          <TableHead>Giáo viên phụ trách</TableHead>

          {/* Trạng thái */}
          <TableHead>Trạng thái</TableHead>

          {/* Ngày tạo (Sắp xếp) */}
          <TableHead>
            <button
              type="button"
              onClick={() => onSortToggle("created_at")}
              className="inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer select-none"
            >
              <span>Ngày tạo</span>
              {renderSortIcon("created_at")}
            </button>
          </TableHead>

          {/* Thao tác */}
          <TableHead align="right">Thao tác</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody striped>
        {items.map((item) => (
          <TableRow key={item.id} className={item.is_deleted ? "bg-rose-50/20" : undefined}>
            {/* Checkbox chọn hàng (Chỉ Admin mới có) */}
            {isAdmin && (
              <TableCell className="w-10 px-3 text-center">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(item.id)}
                  onChange={() => handleToggleSelect(item.id)}
                  className="w-4 h-4 rounded border-slate-300 text-[#0A62D6] focus:ring-[#0A62D6] cursor-pointer accent-[#0A62D6]"
                />
              </TableCell>
            )}

            {/* Tên lớp */}
            <TableCell>
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border border-slate-200/60 font-bold ${
                    item.is_deleted
                      ? "bg-rose-100 text-rose-600 border-rose-200"
                      : item.is_active
                      ? "bg-[#F1F5F9] text-[#64748B]"
                      : "bg-[#F1F5F9] text-[#94A3B8]"
                  }`}
                >
                  <School className="w-4 h-4" />
                </div>
                <span
                  className={`font-semibold text-sm select-text ${
                    item.is_deleted
                      ? "text-slate-500 line-through"
                      : item.is_active
                      ? "text-[#0F172A]"
                      : "text-slate-500"
                  }`}
                >
                  {item.class_name}
                </span>
              </div>
            </TableCell>

            {/* Sĩ số (Badge pill nhỏ gọn click được) */}
            <TableCell align="center" className="whitespace-nowrap">
              <Tooltip
                content={`Xem danh sách ${item.student_count} học sinh của ${item.class_name}`}
                side="top"
              >
                <button
                  type="button"
                  onClick={() => onOpenStudents(item)}
                  className={`inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer tabular-nums shadow-2xs group ${
                    item.student_count > 0
                      ? "bg-blue-50/80 text-[#0A62D6] border border-blue-200/70 hover:bg-[#EAF2FF] hover:border-blue-300"
                      : "bg-slate-50 text-slate-400 border border-slate-200/60 hover:bg-slate-100 hover:text-slate-600"
                  }`}
                >
                  <Users
                    className={`w-3.5 h-3.5 transition-colors ${
                      item.student_count > 0
                        ? "text-[#0A62D6]"
                        : "text-slate-400 group-hover:text-slate-600"
                    }`}
                  />
                  <span>{item.student_count}</span>
                </button>
              </Tooltip>
            </TableCell>

            {/* Tổng xu tích lũy của học sinh trong lớp */}
            <TableCell align="center" className="whitespace-nowrap">
              {item.total_coins && item.total_coins > 0 ? (
                <Tooltip
                  content={`Tổng ${item.total_coins.toLocaleString("vi-VN")} xu của lớp ${item.class_name}`}
                  side="top"
                >
                  <div className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50/90 border border-amber-200/80 text-amber-900 text-xs font-bold tabular-nums shadow-2xs cursor-default">
                    <Image
                      src="/coin.png"
                      alt="Xu"
                      width={15}
                      height={15}
                      unoptimized
                      style={{ height: "auto" }}
                      className="w-3.5 h-3.5 drop-shadow-xs shrink-0"
                    />
                    <span>{item.total_coins.toLocaleString("vi-VN")}</span>
                  </div>
                </Tooltip>
              ) : (
                <Tooltip content="Lớp chưa có xu tích lũy" side="top">
                  <div className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200/60 text-slate-400 text-xs font-medium tabular-nums cursor-default">
                    <Image
                      src="/coin.png"
                      alt="Xu"
                      width={15}
                      height={15}
                      unoptimized
                      style={{ height: "auto" }}
                      className="w-3.5 h-3.5 opacity-30 grayscale shrink-0"
                    />
                    <span>0</span>
                  </div>
                </Tooltip>
              )}
            </TableCell>

            {/* Giáo viên phụ trách */}
            <TableCell>
              <TeacherList teachers={item.teachers} />
            </TableCell>

            {/* Trạng thái */}
            <TableCell>
              <StatusBadge isActive={item.is_active} isDeleted={item.is_deleted} />
            </TableCell>

            {/* Ngày tạo */}
            <TableCell className="text-[13px] font-sans font-medium text-slate-600 tabular-nums whitespace-nowrap">
              {item.created_at}
            </TableCell>

            {/* Thao tác */}
            <TableCell align="right" className="whitespace-nowrap">
              <RowActions
                item={item}
                onAssignTeacher={onAssignTeacher}
                onEdit={onEdit}
                onToggleStatus={onToggleStatus}
                onDelete={onDelete}
                onRestore={onRestore}
                onPermanentDelete={onPermanentDelete}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
