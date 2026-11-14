"use client";

import dynamic from "next/dynamic";
import { SlidersHorizontal, BarChart3 } from "lucide-react";
import { InitialWheelConfigData } from "../services/wheelServerService";
import {
	WheelConfigProvider,
	useWheelConfigContext,
} from "../contexts/WheelConfigContext";
import { WheelConfigHeader } from "./WheelConfigHeader";
import { WheelConfigStatsKPI } from "./WheelConfigStatsKPI";
import { WheelConfigAnalytics } from "./WheelConfigAnalytics";
import { WheelSlotsGrid } from "./WheelSlotsGrid";
import { WheelSimulatorAndHistorySection } from "./WheelSimulatorAndHistorySection";

const EditWheelSlotModal = dynamic(
	() =>
		import("./modals/EditWheelSlotModal").then((m) => m.EditWheelSlotModal),
	{ ssr: false },
);
const ConfirmBalanceModal = dynamic(
	() =>
		import("./modals/ConfirmBalanceModal").then((m) => m.ConfirmBalanceModal),
	{ ssr: false },
);
const ConfirmDeleteSlotModal = dynamic(
	() =>
		import("./modals/ConfirmDeleteSlotModal").then(
			(m) => m.ConfirmDeleteSlotModal,
		),
	{ ssr: false },
);

interface WheelConfigViewProps {
	initialData?: InitialWheelConfigData;
}

/**
 * Component View chính của trang Cấu hình vòng quay may mắn
 * - Áp dụng Feature Context Pattern (Quy tắc 10 AGENTS.md): Tách biệt Provider và Content
 * - Loại bỏ 100% Prop Drilling qua các component con và Modals
 */
export function WheelConfigView({ initialData }: WheelConfigViewProps) {
	return (
		<WheelConfigProvider initialData={initialData}>
			<WheelConfigContent />
		</WheelConfigProvider>
	);
}

function WheelConfigContent() {
	const { activeTab, setActiveTab, hasUnsavedChanges, dynamicStats } =
		useWheelConfigContext();

	const totalSpinsCount = dynamicStats.total_historical_spins ?? 0;

	return (
		<div className='space-y-5'>
			{/* 1. Header Trang & Trạng thái cân bằng */}
			<WheelConfigHeader />

			{/* 2. Thẻ KPI Thống Kê Thông Minh */}
			<WheelConfigStatsKPI />

			{/* 3. Thanh Chuyển Đổi 2 Tab Chuyên Biệt */}
			<div className='flex flex-wrap items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-slate-200/80 shadow-xs'>
				<div className='flex items-center gap-1.5 w-full sm:w-auto'>
					<button
						type='button'
						onClick={() => setActiveTab("config")}
						className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
							activeTab === "config"
								? "bg-[#0A62D6] text-white shadow-sm"
								: "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
						}`}
					>
						<SlidersHorizontal className='w-4 h-4' />
						<span>Thiết Lập & Mô Phỏng Vòng Quay</span>
						{hasUnsavedChanges && (
							<span
								className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
									activeTab === "config"
										? "bg-amber-400 text-slate-950"
										: "bg-amber-100 text-amber-800"
								}`}
							>
								Chưa lưu
							</span>
						)}
					</button>

					<button
						type='button'
						onClick={() => setActiveTab("analytics")}
						className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
							activeTab === "analytics"
								? "bg-[#0A62D6] text-white shadow-sm"
								: "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
						}`}
					>
						<BarChart3 className='w-4 h-4' />
						<span>Top Ô Trúng & Lịch Sử Quay Thưởng</span>
						<span
							className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
								activeTab === "analytics"
									? "bg-white/20 text-white"
									: "bg-slate-100 text-slate-600"
							}`}
						>
							{totalSpinsCount.toLocaleString("vi-VN")} lượt
						</span>
					</button>
				</div>

				<span className='hidden md:inline-block text-[11px] font-medium text-slate-400 pr-2'>
					{activeTab === "config"
						? "Thiết lập chi phí, phân bổ tỷ lệ, mô phỏng vòng quay và quản lý các ô phần thưởng"
						: "Theo dõi top ô hay trúng thực tế so với lý thuyết và lịch sử học sinh quay thưởng"}
				</span>
			</div>

			{/* 4. Nội dung theo Tab (0 dòng Prop Drilling) */}
			{activeTab === "config" ? (
				<div className='space-y-5'>
					<WheelConfigAnalytics />
					<WheelSlotsGrid />
				</div>
			) : (
				<WheelSimulatorAndHistorySection />
			)}

			{/* 5. Các hộp thoại Modals tự đọc Context */}
			<EditWheelSlotModal />
			<ConfirmBalanceModal />
			<ConfirmDeleteSlotModal />
		</div>
	);
}
