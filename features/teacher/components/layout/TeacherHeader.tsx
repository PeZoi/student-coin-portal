"use client";

import { useUserStore } from "@/stores/useUserStore";
import { Menu, LogOut, ChevronDown, Bell, School } from "lucide-react";

interface TeacherHeaderProps {
	onToggleSidebar: () => void;
}

export function TeacherHeader({ onToggleSidebar }: TeacherHeaderProps) {
	const { student, logout } = useUserStore();
	const isAdmin = student?.role === "admin";
	const isSuperTeacher = student?.role === "super_teacher";

	const displayName =
		student?.full_name ||
		(isAdmin ? "Admin" : isSuperTeacher ? "Khối Trưởng" : "Giáo viên");

	const roleLabel = isAdmin ? "Quản trị" : "Giáo viên";

	const avatarInitial = displayName.trim().charAt(0).toUpperCase() || "T";

	return (
		<header className='fixed top-0 right-0 left-0 lg:left-64 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] px-4 sm:px-6 flex items-center justify-between'>
			{/* Left: Mobile Toggle & Class Selector */}
			<div className='flex items-center gap-3'>
				<button
					type='button'
					onClick={onToggleSidebar}
					className='lg:hidden p-2 text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-xl transition-colors cursor-pointer'
					aria-label='Mở thanh điều hướng'
				>
					<Menu className='w-5 h-5' />
				</button>

				{/* Class Selector Dropdown (Symbolic) */}
				<button
					type='button'
					className='group inline-flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-xl bg-white hover:bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#CBD5E1] shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-all cursor-pointer select-none'
				>
					<div className='w-7 h-7 rounded-lg bg-[#EAF2FF] text-[#0A62D6] flex items-center justify-center shrink-0 group-hover:bg-[#DCE9FF] transition-colors'>
						<School className='w-4 h-4 stroke-[2.2]' />
					</div>

					<div className='flex items-center gap-1.5 text-xs'>
						<span className='font-medium text-[#64748B] hidden sm:inline'>
							{isSuperTeacher || isAdmin ? "Xem lớp:" : "Lớp phụ trách:"}
						</span>
						<span className='font-bold text-[13px] text-[#0F172A]'>
							Lớp 3A1
						</span>
					</div>

					<span className='hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#F8FAFC] text-[11px] font-semibold text-[#475569] border border-[#E2E8F0]'>
						<span className='w-1.5 h-1.5 rounded-full bg-emerald-500' />
						{isSuperTeacher || isAdmin ? "Toàn trường" : "32 học sinh"}
					</span>

					<ChevronDown className='w-4 h-4 text-[#94A3B8] group-hover:text-[#475569] transition-colors ml-0.5' />
				</button>
			</div>

			{/* Right Controls */}
			<div className='flex items-center gap-2.5 sm:gap-3'>
				{/* Notification Bell (Symbolic) */}
				<button
					type='button'
					className='relative w-9 h-9 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] hover:border-[#CBD5E1] text-[#475569] hover:text-[#0F172A] flex items-center justify-center transition-all cursor-pointer'
					aria-label='Thông báo'
					title='Thông báo'
				>
					<Bell className='w-4 h-4' />
					<span className='absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white' />
				</button>

				<div className='h-6 w-px bg-[#E2E8F0] hidden sm:block' />

				{/* Teacher Avatar, Info & Logout */}
				<div className='flex items-center gap-2.5 pl-1.5 pr-1.5 py-1 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]/90'>
					<div className='w-8 h-8 rounded-lg bg-gradient-to-br from-[#0A62D6] to-[#074799] text-white font-extrabold text-xs flex items-center justify-center shadow-[0_2px_6px_rgba(10,98,214,0.28)] shrink-0'>
						{avatarInitial}
					</div>

					<div className='hidden md:block text-left leading-tight pr-1'>
						<div className='text-xs font-bold text-[#0F172A] max-w-[180px] truncate'>
							{displayName}
						</div>
						<div className='text-[11px] text-[#64748B] font-medium flex items-center gap-1 mt-0.5'>
							<span className='w-1.5 h-1.5 rounded-full bg-[#0A62D6]' />
							<span>{roleLabel}</span>
						</div>
					</div>

					<div className='h-5 w-px bg-[#E2E8F0] hidden md:block' />

					{/* Logout Button */}
					<button
						type='button'
						onClick={logout}
						className='w-8 h-8 text-[#64748B] hover:text-rose-600 hover:bg-rose-50 rounded-lg flex items-center justify-center transition-colors cursor-pointer'
						title='Đăng xuất'
						aria-label='Đăng xuất'
					>
						<LogOut className='w-4 h-4' />
					</button>
				</div>
			</div>
		</header>
	);
}
