"use client";

import { useMemo } from "react";
import {
	Scale,
	RotateCcw,
	Lock,
	AlertTriangle,
	Lightbulb,
	CheckCircle2,
} from "lucide-react";
import {
	Modal,
	ModalHeader,
	ModalBody,
	ModalFooter,
} from "@/components/ui/modal";
import { WHEEL_CONSTANTS } from "@/constants/wheel";
import { useWheelConfigContext } from "../../contexts/WheelConfigContext";

export type BalanceMode = "equalize" | "auto_balance";

/**
 * Modal Popup Xác Nhận & Hướng Dẫn Chi Tiết Khi Chia Đều Hoặc Cân Bằng Tỷ Lệ
 * - Tự truy xuất state từ WheelConfigContext (Quy tắc 10)
 */
export function ConfirmBalanceModal() {
	const {
		confirmBalanceMode: mode,
		setConfirmBalanceMode,
		handleEqualize,
		handleAutoBalance,
		slots,
		totalWeight,
	} = useWheelConfigContext();

	const activeSlots = useMemo(() => slots.filter((s) => s.is_active), [slots]);
	const lockedSlots = useMemo(
		() => activeSlots.filter((s) => s.is_locked),
		[activeSlots],
	);
	const unlockedSlots = useMemo(
		() => activeSlots.filter((s) => !s.is_locked),
		[activeSlots],
	);

	const lockedTotal = useMemo(
		() => lockedSlots.reduce((sum, s) => sum + s.probability_weight, 0),
		[lockedSlots],
	);

	const isLockedInvalid =
		mode === "auto_balance" &&
		lockedSlots.length > 0 &&
		lockedTotal >= WHEEL_CONSTANTS.TARGET_TOTAL_WEIGHT;

	if (!mode) return null;

	const handleClose = () => setConfirmBalanceMode(null);

	const handleConfirm = () => {
		if (mode === "equalize") {
			handleEqualize();
		} else if (mode === "auto_balance") {
			handleAutoBalance();
		}
		setConfirmBalanceMode(null);
	};

	return (
		<Modal isOpen={!!mode} onClose={handleClose} maxWidth='md'>
			<ModalHeader
				icon={
					mode === "equalize" ? (
						<Scale className='w-5 h-5 text-blue-600' />
					) : (
						<RotateCcw className='w-5 h-5 text-[#0A62D6]' />
					)
				}
				title={
					mode === "equalize"
						? "Xác Nhận Chia Đều Tỷ Lệ"
						: "Xác Nhận Cân Bằng Tỷ Lệ"
				}
				description={
					mode === "equalize"
						? "Đặt lại xác suất trúng thưởng bằng nhau cho mọi ô"
						: `Chuẩn hóa tổng xác suất từ ${totalWeight}% về đúng ${WHEEL_CONSTANTS.TARGET_TOTAL_WEIGHT}%`
				}
				onClose={handleClose}
			/>

			<ModalBody className='space-y-4'>
				{mode === "equalize" ? (
					<>
						<div className='bg-slate-50 border border-slate-200/80 rounded-2xl p-4'>
							<div className='grid grid-cols-2 gap-3 text-center'>
								<div className='p-2.5 rounded-xl bg-white border border-slate-200/60 shadow-2xs'>
									<span className='text-[11px] font-bold text-slate-500 uppercase'>
										Số ô kích hoạt
									</span>
									<div className='text-xl font-heading font-black text-slate-800 mt-0.5'>
										{activeSlots.length} ô
									</div>
								</div>
								<div className='p-2.5 rounded-xl bg-white border border-slate-200/60 shadow-2xs'>
									<span className='text-[11px] font-bold text-slate-500 uppercase'>
										Tỷ lệ mỗi ô
									</span>
									<div className='text-xl font-heading font-black text-blue-600 mt-0.5'>
										~{(100 / (activeSlots.length || 1)).toFixed(1)}%
									</div>
								</div>
							</div>

							<p className='text-xs text-slate-600 mt-3 leading-relaxed'>
								Tất cả <b>{activeSlots.length} ô đang kích hoạt</b> sẽ
								được phân bổ tỷ trọng bằng phẳng nhau.
								{lockedSlots.length > 0 && (
									<span className='block mt-1 text-amber-700 font-medium'>
										* Lưu ý: {lockedSlots.length} ô đang khóa 🔒 cũng
										sẽ được mở khóa để chia đều.
									</span>
								)}
							</p>
						</div>

						<div className='bg-blue-50/70 border border-blue-200/70 rounded-2xl p-4 flex gap-3 items-start'>
							<div className='w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5'>
								<Lightbulb className='w-4 h-4' />
							</div>
							<div className='space-y-1 text-xs'>
								<span className='font-bold text-blue-950'>
									Khi nào nên chọn Chia đều?
								</span>
								<p className='text-blue-900/80 leading-relaxed'>
									Phù hợp khi bạn muốn thiết lập lại vòng quay từ đầu,
									đảm bảo cơ hội trúng của tất cả các phần thưởng là
									hoàn toàn ngang nhau.
								</p>
							</div>
						</div>
					</>
				) : (
					<>
						<div className='bg-slate-50 border border-slate-200/80 rounded-2xl p-4'>
							<div className='flex items-center justify-between pb-3 border-b border-slate-200/60'>
								<div className='flex items-center gap-2'>
									<span className='text-xs font-bold text-slate-600'>
										Tổng tỷ lệ hiện tại:
									</span>
									<span
										className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
											totalWeight === 100
												? "bg-emerald-50 text-emerald-700 border-emerald-200"
												: "bg-red-50 text-red-700 border-red-200"
										}`}
									>
										{totalWeight}%
									</span>
								</div>

								<div className='flex items-center gap-1.5 text-xs font-bold text-emerald-700'>
									<CheckCircle2 className='w-4 h-4 text-emerald-600' />
									<span>Mục tiêu: 100%</span>
								</div>
							</div>

							<div className='mt-3'>
								{lockedSlots.length > 0 ? (
									<div className='space-y-2'>
										<div className='flex items-center justify-between text-xs'>
											<span className='font-bold text-amber-800 flex items-center gap-1'>
												<Lock className='w-3.5 h-3.5 text-amber-600' />
												Đang giữ nguyên {lockedSlots.length} ô khóa
												cố định (Tổng: {lockedTotal}%):
											</span>
										</div>

										<div className='flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 bg-amber-50/70 border border-amber-200/70 rounded-xl'>
											{lockedSlots.map((s) => (
												<span
													key={s.id}
													className='inline-flex items-center gap-1 text-[11px] font-bold bg-white text-amber-900 border border-amber-200 px-2 py-0.5 rounded-md shadow-2xs'
												>
													<Lock className='w-2.5 h-2.5 text-amber-600' />
													<span className='truncate max-w-[120px]'>
														{s.short_label || s.label}:
													</span>
													<span className='text-[#0A62D6]'>
														{s.probability_weight}%
													</span>
												</span>
											))}
										</div>

										{isLockedInvalid ? (
											<div className='p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2'>
												<AlertTriangle className='w-4 h-4 text-red-600 shrink-0 mt-0.5' />
												<span>
													Tổng tỷ lệ các ô đã khóa đã đạt hoặc vượt
													quá 100% ({lockedTotal}%). Vui lòng mở
													khóa bớt ô hoặc giảm tỷ lệ trước khi cân
													bằng!
												</span>
											</div>
										) : (
											<p className='text-xs text-slate-600 leading-relaxed'>
												Hệ thống sẽ giữ nguyên <b>{lockedTotal}%</b>{" "}
												cho {lockedSlots.length} ô này, và chỉ tự
												động tăng/giảm tỷ lệ của{" "}
												<b>{unlockedSlots.length} ô còn lại</b> để
												tổng đạt chuẩn 100%.
											</p>
										)}
									</div>
								) : (
									<p className='text-xs text-slate-600 leading-relaxed'>
										Hệ thống sẽ tự động chuẩn hóa tỷ lệ của{" "}
										<b>
											tất cả {activeSlots.length} ô đang kích hoạt
										</b>{" "}
										theo đúng tỷ lệ tương quan hiện tại về tổng 100%.
									</p>
								)}
							</div>
						</div>

						<div className='bg-amber-50/70 border border-amber-200/70 rounded-2xl p-4 flex gap-3 items-start'>
							<div className='w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5'>
								<Lightbulb className='w-4 h-4' />
							</div>
							<div className='space-y-1 text-xs'>
								<span className='font-bold text-amber-950'>
									Mẹo cố định ô mong muốn:
								</span>
								<p className='text-amber-900/80 leading-relaxed'>
									Nếu có ô đặc biệt bạn muốn cố định tỷ lệ chính xác,
									hãy bấm biểu tượng chiếc khóa 🔒 trên thẻ ô đó trước
									khi nhấn Cân bằng.
								</p>
							</div>
						</div>
					</>
				)}
			</ModalBody>

			<ModalFooter
				showCancel
				cancelLabel='Hủy bỏ'
				onCancel={handleClose}
				showSubmit
				submitLabel={
					mode === "equalize"
						? "Xác nhận chia đều"
						: lockedSlots.length > 0
							? `Cân bằng (giữ ${lockedSlots.length} ô 🔒)`
							: "Xác nhận cân bằng"
				}
				onSubmit={handleConfirm}
				submitDisabled={isLockedInvalid}
				submitVariant='primary'
			/>
		</Modal>
	);
}
