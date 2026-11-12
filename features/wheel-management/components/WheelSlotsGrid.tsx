"use client";

import { useMemo } from "react";
import { Plus, SlidersHorizontal, RotateCcw, Save, Scale, Lock } from "lucide-react";
import { WheelSlotItem } from "../types";
import { WheelSlotCard } from "./WheelSlotCard";

interface WheelSlotsGridProps {
  slots: WheelSlotItem[];
  totalWeight: number;
  selectedSlotId: string | null;
  onSelectSlot: (id: string) => void;
  onAddSlot: () => void;
  onEditSlot: (slot: WheelSlotItem) => void;
  onToggleActive: (id: string) => void;
  onToggleLock: (id: string) => void;
  onDeleteSlot: (id: string) => void;
  onEqualize: () => void;
  onAutoBalance: () => void;
  onSaveSlots: () => void;
}

export function WheelSlotsGrid({
  slots,
  totalWeight,
  selectedSlotId,
  onSelectSlot,
  onAddSlot,
  onEditSlot,
  onToggleActive,
  onToggleLock,
  onDeleteSlot,
  onEqualize,
  onAutoBalance,
  onSaveSlots,
}: WheelSlotsGridProps) {
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
            <span
              title="Các ô này sẽ được giữ nguyên 100% tỷ lệ khi bạn nhấn 'Tự động cân bằng'"
              className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300"
            >
              <Lock className="w-3 h-3 text-amber-600" />
              <span>Đang khóa {lockedCount} ô cố định</span>
            </span>
          )}
        </div>

        {/* Nhóm nút hành động đặt ngay tại khối số liệu ô thưởng */}
        <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
          {/* Nút 1: Chia đều phẳng 100% cho mọi ô */}
          <button
            type="button"
            onClick={onEqualize}
            title="Chia đều tỷ lệ % cho tất cả các ô bằng phẳng nhau (Ví dụ: 8 ô mỗi ô ~12.5%)"
            className="inline-flex items-center justify-center gap-1.5 h-8.5 px-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-98 shrink-0"
          >
            <Scale className="w-3.5 h-3.5 text-blue-600" />
            <span>Chia đều</span>
          </button>

          {/* Nút 2: Tự động cân bằng thông minh (Giữ nguyên các ô đã khóa) */}
          <button
            type="button"
            onClick={onAutoBalance}
            title={
              lockedCount > 0
                ? `Cân bằng về 100%, giữ nguyên ${lockedCount} ô đã khóa 🔒 và tự bù trừ các ô còn lại`
                : "Tự động chuẩn hóa tổng trọng số của các ô về đúng 100% (Click biểu tượng 🔒 trên thẻ nếu muốn cố định ô nào)"
            }
            className="inline-flex items-center justify-center gap-1.5 h-8.5 px-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-98 shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>
              Cân bằng
              {lockedCount > 0 ? ` (giữ ${lockedCount} ô 🔒)` : ""}
            </span>
          </button>

          {/* Nút 3: Thêm ô phần thưởng */}
          <button
            type="button"
            onClick={onAddSlot}
            className="inline-flex items-center justify-center gap-1.5 h-8.5 px-3.5 rounded-xl bg-[#0A62D6] hover:bg-[#0850B0] text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-98 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm ô phần thưởng</span>
          </button>

          {/* Nút 4: Lưu cơ cấu ô thưởng */}
          <button
            type="button"
            onClick={onSaveSlots}
            className="inline-flex items-center justify-center gap-1.5 h-8.5 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-98 shrink-0"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Lưu cơ cấu ô</span>
          </button>
        </div>
      </div>

      {/* Lưới các Thẻ Ô Số Visual Cards (Hiển thị đầy đủ tất cả các ô, không chia tab) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {slots.map((slot) => (
          <WheelSlotCard
            key={slot.id}
            slot={slot}
            totalWeight={totalWeight}
            isSelected={slot.id === selectedSlotId}
            onSelect={() => onSelectSlot(slot.id)}
            onEdit={() => onEditSlot(slot)}
            onToggleActive={() => onToggleActive(slot.id)}
            onToggleLock={() => onToggleLock(slot.id)}
            onDelete={() => onDeleteSlot(slot.id)}
          />
        ))}

        {/* Thẻ Thêm Ô Mới (Dashed Border Card) */}
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
      </div>
    </div>
  );
}
