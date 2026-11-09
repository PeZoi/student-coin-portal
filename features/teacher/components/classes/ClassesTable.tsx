import { School, Users, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
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

interface ClassesTableProps {
  items: MockClassItem[];
  sortField: SortField | null;
  sortDirection: SortDirection;
  onSortToggle: (field: SortField) => void;
  onAssignTeacher?: (item: MockClassItem) => void;
  onEdit?: (item: MockClassItem) => void;
  onToggleStatus?: (item: MockClassItem) => void;
  onViewClassDetails?: (item: MockClassItem) => void;
}

export function ClassesTable({
  items,
  sortField,
  sortDirection,
  onSortToggle,
  onAssignTeacher,
  onEdit,
  onToggleStatus,
  onViewClassDetails,
}: ClassesTableProps) {
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
          <TableRow key={item.id}>
            {/* Tên lớp */}
            <TableCell>
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border border-slate-200/60 font-bold ${
                    item.is_active
                      ? "bg-[#F1F5F9] text-[#64748B]"
                      : "bg-[#F1F5F9] text-[#94A3B8]"
                  }`}
                >
                  <School className="w-4 h-4" />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    // TODO: mở chi tiết lớp
                    if (onViewClassDetails) onViewClassDetails(item);
                  }}
                  className={`text-left font-semibold text-sm transition-colors cursor-pointer hover:underline hover:text-[#0A62D6] ${
                    item.is_active ? "text-[#0F172A]" : "text-slate-500"
                  }`}
                >
                  {item.class_name}
                </button>
              </div>
            </TableCell>

            {/* Sĩ số (chỉ số + icon Users, căn giữa) */}
            <TableCell align="center" className="whitespace-nowrap">
              <div className="inline-flex items-center justify-center gap-1.5 font-semibold text-slate-700 tabular-nums">
                <Users className="w-4 h-4 text-slate-400" />
                <span>{item.student_count}</span>
              </div>
            </TableCell>

            {/* Giáo viên phụ trách */}
            <TableCell>
              <TeacherList teachers={item.teachers} />
            </TableCell>

            {/* Trạng thái */}
            <TableCell>
              <StatusBadge isActive={item.is_active} />
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
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
