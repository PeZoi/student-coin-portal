"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
	format,
	addDays,
	subMonths,
	addMonths,
	startOfMonth,
	endOfMonth,
	startOfWeek,
	endOfWeek,
	eachDayOfInterval,
	isSameMonth,
	isSameDay,
	isToday,
	isBefore,
	startOfDay,
	setHours,
	setMinutes,
} from "date-fns";
import { vi } from "date-fns/locale";
import {
	Calendar as CalendarIcon,
	Clock,
	ChevronLeft,
	ChevronRight,
	ChevronDown,
	ChevronUp,
	Check,
	Sparkles,
} from "lucide-react";
import { toValidDate } from "@/lib/date";
import {
	TeacherSelect,
	TeacherSelectOption,
} from "@/components/ui/TeacherSelect";

interface MissionDateTimePickerProps {
	value: string; // ISO hoặc yyyy-MM-ddTHH:mm
	onChange: (newValue: string) => void;
	label?: string;
	required?: boolean;
	className?: string;
}

/**
 * Danh sách 24 Giờ cho TeacherSelect
 */
const HOUR_OPTIONS: TeacherSelectOption[] = Array.from({ length: 24 }).map(
	(_, h) => ({
		label: `${String(h).padStart(2, "0")} giờ`,
		value: String(h),
	}),
);

/**
 * Danh sách 60 Phút cho TeacherSelect
 */
const MINUTE_OPTIONS: TeacherSelectOption[] = Array.from({ length: 60 }).map(
	(_, m) => ({
		label: `${String(m).padStart(2, "0")} phút`,
		value: String(m),
	}),
);

/**
 * Format chuỗi ngày giờ sang yyyy-MM-ddTHH:mm
 */
function toLocalDatetimeString(date: Date): string {
	return format(date, "yyyy-MM-dd'T'HH:mm");
}

export function MissionDateTimePicker({
	value,
	onChange,
	label = "Hạn chót nộp bài",
	required = false,
	className = "",
}: MissionDateTimePickerProps) {
	// 1. Phân tích ngày giờ hiện tại từ value
	const currentDate = useMemo(() => {
		const parsed = toValidDate(value);
		if (parsed && !isNaN(parsed.getTime())) return parsed;
		// Fallback: hôm nay + 2 ngày, giữ nguyên giờ hiện tại
		const d = new Date();
		d.setDate(d.getDate() + 2);
		return d;
	}, [value]);

	// Snapshot thời gian hiện tại khi component mount để đảm bảo tính thuần túy (pure render)
	const [now] = useState<Date>(() => new Date());
	const today = useMemo(() => startOfDay(now), [now]);

	// 2. State điều hướng tháng trong lịch
	const [viewMonth, setViewMonth] = useState<Date>(() =>
		startOfMonth(currentDate),
	);

	// 3. State mở rộng / thu gọn bảng tùy chỉnh chi tiết
	const [isExpanded, setIsExpanded] = useState<boolean>(false);

	// Tính toán các ngày hiển thị trong lưới lịch (7 cột từ Thứ 2 đến Chủ nhật)
	const calendarDays = useMemo(() => {
		const monthStart = startOfMonth(viewMonth);
		const monthEnd = endOfMonth(monthStart);
		const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
		const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
		return eachDayOfInterval({ start: startDate, end: endDate });
	}, [viewMonth]);

	// Điều hướng tháng
	const handlePrevMonth = () => {
		setViewMonth((prev) => subMonths(prev, 1));
	};

	const handleNextMonth = () => {
		setViewMonth((prev) => addMonths(prev, 1));
	};

	// Xử lý khi chọn 1 ngày trong lịch
	const handleSelectDay = (day: Date) => {
		if (isBefore(day, today)) return; // Không cho chọn ngày quá khứ

		// Giữ nguyên giờ và phút hiện tại
		const newDate = new Date(day);
		newDate.setHours(currentDate.getHours(), currentDate.getMinutes(), 0, 0);
		onChange(toLocalDatetimeString(newDate));
	};

	// Xử lý đổi giờ
	const handleHourChange = (newHour: number) => {
		const updated = setHours(currentDate, newHour);
		onChange(toLocalDatetimeString(updated));
	};

	// Xử lý đổi phút
	const handleMinuteChange = (newMinute: number) => {
		const updated = setMinutes(currentDate, newMinute);
		onChange(toLocalDatetimeString(updated));
	};

	// Xử lý các Presets nhanh theo ngày
	const handlePresetDays = useCallback(
		(daysToAdd: number, specificHour?: number, specificMinute?: number) => {
			const target = addDays(new Date(), daysToAdd);
			if (specificHour !== undefined && specificMinute !== undefined) {
				target.setHours(specificHour, specificMinute, 0, 0);
			} else {
				// Giữ nguyên giờ và phút hiện tại
				const now = new Date();
				target.setHours(now.getHours(), now.getMinutes(), 0, 0);
			}
			onChange(toLocalDatetimeString(target));
			setViewMonth(startOfMonth(target));
		},
		[onChange],
	);

	// Preset cuối tuần này (Chủ nhật 23:59)
	const handlePresetEndOfWeek = useCallback(() => {
		const now = new Date();
		const currentDayOfWeek = now.getDay(); // 0 là Chủ nhật, 1 là Thứ hai
		const daysUntilSunday = currentDayOfWeek === 0 ? 7 : 7 - currentDayOfWeek;
		const sunday = addDays(now, daysUntilSunday);
		sunday.setHours(23, 59, 0, 0);
		onChange(toLocalDatetimeString(sunday));
		setViewMonth(startOfMonth(sunday));
	}, [onChange]);

	// Phân tích trạng thái còn lại (meta) dựa trên snapshot now (tránh gọi Date.now impure)
	const deadlineMeta = useMemo(() => {
		const diffMs = currentDate.getTime() - now.getTime();
		if (diffMs < 0) {
			return {
				label: "Đã qua hạn",
				variant: "expired" as const,
			};
		}
		const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
		if (diffHours < 24) {
			return {
				label: diffHours <= 1 ? "Sắp hết hạn (<1h)" : `Còn ${diffHours} giờ`,
				variant: "soon" as const,
			};
		}
		const diffDays = Math.ceil(diffHours / 24);
		return {
			label: `Còn ${diffDays} ngày nữa`,
			variant: "normal" as const,
		};
	}, [currentDate, now]);

	// Kiểm tra xem preset nào đang active
	const currentHour = currentDate.getHours();
	const currentMinute = currentDate.getMinutes();
	const isPreset2Days =
		isSameDay(currentDate, addDays(now, 2)) &&
		currentHour === now.getHours() &&
		Math.abs(currentMinute - now.getMinutes()) <= 1;

	const isPreset3Days = isSameDay(currentDate, addDays(now, 3));
	const isPreset7Days = isSameDay(currentDate, addDays(now, 7));

	return (
		<div className={`space-y-2 text-xs ${className}`}>
			{/* Tiêu đề & Nhãn */}
			<div className='flex items-center justify-between'>
				<label className='block text-xs font-semibold text-slate-700'>
					{label} {required && <span className='text-rose-500'>*</span>}
				</label>
				<span className='text-xs text-slate-400'>
					Tự động tính theo giờ lớp học
				</span>
			</div>

			{/* Card tóm tắt thời hạn được chọn (Thiết kế đồng bộ Type Scale: text-xs) */}
			<div className='rounded-xl border border-slate-200/90 bg-slate-50/70 p-3 shadow-2xs transition-all space-y-2.5'>
				<div className='flex flex-wrap items-center justify-between gap-2.5'>
					{/* Bên trái: Icon + Ngày giờ tiếng Việt */}
					<div className='flex items-center gap-2.5'>
						<div className='w-8 h-8 rounded-lg bg-blue-50 border border-blue-200/70 text-blue-600 flex items-center justify-center shrink-0'>
							<CalendarIcon className='w-4 h-4' />
						</div>
						<div>
							<div className='text-xs font-semibold text-slate-800 capitalize flex items-center gap-2'>
								<span>
									{format(currentDate, "EEEE, 'ngày' dd/MM/yyyy", {
										locale: vi,
									})}
								</span>
							</div>
							<div className='flex items-center gap-1.5 text-xs text-slate-500 mt-0.5'>
								<Clock className='w-3.5 h-3.5 text-blue-600 shrink-0' />
								<span>
									Lúc{" "}
									<strong className='text-slate-800 font-semibold'>
										{format(currentDate, "HH:mm")}
									</strong>
								</span>
								<span className='text-slate-300'>•</span>
								<span
									className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
										deadlineMeta.variant === "expired"
											? "bg-rose-50 text-rose-700 border-rose-200"
											: deadlineMeta.variant === "soon"
												? "bg-amber-50 text-amber-700 border-amber-200"
												: "bg-emerald-50 text-emerald-700 border-emerald-200"
									}`}
								>
									{deadlineMeta.label}
								</span>
							</div>
						</div>
					</div>

					{/* Bên phải: Nút bật/tắt bảng chỉnh lịch chi tiết (Outline thanh lịch) */}
					<button
						type='button'
						onClick={() => setIsExpanded((prev) => !prev)}
						className='flex items-center gap-1.5 h-7 px-2.5 rounded-lg text-xs font-medium border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-blue-600 transition-all cursor-pointer shadow-2xs'
					>
						<span>{isExpanded ? "Thu gọn" : "Đổi ngày / giờ"}</span>
						{isExpanded ? (
							<ChevronUp className='w-3.5 h-3.5' />
						) : (
							<ChevronDown className='w-3.5 h-3.5' />
						)}
					</button>
				</div>

				{/* Hàng phím tắt chọn nhanh 1 chạm (Đồng bộ cỡ chữ text-xs, nút active xanh dịu) */}
				<div className='pt-2 border-t border-slate-200/60 flex items-center gap-1.5 flex-wrap text-xs'>
					<span className='text-slate-500 font-medium mr-1 flex items-center gap-1'>
						<Sparkles className='w-3.5 h-3.5 text-amber-500 shrink-0' />
						Chọn nhanh:
					</span>

					<button
						type='button'
						onClick={() => handlePresetDays(2)}
						className={`h-7 px-2.5 rounded-lg text-xs transition-all cursor-pointer border ${
							isPreset2Days
								? "bg-blue-50 text-blue-700 border-blue-300 font-semibold shadow-2xs"
								: "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-900 font-medium"
						}`}
						title='Hạn chót sau 2 ngày kể từ hôm nay, đúng giờ phút hiện tại'
					>
						+2 ngày (Mặc định)
					</button>

					<button
						type='button'
						onClick={() => handlePresetDays(3)}
						className={`h-7 px-2.5 rounded-lg text-xs transition-all cursor-pointer border ${
							isPreset3Days
								? "bg-blue-50 text-blue-700 border-blue-300 font-semibold shadow-2xs"
								: "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-900 font-medium"
						}`}
					>
						+3 ngày
					</button>

					<button
						type='button'
						onClick={() => handlePresetDays(7)}
						className={`h-7 px-2.5 rounded-lg text-xs transition-all cursor-pointer border ${
							isPreset7Days
								? "bg-blue-50 text-blue-700 border-blue-300 font-semibold shadow-2xs"
								: "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-900 font-medium"
						}`}
					>
						+1 tuần
					</button>

					<button
						type='button'
						onClick={handlePresetEndOfWeek}
						className='h-7 px-2.5 rounded-lg text-xs font-medium border bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-900 transition-all cursor-pointer'
					>
						Chủ nhật (23:59)
					</button>
				</div>
			</div>

			{/* Bảng tùy chỉnh chi tiết: Lịch tháng mini + Giờ nộp bài (Collapsible) */}
			{isExpanded && (
				<div className='p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3.5 animate-in fade-in slide-in-from-top-1 duration-200'>
					<div className='grid grid-cols-1 md:grid-cols-12 gap-4'>
						{/* Cột 1 (7/12): Lịch tháng mini chọn ngày */}
						<div className='md:col-span-7 border-b md:border-b-0 md:border-r border-slate-100 pb-3 md:pb-0 md:pr-4'>
							{/* Điều hướng tháng */}
							<div className='flex items-center justify-between mb-2.5'>
								<div className='text-xs font-semibold text-slate-800 capitalize flex items-center gap-1.5'>
									<CalendarIcon className='w-3.5 h-3.5 text-blue-600' />
									<span>
										{format(viewMonth, "'Tháng' MM, yyyy", {
											locale: vi,
										})}
									</span>
								</div>
								<div className='flex items-center gap-1'>
									<button
										type='button'
										onClick={handlePrevMonth}
										className='w-6 h-6 rounded-md border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 cursor-pointer transition-colors'
										title='Tháng trước'
									>
										<ChevronLeft className='w-3.5 h-3.5' />
									</button>
									<button
										type='button'
										onClick={handleNextMonth}
										className='w-6 h-6 rounded-md border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 cursor-pointer transition-colors'
										title='Tháng sau'
									>
										<ChevronRight className='w-3.5 h-3.5' />
									</button>
								</div>
							</div>

							{/* Hàng 7 thứ trong tuần (Đồng bộ font text-xs, cân đối với ngày) */}
							<div className='grid grid-cols-7 gap-1 text-center mb-1.5'>
								{["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((dow, idx) => (
									<span
										key={dow}
										className={`text-xs font-medium py-0.5 ${
											idx >= 5 ? "text-amber-600 font-semibold" : "text-slate-400"
										}`}
									>
										{dow}
									</span>
								))}
							</div>

							{/* Lưới các ngày trong tháng (Đồng bộ font text-xs) */}
							<div className='grid grid-cols-7 gap-1'>
								{calendarDays.map((day) => {
									const isCurrentMonth = isSameMonth(day, viewMonth);
									const isSelected = isSameDay(day, currentDate);
									const isPast = isBefore(day, today);
									const isDayToday = isToday(day);

									return (
										<button
											key={day.toISOString()}
											type='button'
											disabled={isPast}
											onClick={() => handleSelectDay(day)}
											className={`h-7.5 rounded-lg text-xs transition-all cursor-pointer relative flex items-center justify-center ${
												isSelected
													? "bg-blue-600 text-white font-semibold shadow-2xs"
													: isPast
														? "text-slate-300 cursor-not-allowed"
														: !isCurrentMonth
															? "text-slate-300 hover:bg-slate-50"
															: isDayToday
																? "text-blue-700 font-semibold bg-blue-50 border border-blue-200 hover:bg-blue-100"
																: "text-slate-700 hover:bg-slate-100 font-medium"
											}`}
										>
											{format(day, "d")}
											{isDayToday && !isSelected && (
												<span className='absolute bottom-1 w-1 h-1 rounded-full bg-blue-600' />
											)}
										</button>
									);
								})}
							</div>
						</div>

						{/* Cột 2 (5/12): Chọn giờ & phút nộp bài bằng TeacherSelect */}
						<div className='md:col-span-5 flex flex-col justify-between space-y-3'>
							<div>
								<div className='text-xs font-semibold text-slate-800 mb-2 flex items-center gap-1.5'>
									<Clock className='w-3.5 h-3.5 text-blue-600' />
									<span>Giờ chốt nộp</span>
								</div>

								{/* Hai ô TeacherSelect Giờ và Phút đồng bộ cỡ text-xs chuẩn */}
								<div className='flex items-center gap-2'>
									<div className='flex-1 min-w-0'>
										<label className='block text-xs font-medium text-slate-500 mb-1 select-none'>
											Giờ (0 - 23)
										</label>
										<TeacherSelect
											size='xs'
											value={String(currentHour)}
											onChange={(val) => handleHourChange(Number(val))}
											options={HOUR_OPTIONS}
											className='h-8 text-xs font-medium text-slate-800'
										/>
									</div>

									<span className='text-slate-400 font-semibold text-xs pt-5 shrink-0 select-none'>
										:
									</span>

									<div className='flex-1 min-w-0'>
										<label className='block text-xs font-medium text-slate-500 mb-1 select-none'>
											Phút (0 - 59)
										</label>
										<TeacherSelect
											size='xs'
											value={String(currentMinute)}
											onChange={(val) => handleMinuteChange(Number(val))}
											options={MINUTE_OPTIONS}
											className='h-8 text-xs font-medium text-slate-800'
										/>
									</div>
								</div>

								{/* Các mốc giờ thông dụng (Đồng bộ font text-xs, layout phẳng thanh lịch) */}
								<div className='mt-3'>
									<span className='block text-xs font-medium text-slate-500 mb-1.5'>
										Mốc giờ thông dụng:
									</span>
									<div className='grid grid-cols-2 gap-1.5'>
										<button
											type='button'
											onClick={() => {
												const n = new Date();
												handleHourChange(n.getHours());
												handleMinuteChange(n.getMinutes());
											}}
											className='h-7.5 px-2.5 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-blue-50 hover:border-blue-300 text-slate-700 hover:text-blue-700 flex items-center justify-between text-xs transition-all cursor-pointer'
											title='Chọn giờ và phút hiện tại'
										>
											<span className='font-semibold text-slate-800'>
												{format(now, "HH:mm")}
											</span>
											<span className='text-slate-400 font-normal'>
												Hiện tại
											</span>
										</button>

										<button
											type='button'
											onClick={() => {
												handleHourChange(23);
												handleMinuteChange(59);
											}}
											className='h-7.5 px-2.5 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-blue-50 hover:border-blue-300 text-slate-700 hover:text-blue-700 flex items-center justify-between text-xs transition-all cursor-pointer'
										>
											<span className='font-semibold text-slate-800'>
												23:59
											</span>
											<span className='text-slate-400 font-normal'>
												Cuối ngày
											</span>
										</button>

										<button
											type='button'
											onClick={() => {
												handleHourChange(21);
												handleMinuteChange(0);
											}}
											className='h-7.5 px-2.5 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-blue-50 hover:border-blue-300 text-slate-700 hover:text-blue-700 flex items-center justify-between text-xs transition-all cursor-pointer'
										>
											<span className='font-semibold text-slate-800'>
												21:00
											</span>
											<span className='text-slate-400 font-normal'>
												Buổi tối
											</span>
										</button>

										<button
											type='button'
											onClick={() => {
												handleHourChange(12);
												handleMinuteChange(0);
											}}
											className='h-7.5 px-2.5 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-blue-50 hover:border-blue-300 text-slate-700 hover:text-blue-700 flex items-center justify-between text-xs transition-all cursor-pointer'
										>
											<span className='font-semibold text-slate-800'>
												12:00
											</span>
											<span className='text-slate-400 font-normal'>
												Trưa
											</span>
										</button>
									</div>
								</div>
							</div>

							{/* Nút hoàn tất (Nhỏ gọn, vừa vặn góc phải) */}
							<div className='pt-2 border-t border-slate-100 flex items-center justify-end'>
								<button
									type='button'
									onClick={() => setIsExpanded(false)}
									className='flex items-center gap-1.5 h-7 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-2xs transition-all cursor-pointer'
								>
									<Check className='w-3.5 h-3.5' />
									<span>Áp dụng</span>
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
