"use client";

import { useState, useCallback } from "react";
import { Coins, PlusCircle, MinusCircle, FerrisWheel } from "lucide-react";
import {
	Modal,
	ModalHeader,
	ModalBody,
	ModalFooter,
} from "@/components/ui/modal";
import { COIN_TX_DESCRIPTIONS } from "@/constants";
import { StudentItem, AdjustCoinsValues } from "./types";
import { useManageStudentsContext } from "../../contexts/ManageStudentsContext";

interface AdjustStudentCoinsModalProps {
	isOpen?: boolean;
	onClose?: () => void;
	studentItem?: StudentItem | null;
	onSubmit?: (
		values: AdjustCoinsValues,
	) => Promise<boolean | void> | boolean | void;
	isSubmitting?: boolean;
}

export function AdjustStudentCoinsModal(props?: AdjustStudentCoinsModalProps) {
	const context = useManageStudentsContext();
	const isOpen = props?.isOpen ?? context.isAdjustCoinsOpen;
	const onClose = props?.onClose ?? context.handleCloseAdjustCoins;
	const studentItem =
		props?.studentItem !== undefined
			? props.studentItem
			: context.adjustingCoinsStudent;
	const onSubmit = props?.onSubmit ?? context.handleAdjustCoinsSubmit;
	const isSubmitting = props?.isSubmitting ?? context.isSubmitting;

	if (!isOpen || !studentItem) return null;

	return (
		<AdjustStudentCoinsDialogContent
			key={studentItem.id}
			studentItem={studentItem}
			onClose={onClose}
			onSubmit={onSubmit}
			isSubmitting={isSubmitting}
		/>
	);
}

interface AdjustStudentCoinsDialogContentProps {
	studentItem: StudentItem;
	onClose: () => void;
	onSubmit: (
		values: AdjustCoinsValues,
	) => Promise<boolean | void> | boolean | void;
	isSubmitting: boolean;
}

type TabType = "coins" | "spins";

function AdjustStudentCoinsDialogContent({
	studentItem,
	onClose,
	onSubmit,
	isSubmitting,
}: AdjustStudentCoinsDialogContentProps) {
	// Tab chính: Thưởng/Trừ xu HOẶC Thưởng/Trừ lượt quay
	const [activeTab, setActiveTab] = useState<TabType>("coins");

	// State cho Tab Thưởng / Trừ xu
	const [coinType, setCoinType] = useState<"add" | "deduct">("add");
	const [amount, setAmount] = useState<number>(50);
	const [coinReason, setCoinReason] = useState(
		"Thưởng làm bài tập chăm chỉ và đạt điểm cao",
	);

	// State cho Tab Thưởng / Trừ lượt quay
	const [spinsType, setSpinsType] = useState<"add" | "deduct">("add");
	const [spinsAmount, setSpinsAmount] = useState<number>(1);
	const [spinsReason, setSpinsReason] = useState(
		"Thưởng lượt quay may mắn vì thành tích tốt",
	);

	const [errorMessage, setErrorMessage] = useState("");

	const currentCoins = studentItem.current_coins;
	const currentSpins = studentItem.free_spins ?? 0;

	const calculatedBalance =
		coinType === "add"
			? currentCoins + (Number(amount) || 0)
			: Math.max(0, currentCoins - (Number(amount) || 0));

	const calculatedSpins =
		spinsType === "add"
			? currentSpins + (Number(spinsAmount) || 0)
			: Math.max(0, currentSpins - (Number(spinsAmount) || 0));

	const handleClose = useCallback(() => {
		if (!isSubmitting) {
			onClose();
		}
	}, [isSubmitting, onClose]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (activeTab === "coins") {
			const parsedAmount = Number(amount);
			if (isNaN(parsedAmount) || parsedAmount <= 0) {
				setErrorMessage("Vui lòng nhập số xu hợp lệ lớn hơn 0.");
				return;
			}

			if (coinType === "deduct" && parsedAmount > currentCoins) {
				setErrorMessage(
					`Số xu trừ (${parsedAmount.toLocaleString(
						"vi-VN",
					)} xu) vượt quá số dư hiện tại của bé (${currentCoins.toLocaleString(
						"vi-VN",
					)} xu).`,
				);
				return;
			}

			setErrorMessage("");
			await onSubmit({
				student_id: studentItem.id,
				student_name: studentItem.full_name,
				type: coinType,
				amount: parsedAmount,
				reason:
					coinReason.trim() ||
					(coinType === "add"
						? COIN_TX_DESCRIPTIONS.DEFAULT_ADD
						: COIN_TX_DESCRIPTIONS.DEFAULT_DEDUCT),
			});
		} else {
			// Tab Thưởng / Trừ lượt quay
			const parsedSpins = Number(spinsAmount);
			if (isNaN(parsedSpins) || parsedSpins <= 0) {
				setErrorMessage("Vui lòng nhập số lượt quay lớn hơn 0.");
				return;
			}

			if (spinsType === "deduct" && parsedSpins > currentSpins) {
				setErrorMessage(
					`Số lượt quay trừ (${parsedSpins} lượt) vượt quá số lượt quay hiện có của bé (${currentSpins} lượt).`,
				);
				return;
			}

			setErrorMessage("");
			const change = spinsType === "add" ? parsedSpins : -parsedSpins;
			await onSubmit({
				student_id: studentItem.id,
				student_name: studentItem.full_name,
				type: "add",
				amount: 0,
				spins_change: change,
				reason:
					spinsReason.trim() ||
					(spinsType === "add"
						? COIN_TX_DESCRIPTIONS.DEFAULT_SPIN_ADD
						: COIN_TX_DESCRIPTIONS.DEFAULT_SPIN_DEDUCT),
			});
		}
	};

	return (
		<Modal maxWidth='md' onClose={handleClose} disabled={isSubmitting}>
			<ModalHeader
				icon={
					activeTab === "coins" ? (
						<Coins className='w-5 h-5 text-amber-500' />
					) : (
						<FerrisWheel className='w-5 h-5 text-purple-600' />
					)
				}
				title={
					activeTab === "coins"
						? "Thưởng / Trừ số xu"
						: "Thưởng / Trừ lượt quay"
				}
				description={
					<>
						Học sinh:{" "}
						<span className='font-bold text-[#0F172A]'>
							{studentItem.full_name}
						</span>{" "}
						• Lớp:{" "}
						<span className='font-bold text-[#0A62D6]'>
							{studentItem.class_name}
						</span>
					</>
				}
				onClose={handleClose}
				disabled={isSubmitting}
			/>

			<form onSubmit={handleSubmit} className='flex flex-col flex-1 min-h-0'>
				<ModalBody>
					{/* Thanh chuyển đổi Tab: Thưởng / Trừ xu vs Thưởng / Trừ lượt quay */}
					<div className='grid grid-cols-2 p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 gap-1'>
						<button
							type='button'
							onClick={() => {
								setActiveTab("coins");
								setErrorMessage("");
							}}
							className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
								activeTab === "coins"
									? "bg-white text-amber-700 shadow-xs border border-amber-200/50"
									: "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
							}`}
						>
							<Coins className='w-4 h-4 text-amber-500' />
							<span>Thưởng / Trừ xu</span>
						</button>

						<button
							type='button'
							onClick={() => {
								setActiveTab("spins");
								setErrorMessage("");
							}}
							className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
								activeTab === "spins"
									? "bg-white text-purple-700 shadow-xs border border-purple-200/50"
									: "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
							}`}
						>
							<FerrisWheel className='w-4 h-4 text-purple-600' />
							<span>Thưởng / Trừ lượt quay</span>
						</button>
					</div>

					{errorMessage && (
						<div className='p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-600'>
							{errorMessage}
						</div>
					)}

					{/* TAB 1: THƯỞNG HOẶC TRỪ XU */}
					{activeTab === "coins" ? (
						<div className='space-y-4'>
							{/* Chọn thao tác: Thưởng hay Trừ xu */}
							<div className='grid grid-cols-2 gap-2.5'>
								<button
									type='button'
									onClick={() => {
										setCoinType("add");
										setCoinReason(
											"Thưởng làm bài tập chăm chỉ và đạt điểm cao",
										);
										if (errorMessage) setErrorMessage("");
									}}
									className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
										coinType === "add"
											? "bg-amber-50 border-amber-300 text-amber-900 shadow-2xs ring-2 ring-amber-400/20"
											: "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
									}`}
								>
									<PlusCircle className='w-4 h-4 text-amber-600' />
									<span>Thưởng nóng xu</span>
								</button>

								<button
									type='button'
									onClick={() => {
										setCoinType("deduct");
										setCoinReason(
											"Khấu trừ xu đổi quà hoặc điều chỉnh sai lệch",
										);
										if (errorMessage) setErrorMessage("");
									}}
									className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
										coinType === "deduct"
											? "bg-rose-50 border-rose-300 text-rose-900 shadow-2xs ring-2 ring-rose-400/20"
											: "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
									}`}
								>
									<MinusCircle className='w-4 h-4 text-rose-600' />
									<span>Trừ bớt xu</span>
								</button>
							</div>

							{/* Thẻ hiển thị số dư hiện tại -> Sau điều chỉnh */}
							<div className='p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between'>
								<div>
									<span className='text-[11px] font-medium text-slate-500 block'>
										Số dư hiện tại
									</span>
									<div className='font-extrabold text-sm text-[#0F172A]'>
										{currentCoins.toLocaleString("vi-VN")} xu
									</div>
								</div>

								<div className='text-right'>
									<span className='text-[11px] font-medium text-slate-500 block'>
										Sau điều chỉnh
									</span>
									<div
										className={`font-black text-base ${
											coinType === "add"
												? "text-emerald-700"
												: "text-rose-700"
										}`}
									>
										{calculatedBalance.toLocaleString("vi-VN")} xu
									</div>
								</div>
							</div>

							{/* Nhập số lượng xu */}
							<div>
								<label className='block text-xs font-semibold text-[#0F172A] mb-1.5'>
									Số lượng xu {coinType === "add" ? "thưởng" : "trừ"}{" "}
									<span className='text-rose-500'>*</span>
								</label>
								<div className='relative'>
									<Coins className='w-4 h-4 text-amber-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none' />
									<input
										type='number'
										min={0}
										value={amount}
										onChange={(e) => {
											setAmount(Math.max(1, Number(e.target.value)));
											if (errorMessage) setErrorMessage("");
										}}
										placeholder='Nhập số xu...'
										className='w-full h-10 pl-10 pr-4 rounded-xl bg-white border border-slate-300 text-sm font-bold text-[#0F172A] transition-all focus:outline-none focus:border-[#0A62D6] focus:ring-2 focus:ring-[#0A62D6]/20'
									/>
								</div>
							</div>

							{/* Lý do ghi nhận */}
							<div>
								<label className='block text-xs font-semibold text-[#0F172A] mb-1.5'>
									Lý do ghi nhận vào sổ nhật ký
								</label>
								<textarea
									rows={2}
									value={coinReason}
									onChange={(e) => setCoinReason(e.target.value)}
									placeholder='Nhập lý do thưởng hoặc trừ xu...'
									className='w-full p-2.5 rounded-xl bg-white border border-slate-300 text-xs text-[#0F172A] placeholder-slate-400 transition-all focus:outline-none focus:border-[#0A62D6] focus:ring-2 focus:ring-[#0A62D6]/20 resize-none'
								/>
							</div>
						</div>
					) : (
						/* TAB 2: THƯỞNG HOẶC TRỪ LƯỢT QUAY MAY MẮN */
						<div className='space-y-4'>
							{/* Chọn thao tác: Thưởng hay Trừ lượt quay */}
							<div className='grid grid-cols-2 gap-2.5'>
								<button
									type='button'
									onClick={() => {
										setSpinsType("add");
										setSpinsReason(
											"Thưởng lượt quay may mắn vì thành tích tốt",
										);
										if (errorMessage) setErrorMessage("");
									}}
									className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
										spinsType === "add"
											? "bg-purple-50 border-purple-300 text-purple-900 shadow-2xs ring-2 ring-purple-400/20"
											: "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
									}`}
								>
									<PlusCircle className='w-4 h-4 text-purple-600' />
									<span>Thưởng lượt quay</span>
								</button>

								<button
									type='button'
									onClick={() => {
										setSpinsType("deduct");
										setSpinsReason("Khấu trừ lượt quay may mắn");
										if (errorMessage) setErrorMessage("");
									}}
									className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
										spinsType === "deduct"
											? "bg-rose-50 border-rose-300 text-rose-900 shadow-2xs ring-2 ring-rose-400/20"
											: "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
									}`}
								>
									<MinusCircle className='w-4 h-4 text-rose-600' />
									<span>Trừ bớt lượt quay</span>
								</button>
							</div>

							{/* Thẻ hiển thị số lượt quay hiện tại -> Sau điều chỉnh */}
							<div className='p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between'>
								<div>
									<span className='text-[11px] font-medium text-slate-500 block'>
										Lượt quay hiện có
									</span>
									<div className='font-extrabold text-sm text-[#0F172A] flex items-center gap-1.5 mt-0.5'>
										<FerrisWheel className='w-4 h-4 text-purple-600' />
										<span>{currentSpins} lượt</span>
									</div>
								</div>

								<div className='text-right'>
									<span className='text-[11px] font-medium text-slate-500 block'>
										Sau điều chỉnh
									</span>
									<div
										className={`font-black text-base mt-0.5 ${
											spinsType === "add"
												? "text-purple-800"
												: "text-rose-700"
										}`}
									>
										{calculatedSpins} lượt
									</div>
								</div>
							</div>

							{/* Nhập số lượt quay thưởng/trừ */}
							<div>
								<label className='block text-xs font-semibold text-[#0F172A] mb-1.5'>
									Số lượt quay{" "}
									{spinsType === "add" ? "thưởng thêm" : "trừ bớt"}{" "}
									<span className='text-rose-500'>*</span>
								</label>
								<div className='relative'>
									<FerrisWheel
										className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${
											spinsType === "add"
												? "text-purple-600"
												: "text-rose-600"
										}`}
									/>
									<input
										type='number'
										min={0}
										value={spinsAmount}
										onChange={(e) => {
											setSpinsAmount(
												Math.max(1, Number(e.target.value)),
											);
											if (errorMessage) setErrorMessage("");
										}}
										placeholder='Nhập số lượt quay...'
										className={`w-full h-10 pl-10 pr-4 rounded-xl bg-white border border-slate-300 text-sm font-bold text-[#0F172A] transition-all focus:outline-none focus:ring-2 ${
											spinsType === "add"
												? "focus:border-purple-600 focus:ring-purple-600/20"
												: "focus:border-rose-600 focus:ring-rose-600/20"
										}`}
									/>
								</div>
							</div>

							{/* Lý do thưởng/trừ lượt quay */}
							<div>
								<label className='block text-xs font-semibold text-[#0F172A] mb-1.5'>
									Lý do ghi nhận
								</label>
								<textarea
									rows={2}
									value={spinsReason}
									onChange={(e) => setSpinsReason(e.target.value)}
									placeholder='Nhập lý do điều chỉnh lượt quay...'
									className={`w-full p-2.5 rounded-xl bg-white border border-slate-300 text-xs text-[#0F172A] placeholder-slate-400 transition-all focus:outline-none focus:ring-2 resize-none ${
										spinsType === "add"
											? "focus:border-purple-600 focus:ring-purple-600/20"
											: "focus:border-rose-600 focus:ring-rose-600/20"
									}`}
								/>
							</div>
						</div>
					)}
				</ModalBody>

				<ModalFooter>
					<button
						type='button'
						onClick={handleClose}
						disabled={isSubmitting}
						className='h-10 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50'
					>
						Hủy
					</button>
					<button
						type='submit'
						disabled={isSubmitting}
						className={`h-10 px-5 rounded-xl text-white text-sm font-semibold transition-all shadow-xs cursor-pointer active:scale-98 disabled:opacity-60 inline-flex items-center gap-2 ${
							activeTab === "spins"
								? spinsType === "add"
									? "bg-purple-600 hover:bg-purple-700"
									: "bg-rose-600 hover:bg-rose-700"
								: coinType === "add"
									? "bg-amber-500 hover:bg-amber-600"
									: "bg-rose-600 hover:bg-rose-700"
						}`}
					>
						{isSubmitting ? (
							<>
								<span className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
								<span>Đang lưu...</span>
							</>
						) : activeTab === "spins" ? (
							<span>
								{spinsType === "add"
									? "Xác nhận thưởng lượt quay"
									: "Xác nhận trừ lượt quay"}
							</span>
						) : (
							<span>
								{coinType === "add"
									? "Xác nhận thưởng xu"
									: "Xác nhận trừ xu"}
							</span>
						)}
					</button>
				</ModalFooter>
			</form>
		</Modal>
	);
}
