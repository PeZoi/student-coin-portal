"use client";

import { useState, useMemo } from "react";
import { Plus, SlidersHorizontal, RotateCcw, Save, Scale, Lock, Undo2 } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import { WheelSlotItem } from "../types";
import { WheelSlotCard, DropMode } from "./WheelSlotCard";

interface WheelSlotsGridProps {
  slots: WheelSlotItem[];
  savedSlots?: WheelSlotItem[];
  totalWeight: number;
  selectedSlotId: string | null;
  isDirty?: boolean;
  isSaving?: boolean;
  onSelectSlot: (id: string) => void;
  onAddSlot: () => void;
  onEditSlot: (slot: WheelSlotItem) => void;
  onToggleActive: (id: string) => void;
  onToggleLock: (id: string) => void;
  onDeleteSlot: (id: string) => void;
  onEqualize: () => void;
  onAutoBalance: () => void;
  onResetSlots?: () => void;
  onSaveSlots: () => void;
  onReorderSlots: (draggedId: string, targetId: string, mode: DropMode) => void;
  onMoveSlot?: (id: string, newOrder: number) => void;
}

/**
 * Kiểm tra xem một ô có sự thay đổi so với bản đã lưu hay không
 */
function checkIsSlotModified(slot: WheelSlotItem, savedSlots?: WheelSlotItem[]): boolean {
  if (!savedSlots) return false;
  const original = savedSlots.find((s) => s.id === slot.id);
  if (!original) return true; // Ô mới tạo
  return (
    original.slot_order !== slot.slot_order ||
    original.label !== slot.label ||
    original.short_label !== slot.short_label ||
    original.prize_type !== slot.prize_type ||
    original.reward_coins !== slot.reward_coins ||
    original.reward_free_spins !== slot.reward_free_spins ||
    original.probability_weight !== slot.probability_weight ||
    original.is_active !== slot.is_active ||
    !!original.is_locked !== !!slot.is_locked
  );
}

export function WheelSlotsGrid({
  slots,
  savedSlots,
  totalWeight,
  selectedSlotId,
  isDirty = false,
  isSaving = false,
  onSelectSlot,
  onAddSlot,
  onEditSlot,
  onToggleActive,
  onToggleLock,
  onDeleteSlot,
  onEqualize,
  onAutoBalance,
  onResetSlots,
  onSaveSlots,
  onReorderSlots,
  onMoveSlot,
}: WheelSlotsGridProps) {
  // Quản lý trạng thái Kéo Thả (Drag and Drop Reordering)
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverTarget, setDragOverTarget] = useState<{
    id: string;
    mode: DropMode;
  } | null>(null);

  // Đếm số ô đang được khóa cố định tỷ lệ
  const lockedCount = useMemo(
    () => slots.filter((s) => s.is_active && s.is_locked).length,
    [slots]
  );

  return (
    <div className="space-y-4">
      {/* Toolbar Thao Tác Trực Tiếp Với Số Liệu Ô - Đã bỏ tab filter theo yêu cầu */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        {/* Nhóm thông tin bên trái */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-500" />
            <span className="text-xs sm:text-sm font-bold text-slate-800">
              Cơ Cấu {slots.length} Ô Phần Thưởng
            </span>
          </div>

          {/* Badge kiểm soát tổng tỷ lệ */}
          <span
            className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
              totalWeight === 100
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-red-50 text-red-700 border-red-200"
            }`}
          >
            Tổng: {totalWeight}%
          </span>

          {/* Badge hiển thị số lượng ô đang khóa cố định (nếu có) */}
          {lockedCount > 0 && (
            <Tooltip
              content="Các ô có biểu tượng 🔒 sẽ được giữ nguyên 100% tỷ lệ khi bạn nhấn 'Cân bằng'"
              side="top"
              wrapperClassName="shrink-0"
            >
              <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 cursor-help">
                <Lock className="w-3 h-3 text-amber-600" />
                <span>Đang khóa {lockedCount} ô cố định</span>
              </span>
            </Tooltip>
          )}
        </div>

        {/* Nhóm nút hành động đặt ngay tại khối số liệu ô thưởng */}
        <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
          {/* Nút 1: Chia đều phẳng 100% cho mọi ô */}
          <Tooltip
            content="Chia đều 100% tỷ lệ cho tất cả ô"
            wrapperClassName="shrink-0"
            side="top"
          >
            <button
              type="button"
              onClick={onEqualize}
              className="inline-flex items-center justify-center gap-1.5 h-8.5 px-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-98 shrink-0"
            >
              <Scale className="w-3.5 h-3.5 text-blue-600" />
              <span>Chia đều</span>
            </button>
          </Tooltip>

          {/* Nút 2: Tự động cân bằng thông minh (Giữ nguyên các ô đã khóa) */}
          <Tooltip
            content={
              lockedCount > 0
                ? `Cân bằng về 100% (giữ ${lockedCount} ô 🔒)`
                : "Tự động cân bằng tỷ lệ về 100%"
            }
            wrapperClassName="shrink-0"
            side="top"
          >
            <button
              type="button"
              onClick={onAutoBalance}
              className="inline-flex items-center justify-center gap-1.5 h-8.5 px-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-98 shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>
                Cân bằng
                {lockedCount > 0 ? ` (giữ ${lockedCount} ô 🔒)` : ""}
              </span>
            </button>
          </Tooltip>

          {/* Badge Thông báo Chưa Lưu Thay Đổi */}
          {isDirty && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300 animate-pulse shadow-2xs shrink-0">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span>Chưa lưu thay đổi</span>
            </span>
          )}

          {/* Nút Đặt lại ban đầu: Luôn luôn hiển thị, kích hoạt khi có thay đổi chưa lưu */}
          {onResetSlots && (
            <Tooltip
              content={
                isDirty
                  ? "Hủy bỏ toàn bộ thay đổi chưa lưu (thứ tự, tỷ lệ, thông tin) và khôi phục về trạng thái ban đầu"
                  : "Hiện chưa có thay đổi nào để đặt lại"
              }
              wrapperClassName="shrink-0"
              side="top"
            >
              <button
                type="button"
                onClick={onResetSlots}
                disabled={!isDirty}
                className={`inline-flex items-center justify-center gap-1.5 h-8.5 px-3 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  isDirty
                    ? "bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-300 shadow-xs cursor-pointer active:scale-98"
                    : "bg-slate-50 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60"
                }`}
              >
                <Undo2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Đặt lại ban đầu</span>
              </button>
            </Tooltip>
          )}

          {/* Nút: Lưu cơ cấu ô thưởng */}
          <button
            type="button"
            onClick={onSaveSlots}
            disabled={isSaving}
            className={`inline-flex items-center justify-center gap-1.5 h-8.5 px-3.5 rounded-xl text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-98 shrink-0 disabled:opacity-60 ${
              isDirty
                ? "bg-emerald-600 hover:bg-emerald-700 ring-2 ring-emerald-500/40 ring-offset-1 shadow-md shadow-emerald-600/20"
                : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? "Đang lưu..." : "Lưu cơ cấu ô"}</span>
          </button>
        </div>
      </div>

      {/* Lưới các Thẻ Ô Số Visual Cards (Hỗ trợ Kéo Thả Reorder Drag & Drop) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* Thẻ Thêm Ô Mới (Được đưa lên ĐẦU DANH SÁCH theo yêu cầu) */}
        <button
          type="button"
          onClick={onAddSlot}
          className="group min-h-[220px] rounded-2xl border-2 border-dashed border-slate-300 hover:border-[#0A62D6] bg-slate-50/50 hover:bg-blue-50/30 p-6 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer text-center"
        >
          <div className="w-12 h-12 rounded-2xl bg-white group-hover:bg-[#0A62D6] group-hover:text-white text-slate-500 border border-slate-200 group-hover:border-[#0A62D6] flex items-center justify-center transition-all shadow-xs group-hover:scale-110">
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </div>

          <div>
            <div className="font-extrabold text-xs sm:text-sm text-slate-800 group-hover:text-[#0A62D6] transition-colors">
              + Thêm Ô Phần Thưởng Mới
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Tùy biến nhãn, giá trị và trọng số xác suất
            </div>
          </div>
        </button>

        {slots.map((slot) => (
          <WheelSlotCard
            key={slot.id}
            slot={slot}
            totalWeight={totalWeight}
            isSelected={slot.id === selectedSlotId}
            totalSlotsCount={slots.length}
            isDirty={checkIsSlotModified(slot, savedSlots)}
            isDragging={draggedId === slot.id}
            dropMode={
              dragOverTarget?.id === slot.id && draggedId !== slot.id
                ? dragOverTarget.mode
                : null
            }
            onSelect={() => onSelectSlot(slot.id)}
            onEdit={() => onEditSlot(slot)}
            onToggleActive={() => onToggleActive(slot.id)}
            onToggleLock={() => onToggleLock(slot.id)}
            onDelete={() => onDeleteSlot(slot.id)}
            onMoveSlot={onMoveSlot}
            onDragStart={() => setDraggedId(slot.id)}
            onDragOver={(id, mode) => {
              if (draggedId && draggedId !== id) {
                setDragOverTarget({ id, mode });
              }
            }}
            onDragLeave={(id) => {
              if (dragOverTarget?.id === id) {
                setDragOverTarget(null);
              }
            }}
            onDrop={(id, mode) => {
              if (draggedId && draggedId !== id) {
                onReorderSlots(draggedId, id, mode);
              }
              setDraggedId(null);
              setDragOverTarget(null);
            }}
            onDragEnd={() => {
              setDraggedId(null);
              setDragOverTarget(null);
            }}
          />
        ))}
      </div>
    </div>
  );
}
