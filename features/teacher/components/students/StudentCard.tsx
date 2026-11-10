import { Phone, Calendar } from "lucide-react";
import { StudentItem } from "./types";
import {
  StudentStatusBadge,
  StudentClassBadge,
  StudentPinBadge,
  StudentCoinsBadge,
} from "./StudentBadges";
import { StudentRowActions } from "./StudentRowActions";
import { getStudentInitial } from "./constants";
import { formatDate } from "@/lib/date";

interface StudentCardProps {
  item: StudentItem;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  onChangeClass?: (item: StudentItem) => void;
  onEdit?: (item: StudentItem) => void;
  onAdjustCoins?: (item: StudentItem) => void;
  onResetPin?: (item: StudentItem) => void;
  onToggleStatus?: (item: StudentItem) => void;
  onDelete?: (item: StudentItem) => void;
  onRestore?: (item: StudentItem) => void;
  onPermanentDelete?: (item: StudentItem) => void;
  isRestoring?: boolean;
}

export function StudentCard({
  item,
  isSelected = false,
  onToggleSelect,
  onChangeClass,
  onEdit,
  onAdjustCoins,
  onResetPin,
  onToggleStatus,
  onDelete,
  onRestore,
  onPermanentDelete,
  isRestoring = false,
}: StudentCardProps) {
  const avatarLetter = getStudentInitial(item.full_name);

  return (
    <div
      className={`rounded-2xl border p-4 space-y-3 shadow-2xs transition-all ${
        isSelected
          ? "bg-[#EAF2FF]/30 border-[#0A62D6]/40"
          : "bg-white border-slate-200"
      }`}
    >
      {/* Hàng 1: Checkbox + Avatar + Tên + Badge Trạng thái */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect?.(item.id)}
            className="w-4 h-4 rounded border-slate-300 text-[#0A62D6] focus:ring-[#0A62D6] cursor-pointer shrink-0"
            aria-label={`Chọn học sinh ${item.full_name}`}
          />

          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
            {avatarLetter}
          </div>

          <div className="min-w-0">
            <button
              type="button"
              onClick={() => onEdit?.(item)}
              className="text-left font-bold text-sm text-[#0F172A] hover:text-[#0A62D6] hover:underline transition-colors block truncate"
            >
              {item.full_name}
            </button>
            <div className="flex items-center gap-1.5 text-xs text-[#64748B] font-mono mt-0.5">
              <Phone className="w-3 h-3 text-slate-400" />
              <span>{item.phone_zalo}</span>
            </div>
          </div>
        </div>

        <div className="shrink-0">
          <StudentStatusBadge
            isActive={item.is_active}
            isDeleted={item.is_deleted}
          />
        </div>
      </div>

      {/* Hàng 2: Lớp học & Heo Đất xu */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <StudentClassBadge className={item.class_name} />
        <StudentCoinsBadge
          currentCoins={item.current_coins}
          totalEarnedCoins={item.total_earned_coins}
        />
      </div>

      {/* Hàng 3: Bảo mật PIN & Ngày vào lớp */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
        <StudentPinBadge
          failedAttempts={item.failed_login_attempts}
          lockedUntil={item.locked_until}
        />

        <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
          <Calendar className="w-3 h-3" />
          <span>{formatDate(item.created_at)}</span>
        </div>
      </div>

      {/* Hàng 4: Các nút thao tác */}
      <div className="pt-2 border-t border-slate-100">
        <StudentRowActions
          item={item}
          fullWidth
          onChangeClass={onChangeClass}
          onEdit={onEdit}
          onAdjustCoins={onAdjustCoins}
          onResetPin={onResetPin}
          onToggleStatus={onToggleStatus}
          onDelete={onDelete}
          onRestore={onRestore}
          onPermanentDelete={onPermanentDelete}
          isRestoring={isRestoring}
        />
      </div>
    </div>
  );
}

