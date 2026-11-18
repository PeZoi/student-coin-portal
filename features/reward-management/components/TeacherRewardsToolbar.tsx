"use client";

import { useMemo } from "react";
import { Search, X, RotateCw, Filter, List, LayoutGrid } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import {
	TeacherSelect,
	TeacherSelectOption,
} from "@/components/ui/TeacherSelect";
import { cn } from "@/lib/utils";
import {
	ExchangeFilterStatus,
	ExchangeFilterChoiceType,
	ExchangeViewMode,
} from "../types";
import { ExchangeChoiceType, ExchangeRequestStatus } from "@/constants/rewards";
import { useOptionalTeacherRewardsContext } from "../contexts/TeacherRewardsContext";

const DEFAULT_COUNTS = {
	all: 0,
	pending: 0,
	completed: 0,
	rejected: 0,
};

export interface TeacherRewardsToolbarProps {
	searchQuery?: string;
	onSearchChange?: (query: string) => void;
	statusFilter?: ExchangeFilterStatus;
	onStatusChange?: (status: ExchangeFilterStatus) => void;
	choiceTypeFilter?: ExchangeFilterChoiceType;
	onChoiceTypeChange?: (type: ExchangeFilterChoiceType) => void;
	viewMode?: ExchangeViewMode;
	onViewModeChange?: (mode: ExchangeViewMode) => void;
	counts?: {
		all: number;
		pending: number;
		completed: number;
		rejected: number;
	};
	onRefresh?: () => void;
	isRefreshing?: boolean;
}

/**
 * Toolbar tìm kiếm, lọc trạng thái và hình thức đổi quà Heo Đất
 * - Tự động đọc dữ liệu từ TeacherRewardsContext (Quy tắc 10 - Feature Context Pattern)
 * - Vẫn hỗ trợ truyền props độc lập khi cần
 */
export function TeacherRewardsToolbar(props?: TeacherRewardsToolbarProps) {
	const context = useOptionalTeacherRewardsContext();

	const searchQuery = props?.searchQuery ?? context?.searchQuery ?? "";
	const onSearchChange =
		props?.onSearchChange ?? context?.setSearchQuery ?? (() => {});
	const statusFilter = props?.statusFilter ?? context?.statusFilter ?? "all";
	const onStatusChange =
		props?.onStatusChange ?? context?.setStatusFilter ?? (() => {});
	const choiceTypeFilter =
		props?.choiceTypeFilter ?? context?.choiceTypeFilter ?? "all";
	const onChoiceTypeChange =
		props?.onChoiceTypeChange ?? context?.setChoiceTypeFilter ?? (() => {});
	const viewMode = props?.viewMode ?? context?.viewMode ?? "table";
	const onViewModeChange =
		props?.onViewModeChange ?? context?.setViewMode ?? (() => {});
	const counts = props?.counts ?? context?.counts ?? DEFAULT_COUNTS;
	const onRefresh = props?.onRefresh ?? context?.handleRefresh;
	const isRefreshing =
		props?.isRefreshing ??
		Boolean(context?.isValidating || context?.isLoading);

	// 1. Tùy chọn lọc Trạng thái (Chỉ còn: Tất cả, Chờ duyệt, Đã duyệt & trao, Từ chối)
	const statusOptions: TeacherSelectOption[] = useMemo(
		() => [
			{
				label: "Tất cả trạng thái",
				value: "all",
				badge: `${counts.all}`,
			},
			{
				label: "Chờ cô duyệt",
				value: ExchangeRequestStatus.PENDING,
				badge: `${counts.pending}`,
			},
			{
				label: "Đã duyệt & trao",
				value: ExchangeRequestStatus.COMPLETED,
				badge: `${counts.completed}`,
			},
			{
				label: "Đã từ chối",
				value: ExchangeRequestStatus.REJECTED,
				badge: `${counts.rejected}`,
			},
		],
		[counts.all, counts.pending, counts.completed, counts.rejected],
	);

	// 2. Tùy chọn lọc Hình thức đổi (Tiền mặt / Quà tự chọn)
	const choiceTypeOptions: TeacherSelectOption[] = useMemo(
		() => [
			{ label: "Tất cả hình thức", value: "all" },
			{ label: "Tiền mặt", value: ExchangeChoiceType.CASH },
			{ label: "Quà tự chọn", value: ExchangeChoiceType.GIFT },
		],
		[],
	);

	return (
		<div className='p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white'>
			{/* Cụm bộ lọc: Dropdown Trạng thái & Hình thức */}
			<div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1 max-w-2xl'>
				{/* Bộ lọc trạng thái */}
				<div className='w-full sm:w-56 shrink-0'>
					<TeacherSelect
						icon={<Filter className='w-4 h-4 text-slate-500' />}
						options={statusOptions}
						value={statusFilter}
						onChange={(val) =>
							onStatusChange(val as ExchangeFilterStatus)
						}
					/>
				</div>

				{/* Bộ lọc hình thức */}
				<div className='w-full sm:w-52 shrink-0'>
					<TeacherSelect
						options={choiceTypeOptions}
						value={choiceTypeFilter}
						onChange={(val) =>
							onChoiceTypeChange(val as ExchangeFilterChoiceType)
						}
					/>
				</div>
			</div>

			{/* Cụm tìm kiếm, chuyển View & Refresh */}
			<div className='flex items-center gap-2.5 justify-end'>
				{/* Ô tìm kiếm theo tên học sinh */}
				<div className='relative w-full sm:w-64 md:w-72'>
					<Search className='w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none' />
					<input
						type='text'
						value={searchQuery}
						onChange={(e) => onSearchChange(e.target.value)}
						placeholder='Tìm theo tên học sinh...'
						className='w-full pl-9.5 pr-8 py-2 text-sm bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0A62D6]/20 focus:border-[#0A62D6] transition-all text-[#0F172A] placeholder:text-slate-400'
					/>
					{searchQuery && (
						<button
							type='button'
							onClick={() => onSearchChange("")}
							className='absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-md cursor-pointer'
						>
							<X className='w-3.5 h-3.5' />
						</button>
					)}
				</div>

				{/* Toggle Chuyển chế độ xem Bảng / Thẻ */}
				<div className='flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0'>
					<button
						type='button'
						onClick={() => onViewModeChange("table")}
						className={cn(
							"flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
							viewMode === "table"
								? "bg-white text-[#0A62D6] shadow-2xs font-bold"
								: "text-slate-600 hover:text-[#0F172A]",
						)}
					>
						<List className='w-3.5 h-3.5' />
						<span className='hidden sm:inline'>Bảng</span>
					</button>
					<button
						type='button'
						onClick={() => onViewModeChange("grid")}
						className={cn(
							"flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
							viewMode === "grid"
								? "bg-white text-[#0A62D6] shadow-2xs font-bold"
								: "text-slate-600 hover:text-[#0F172A]",
						)}
					>
						<LayoutGrid className='w-3.5 h-3.5' />
						<span className='hidden sm:inline'>Thẻ</span>
					</button>
				</div>

				{/* Nút Làm mới danh sách (nếu có) */}
				{onRefresh && (
					<Tooltip content='Làm mới' side='bottom'>
						<button
							type='button'
							onClick={onRefresh}
							disabled={isRefreshing}
							className='w-9 h-9 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 transition-colors shadow-2xs flex items-center justify-center cursor-pointer disabled:opacity-60 shrink-0'
						>
							<RotateCw
								className={`w-3.5 h-3.5 text-slate-600 ${
									isRefreshing ? "animate-spin text-[#0A62D6]" : ""
								}`}
							/>
						</button>
					</Tooltip>
				)}
			</div>
		</div>
	);
}
