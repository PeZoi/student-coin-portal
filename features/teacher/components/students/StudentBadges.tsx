import Image from "next/image";
import { ShieldCheck, ShieldAlert, School } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";

interface StudentPinBadgeProps {
	failedAttempts: number;
	lockedUntil: string | null;
}

export function StudentPinBadge({
	failedAttempts,
	lockedUntil,
}: StudentPinBadgeProps) {
	const isLocked = Boolean(lockedUntil) || failedAttempts >= 5;

	if (isLocked) {
		return (
			<span className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 whitespace-nowrap'>
				<ShieldAlert className='w-3.5 h-3.5 text-rose-600 shrink-0' />
				<span>Khóa PIN (sai {failedAttempts} lần)</span>
			</span>
		);
	}

	if (failedAttempts > 0) {
		return (
			<span className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap'>
				<ShieldAlert className='w-3.5 h-3.5 text-amber-600 shrink-0' />
				<span>Sai {failedAttempts}/5 lần</span>
			</span>
		);
	}

	return (
		<span className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80 whitespace-nowrap'>
			<ShieldCheck className='w-3.5 h-3.5 text-emerald-600 shrink-0' />
			<span>Hoạt động</span>
		</span>
	);
}

interface StudentStatusBadgeProps {
	isActive: boolean;
	isDeleted?: boolean;
}

export function StudentStatusBadge({
	isActive,
	isDeleted,
}: StudentStatusBadgeProps) {
	if (isDeleted) {
		return (
			<span className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 whitespace-nowrap'>
				<span className='w-1.5 h-1.5 rounded-full bg-rose-500' />
				<span>Đã xóa</span>
			</span>
		);
	}

	if (!isActive) {
		return (
			<span className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200 whitespace-nowrap'>
				<span className='w-1.5 h-1.5 rounded-full bg-slate-400' />
				<span>Tạm ngưng</span>
			</span>
		);
	}

	return (
		<span className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#ECFDF3] text-[#15803D] border border-[#ABEFC6] whitespace-nowrap'>
			<span className='w-1.5 h-1.5 rounded-full bg-[#15803D]' />
			<span>Đang học</span>
		</span>
	);
}

interface StudentClassBadgeProps {
	className: string;
}

export function StudentClassBadge({ className }: StudentClassBadgeProps) {
	const isUnassigned = !className || className === "Chưa phân lớp";

	if (isUnassigned) {
		return (
			<span className='text-slate-400 text-[13px] italic whitespace-nowrap'>
				Chưa phân lớp
			</span>
		);
	}

	return (
		<span className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-[#EAF2FF] text-[#0A62D6] border border-[#CFE1FB] whitespace-nowrap'>
			<School className='w-3.5 h-3.5 text-[#0A62D6] shrink-0' />
			<span>{className}</span>
		</span>
	);
}

interface StudentCoinsBadgeProps {
	currentCoins: number;
	totalEarnedCoins?: number;
}

/**
 * Hiển thị số xu học sinh: Hộp 2 tầng (Ví hiện có / Tổng tích lũy)
 * Đồng bộ 100% với giao diện bên Quản lý lớp học (ClassStudentsModal)
 */
export function StudentCoinsBadge({
	currentCoins,
	totalEarnedCoins,
}: StudentCoinsBadgeProps) {
	const current = currentCoins ?? 0;
	const total = totalEarnedCoins ?? current;

	return (
		<div className='inline-flex flex-col items-start justify-center py-1 px-2.5 rounded-xl bg-slate-50 border border-slate-200/80 shadow-2xs min-w-[110px]'>
			{/* Dòng 1: Ví hiện có */}
			<Tooltip content='Số xu hiện có trong ví học sinh' side='top'>
				<div className='inline-flex items-center gap-1.5 text-amber-900 cursor-default'>
					<Image
						src='/coin.png'
						alt='Ví xu'
						width={15}
						height={15}
						unoptimized
						style={{ height: "auto" }}
						className='w-3.5 h-3.5 object-contain shrink-0 drop-shadow-xs'
					/>
					<span className='font-heading font-black text-xs tabular-nums text-amber-950'>
						{current.toLocaleString("vi-VN")}
					</span>
					<span className='text-[12px] font-bold text-amber-700'>ví</span>
				</div>
			</Tooltip>

			{/* Vạch ngăn mảnh */}
			<div className='w-full h-[1px] bg-slate-200/70 my-0.5' />

			{/* Dòng 2: Tổng tích lũy */}
			<Tooltip content='Tổng số xu đã kiếm được từ trước đến nay' side='top'>
				<div className='inline-flex items-center gap-1.5 text-slate-600 cursor-default'>
					<Image
						src='/coin.png'
						alt='Tổng xu'
						width={14}
						height={14}
						unoptimized
						style={{ height: "auto" }}
						className='w-3.5 h-3.5 object-contain shrink-0 opacity-80'
					/>
					<span className='font-heading font-bold text-xs tabular-nums text-slate-700'>
						{total.toLocaleString("vi-VN")}
					</span>
					<span className='text-[12px] font-bold text-slate-500'>
						tổng
					</span>
				</div>
			</Tooltip>
		</div>
	);
}
