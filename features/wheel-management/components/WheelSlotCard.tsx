"use client";

import {
  Edit2,
  Trash2,
  Lock,
  Unlock,
  GripVertical,
  ArrowLeftRight,
} from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import { WheelSlotItem } from "../types";
import { WheelPrizeImage } from "./WheelPrizeImage";
import {
  getWheelPrizeConfig,
  formatWheelPrizeValue,
} from "../constants/prizeConfig";

export type DropMode = "insert-before" | "insert-after" | "swap";

interface WheelSlotCardProps {
  slot: WheelSlotItem;
  totalWeight: number;
  isSelected: boolean;
  totalSlotsCount?: number;
  isDirty?: boolean;
  isDragging?: boolean;
  dropMode?: DropMode | null;
  onSelect: () => void;
  onEdit: () => void;
  onToggleActive: () => void;
  onToggleLock: () => void;
  onDelete: () => void;
  onMoveSlot?: (id: string, newOrder: number) => void;
  onDragStart?: (id: string) => void;
  onDragOver?: (id: string, mode: DropMode) => void;
  onDragLeave?: (id: string) => void;
  onDrop?: (id: string, mode: DropMode) => void;
  onDragEnd?: () => void;
}

export function WheelSlotCard({
  slot,
  totalWeight,
  isSelected,
  isDirty = false,
  isDragging = false,
  dropMode = null,
  onSelect,
  onEdit,
  onToggleActive,
  onToggleLock,
  onDelete,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
}: WheelSlotCardProps) {
  // Tính tỷ lệ % theo tổng trọng số
  const percentage =
    totalWeight > 0
      ? ((slot.probability_weight / totalWeight) * 100).toFixed(1)
      : "0.0";

  const prizeConfig = getWheelPrizeConfig(slot.prize_type);

  // Phân biệt: Thả vào khoảng cách mép 2 bên (Chèn giữa) HOẶC Thả vào thân ô (Swap)
  const getDropMode = (e: React.DragEvent<HTMLDivElement>): DropMode => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const edge = Math.min(44, rect.width * 0.18);
    if (mouseX <= edge) return "insert-before";
    if (mouseX >= rect.width - edge) return "insert-after";
    return "swap";
  };

  return (
    <div
      onClick={onSelect}
      draggable
      onDragStart={(e) => {
        const target = e.target as HTMLElement;
        if (target.closest("button") || target.closest("input") || target.closest("label")) {
          e.preventDefault();
          return;
        }
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", slot.id);
        onDragStart?.(slot.id);
      }}
      onDragEnd={() => onDragEnd?.()}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        const mode = getDropMode(e);
        onDragOver?.(slot.id, mode);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          onDragLeave?.(slot.id);
        }
      }}
      onDrop={(e) => {
        e.preventDefault();
        const mode = getDropMode(e);
        onDrop?.(slot.id, mode);
      }}
      className={`group relative bg-white rounded-2xl p-4.5 border transition-all flex flex-col justify-between ${
        isDragging
          ? "opacity-30 scale-95 border-2 border-dashed border-[#0A62D6] bg-blue-50/20 shadow-none cursor-grabbing"
          : dropMode === "swap"
          ? "border-2 border-dashed border-[#0A62D6] bg-blue-50/40 ring-2 ring-[#0A62D6]/20 shadow-md scale-[1.01]"
          : dropMode === "insert-before"
          ? "border-l-2 border-l-[#0A62D6] bg-blue-50/15 shadow-sm"
          : dropMode === "insert-after"
          ? "border-r-2 border-r-[#0A62D6] bg-blue-50/15 shadow-sm"
          : isSelected
          ? "border-[#0A62D6] ring-2 ring-[#0A62D6]/20 shadow-md bg-blue-50/10 cursor-pointer"
          : isDirty
          ? "border-amber-300 ring-1 ring-amber-300/40 shadow-xs hover:shadow-md cursor-pointer"
          : "border-slate-200/80 hover:border-slate-300 shadow-xs hover:shadow-md cursor-pointer"
      } ${!slot.is_active ? "opacity-60 bg-slate-50/70" : ""}`}
    >
      {/* 1. Khi ở khoảng cách mép TRÁI: Vạch chèn giữa tinh tế */}
      {dropMode === "insert-before" && (
        <div className="absolute -left-2.5 top-0 bottom-0 z-30 flex flex-col items-center justify-center pointer-events-none">
          <div className="w-2 h-2 rounded-full bg-[#0A62D6] mb-[-1px] shadow-xs" />
          <div className="w-[3px] h-full bg-[#0A62D6] rounded-full shadow-xs" />
          <div className="w-2 h-2 rounded-full bg-[#0A62D6] mt-[-1px] shadow-xs" />
          <div className="absolute top-1/2 -translate-y-1/2 px-2 py-0.5 rounded-full bg-[#0A62D6] text-white text-[10px] font-bold shadow-md whitespace-nowrap">
            + Chèn vào giữa
          </div>
        </div>
      )}

      {/* 2. Khi ở khoảng cách mép PHẢI: Vạch chèn giữa tinh tế */}
      {dropMode === "insert-after" && (
        <div className="absolute -right-2.5 top-0 bottom-0 z-30 flex flex-col items-center justify-center pointer-events-none">
          <div className="w-2 h-2 rounded-full bg-[#0A62D6] mb-[-1px] shadow-xs" />
          <div className="w-[3px] h-full bg-[#0A62D6] rounded-full shadow-xs" />
          <div className="w-2 h-2 rounded-full bg-[#0A62D6] mt-[-1px] shadow-xs" />
          <div className="absolute top-1/2 -translate-y-1/2 px-2 py-0.5 rounded-full bg-[#0A62D6] text-white text-[10px] font-bold shadow-md whitespace-nowrap">
            + Chèn vào giữa
          </div>
        </div>
      )}

      {/* 3. Khi ở thân ô cần thay thế: Overlay Hoán đổi (SWAP) */}
      {dropMode === "swap" && (
        <div className="absolute inset-0 z-30 rounded-2xl bg-blue-600/10 backdrop-blur-[0.5px] border-2 border-dashed border-[#0A62D6] flex flex-col items-center justify-center pointer-events-none p-3 animate-in fade-in duration-100">
          <div className="px-3.5 py-1.5 rounded-xl bg-[#0A62D6] text-white text-xs font-bold shadow-md flex items-center gap-1.5 animate-pulse">
            <ArrowLeftRight className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Hoán đổi với ô #{slot.slot_order}</span>
          </div>
          <span className="text-[10px] font-medium text-slate-500 mt-1 bg-white/90 px-2 py-0.5 rounded-full shadow-2xs">
            Thả để đổi chỗ 2 ô này
          </span>
        </div>
      )}

      {/* 1. Header của Thẻ Card: Số thứ tự ô, Badge loại và Switch Bật/Tắt */}
      <div>
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-1.5 flex-wrap min-w-0">
            {/* Badge thứ tự kèm Grip Kéo Thả (Draggable Handle) */}
            <Tooltip
              content="Cầm và kéo ô này thả vào giữa các ô khác để sắp xếp lại thứ tự"
              side="top"
            >
              <div
                className={`flex items-center gap-1 h-7 px-2.5 rounded-xl text-xs font-black shadow-xs cursor-grab active:cursor-grabbing select-none transition-transform hover:scale-105 shrink-0 ${
                  (slot.slot_order - 1) % 2 === 0
                    ? "bg-[#FFC93C] text-[#7A4300]"
                    : "bg-[#1B66E0] text-white"
                }`}
              >
                <GripVertical className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 shrink-0" />
                <span>#{slot.slot_order}</span>
              </div>
            </Tooltip>

            {/* Badge Loại phần thưởng */}
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${prizeConfig.badgeBg} shrink-0`}
            >
              <WheelPrizeImage type={slot.prize_type} size={15} hasShadow={false} />
              <span className="truncate max-w-[70px]">{prizeConfig.badgeLabel}</span>
            </span>

            {/* Badge Trạng thái Chưa lưu */}
            {isDirty && (
              <span
                title="Ô này có thay đổi thông tin/vị trí chưa lưu vào CSDL"
                className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 animate-pulse shadow-2xs shrink-0"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                <span>Chưa lưu</span>
              </span>
            )}
          </div>

          {/* Toggle Lock và Switch Active */}
          <div
            className="flex items-center gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Nút Khóa / Mở khóa tỷ lệ khi tự động cân bằng */}
            <Tooltip
              content={
                slot.is_locked
                  ? "Tỷ lệ ô này đang được KHÓA CỐ ĐỊNH (Nhấn để mở)"
                  : "Khóa CỐ ĐỊNH tỷ lệ khi cân bằng"
              }
              side="top"
              wrapperClassName="shrink-0"
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleLock();
                }}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  slot.is_locked
                    ? "bg-amber-100 text-amber-800 border border-amber-300 shadow-xs"
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-100 border border-transparent"
                }`}
              >
                {slot.is_locked ? (
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                ) : (
                  <Unlock className="w-3.5 h-3.5" />
                )}
              </button>
            </Tooltip>

            {/* Toggle Switch Active */}
            <Tooltip
              content={
                slot.is_active
                  ? "Đang bật ô này trên vòng quay (Nhấn để tạm ẩn)"
                  : "Ô này đang bị ẩn (Nhấn để kích hoạt)"
              }
              side="top"
              wrapperClassName="shrink-0"
            >
              <button
                type="button"
                role="switch"
                aria-checked={slot.is_active}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleActive();
                }}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  slot.is_active ? "bg-emerald-500" : "bg-slate-300"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    slot.is_active ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </Tooltip>
          </div>
        </div>

        {/* 2. Thân thẻ Card: Tên hiển thị, Giá trị thưởng/phạt - Click vào để chỉnh sửa ngay */}
        <div
          className="mt-3 cursor-pointer group/content"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          title="Nhấn vào đây để chỉnh sửa thông tin ô này"
        >
          <h4 className="font-extrabold text-sm text-slate-900 group-hover/content:text-[#0A62D6] transition-colors line-clamp-1">
            {slot.label}
          </h4>

          <div className="flex items-center justify-between text-xs mt-1 text-slate-500">
            <span>Hiển thị vòng quay:</span>
            <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
              {slot.short_label}
            </span>
          </div>

          {/* Giá trị phần thưởng nổi bật */}
          <div className="mt-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">
              Giá trị nhận:
            </span>
            <div className="flex items-center gap-1.5">
              <WheelPrizeImage type={slot.prize_type} size={20} />
              <span className={`text-xs font-black ${prizeConfig.textColor}`}>
                {formatWheelPrizeValue(slot)}
              </span>
            </div>
          </div>

          {/* Thanh Tiến Trình Xác Suất (%) */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                <span>
                  Trọng số: <b className="text-slate-800">{slot.probability_weight}</b>
                </span>
                {slot.is_locked && (
                  <span className="inline-flex items-center gap-0.5 text-[9.5px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded-md">
                    <Lock className="w-2.5 h-2.5 text-amber-600" />
                    <span>Cố định</span>
                  </span>
                )}
              </span>
              <span className="font-black text-slate-900">{percentage}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  slot.is_locked
                    ? "bg-amber-500"
                    : (slot.slot_order - 1) % 2 === 0
                    ? "bg-[#F59E0B]"
                    : "bg-[#1B66E0]"
                }`}
                style={{
                  width: `${percentage}%`,
                }}
              />
            </div>
          </div>

          {/* Thống kê vận hành thực tế */}
          {slot.stats && (
            <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-400">
              <span>
                Thực tế đã trúng:{" "}
                <b className="text-slate-700">{slot.stats.total_hits} lần</b>
              </span>
              <span className="font-semibold text-slate-600">
                ({slot.stats.actual_rate}%)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 3. Footer của Thẻ Card: Nút Sửa & Nút Xóa */}
      <div
        className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onEdit}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold transition-all cursor-pointer"
        >
          <Edit2 className="w-3.5 h-3.5 text-slate-500" />
          <span>Chỉnh sửa</span>
        </button>

        <Tooltip content="Xóa ô phần thưởng này" side="top" wrapperClassName="shrink-0">
          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </Tooltip>
      </div>
    </div>
  );
}
