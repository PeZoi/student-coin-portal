"use client";

import Image from "next/image";
import { Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { MissionSubmissionType } from "@/constants";
import { SUBMISSION_TYPE_CONFIG } from "../constants";
import {
	formatRewardCoinsLabel,
	getMissionDeadlineMeta,
	isMissionExpired,
} from "../utils";

/**
 * 1. Hàm tiện ích tính toán các tỷ lệ phần trăm tiến độ nộp và duyệt bài
 */
export function calculateMissionProgressPercents(
	submittedCount: number,
	totalStudents: number,
	approvedCount: number,
) {
	const percentSubmitted =
		totalStudents > 0
			? Math.min(100, Math.round((submittedCount / totalStudents) * 100))
			: 0;

	const percentApproved =
		totalStudents > 0
			? Math.min(
					percentSubmitted,
					Math.round((approvedCount / totalStudents) * 100),
				)
			: 0;

	const percentPending = Math.max(0, percentSubmitted - percentApproved);

	return {
		percentSubmitted,
		percentApproved,
		percentPending,
	};
}

/**
 * 2. Component thanh tiến độ 2 màu dùng chung toàn bộ phân hệ Bài tập:
 * - Màu xanh lá (bg-emerald-500): Tỷ lệ bài đã duyệt
 * - Màu vàng hổ phách (bg-amber-400): Tỷ lệ bài chờ duyệt
 */
export function MissionStackedProgressBar({
	percentApproved,
	percentPending,
	percentExempt = 0,
	approvedCount,
	pendingCount,
	exemptCount,
	heightClass = "h-2",
	bgClass = "bg-slate-100 border border-slate-200/60",
	className,
}: {
	percentApproved: number;
	percentPending: number;
	percentExempt?: number;
	approvedCount?: number;
	pendingCount?: number;
	exemptCount?: number;
	heightClass?: string;
	bgClass?: string;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"w-full rounded-full overflow-hidden flex",
				heightClass,
				bgClass,
				className,
			)}
		>
			{percentApproved > 0 && (
				<div
					className='h-full bg-emerald-500 transition-all duration-300'
					style={{ width: `${percentApproved}%` }}
					title={
						approvedCount !== undefined
							? `Đã duyệt: ${approvedCount} bài (${percentApproved}%)`
							: `Đã duyệt: ${percentApproved}%`
					}
				/>
			)}
			{percentPending > 0 && (
				<div
					className='h-full bg-amber-400 transition-all duration-300'
					style={{ width: `${percentPending}%` }}
					title={
						pendingCount !== undefined
							? `Chờ duyệt: ${pendingCount} bài (${percentPending}%)`
							: `Chờ duyệt: ${percentPending}%`
					}
				/>
			)}
			{percentExempt > 0 && (
				<div
					className='h-full bg-purple-500 transition-all duration-300'
					style={{ width: `${percentExempt}%` }}
					title={
						exemptCount !== undefined
							? `Miễn làm: ${exemptCount} bài (${percentExempt}%)`
							: `Miễn làm: ${percentExempt}%`
					}
				/>
			)}
		</div>
	);
}

/**
 * 3. Icon đại diện của Bài tập theo hình thức nộp bài (`missions.submission_type`)
 */
export function MissionIconAvatar({
	submissionType = MissionSubmissionType.SUBJECTIVE_WRITING,
	isDeleted,
	isActive,
	size = "md",
}: {
	submissionType?: MissionSubmissionType | null;
	isDeleted?: boolean;
	isActive?: boolean;
	size?: "sm" | "md" | "lg";
}) {
	const safeType: MissionSubmissionType =
		submissionType && SUBMISSION_TYPE_CONFIG[submissionType]
			? submissionType
			: MissionSubmissionType.SUBJECTIVE_WRITING;

	const config = SUBMISSION_TYPE_CONFIG[safeType];

	const sizeClass =
		size === "sm"
			? "w-8 h-8 rounded-lg"
			: size === "lg"
				? "w-11 h-11 rounded-2xl"
				: "w-10 h-10 rounded-xl";

	return (
		<div
			className={`${sizeClass} flex items-center justify-center shrink-0 border transition-colors ${
				isDeleted
					? "bg-rose-50 border-rose-200 grayscale opacity-60"
					: !isActive
						? "bg-slate-100 border-slate-200 grayscale opacity-70"
						: `${config.bgClass} ${config.borderClass}`
			}`}
		>
			<Image
				src={config.iconSrc}
				alt={config.label}
				width={32}
				height={32}
				unoptimized
				style={{ height: "auto" }}
				className={
					size === "sm"
						? "w-6 h-6 object-contain drop-shadow-2xs"
						: size === "lg"
							? "w-8 h-8 object-contain drop-shadow-2xs"
							: "w-7 h-7 object-contain drop-shadow-2xs"
				}
			/>
		</div>
	);
}

/**
 * 4. Badge Mức thưởng Xu (`min_reward_coins` ~ `max_reward_coins`)
 */
export function MissionRewardCoinsBadge({
	minCoins,
	maxCoins,
}: {
	minCoins: number;
	maxCoins: number;
}) {
	const isFixed = minCoins === maxCoins || minCoins <= 0;
	const label = formatRewardCoinsLabel(minCoins, maxCoins);

	return (
		<Tooltip
			content={
				isFixed
					? `Mức thưởng cố định: +${maxCoins} xu khi hoàn thành`
					: `Khoảng xu tham khảo: Tối thiểu +${minCoins} xu ~ Tối đa +${maxCoins} xu`
			}
			side='top'
		>
			<div className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50/90 border border-amber-200/80 text-amber-900 text-xs font-bold tabular-nums shadow-2xs whitespace-nowrap'>
				<Image
					src='/wheel/coin.webp'
					alt='Xu'
					width={15}
					height={15}
					unoptimized
					style={{ height: "auto" }}
					className='w-3.5 h-3.5 drop-shadow-xs shrink-0'
				/>
				<span>{label} xu</span>
			</div>
		</Tooltip>
	);
}

/**
 * 5. Ô Tiến độ nộp & Duyệt bài (`homework_submissions` aggregate)
 * - Tái sử dụng component `MissionStackedProgressBar`
 */
export function MissionProgressCell({
	submittedCount,
	totalStudents,
	pendingReviewCount,
	approvedCount,
	lateCount,
	onClickViewSubmissions,
}: {
	submittedCount: number;
	totalStudents: number;
	pendingReviewCount: number;
	approvedCount: number;
	lateCount: number;
	onClickViewSubmissions?: () => void;
}) {
	const { percentSubmitted, percentApproved, percentPending } =
		calculateMissionProgressPercents(
			submittedCount,
			totalStudents,
			approvedCount,
		);

	return (
		<Tooltip content={`Click để xem danh sách học sinh!`} side='top'>
			<button
				type='button'
				onClick={onClickViewSubmissions}
				className='w-full min-w-[150px] max-w-[200px] text-left p-2 -m-2 rounded-xl hover:bg-slate-100/80 transition-colors cursor-pointer group'
			>
				<div className='flex items-center justify-between gap-2 text-xs mb-1.5'>
					<span className='font-bold text-[#0F172A] group-hover:text-[#0A62D6] transition-colors tabular-nums'>
						{submittedCount}/{totalStudents}{" "}
						<span className='font-medium text-slate-500'>HS</span>
					</span>
					<span className='font-bold text-slate-700 tabular-nums'>
						{percentSubmitted}%
					</span>
				</div>

				{/* Thanh Progress Bar 2 màu dùng chung */}
				<MissionStackedProgressBar
					percentApproved={percentApproved}
					percentPending={percentPending}
					approvedCount={approvedCount}
					pendingCount={pendingReviewCount}
				/>

				{/* Dòng trạng thái phụ: Chờ cô duyệt / Đã duyệt / Nộp trễ */}
				<div className='flex items-center gap-1.5 mt-1.5 flex-wrap'>
					{pendingReviewCount > 0 && (
						<span className='inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200/80 text-[10px] font-bold'>
							<span className='w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse' />
							<span>Chờ duyệt: {pendingReviewCount}</span>
						</span>
					)}

					{approvedCount > 0 && (
						<span className='inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700'>
							<CheckCircle2 className='w-3 h-3 text-emerald-600' />
							<span>
								{pendingReviewCount === 0
									? `Đã duyệt đủ (${approvedCount})`
									: `Đã duyệt: ${approvedCount}`}
							</span>
						</span>
					)}

					{submittedCount === 0 && (
						<span className='text-[10px] text-slate-400 font-medium'>
							Chưa có bài nộp
						</span>
					)}

					{lateCount > 0 && (
						<span className='text-[10px] font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200/60'>
							{lateCount} trễ
						</span>
					)}
				</div>
			</button>
		</Tooltip>
	);
}

/**
 * 6. Ô Hạn chót nộp bài (`missions.due_at`)
 */
export function MissionDeadlineCell({
	dueAt,
	isActive,
	isDeleted,
}: {
	dueAt: string;
	isActive: boolean;
	isDeleted: boolean;
}) {
	const meta = getMissionDeadlineMeta(dueAt, isActive, isDeleted);

	const badgeColors =
		meta.urgency === "expired"
			? "bg-rose-50 text-rose-700 border-rose-200/80"
			: meta.urgency === "soon"
				? "bg-amber-50 text-amber-800 border-amber-200/80"
				: meta.urgency === "normal"
					? "bg-emerald-50 text-emerald-700 border-emerald-200/80"
					: "bg-slate-100 text-slate-500 border-slate-200";

	return (
		<div className='space-y-1 whitespace-nowrap'>
			<div className='flex items-center gap-1.5 text-xs font-semibold text-[#0F172A] tabular-nums'>
				<Clock className='w-3.5 h-3.5 text-slate-400 shrink-0' />
				<span>
					{meta.formattedTime} - {meta.formattedDate}
				</span>
			</div>
			<span
				className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-semibold ${badgeColors}`}
			>
				{meta.urgency === "expired" && <AlertCircle className='w-3 h-3' />}
				<span>{meta.relativeLabel}</span>
			</span>
		</div>
	);
}

/**
 * 7. Huy hiệu Trạng thái Bài tập (`is_active`, `is_deleted`, `due_at`)
 * - Đồng bộ hoàn toàn phong cách với StatusBadge của Quản lý lớp học
 */
export function MissionStatusBadge({
	isActive,
	isDeleted,
	dueAt,
}: {
	isActive: boolean;
	isDeleted: boolean;
	dueAt: string;
}) {
	if (isDeleted) {
		return (
			<span className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/80 whitespace-nowrap'>
				<span className='w-1.5 h-1.5 rounded-full bg-rose-500' />
				<span>Đã xóa</span>
			</span>
		);
	}

	if (!isActive) {
		return (
			<span className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200 whitespace-nowrap'>
				<span className='w-1.5 h-1.5 rounded-full bg-slate-400' />
				<span>Tạm ẩn</span>
			</span>
		);
	}

	if (isMissionExpired(dueAt)) {
		return (
			<span className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/80 whitespace-nowrap'>
				<span className='w-1.5 h-1.5 rounded-full bg-amber-500' />
				<span>Quá hạn nộp</span>
			</span>
		);
	}

	return (
		<span className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#ECFDF3] text-[#15803D] border border-[#BBF7D0] whitespace-nowrap'>
			<span className='w-1.5 h-1.5 rounded-full bg-[#22C55E]' />
			<span>Đang mở</span>
		</span>
	);
}
