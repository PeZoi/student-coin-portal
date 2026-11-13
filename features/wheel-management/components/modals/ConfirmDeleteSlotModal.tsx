"use client";

import { ConfirmDeleteModal } from "@/components/ui/modal";
import { WheelSlotItem } from "../../types";
import { WheelPrizeImage } from "../WheelPrizeImage";

interface ConfirmDeleteSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  slot: WheelSlotItem | null;
  totalSlots: number;
}

/**
 * Modal Xác Nhận Xóa Ô Phần Thưởng Vòng Quay
 * - Hiển thị chi tiết ô chuẩn bị xóa: Tên, loại giải, trọng số tỷ lệ
 * - Cảnh báo dồn thứ tự ô và điều kiện tối thiểu 4 ô
 */
export function ConfirmDeleteSlotModal({
  isOpen,
  onClose,
  onConfirm,
  slot,
  totalSlots,
}: ConfirmDeleteSlotModalProps) {
  if (!slot) return null;

  const isMinSlots = totalSlots <= 4;

  return (
    <ConfirmDeleteModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={isMinSlots ? () => {} : onConfirm}
      title={`Xóa Ô #${slot.slot_order}: "${slot.label}"`}
      description="Xác nhận xóa bỏ ô phần thưởng này khỏi cơ cấu vòng quay"
      confirmLabel={isMinSlots ? "Không thể xóa ô" : "Xác nhận xóa"}
      warningText={
        isMinSlots
          ? "Vòng quay cần duy trì tối thiểu 4 ô để đảm bảo tính mỹ thuật. Hệ thống không cho phép xóa thêm ô!"
          : "Sau khi xóa, các ô còn lại sẽ tự động dồn lại số thứ tự. Vui lòng nhấn 'Cân bằng' nếu tổng tỷ lệ bị lệch khỏi chuẩn 100%."
      }
    >
      <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center gap-3.5 mb-3">
        <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
          <WheelPrizeImage type={slot.prize_type} size={28} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black px-2 py-0.5 rounded-lg bg-blue-100 text-[#0A62D6]">
              Vị trí #{slot.slot_order}
            </span>
            <span className="text-xs font-bold text-slate-500">
              Tỷ lệ: {slot.probability_weight}%
            </span>
          </div>
          <div className="text-sm font-bold text-slate-900 truncate mt-1">
            {slot.label}
          </div>
        </div>
      </div>
    </ConfirmDeleteModal>
  );
}
