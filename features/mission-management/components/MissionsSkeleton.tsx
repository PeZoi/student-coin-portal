/**
 * Component Skeleton thuần UI cho trang Quản lý & Giao bài tập
 * - Server Component tĩnh (không 'use client', không hook, không gọi API)
 * - Dùng làm Suspense fallback chuẩn theo Quy tắc 9
 */
export function MissionsSkeleton() {
	return (
		<div className='space-y-5 animate-pulse'>
			{/* 1. Header Skeleton */}
			<div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
				<div>
					<div className='h-8 w-56 bg-slate-200 rounded-xl' />
					<div className='h-4 w-80 bg-slate-100 rounded-md mt-2' />
				</div>
				<div className='h-10 w-44 bg-slate-200 rounded-xl shrink-0' />
			</div>

			{/* 2. KPI Cards Skeleton */}
			<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
				{[1, 2, 3, 4].map((i) => (
					<div
						key={i}
						className='bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs'
					>
						<div className='flex items-start justify-between gap-2'>
							<div className='h-4 w-28 bg-slate-100 rounded-md' />
							<div className='w-10 h-10 rounded-xl bg-slate-100 shrink-0' />
						</div>
						<div className='mt-4 flex items-baseline gap-2'>
							<div className='h-8 w-16 bg-slate-200 rounded-lg' />
							<div className='h-4 w-10 bg-slate-100 rounded-md' />
						</div>
					</div>
				))}
			</div>

			{/* 3. Toolbar & Table Skeleton */}
			<div className='bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden'>
				<div className='p-4 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3'>
					<div className='h-10 w-52 bg-slate-100 rounded-xl' />
					<div className='flex items-center gap-2'>
						<div className='h-10 w-full sm:w-64 bg-slate-100 rounded-xl' />
						<div className='h-10 w-28 bg-slate-100 rounded-xl shrink-0' />
						<div className='h-10 w-10 bg-slate-100 rounded-xl shrink-0' />
					</div>
				</div>

				<div className='border-b border-slate-200' />

				<div className='p-4 sm:p-6 space-y-4'>
					{[1, 2, 3, 4, 5].map((row) => (
						<div
							key={row}
							className='flex items-center justify-between py-3 border-b border-slate-100 last:border-b-0 gap-4'
						>
							<div className='flex items-center gap-3'>
								<div className='w-10 h-10 rounded-xl bg-slate-100 shrink-0' />
								<div className='h-4 w-56 bg-slate-200 rounded-md' />
							</div>

							<div className='hidden md:block h-6 w-20 bg-slate-100 rounded-xl' />
							<div className='hidden lg:block h-6 w-28 bg-slate-100 rounded-lg' />
							<div className='h-6 w-24 bg-slate-100 rounded-full' />
							<div className='h-9 w-28 bg-slate-100 rounded-xl shrink-0' />
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
