"use client";

import { useState, useMemo } from "react";
import {
	Plus,
	SlidersHorizontal,
	RotateCcw,
	Save,
	Scale,
	Undo2,
} from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import { WHEEL_CONSTANTS } from "@/constants/wheel";
import { useWheelConfigContext } from "../contexts/WheelConfigContext";
import { checkIsSlotModified } from "../utils/wheelUtils";
import { WheelSlotCard, DropMode } from "./WheelSlotCard";

/**
 * Lưới Các Thẻ Ô Phần Thưởng Vòng Quay
 * - Tự truy xuất state & handlers từ WheelConfigContext (Quy tắc 10)
 */
export function WheelSlotsGrid() {
	const {
		slots,
		savedSlots,
		totalWeight,
		selectedSlotId,
		setSelectedSlotId,
		isSlotsDirty: isDirty,
		isSavingSlots: isSaving,
		setIsAddModalOpen,
		setEditingSlot,
		handleToggleActive,
		handleToggleLock,
		handleDeleteSlot,
		setConfirmBalanceMode,
		handleResetSlots,
		handleSaveSlots,
		handleReorderSlots,
		handleMoveSlot,
	} = useWheelConfigContext();

	// Quản lý trạng thái Kéo Thả (Drag and Drop Reordering)
	const [draggedId, setDraggedId] = useState<string | null>(null);
	const [dragOverTarget, setDragOverTarget] = useState<{
		id: string;
		mode: DropMode;
	} | null>(null);

	// Đếm số ô đang được khóa cố định tỷ lệ
	const lockedCount = useMemo(
		() => slots.filter((s) => s.is_active && s.is_locked).length,
		[slots],
	);

	return (
		<div className='space-y-4'>
			{/* Toolbar Thao Tác Trực Tiếp Với Số Liệu Ô */}
			<div className='flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs'>
				<div className='flex flex-wrap items-center gap-2.5'>
					<div className='flex items-center gap-2'>
						<SlidersHorizontal className='w-4 h-4 text-slate-500' />
						<span className='text-xs sm:text-sm font-bold text-slate-800'>
							Cơ Cấu {slots.length} Ô Phần Thưởng
						</span>
					</div>

					<span
						className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
							totalWeight === WHEEL_CONSTANTS.TARGET_TOTAL_WEIGHT
								? "bg-emerald-50 text-emerald-700 border-emerald-200"
								: "bg-red-50 text-red-700 border-red-200"
						}`}
					>
						Tổng: {totalWeight}%
					</span>
				</div>

				<div className='flex flex-wrap items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100'>
					<Tooltip
						content='Chia đều 100% tỷ lệ cho tất cả ô'
						wrapperClassName='shrink-0'
						side='top'
					>
						<button
							type='button'
							onClick={() => setConfirmBalanceMode("equalize")}
							className='inline-flex items-center justify-center gap-1.5 h-8.5 px-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-98 shrink-0'
						>
							<Scale className='w-3.5 h-3.5 text-blue-600' />
							<span>Chia đều</span>
						</button>
					</Tooltip>

					<Tooltip
						content={
							lockedCount > 0
								? `Cân bằng về 100% (giữ ${lockedCount} ô 🔒)`
								: "Tự động cân bằng tỷ lệ về 100%"
						}
						wrapperClassName='shrink-0'
						side='top'
					>
						<button
							type='button'
							onClick={() => setConfirmBalanceMode("auto_balance")}
							className='inline-flex items-center justify-center gap-1.5 h-8.5 px-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-98 shrink-0'
						>
							<RotateCcw className='w-3.5 h-3.5 text-slate-500' />
							<span>
								Cân bằng
								{lockedCount > 0 ? ` (giữ ${lockedCount} ô 🔒)` : ""}
							</span>
						</button>
					</Tooltip>

					{isDirty && (
						<span className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300 animate-pulse shadow-2xs shrink-0'>
							<span className='w-2 h-2 rounded-full bg-amber-500 animate-ping' />
							<span>Chưa lưu thay đổi</span>
						</span>
					)}

					<Tooltip
						content={
							isDirty
								? "Hủy bỏ toàn bộ thay đổi chưa lưu (thứ tự, tỷ lệ, thông tin) và khôi phục về trạng thái ban đầu"
								: "Hiện chưa có thay đổi nào để đặt lại"
						}
						wrapperClassName='shrink-0'
						side='top'
					>
						<button
							type='button'
							onClick={handleResetSlots}
							disabled={!isDirty}
							className={`inline-flex items-center justify-center gap-1.5 h-8.5 px-3 rounded-xl text-xs font-bold transition-all shrink-0 ${
								isDirty
									? "bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-300 shadow-xs cursor-pointer active:scale-98"
									: "bg-slate-50 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60"
							}`}
						>
							<Undo2 className='w-3.5 h-3.5 text-slate-500' />
							<span>Đặt lại ban đầu</span>
						</button>
					</Tooltip>

					<button
						type='button'
						onClick={handleSaveSlots}
						disabled={isSaving}
						className={`inline-flex items-center justify-center gap-1.5 h-8.5 px-3.5 rounded-xl text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-98 shrink-0 disabled:opacity-60 ${
							isDirty
								? "bg-emerald-600 hover:bg-emerald-700 ring-2 ring-emerald-500/40 ring-offset-1 shadow-md shadow-emerald-600/20"
								: "bg-emerald-600 hover:bg-emerald-700"
						}`}
					>
						<Save className='w-3.5 h-3.5' />
						<span>{isSaving ? "Đang lưu..." : "Lưu cơ cấu ô"}</span>
					</button>
				</div>
			</div>

			{/* Lưới các Thẻ Ô Số Visual Cards (Chiếm 1 Row đầy đủ như cũ) */}
			<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
				<button
					type='button'
					onClick={() => setIsAddModalOpen(true)}
					className='group min-h-[220px] rounded-2xl border-2 border-dashed border-slate-300 hover:border-[#0A62D6] bg-slate-50/50 hover:bg-blue-50/30 p-6 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer text-center'
				>
					<div className='w-12 h-12 rounded-2xl bg-white group-hover:bg-[#0A62D6] group-hover:text-white text-slate-500 border border-slate-200 group-hover:border-[#0A62D6] flex items-center justify-center transition-all shadow-xs group-hover:scale-110'>
						<Plus className='w-6 h-6 stroke-[2.5]' />
					</div>

					<div>
						<div className='font-extrabold text-xs sm:text-sm text-slate-800 group-hover:text-[#0A62D6] transition-colors'>
							+ Thêm Ô Phần Thưởng Mới
						</div>
						<div className='text-[11px] text-slate-500 mt-0.5'>
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
						onSelect={() => setSelectedSlotId(slot.id)}
						onEdit={() => setEditingSlot(slot)}
						onToggleActive={() => handleToggleActive(slot.id)}
						onToggleLock={() => handleToggleLock(slot.id)}
						onDelete={() => handleDeleteSlot(slot.id)}
						onMoveSlot={handleMoveSlot}
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
								handleReorderSlots(draggedId, id, mode);
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
