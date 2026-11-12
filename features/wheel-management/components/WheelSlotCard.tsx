"use client";

import {
  Edit2,
  Trash2,
  Lock,
  Unlock,
} from "lucide-react";
import { WheelSlotItem, WheelPrizeType } from "../types";
import { WheelPrizeImage } from "./WheelPrizeImage";

interface WheelSlotCardProps {
  slot: WheelSlotItem;
  totalWeight: number;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onToggleActive: () => void;
  onToggleLock: () => void;
  onDelete: () => void;
}

export function WheelSlotCard({
  slot,
  totalWeight,
  isSelected,
  onSelect,
  onEdit,
  onToggleActive,
  onToggleLock,
  onDelete,
}: WheelSlotCardProps) {
  // Tính tỷ lệ % theo tổng trọng số
  const percentage =
    totalWeight > 0
      ? ((slot.probability_weight / totalWeight) * 100).toFixed(1)
      : "0.0";

  // Cấu hình hiển thị theo từng loại phần thưởng
  const getTypeBadge = (type: WheelPrizeType) => {
    switch (type) {
      case "coin":
        return {
          icon: <WheelPrizeImage type="coin" size={15} hasShadow={false} />,
          label: "Cộng Xu",
          bg: "bg-amber-50 text-amber-800 border-amber-200",
        };
      case "deduct_coin":
        return {
          icon: <WheelPrizeImage type="deduct_coin" size={15} hasShadow={false} />,
          label: "Bị Trừ Xu",
          bg: "bg-rose-50 text-rose-800 border-rose-200",
        };
      case "free_spin":
        return {
          icon: <WheelPrizeImage type="free_spin" size={15} hasShadow={false} />,
          label: "Lượt Quay",
          bg: "bg-emerald-50 text-emerald-800 border-emerald-200",
        };
      case "gift":
        return {
          icon: <WheelPrizeImage type="gift" size={15} hasShadow={false} />,
          label: "Quà Tặng",
          bg: "bg-purple-50 text-purple-800 border-purple-200",
        };
      case "luck":
      default:
        return {
          icon: <WheelPrizeImage type="luck" size={15} hasShadow={false} />,
          label: "May Mắn",
          bg: "bg-slate-100 text-slate-700 border-slate-200",
        };
    }
  };

  const badge = getTypeBadge(slot.prize_type);

  return (
    <div
      onClick={onSelect}
      className={`group relative bg-white rounded-2xl p-4.5 border transition-all cursor-pointer flex flex-col justify-between ${
        isSelected
          ? "border-[#0A62D6] ring-2 ring-[#0A62D6]/20 shadow-md bg-blue-50/10"
          : "border-slate-200/80 hover:border-slate-300 shadow-xs hover:shadow-md"
      } ${!slot.is_active ? "opacity-60 bg-slate-50/70" : ""}`}
    >
      {/* 1. Header của Thẻ Card: Số thứ tự ô, Badge loại và Switch Bật/Tắt */}
      <div>
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span
              className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shadow-xs ${
                (slot.slot_order - 1) % 2 === 0
                  ? "bg-[#FFC93C] text-[#7A4300]"
                  : "bg-[#1B66E0] text-white"
              }`}
            >
              #{slot.slot_order}
            </span>

            <span
              className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badge.bg}`}
            >
              {badge.icon}
              <span>{badge.label}</span>
            </span>
          </div>

          {/* Toggle Lock và Switch Active */}
          <div
            className="flex items-center gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Nút Khóa / Mở khóa tỷ lệ khi tự động cân bằng */}
            <button
              type="button"
              onClick={onToggleLock}
              title={
                slot.is_locked
                  ? "Tỷ lệ ô này đang được KHÓA CỐ ĐỊNH khi tự động cân bằng (Nhấn để mở khóa)"
                  : "Nhấn để KHÓA CỐ ĐỊNH tỷ lệ ô này (không bị thay đổi khi tự động cân bằng)"
              }
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

            {/* Toggle Switch Active */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={slot.is_active}
                onChange={onToggleActive}
                className="sr-only peer"
              />
              <div className="w-8 h-4.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-emerald-500" />
            </label>
          </div>
        </div>

        {/* 2. Thân thẻ Card: Tên hiển thị, Giá trị thưởng/phạt */}
        <div className="mt-3">
          <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-[#0A62D6] transition-colors line-clamp-1">
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
              <span
                className={`text-xs font-black ${
                  slot.prize_type === "coin"
                    ? "text-amber-600"
                    : slot.prize_type === "deduct_coin"
                    ? "text-rose-600"
                    : slot.prize_type === "free_spin"
                    ? "text-emerald-600"
                    : slot.prize_type === "gift"
                    ? "text-purple-600"
                    : "text-slate-600"
                }`}
              >
                {slot.prize_type === "coin"
                  ? `+${slot.reward_coins} Xu`
                  : slot.prize_type === "deduct_coin"
                  ? `${slot.reward_coins} Xu`
                  : slot.prize_type === "free_spin"
                  ? `+${slot.reward_free_spins} Lượt quay`
                  : slot.prize_type === "gift"
                  ? "Quà Hiện Vật"
                  : "Chúc May Mắn"}
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

        <button
          type="button"
          onClick={onDelete}
          title="Xóa ô phần thưởng này"
          className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
