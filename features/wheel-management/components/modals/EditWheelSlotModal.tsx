"use client";

import { useState, useMemo } from "react";
import { Check, Sparkles } from "lucide-react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal";
import {
  TeacherSelect,
  TeacherSelectOption,
} from "@/components/ui/TeacherSelect";
import { WHEEL_CONSTANTS } from "@/constants/wheel";
import { WheelSlotItem, WheelPrizeType } from "../../types";
import { useWheelConfigContext } from "../../contexts/WheelConfigContext";
import { WheelPrizeImage } from "../WheelPrizeImage";
import { WHEEL_PRIZE_TYPES_LIST } from "../../constants/prizeConfig";

interface EditWheelSlotFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (slotData: Omit<WheelSlotItem, "stats">) => void;
  initialData: WheelSlotItem | null;
  totalSlotsCount: number;
}

function EditWheelSlotForm({
  isOpen,
  onClose,
  onSave,
  initialData,
  totalSlotsCount,
}: EditWheelSlotFormProps) {
  const isEditing = !!initialData;

  // Khởi tạo state trực tiếp từ initialData kết hợp key ở component bọc ngoài (Quy tắc 8 AGENTS.md)
  const [prizeType, setPrizeType] = useState<WheelPrizeType>(
    initialData?.prize_type || "coin"
  );
  const [label, setLabel] = useState(initialData?.label || "");
  const [shortLabel, setShortLabel] = useState(initialData?.short_label || "");
  const [rewardCoins, setRewardCoins] = useState<number>(
    initialData?.reward_coins ? Math.abs(initialData.reward_coins) : 20
  );
  const [rewardFreeSpins, setRewardFreeSpins] = useState<number>(
    initialData?.reward_free_spins || 1
  );
  const [probabilityWeight, setProbabilityWeight] = useState<number>(
    initialData?.probability_weight ?? 15
  );
  const isActive = initialData?.is_active ?? true;
  const [slotOrder, setSlotOrder] = useState<number>(
    initialData?.slot_order ?? totalSlotsCount + 1
  );

  const slotOrderOptions: TeacherSelectOption[] = useMemo(() => {
    const total = isEditing ? totalSlotsCount : totalSlotsCount + 1;
    return Array.from({ length: total }, (_, i) => {
      const pos = i + 1;
      let optLabel = `Vị trí #${pos}`;
      if (pos === 1) {
        optLabel = `Vị trí #1 (Đầu vòng quay)`;
      } else if (pos === total) {
        optLabel = `Vị trí #${pos} (Cuối vòng quay)`;
      }
      return {
        label: optLabel,
        value: String(pos),
      };
    });
  }, [isEditing, totalSlotsCount]);

  const isFormValid = label.trim().length > 0 && shortLabel.trim().length > 0;

  const handleSubmit = () => {
    if (!isFormValid) return;

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
      probability_weight: Math.max(
        WHEEL_CONSTANTS.MIN_SLOT_WEIGHT,
        probabilityWeight
      ),
      is_active: isActive,
      is_locked: initialData?.is_locked ?? false,
    });

    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="lg" closeOnBackdrop>
      <ModalHeader
        icon={<Sparkles className="w-5 h-5 text-[#0A62D6]" />}
        title={
          isEditing
            ? `Chỉnh Sửa Ô #${initialData.slot_order} Trên Vòng Quay`
            : "Thêm Ô Phần Thưởng Mới"
        }
        description="Thiết lập loại phần thưởng, trọng số xác suất và giao diện vòng quay"
        onClose={onClose}
      />

      <ModalBody className="space-y-4">
        {/* 1. Chọn Loại Phần Thưởng */}
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
              Tên ngắn trên vòng quay (max 12 ký tự):
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
              max={WHEEL_CONSTANTS.MAX_DAILY_FREE_SPINS}
              required
              value={rewardFreeSpins}
              onChange={(e) => setRewardFreeSpins(Number(e.target.value))}
              className="w-full h-9 px-3 text-xs font-bold text-emerald-600 bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:border-[#0A62D6] outline-none transition-all"
            />
          </div>
        )}

        {/* 4. Vị trí thứ tự ô */}
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
            min={WHEEL_CONSTANTS.MIN_SLOT_WEIGHT}
            max={WHEEL_CONSTANTS.MAX_SLOT_WEIGHT}
            value={probabilityWeight}
            onChange={(e) => setProbabilityWeight(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0A62D6]"
          />
          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
            <span>{WHEEL_CONSTANTS.MIN_SLOT_WEIGHT} (Hiếm nhất)</span>
            <span>
              {Math.round(WHEEL_CONSTANTS.MAX_SLOT_WEIGHT / 2)} (Trung bình)
            </span>
            <span>{WHEEL_CONSTANTS.MAX_SLOT_WEIGHT} (Rất dễ trúng)</span>
          </div>
        </div>
      </ModalBody>

      <ModalFooter
        showCancel
        cancelLabel="Hủy"
        onCancel={onClose}
        showSubmit
        submitLabel={isEditing ? "Cập nhật ô" : "Thêm vào vòng quay"}
        onSubmit={handleSubmit}
        submitDisabled={!isFormValid}
        submitVariant="primary"
      />
    </Modal>
  );
}

/**
 * Modal Thêm / Chỉnh sửa Ô Phần Thưởng
 * - Tự truy xuất state từ WheelConfigContext (Quy tắc 10)
 */
export function EditWheelSlotModal() {
  const {
    isAddModalOpen,
    setIsAddModalOpen,
    editingSlot,
    setEditingSlot,
    handleSaveSlot,
    slots,
  } = useWheelConfigContext();

  const isOpen = isAddModalOpen || !!editingSlot;
  if (!isOpen) return null;

  return (
    <EditWheelSlotForm
      key={editingSlot?.id || "create-new"}
      isOpen={isOpen}
      onClose={() => {
        setIsAddModalOpen(false);
        setEditingSlot(null);
      }}
      onSave={handleSaveSlot}
      initialData={editingSlot}
      totalSlotsCount={slots.length}
    />
  );
}
