"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { Plus, Pencil, Sparkles, GraduationCap } from "lucide-react";
import {
	Modal,
	ModalHeader,
	ModalBody,
	ModalFooter,
} from "@/components/ui/modal";
import { useTeacherWorkspaceStore } from "@/stores/useTeacherWorkspaceStore";
import {
	TeacherMissionItem,
	MissionFormValues,
	AiGradingErrorType,
} from "../../types";
import {
	SUBMISSION_TYPE_OPTIONS,
	AI_GRADING_FOCUS_OPTIONS,
} from "../../constants";
import { toDatetimeLocalValue } from "../../utils";
import { useManageMissionsContext } from "../../contexts/ManageMissionsContext";
import { MissionDateTimePicker } from "./MissionDateTimePicker";

export function MissionFormModal() {
	const {
		isMissionFormOpen,
		editingMission,
		formKey,
		handleCloseMissionForm,
		handleMissionFormSubmit,
		isSubmitting,
		availableClasses,
	} = useManageMissionsContext();

	if (!isMissionFormOpen) return null;

	const modalKey = editingMission
		? `${editingMission.id}-edit-${formKey}`
		: `create-new-mission-${formKey}`;

	return (
		<MissionFormDialogContent
			key={modalKey}
			editingMission={editingMission}
			availableClasses={availableClasses}
			onClose={handleCloseMissionForm}
			onSubmit={handleMissionFormSubmit}
			isSubmitting={isSubmitting}
		/>
	);
}

interface MissionFormDialogContentProps {
	editingMission: TeacherMissionItem | null;
	availableClasses: {
		id: string;
		class_name: string;
		student_count: number;
	}[];
	onClose: () => void;
	onSubmit: (values: MissionFormValues) => Promise<boolean>;
	isSubmitting: boolean;
}

function MissionFormDialogContent({
	editingMission,
	availableClasses,
	onClose,
	onSubmit,
	isSubmitting,
}: MissionFormDialogContentProps) {
	const currentWorkspaceClass = useTeacherWorkspaceStore((state) =>
		state.getSelectedClass(),
	);

	// Xác định lớp được gán: đang active lớp nào thì tự gán lớp đó, không gán một lúc nhiều lớp
	const activeClass =
		currentWorkspaceClass ||
		(availableClasses.length > 0 ? availableClasses[0] : null);

	const targetClass = editingMission
		? availableClasses.find((c) =>
				editingMission.assigned_class_ids.includes(c.id),
			) || activeClass
		: activeClass;

	const targetClassId = targetClass?.id;

	// Khởi tạo trực tiếp từ props qua thuộc tính key (Quy tắc 8 - Không dùng useEffect)
	const [formValues, setFormValues] = useState<MissionFormValues>(() => {
		if (editingMission) {
			return {
				title: editingMission.title,
				description: editingMission.description,
				submission_type:
					editingMission.submission_type ?? "subjective_writing",
				min_reward_coins: editingMission.min_reward_coins,
				max_reward_coins: editingMission.max_reward_coins,
				due_at: toDatetimeLocalValue(editingMission.due_at),
				is_active: editingMission.is_active ?? true,
				assigned_class_ids: targetClassId
					? [targetClassId]
					: (editingMission.assigned_class_ids ?? []),
				grading_focus: editingMission.grading_focus || [
					"spelling",
					"grammar",
				],
				custom_ai_prompt: editingMission.custom_ai_prompt || "",
				allow_late_submission: editingMission.allow_late_submission ?? true,
				ai_prompt_template_id: editingMission.ai_prompt_template_id ?? null,
			};
		}

		return {
			title: "",
			description: "",
			submission_type: "subjective_writing",
			min_reward_coins: 20,
			max_reward_coins: 40,
			due_at: toDatetimeLocalValue(null),
			is_active: true,
			assigned_class_ids: targetClassId ? [targetClassId] : [],
			grading_focus: ["spelling", "grammar"],
			custom_ai_prompt: "",
			allow_late_submission: true,
			ai_prompt_template_id: null,
		};
	});

	const [errorMsg, setErrorMsg] = useState<string | null>(null);

	const updateField = useCallback(
		<K extends keyof MissionFormValues>(
			field: K,
			value: MissionFormValues[K],
		) => {
			setErrorMsg(null);
			setFormValues((prev) => ({ ...prev, [field]: value }));
		},
		[],
	);

	const handleToggleGradingFocus = (focusId: AiGradingErrorType) => {
		setFormValues((prev) => {
			const exists = prev.grading_focus.includes(focusId);
			return {
				...prev,
				grading_focus: exists
					? prev.grading_focus.filter((item) => item !== focusId)
					: [...prev.grading_focus, focusId],
			};
		});
	};

	const handleFormSubmit = async () => {
		if (!formValues.title.trim()) {
			setErrorMsg("Vui lòng nhập tên bài tập cho học sinh.");
			return;
		}
		if (formValues.max_reward_coins <= 0) {
			setErrorMsg("Số xu thưởng tối đa phải lớn hơn 0.");
			return;
		}
		if (formValues.min_reward_coins > formValues.max_reward_coins) {
			setErrorMsg(
				"Xu thưởng tối thiểu không được lớn hơn xu thưởng tối đa.",
			);
			return;
		}
		if (formValues.assigned_class_ids.length === 0) {
			setErrorMsg("Vui lòng chọn ít nhất một lớp học nhận bài tập.");
			return;
		}

		await onSubmit(formValues);
	};

	return (
		<Modal maxWidth='2xl' onClose={onClose} disabled={isSubmitting}>
			<ModalHeader
				icon={
					editingMission ? (
						<Pencil className='w-5 h-5' />
					) : (
						<Plus className='w-5 h-5' />
					)
				}
				title={
					editingMission
						? "Chỉnh sửa bài tập"
						: "Giao bài tập mới cho học sinh"
				}
				description='Thiết lập nội dung bài tập, mức thưởng xu Heo Đất và hạn chót nộp bài'
				onClose={onClose}
				disabled={isSubmitting}
			/>

			<ModalBody className='max-h-[75vh] overflow-y-auto space-y-4'>
				{errorMsg && (
					<div className='p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700'>
						{errorMsg}
					</div>
				)}

				{/* Thông tin lớp học nhận bài tập: Tự động gán theo lớp đang active trên Workspace */}
				<div className='p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80 flex items-center justify-between gap-3'>
					<div className='flex items-center gap-3 min-w-0'>
						<div className='w-9 h-9 rounded-xl bg-blue-100 text-[#0A62D6] flex items-center justify-center shrink-0'>
							<GraduationCap className='w-5 h-5' />
						</div>
						<div className='min-w-0'>
							<span className='text-[11px] font-semibold text-blue-600 block uppercase tracking-wider'>
								Lớp học nhận bài tập
							</span>
							<span className='text-sm font-bold text-slate-800 truncate block'>
								{targetClass
									? `${targetClass.class_name} (${targetClass.student_count} học sinh)`
									: "Chưa có lớp học được chọn"}
							</span>
						</div>
					</div>
				</div>

				{/* 1. Chọn Hình thức nộp bài (submission_type) */}
				<div>
					<label className='block text-xs font-semibold text-slate-700 mb-1.5'>
						Hình thức nộp bài <span className='text-rose-500'>*</span>
					</label>
					<div className='grid grid-cols-1 sm:grid-cols-2 gap-2.5'>
						{SUBMISSION_TYPE_OPTIONS.map((opt) => {
							const active = formValues.submission_type === opt.type;
							return (
								<button
									key={opt.type}
									type='button'
									onClick={() =>
										updateField("submission_type", opt.type)
									}
									className={`p-3 rounded-xl border flex items-center gap-3 transition-all cursor-pointer text-left ${
										active
											? "bg-[#F0F6FE] border-[#0A62D6] ring-2 ring-[#0A62D6]/20 shadow-2xs"
											: "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
									}`}
								>
									<div
										className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${opt.bgClass} ${opt.borderClass}`}
									>
										<Image
											src={opt.iconSrc}
											alt={opt.label}
											width={36}
											height={36}
											unoptimized
											style={{ height: "auto" }}
											className='w-8 h-8 object-contain'
										/>
									</div>
									<div className='min-w-0 flex-1'>
										<span
											className={`text-xs font-bold block ${
												active ? "text-[#0A62D6]" : "text-slate-800"
											}`}
										>
											{opt.label}
										</span>
										<span className='text-[11px] text-slate-500 line-clamp-1 block mt-0.5'>
											{opt.description}
										</span>
									</div>
								</button>
							);
						})}
					</div>
				</div>

				{/* 2. Tên bài tập */}
				<div>
					<label className='block text-xs font-semibold text-slate-700 mb-1'>
						Tên bài tập <span className='text-rose-500'>*</span>
					</label>
					<input
						type='text'
						value={formValues.title}
						onChange={(e) => updateField("title", e.target.value)}
						placeholder='VD: Viết đoạn văn (5-7 câu) miêu tả hoạt động cuối tuần'
						className='w-full h-10 px-3.5 rounded-xl bg-white border border-slate-300 text-sm text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-[#0A62D6] focus:ring-2 focus:ring-[#0A62D6]/20'
					/>
				</div>

				{/* 3. Hướng dẫn làm bài */}
				<div>
					<label className='block text-xs font-semibold text-slate-700 mb-1'>
						Hướng dẫn làm bài cho học sinh (Tùy chọn)
					</label>
					<textarea
						rows={3}
						value={formValues.description}
						onChange={(e) => updateField("description", e.target.value)}
						placeholder='Mô tả các bước thực hiện và yêu cầu chụp ảnh trang vở hoặc kết quả để học sinh dễ làm...'
						className='w-full p-3 rounded-xl bg-white border border-slate-300 text-sm text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-[#0A62D6] focus:ring-2 focus:ring-[#0A62D6]/20 resize-none leading-relaxed'
					/>
				</div>

				{/* 4. Mức thưởng Xu Heo Đất */}
				<div className='p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-2.5'>
					<label className='block text-xs font-bold text-amber-900 uppercase tracking-wider'>
						Khung thưởng Heo Đất (Số xu học sinh nhận được)
					</label>
					<div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
						<div>
							<label className='block text-xs font-semibold text-amber-900 mb-1'>
								Xu tối thiểu
							</label>
							<input
								type='number'
								min={1}
								max={formValues.max_reward_coins}
								value={formValues.min_reward_coins}
								onChange={(e) =>
									updateField(
										"min_reward_coins",
										Math.max(0, Number(e.target.value)),
									)
								}
								className='w-full h-9 px-3 rounded-xl bg-white border border-amber-300 text-sm font-bold text-amber-900 focus:outline-none focus:border-amber-500'
							/>
						</div>

						<div>
							<label className='block text-xs font-semibold text-amber-900 mb-1'>
								Xu tối đa
							</label>
							<input
								type='number'
								min={1}
								value={formValues.max_reward_coins}
								onChange={(e) =>
									updateField(
										"max_reward_coins",
										Math.max(0, Number(e.target.value)),
									)
								}
								className='w-full h-9 px-3 rounded-xl bg-white border border-amber-300 text-sm font-bold text-amber-900 focus:outline-none focus:border-amber-500'
							/>
						</div>
					</div>
				</div>

				{/* 5. Hạn chót nộp bài (due_at) */}
				<MissionDateTimePicker
					value={formValues.due_at}
					onChange={(newValue) => updateField("due_at", newValue)}
				/>

				{/* 6. Tiêu chí AI Chấm bài (Khớp DB grading_focus) */}
				<div className='pt-3 border-t border-slate-100 space-y-2.5'>
					<label className='text-xs font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5'>
						<Sparkles className='w-3.5 h-3.5' />
						<span>Tiêu chí AI hỗ trợ chấm bài</span>
					</label>

					<div>
						<label className='block text-xs font-semibold text-slate-700 mb-1.5'>
							Các lỗi AI tập trung bắt:
						</label>
						<div className='flex items-center gap-1.5 flex-wrap'>
							{AI_GRADING_FOCUS_OPTIONS.map((focusOpt) => {
								const active = formValues.grading_focus.includes(
									focusOpt.id,
								);
								return (
									<button
										key={focusOpt.id}
										type='button'
										onClick={() =>
											handleToggleGradingFocus(focusOpt.id)
										}
										className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
											active
												? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
												: "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
										}`}
									>
										{focusOpt.label}
									</button>
								);
							})}
						</div>
					</div>

					{/* Lời dặn / Prompt tùy chỉnh của giáo viên cho AI */}
					<div>
						<label className='block text-xs font-semibold text-slate-700 mb-1'>
							Lời dặn riêng cho AI khi chấm bài này (Tùy chọn)
						</label>
						<textarea
							rows={2}
							value={formValues.custom_ai_prompt}
							onChange={(e) =>
								updateField("custom_ai_prompt", e.target.value)
							}
							placeholder='VD: Học sinh lớp 3 mới học bài này, không trừ điểm lỗi thì quá khứ. Hãy khen ngợi các câu học sinh viết sáng tạo và giải thích lỗi bằng tiếng Việt dễ hiểu...'
							className='w-full p-2.5 rounded-xl bg-white border border-slate-300 text-xs text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-[#0A62D6] focus:ring-2 focus:ring-[#0A62D6]/20 resize-none leading-relaxed'
						/>
					</div>
				</div>

				{/* 7. Tùy chọn cài đặt */}
				<div className='pt-3 border-t border-slate-100 space-y-2 text-xs'>
					<label className='flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 cursor-pointer'>
						<span className='font-semibold text-slate-700'>
							Mở nhận bài ngay sau khi lưu
						</span>
						<input
							type='checkbox'
							checked={formValues.is_active}
							onChange={(e) =>
								updateField("is_active", e.target.checked)
							}
							className='w-4 h-4 rounded accent-[#0A62D6] cursor-pointer'
						/>
					</label>

					<label className='flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 cursor-pointer'>
						<span className='font-semibold text-slate-700'>
							Cho phép học sinh nộp bài trễ hạn
						</span>
						<input
							type='checkbox'
							checked={formValues.allow_late_submission}
							onChange={(e) =>
								updateField("allow_late_submission", e.target.checked)
							}
							className='w-4 h-4 rounded accent-[#0A62D6] cursor-pointer'
						/>
					</label>
				</div>
			</ModalBody>

			<ModalFooter
				showCancel
				cancelLabel='Hủy bỏ'
				onCancel={onClose}
				cancelDisabled={isSubmitting}
				showSubmit
				submitLabel={editingMission ? "Lưu thay đổi" : "Giao bài tập ngay"}
				submittingLabel='Đang lưu...'
				onSubmit={handleFormSubmit}
				isSubmitting={isSubmitting}
			/>
		</Modal>
	);
}
