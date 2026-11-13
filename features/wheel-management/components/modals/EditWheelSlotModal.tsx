"use client";

import { useState, useMemo } from "react";
import {
  X,
  Check,
} from "lucide-react";
import { WheelSlotItem, WheelPrizeType } from "../../types";
import { WheelPrizeImage } from "../WheelPrizeImage";
import { WHEEL_PRIZE_TYPES_LIST } from "../../constants/prizeConfig";
import { TeacherSelect, TeacherSelectOption } from "@/components/ui/TeacherSelect";

interface EditWheelSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (slotData: Omit<WheelSlotItem, "stats">) => void;
  initialData?: WheelSlotItem | null;
  totalSlotsCount: number;
}

export function EditWheelSlotModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  totalSlotsCount,
}: EditWheelSlotModalProps) {
  const isEditing = !!initialData;

  // Khởi tạo state trực tiếp từ initialData (tuân thủ quy tắc 8 trong AGENTS.md)
  const [prizeType, setPrizeType] = useState<WheelPrizeType>(
    initialData?.prize_type || "coin"
  );
  const [label, setLabel] = useState(initialData?.label || "");
  const [shortLabel, setShortLabel] = useState(initialData?.short_label || "");
  const [rewardCoins, setRewardCoins] = useState<number>(
    initialData?.reward_coins ?? 20
  );
  const [rewardFreeSpins, setRewardFreeSpins] = useState<number>(
    initialData?.reward_free_spins ?? 0
  );
  const [probabilityWeight, setProbabilityWeight] = useState<number>(
    initialData?.probability_weight ?? 15
  );
  const isActive = initialData?.is_active ?? true;
  const [slotOrder, setSlotOrder] = useState<number>(
    initialData?.slot_order ?? (totalSlotsCount + 1)
  );

  // Danh sách các tùy chọn vị trí thứ tự ô chuẩn theo TeacherSelect
  const slotOrderOptions: TeacherSelectOption[] = useMemo(() => {
    const total = isEditing ? totalSlotsCount : totalSlotsCount + 1;
    return Array.from({ length: total }, (_, i) => {
      const pos = i + 1;
      let label = `Vị trí #${pos}`;
      if (pos === 1) {
        label = `Vị trí #1 (Đầu vòng quay)`;
      } else if (pos === total) {
        label = `Vị trí #${pos} (Cuối vòng quay)`;
      }
      return {
        label,
        value: String(pos),
      };
    });
  }, [isEditing, totalSlotsCount]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!label.trim() || !shortLabel.trim()) return;

    onSave({
      id: initialData?.id || `slot-${Date.now()}`,
      slot_order: slotOrder,
      label: label.trim(),
      short_label: shortLabel.trim(),
      prize_type: prizeType,
      reward_coins:
        prizeType === "coin"
          ? Math.abs(rewardCoins)
          : prizeType === "deduct_coin"
          ? -Math.abs(rewardCoins)
          : 0,
      reward_free_spins:
        prizeType === "free_spin" ? Math.max(1, rewardFreeSpins) : 0,
      probability_weight: Math.max(1, probabilityWeight),
      is_active: isActive,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 font-heading">
              {isEditing
                ? `Chỉnh Sửa Ô #${initialData.slot_order} Trên Vòng Quay`
                : "Thêm Ô Phần Thưởng Mới"}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Thiết lập loại phần thưởng, trọng số xác suất và giao diện vòng quay
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* 1. Chọn Loại Phần Thưởng (5 nhóm) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Loại Phần Thưởng:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {WHEEL_PRIZE_TYPES_LIST.map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => setPrizeType(item.type)}
                  className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    prizeType === item.type
                      ? "border-[#0A62D6] bg-blue-50/40 ring-2 ring-[#0A62D6]/20"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <WheelPrizeImage type={item.type} size={26} />
                    {prizeType === item.type && (
                      <span className="w-4 h-4 rounded-full bg-[#0A62D6] text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <div className="mt-2">
                    <div className="text-xs font-bold text-slate-900">
                      {item.label}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {item.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Tên hiển thị đầy đủ & Tên ngắn */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tên hiển thị đầy đủ:
              </label>
              <input
                type="text"
                required
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Ví dụ: +50 Xu May Mắn"
                className="w-full h-9 px-3 text-xs bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:border-[#0A62D6] outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tên ngắn trên vòng quay (max 10 ký tự):
              </label>
              <input
                type="text"
                required
                maxLength={12}
                value={shortLabel}
                onChange={(e) => setShortLabel(e.target.value)}
                placeholder="Ví dụ: +50 Xu"
                className="w-full h-9 px-3 text-xs bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:border-[#0A62D6] outline-none transition-all"
              />
            </div>
          </div>

          {/* 3. Giá trị nhận (tùy theo loại phần thưởng) */}
          {prizeType === "coin" && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Số xu tặng thêm:
              </label>
              <input
                type="number"
                min="1"
                required
                value={rewardCoins}
                onChange={(e) => setRewardCoins(Number(e.target.value))}
                className="w-full h-9 px-3 text-xs font-bold text-amber-600 bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:border-[#0A62D6] outline-none transition-all"
              />
            </div>
          )}

          {prizeType === "deduct_coin" && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Số xu bị trừ:
              </label>
              <input
                type="number"
                min="1"
                required
                value={Math.abs(rewardCoins)}
                onChange={(e) => setRewardCoins(Number(e.target.value))}
                className="w-full h-9 px-3 text-xs font-bold text-rose-600 bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:border-[#0A62D6] outline-none transition-all"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                * Học sinh quay vào ô này sẽ bị trừ số xu tương ứng trong heo đất.
              </span>
            </div>
          )}

          {prizeType === "free_spin" && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Số lượt quay miễn phí tặng kèm:
              </label>
              <input
                type="number"
                min="1"
                max="5"
                required
                value={rewardFreeSpins}
                onChange={(e) => setRewardFreeSpins(Number(e.target.value))}
                className="w-full h-9 px-3 text-xs font-bold text-emerald-600 bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:border-[#0A62D6] outline-none transition-all"
              />
            </div>
          )}

          {/* 4. Vị trí thứ tự ô (Chèn vào vị trí) */}
          <div>
            <TeacherSelect
              label={isEditing ? "Vị trí ô trên vòng quay:" : "Chèn vào vị trí:"}
              options={slotOrderOptions}
              value={String(slotOrder)}
              onChange={(val) => setSlotOrder(Number(val))}
              size="sm"
            />
            <span className="text-[10px] text-slate-400 mt-1.5 block">
              * Ô này sẽ được chèn vào đúng số thứ tự đã chọn, các ô khác sẽ tự động dời tương ứng.
            </span>
          </div>

          {/* 5. Trọng số xác suất */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
              <span>Trọng số xác suất (Weight):</span>
              <span className="text-[#0A62D6] font-black">{probabilityWeight}</span>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              value={probabilityWeight}
              onChange={(e) => setProbabilityWeight(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0A62D6]"
            />
            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
              <span>1 (Hiếm nhất)</span>
              <span>25 (Trung bình)</span>
              <span>50 (Rất dễ trúng)</span>
            </div>
          </div>

          {/* Footer Form Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#0A62D6] hover:bg-[#074799] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              {isEditing ? "Cập nhật ô" : "Thêm vào vòng quay"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
