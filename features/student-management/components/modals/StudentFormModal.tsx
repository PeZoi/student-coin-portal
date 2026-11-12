"use client";

import { useState, useCallback, useMemo } from "react";
import { User, Phone, School, Coins, KeyRound } from "lucide-react";
import {
	Modal,
	ModalHeader,
	ModalBody,
	ModalFooter,
} from "@/components/ui/modal";
import {
	TeacherSelect,
	TeacherSelectOption,
} from "@/components/ui/TeacherSelect";
import { StudentItem, StudentFormValues } from "@/features/student-management/types";
import { useManageStudentsContext } from "@/features/student-management/contexts/ManageStudentsContext";

interface StudentFormModalProps {
	isOpen?: boolean;
	onClose?: () => void;
	initialData?: StudentItem | null;
	onSubmit?: (
		data: StudentFormValues,
	) => Promise<boolean | void> | boolean | void;
	isSubmitting?: boolean;
}

export function StudentFormModal(props?: StudentFormModalProps) {
	const context = useManageStudentsContext();
	const isOpen = props?.isOpen ?? context.isStudentFormOpen;
	const onClose = props?.onClose ?? context.handleCloseStudentForm;
	const initialData =
		props?.initialData !== undefined
			? props.initialData
			: context.editingStudent;
	const onSubmit = props?.onSubmit ?? context.handleStudentFormSubmit;
	const isSubmitting = props?.isSubmitting ?? context.isSubmitting;
	const formKey = context.formKey;

	if (!isOpen) return null;

	return (
		<StudentFormDialogContent
			key={initialData ? `edit-${initialData.id}` : `create-${formKey}`}
			initialData={initialData}
			onClose={onClose}
			onSubmit={onSubmit}
			isSubmitting={isSubmitting}
		/>
	);
}

interface StudentFormDialogContentProps {
	initialData?: StudentItem | null;
	onClose: () => void;
	onSubmit: (
		data: StudentFormValues,
	) => Promise<boolean | void> | boolean | void;
	isSubmitting: boolean;
}

function StudentFormDialogContent({
	initialData,
	onClose,
	onSubmit,
	isSubmitting,
}: StudentFormDialogContentProps) {
	const isEdit = Boolean(initialData);
	const { availableClasses } = useManageStudentsContext();

	// Khởi tạo trực tiếp từ props kết hợp thuộc tính key (Quy tắc 8)
	const [fullName, setFullName] = useState(initialData?.full_name || "");
	const [phoneZalo, setPhoneZalo] = useState(initialData?.phone_zalo || "");
	const [pinNumber, setPinNumber] = useState(
		initialData?.pin_number || "0000",
	);
	const [classId, setClassId] = useState(
		initialData?.class_id ||
			(availableClasses.find((c) => c.is_active)?.id ?? ""),
	);
	const [initialCoins, setInitialCoins] = useState<number>(0);
	const [errorMessage, setErrorMessage] = useState("");

	const classOptions: TeacherSelectOption[] = useMemo(
		() => [
			{ label: "Chưa phân lớp", value: "" },
			...availableClasses
				.filter((c) => c.is_active)
				.map((c) => ({
					label: c.class_name,
					value: c.id,
					badge:
						c.student_count !== undefined
							? `${c.student_count} em`
							: undefined,
				})),
		],
		[availableClasses],
	);

	const handleClose = useCallback(() => {
		if (!isSubmitting) {
			onClose();
		}
	}, [isSubmitting, onClose]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const trimmedName = fullName.trim();
		const trimmedPhone = phoneZalo.trim();
		const trimmedPin = pinNumber.trim();

		if (!trimmedName) {
			setErrorMessage("Vui lòng nhập họ và tên học sinh.");
			return;
		}

		if (!trimmedPhone) {
			setErrorMessage("Vui lòng nhập số điện thoại Zalo của phụ huynh.");
			return;
		}

		if (
			!isEdit &&
			(!trimmedPin || trimmedPin.length !== 4 || !/^\d{4}$/.test(trimmedPin))
		) {
			setErrorMessage(
				"Mã PIN đăng nhập phải gồm đúng 4 chữ số (ví dụ: 0000).",
			);
			return;
		}

		setErrorMessage("");
		const isSuccess = await onSubmit({
			full_name: trimmedName,
			phone_zalo: trimmedPhone,
			pin_number: isEdit ? undefined : trimmedPin,
			class_id: isEdit ? initialData?.class_id || "" : classId,
			initial_coins: isEdit ? undefined : Number(initialCoins) || 0,
			is_active: isEdit ? (initialData?.is_active ?? true) : true,
		});

		if (isSuccess !== false) {
			setFullName("");
			setPhoneZalo("");
			setPinNumber("0000");
			setErrorMessage("");
		}
	};

	return (
		<Modal
			maxWidth={isEdit ? "md" : "lg"}
			onClose={handleClose}
			disabled={isSubmitting}
		>
			<ModalHeader
				icon={<User className='w-5 h-5 text-[#0A62D6]' />}
				title={isEdit ? "Chỉnh sửa hồ sơ học sinh" : "Thêm học sinh mới"}
				description={
					isEdit ? (
						<>
							Học sinh:{" "}
							<span className='font-bold text-[#0F172A]'>
								{initialData?.full_name}
							</span>{" "}
							• Lớp:{" "}
							<span className='font-bold text-[#0A62D6]'>
								{initialData?.class_name || "Chưa phân lớp"}
							</span>
						</>
					) : (
						"Tạo hồ sơ học sinh mới, cấp mã PIN và cấp lớp học ban đầu"
					)
				}
				onClose={handleClose}
				disabled={isSubmitting}
			/>

			<form onSubmit={handleSubmit} className='flex flex-col flex-1 min-h-0'>
				<ModalBody>
					{errorMessage && (
						<div className='p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-600'>
							{errorMessage}
						</div>
					)}

					{/* 1. Họ và tên học sinh */}
					<div>
						<label className='block text-sm font-semibold text-[#0F172A] mb-1.5'>
							Họ và tên học sinh <span className='text-rose-500'>*</span>
						</label>
						<div className='relative'>
							<User className='w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none' />
							<input
								type='text'
								value={fullName}
								onChange={(e) => {
									setFullName(e.target.value);
									if (errorMessage) setErrorMessage("");
								}}
								placeholder='Ví dụ: Nguyễn Minh An'
								className='w-full h-11 pl-10 pr-3.5 rounded-xl bg-white border border-slate-300 text-sm text-[#0F172A] placeholder-slate-400 transition-all focus:outline-none focus:border-[#0A62D6] focus:ring-2 focus:ring-[#0A62D6]/20'
							/>
						</div>
					</div>

					{/* 2. SĐT Zalo Phụ huynh & Lớp học */}
					{isEdit ? (
						/* Khi chỉnh sửa: Chỉ sửa SĐT Zalo, việc đổi lớp đã có chức năng Chuyển lớp riêng */
						<div>
							<label className='block text-sm font-semibold text-[#0F172A] mb-1.5'>
								SĐT Zalo Phụ huynh{" "}
								<span className='text-rose-500'>*</span>
							</label>
							<div className='relative'>
								<Phone className='w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none' />
								<input
									type='text'
									value={phoneZalo}
									onChange={(e) => {
										setPhoneZalo(e.target.value);
										if (errorMessage) setErrorMessage("");
									}}
									placeholder='Ví dụ: 0912 345 678'
									className='w-full h-11 pl-10 pr-3.5 rounded-xl bg-white border border-slate-300 text-sm font-mono text-[#0F172A] placeholder-slate-400 transition-all focus:outline-none focus:border-[#0A62D6] focus:ring-2 focus:ring-[#0A62D6]/20'
								/>
							</div>
							<p className='text-[11px] text-slate-500 mt-1'>
								Dùng làm tên đăng nhập chính của học sinh
							</p>
						</div>
					) : (
						/* Khi tạo mới: Cần chọn lớp học ban đầu */
						<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
							<div>
								<label className='block text-sm font-semibold text-[#0F172A] mb-1.5'>
									SĐT Zalo Phụ huynh{" "}
									<span className='text-rose-500'>*</span>
								</label>
								<div className='relative'>
									<Phone className='w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none' />
									<input
										type='text'
										value={phoneZalo}
										onChange={(e) => {
											setPhoneZalo(e.target.value);
											if (errorMessage) setErrorMessage("");
										}}
										placeholder='Ví dụ: 0912 345 678'
										className='w-full h-11 pl-10 pr-3.5 rounded-xl bg-white border border-slate-300 text-sm font-mono text-[#0F172A] placeholder-slate-400 transition-all focus:outline-none focus:border-[#0A62D6] focus:ring-2 focus:ring-[#0A62D6]/20'
									/>
								</div>
								<p className='text-[11px] text-slate-500 mt-1'>
									Dùng làm tên đăng nhập chính của học sinh
								</p>
							</div>

							<div>
								<TeacherSelect
									label='Lớp học'
									required
									icon={<School className='w-4 h-4 text-slate-400' />}
									options={classOptions}
									value={classId}
									onChange={setClassId}
									placeholder='Chọn lớp học...'
									searchable={true}
									searchPlaceholder='Tìm kiếm tên lớp...'
									disabled={isSubmitting}
								/>
							</div>
						</div>
					)}

					{/* 3. Mã PIN khởi tạo & Số dư xu Heo Đất (Chỉ khi thêm mới) */}
					{!isEdit && (
						<div className='grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1'>
							<div>
								<label className='block text-sm font-semibold text-[#0F172A] mb-1.5'>
									Mã PIN đăng nhập (4 số){" "}
									<span className='text-rose-500'>*</span>
								</label>
								<div className='relative'>
									<KeyRound className='w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none' />
									<input
										type='text'
										maxLength={4}
										value={pinNumber}
										onChange={(e) => {
											const val = e.target.value.replace(/\D/g, "");
											setPinNumber(val);
											if (errorMessage) setErrorMessage("");
										}}
										placeholder='Mặc định: 0000'
										className='w-full h-11 pl-10 pr-3.5 rounded-xl bg-white border border-slate-300 text-sm font-mono tracking-widest text-[#0F172A] placeholder-slate-400 transition-all focus:outline-none focus:border-[#0A62D6] focus:ring-2 focus:ring-[#0A62D6]/20'
									/>
								</div>
								<p className='text-[11px] text-slate-500 mt-1'>
									Bé dùng 4 số này để đăng nhập vào hệ thống
								</p>
							</div>

							<div>
								<label className='block text-sm font-semibold text-[#0F172A] mb-1.5'>
									Tặng xu khởi tạo (tùy chọn)
								</label>
								<div className='relative'>
									<Coins className='w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none' />
									<input
										type='number'
										min={0}
										value={initialCoins}
										onChange={(e) =>
											setInitialCoins(
												Math.max(0, Number(e.target.value)),
											)
										}
										placeholder='0'
										className='w-full h-11 pl-10 pr-3.5 rounded-xl bg-white border border-slate-300 text-sm font-semibold text-[#0F172A] placeholder-slate-400 transition-all focus:outline-none focus:border-[#0A62D6] focus:ring-2 focus:ring-[#0A62D6]/20'
									/>
								</div>
								<p className='text-[11px] text-slate-500 mt-1'>
									Xu chào mừng vào ví của bé
								</p>
							</div>
						</div>
					)}
				</ModalBody>

				<ModalFooter
					showCancel
					cancelLabel='Hủy'
					onCancel={handleClose}
					cancelDisabled={isSubmitting}
					showSubmit
					submitType='submit'
					submitLabel={isEdit ? "Lưu thay đổi" : "Tạo học sinh"}
					submittingLabel='Đang lưu...'
					isSubmitting={isSubmitting}
				/>
			</form>
		</Modal>
	);
}
