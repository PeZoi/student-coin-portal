import Image from "next/image";
import { ShieldCheck, ShieldAlert, School, Lock } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";

/**
 * Tính toán thời gian khóa còn lại từ timestamp `locked_until`
 * - currentMinute: Số phút hiện tại (epoch minutes) từ useMinuteTicker (0 nếu đang SSR prerender)
 * - Trả về chuỗi ngắn gọn: "còn 12 phút", "còn 1h 15p", "< 1 phút"
 */
export function calculateLockRemainingText(
	lockedUntil: string | null | undefined,
	currentMinute?: number
): string | null {
	if (!lockedUntil || !currentMinute || currentMinute <= 0) return null;
	const target = new Date(lockedUntil).getTime();
	if (isNaN(target)) return null;

	const targetMinute = Math.ceil(target / 60000);
	const remainingMinutes = targetMinute - currentMinute;

	if (remainingMinutes <= 0) return null;
	if (remainingMinutes === 1) return "còn < 1 phút";
	if (remainingMinutes < 60) return `còn ${remainingMinutes} phút`;
	const hours = Math.floor(remainingMinutes / 60);
	const minutes = remainingMinutes % 60;
	return minutes > 0 ? `còn ${hours}h ${minutes}p` : `còn ${hours} giờ`;
}

interface StudentStatusBadgeProps {
	isActive: boolean;
	isDeleted?: boolean;
	failedAttempts?: number;
	lockedUntil?: string | null;
	lockRemainingText?: string | null;
}

/**
 * Huy hiệu Trạng thái học sinh thông minh:
 * Gộp trạng thái tài khoản và bảo mật PIN theo thứ tự ưu tiên:
 * 1. Đã xóa (is_deleted = true) -> Huy hiệu đỏ
 * 2. Tạm ngưng (!isActive) -> Huy hiệu xám
 * 3. Thời gian khóa (lockedUntil còn hạn hoặc failedAttempts >= 5) -> Huy hiệu đỏ / hổ phách "Khóa PIN (còn X phút)"
 * 4. Sai mã PIN (failedAttempts >= 1 và < 5) -> Huy hiệu vàng "Sai X/5 lần"
 * 5. Đang học (mặc định) -> Huy hiệu xanh lá
 */
export function StudentStatusBadge({
	isActive,
	isDeleted,
	failedAttempts = 0,
	lockRemainingText,
}: StudentStatusBadgeProps) {
	// 1. Ưu tiên cao nhất: Đã xóa
	if (isDeleted) {
		return (
			<span className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 whitespace-nowrap'>
				<span className='w-1.5 h-1.5 rounded-full bg-rose-500' />
				<span>Đã xóa</span>
			</span>
		);
	}

	// 2. Ưu tiên kế tiếp: Tạm ngưng
	if (!isActive) {
		return (
			<Tooltip content='Tài khoản học sinh đang tạm ngưng hoạt động' side='top'>
				<span className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200 whitespace-nowrap cursor-default'>
					<span className='w-1.5 h-1.5 rounded-full bg-slate-400' />
					<span>Tạm ngưng</span>
				</span>
			</Tooltip>
		);
	}

	// 3. Ưu tiên kế tiếp: Đang trong thời gian đếm ngược khóa (locked_until còn hiệu lực)
	if (lockRemainingText) {
		return (
			<Tooltip
				content={`Tài khoản đang bị tạm khóa do nhập sai mã PIN quá 5 lần. Tự động mở ${lockRemainingText}. Giáo viên có thể bấm Thao tác > Đặt lại mã PIN để mở khóa ngay.`}
				side='top'
			>
				<span className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 whitespace-nowrap cursor-default'>
					<Lock className='w-3.5 h-3.5 text-rose-600 shrink-0' />
					<span>Khóa PIN ({lockRemainingText})</span>
				</span>
			</Tooltip>
		);
	}

	// 4. Nếu số lần sai >= 5 (nhưng không đang trong thời gian đếm ngược khóa) -> Màu ĐỎ cảnh báo nghiêm trọng
	if (failedAttempts >= 5) {
		return (
			<Tooltip
				content={`Đã nhập sai mã PIN ${failedAttempts}/5 lần. Vui lòng bấm Thao tác > Đặt lại mã PIN để cấp lại mã PIN mới cho học sinh.`}
				side='top'
			>
				<span className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 whitespace-nowrap cursor-default'>
					<ShieldAlert className='w-3.5 h-3.5 text-rose-600 shrink-0' />
					<span>Sai {failedAttempts}/5 lần</span>
				</span>
			</Tooltip>
		);
	}

	// 5. Nếu số lần sai từ 1 đến 4 -> Màu VÀNG cảnh báo nhắc nhở
	if (failedAttempts > 0) {
		return (
			<Tooltip
				content={`Đã nhập sai mã PIN ${failedAttempts} lần. Nếu nhập sai đủ 5 lần tài khoản sẽ bị tạm khóa.`}
				side='top'
			>
				<span className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 whitespace-nowrap cursor-default'>
					<ShieldAlert className='w-3.5 h-3.5 text-amber-600 shrink-0' />
					<span>Sai {failedAttempts}/5 lần</span>
				</span>
			</Tooltip>
		);
	}

	// 6. Mặc định: Đang học
	return (
		<span className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#ECFDF3] text-[#15803D] border border-[#ABEFC6] whitespace-nowrap'>
			<span className='w-1.5 h-1.5 rounded-full bg-[#15803D]' />
			<span>Đang học</span>
		</span>
	);
}

interface StudentPinBadgeProps {
	failedAttempts: number;
	lockedUntil: string | null;
}

/**
 * @deprecated Đã gộp vào StudentStatusBadge. Giữ lại để tương thích các component cũ nếu có.
 */
export function StudentPinBadge({
	failedAttempts,
	lockedUntil,
}: StudentPinBadgeProps) {
	const isLocked = Boolean(lockedUntil) || failedAttempts >= 5;

	if (isLocked) {
		return (
			<span className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 whitespace-nowrap'>
				<ShieldAlert className='w-3.5 h-3.5 text-rose-600 shrink-0' />
				<span>Khóa PIN</span>
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
	onClick?: () => void;
}

/**
 * Hiển thị số xu học sinh: Hộp 2 tầng (Ví hiện có / Tổng tích lũy)
 * Hỗ trợ onClick để mở lịch sử giao dịch ví xu Heo Đất
 * Đồng bộ 100% với giao diện bên Quản lý lớp học (ClassStudentsModal)
 */
export function StudentCoinsBadge({
	currentCoins,
	totalEarnedCoins,
	onClick,
}: StudentCoinsBadgeProps) {
	const current = currentCoins ?? 0;
	const total = totalEarnedCoins ?? current;

	const content = (
		<div
			onClick={onClick}
			role={onClick ? "button" : undefined}
			tabIndex={onClick ? 0 : undefined}
			onKeyDown={
				onClick
					? (e) => {
							if (e.key === "Enter" || e.key === " ") {
								e.preventDefault();
								onClick();
							}
					  }
					: undefined
			}
			className={`inline-flex flex-col items-start justify-center py-1 px-2.5 rounded-xl border shadow-2xs min-w-[110px] select-none transition-all ${
				onClick
					? "bg-slate-50 border-slate-200/90 hover:border-amber-400 hover:bg-amber-50/70 hover:shadow-xs active:scale-98 cursor-pointer group"
					: "bg-slate-50 border-slate-200/80 cursor-default"
			}`}
		>
			{/* Dòng 1: Ví hiện có */}
			<div className='inline-flex items-center gap-1.5 text-amber-900'>
				<Image
					src='/coin.png'
					alt='Ví xu'
					width={15}
					height={15}
					unoptimized
					style={{ height: "auto" }}
					className={`w-3.5 h-3.5 object-contain shrink-0 drop-shadow-xs ${
						onClick ? "group-hover:scale-110 transition-transform" : ""
					}`}
				/>
				<span className='font-heading font-black text-xs tabular-nums text-amber-950'>
					{current.toLocaleString("vi-VN")}
				</span>
				<span className='text-[12px] font-bold text-amber-700'>ví</span>
			</div>

			{/* Vạch ngăn mảnh */}
			<div className='w-full h-[1px] bg-slate-200/70 my-0.5' />

			{/* Dòng 2: Tổng tích lũy */}
			<div className='inline-flex items-center gap-1.5 text-slate-600'>
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
				<span className='text-[12px] font-bold text-slate-500'>tổng</span>
			</div>
		</div>
	);

	if (onClick) {
		return (
			<Tooltip content='Click để xem lịch sử giao dịch ví xu Heo Đất' side='top'>
				{content}
			</Tooltip>
		);
	}

	return content;
}
