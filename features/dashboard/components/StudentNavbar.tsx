"use client";

import { useUserStore } from "@/stores/useUserStore";
import { LogOut, Settings } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppRoutes } from "@/constants";

export function StudentNavbar() {
	const { student, isLoading, logout } = useUserStore();
	const pathname = usePathname();

	const isHome = pathname === AppRoutes.STUDENT.DASHBOARD;
	const isMissions = pathname.startsWith(AppRoutes.STUDENT.MISSIONS);
	const isWheel = pathname.startsWith(AppRoutes.STUDENT.WHEEL);
	const isRewards = pathname.startsWith(AppRoutes.STUDENT.REWARDS);
	const isLeaderboard = pathname.startsWith(AppRoutes.STUDENT.LEADERBOARD);

	const activeMenuClass =
		"relative text-[#451A03] font-heading font-black text-xs md:text-xs lg:text-base tracking-wide px-3 md:px-3.5 lg:px-4 py-1 lg:py-1.5 rounded-full bg-gradient-to-b from-[#FFE84D] via-[#FFC72C] to-[#FFAA00] shadow-[0_2px_4px_rgba(0,0,0,0.22),inset_0_1px_1px_rgba(255,255,255,0.85)] border border-amber-300 whitespace-nowrap transition-all";

	const inactiveMenuClass =
		"text-sky-100 hover:text-white font-heading font-bold text-xs md:text-xs lg:text-base tracking-wide px-2 md:px-2.5 lg:px-3 py-1 lg:py-1.5 rounded-full hover:bg-white/15 whitespace-nowrap transition-all hover:scale-105";

	const studentDisplayName = student
		? `${student.display_name || "Bé"} - ${student.class_name || "Lớp"}`
		: isLoading
			? "Đang tải..."
			: "Chưa đăng nhập";

	const avatarSrc = student?.avatar_url || "/avatar.jpg";
	const avatarAlt = student?.full_name || "Học sinh";

	return (
		<header className='w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-5 lg:px-8 py-1.5 sm:py-2 lg:py-2.5 flex items-center justify-between select-none'>
			{/* Brand Logo: Spark the Present */}
			<Link
				href={AppRoutes.STUDENT.DASHBOARD}
				className='group flex items-center flex-shrink-0 transition-transform active:scale-95 py-0.5'
			>
				<div className='relative h-10 sm:h-11 md:h-12 lg:h-16 aspect-[897/482] flex-shrink-0 transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-0.5'>
					<Image
						src='/logo.png'
						alt='Spark the Present'
						fill
						sizes='(max-width: 640px) 90px, (max-width: 1024px) 110px, 150px'
						priority
						unoptimized
						className='object-contain drop-shadow-[0_4px_10px_rgba(0,20,60,0.35)] group-hover:drop-shadow-[0_6px_18px_rgba(255,215,0,0.45)] transition-all duration-300'
					/>
				</div>
			</Link>

			{/* Navigation links - Tối ưu hiển thị responsive trên iPad (md) và Desktop (lg/xl) */}
			<nav className='hidden md:flex items-center gap-1 md:gap-1.5 lg:gap-4 xl:gap-6 flex-shrink-0'>
				<Link
					href={AppRoutes.STUDENT.DASHBOARD}
					className={isHome ? activeMenuClass : inactiveMenuClass}
				>
					Trang chủ
				</Link>
				<Link
					href={AppRoutes.STUDENT.MISSIONS}
					className={isMissions ? activeMenuClass : inactiveMenuClass}
				>
					Nhiệm vụ
				</Link>
				<Link
					href={AppRoutes.STUDENT.WHEEL}
					className={isWheel ? activeMenuClass : inactiveMenuClass}
				>
					<span className='md:hidden lg:inline'>Vòng quay may mắn</span>
					<span className='hidden md:inline lg:hidden'>Vòng quay</span>
				</Link>
				<Link
					href={AppRoutes.STUDENT.REWARDS}
					className={isRewards ? activeMenuClass : inactiveMenuClass}
				>
					Đổi quà
				</Link>
				<Link
					href={AppRoutes.STUDENT.LEADERBOARD}
					className={isLeaderboard ? activeMenuClass : inactiveMenuClass}
				>
					<span className='md:hidden lg:inline'>Bảng xếp hạng</span>
					<span className='hidden md:inline lg:hidden'>Xếp hạng</span>
				</Link>
			</nav>

			{/* User Profile Pill - Đảm bảo vừa vặn 100% trên iPad và không bị đẩy tràn mép */}
			<div className='flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0'>
				<div className='flex items-center gap-1.5 sm:gap-2 bg-[#003E8A] hover:bg-[#004C9E] pl-1 sm:pl-1.5 pr-2.5 sm:pr-3.5 py-1 rounded-full border border-sky-300/35 shadow-md transition-all cursor-pointer'>
					<div className='w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 rounded-full overflow-hidden border-2 border-yellow-300 relative shadow-sm flex-shrink-0'>
						<Image
							src={avatarSrc}
							alt={avatarAlt}
							fill
							sizes='36px'
							unoptimized
							className='object-cover'
						/>
					</div>
					<div className='flex flex-col text-left justify-center pr-0.5'>
						<span className='text-[10px] sm:text-xs lg:text-sm font-black text-white font-heading leading-tight truncate max-w-[85px] sm:max-w-[125px] md:max-w-[145px] lg:max-w-[185px] drop-shadow-sm'>
							{studentDisplayName}
						</span>
					</div>
				</div>

				{/* Cài đặt & Đăng xuất */}
				<button
					type='button'
					aria-label='Cài đặt'
					className='w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white/80 hover:text-white transition-all cursor-pointer'
				>
					<Settings className='w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-4.5 lg:h-4.5' />
				</button>
				<button
					type='button'
					onClick={logout}
					aria-label='Đăng xuất'
					className='w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 rounded-full bg-red-500/20 hover:bg-red-500/40 border border-red-400/30 flex items-center justify-center text-red-200 hover:text-white transition-all cursor-pointer'
				>
					<LogOut className='w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-4.5 lg:h-4.5' />
				</button>
			</div>
		</header>
	);
}
