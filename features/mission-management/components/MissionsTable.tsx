"use client";

import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import {
	Table,
	TableHeader,
	TableBody,
	TableRow,
	TableHead,
	TableCell,
} from "@/components/ui/table";
import { MissionSortField } from "../types";
import { useManageMissionsContext } from "../contexts/ManageMissionsContext";
import {
	MissionIconAvatar,
	MissionRewardCoinsBadge,
	MissionProgressCell,
	MissionDeadlineCell,
	MissionStatusBadge,
} from "./MissionBadges";
import { MissionRowActions } from "./MissionRowActions";

export function MissionsTable() {
	const {
		paginatedMissions: items,
		sortField,
		sortDirection,
		handleSortToggle,
		isAdmin,
		selectedIds,
		handleToggleSelect,
		handleSelectAll,
		handleOpenEditMission,
		handleOpenSubmissionsModal,
	} = useManageMissionsContext();

	const allVisibleSelected =
		items.length > 0 && items.every((i) => selectedIds.includes(i.id));

	const renderSortIcon = (field: MissionSortField) => {
		if (sortField !== field || sortDirection === "none") {
			return (
				<ChevronsUpDown className='w-3.5 h-3.5 text-slate-400 ml-1 shrink-0' />
			);
		}
		if (sortDirection === "asc") {
			return (
				<ChevronUp className='w-3.5 h-3.5 text-[#0A62D6] ml-1 shrink-0' />
			);
		}
		return (
			<ChevronDown className='w-3.5 h-3.5 text-[#0A62D6] ml-1 shrink-0' />
		);
	};

	return (
		<Table>
			<TableHeader>
				<TableRow className='hover:bg-transparent'>
					{isAdmin && (
						<TableHead className='w-10 px-3 text-center'>
							<input
								type='checkbox'
								checked={allVisibleSelected}
								onChange={() => handleSelectAll(items.map((i) => i.id))}
								className='w-4 h-4 rounded border-slate-300 text-[#0A62D6] focus:ring-[#0A62D6] cursor-pointer accent-[#0A62D6]'
							/>
						</TableHead>
					)}

					{/* 1. Tên bài tập */}
					<TableHead>
						<button
							type='button'
							onClick={() => handleSortToggle("title")}
							className='inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer select-none'
						>
							<span>Tên bài tập</span>
							{renderSortIcon("title")}
						</button>
					</TableHead>

					{/* 2. Mức thưởng xu */}
					<TableHead align='center'>
						<button
							type='button'
							onClick={() => handleSortToggle("max_reward_coins")}
							className='inline-flex items-center justify-center gap-1 font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer select-none'
						>
							<span>Thưởng xu</span>
							{renderSortIcon("max_reward_coins")}
						</button>
					</TableHead>

					{/* 3. Tiến độ nộp bài */}
					<TableHead>
						<button
							type='button'
							onClick={() => handleSortToggle("submission_rate")}
							className='inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer select-none'
						>
							<span>Tiến độ nộp bài</span>
							{renderSortIcon("submission_rate")}
						</button>
					</TableHead>

					{/* 4. Hạn nộp */}
					<TableHead>
						<button
							type='button'
							onClick={() => handleSortToggle("due_at")}
							className='inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer select-none'
						>
							<span>Hạn nộp</span>
							{renderSortIcon("due_at")}
						</button>
					</TableHead>

					{/* 5. Trạng thái */}
					<TableHead>Trạng thái</TableHead>

					{/* 6. Thao tác */}
					<TableHead align='right'>Thao tác</TableHead>
				</TableRow>
			</TableHeader>

			<TableBody>
				{items.map((item) => {
					const checked = selectedIds.includes(item.id);
					return (
						<TableRow
							key={item.id}
							className={`transition-colors ${
								item.is_deleted
									? "bg-rose-50/20 hover:bg-rose-50/40"
									: checked
										? "bg-[#EAF2FF]/40 hover:bg-[#EAF2FF]/60"
										: "hover:bg-slate-50/70"
							}`}
						>
							{isAdmin && (
								<TableCell className='w-10 px-3 text-center'>
									<input
										type='checkbox'
										checked={checked}
										onChange={() => handleToggleSelect(item.id)}
										className='w-4 h-4 rounded border-slate-300 text-[#0A62D6] focus:ring-[#0A62D6] cursor-pointer accent-[#0A62D6]'
									/>
								</TableCell>
							)}

							{/* Cột 1: Icon + Tên bài tập (tự động xuống dòng nếu dài, không hiện hướng dẫn) */}
							<TableCell className='max-w-[380px]'>
								<div className='flex items-center gap-3 py-0.5'>
									<MissionIconAvatar
										iconType={item.icon_type}
										isDeleted={item.is_deleted}
										isActive={item.is_active}
									/>
									<div className='min-w-0 flex-1'>
										{item.is_deleted ? (
											<span className='font-semibold text-sm text-slate-500 line-through block leading-snug break-words'>
												{item.title}
											</span>
										) : (
											<Tooltip
												content='Click để chỉnh sửa bài tập'
												side='top'
											>
												<button
													type='button'
													onClick={() =>
														handleOpenEditMission(item)
													}
													className={`text-left font-semibold text-sm transition-colors cursor-pointer hover:underline hover:text-[#0A62D6] block leading-snug break-words ${
														item.is_active
															? "text-[#0F172A]"
															: "text-slate-500"
													}`}
												>
													{item.title}
												</button>
											</Tooltip>
										)}
									</div>
								</div>
							</TableCell>

							{/* Cột 2: Mức thưởng xu (min_reward_coins ~ max_reward_coins) */}
							<TableCell align='center' className='whitespace-nowrap'>
								<MissionRewardCoinsBadge
									minCoins={item.min_reward_coins}
									maxCoins={item.max_reward_coins}
								/>
							</TableCell>

							{/* Cột 3: Tiến độ nộp bài */}
							<TableCell>
								<MissionProgressCell
									submittedCount={item.submitted_count}
									totalStudents={item.total_students}
									pendingReviewCount={item.pending_review_count}
									approvedCount={item.approved_count}
									lateCount={item.late_count}
									onClickViewSubmissions={() =>
										handleOpenSubmissionsModal(item)
									}
								/>
							</TableCell>

							{/* Cột 4: Hạn nộp (due_at) */}
							<TableCell className='whitespace-nowrap'>
								<MissionDeadlineCell
									dueAt={item.due_at}
									isActive={item.is_active}
									isDeleted={item.is_deleted}
								/>
							</TableCell>

							{/* Cột 5: Trạng thái */}
							<TableCell className='whitespace-nowrap'>
								<MissionStatusBadge
									isActive={item.is_active}
									isDeleted={item.is_deleted}
									dueAt={item.due_at}
								/>
							</TableCell>

							{/* Cột 6: Thao tác */}
							<TableCell align='right' className='whitespace-nowrap'>
								<MissionRowActions item={item} />
							</TableCell>
						</TableRow>
					);
				})}
			</TableBody>
		</Table>
	);
}
