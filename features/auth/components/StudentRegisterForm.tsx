"use client";

import { useState } from "react";
import Image from "next/image";
import { UseFormReturn } from "react-hook-form";
import { Eye, EyeOff, Loader2, Pencil } from "lucide-react";
import { Button3D } from "@/components/ui/Button3D";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { cn, onlyNumberKeyDown } from "@/lib/utils";
import { DEFAULT_CHIBI_AVATAR } from "../constants/chibiAvatars";
import { CLASS_OPTIONS } from "../constants/classOptions";
import { AvatarPickerModal } from "./AvatarPickerModal";
import { StudentRegisterFormValues } from "../types";

interface StudentRegisterFormProps {
  form: UseFormReturn<StudentRegisterFormValues>;
  onSubmit: (values: StudentRegisterFormValues) => void;
  isSubmitting: boolean;
  onSwitchToLogin?: () => void;
}

export function StudentRegisterForm({
  form,
  onSubmit,
  isSubmitting,
}: StudentRegisterFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = form;

  // Công tắc hiển thị cả hai ô mã PIN cùng lúc
  const [showPins, setShowPins] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  const currentAvatarUrl = watch("avatar_url") || DEFAULT_CHIBI_AVATAR;
  const currentPin = watch("pin_number");
  const currentConfirmPin = watch("confirm_pin_number");
  const selectedClass = watch("class_id");

  const pinRegisterProps = register("pin_number");
  const confirmPinRegisterProps = register("confirm_pin_number");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-3">
      {/* ========================================================================= */}
      {/* HÀNG 1: AVATAR CHIBI (TRÁI) VÀ INPUT SỐ ĐIỆN THOẠI ZALO (PHẢI) */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-3 pt-0.5">
        {/* Cột trái: Input Số điện thoại Zalo */}
        <div className="flex-1 min-w-0">
          <Input
            id="phone_zalo"
            label="Số điện thoại Zalo"
            icon="📱"
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={10}
            autoComplete="tel"
            placeholder="Nhập SĐT"
            disabled={isSubmitting}
            error={errors.phone_zalo?.message}
            onKeyDown={onlyNumberKeyDown}
            {...register("phone_zalo", {
              onChange: (e) => {
                // Tự động loại bỏ bất kỳ ký tự nào không phải là chữ số
                e.target.value = e.target.value.replace(/\D/g, "").slice(0, 10);
              },
            })}
          />
        </div>

        {/* Cột phải: Avatar Chibi + label nhỏ "Bấm đổi avatar" ở dưới */}
        <div className="flex flex-col items-center flex-shrink-0">
          <button
            type="button"
            onClick={() => setIsAvatarModalOpen(true)}
            className="relative group w-14 h-14 sm:w-15 sm:h-15 rounded-full flex-shrink-0 cursor-pointer active:scale-95 transition-transform focus-visible:outline-2 focus-visible:outline-amber-600"
            title="Bấm để đổi ảnh đại diện"
          >
            <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-amber-400 shadow-md bg-white">
              <Image
                src={currentAvatarUrl}
                alt="Avatar của con"
                fill
                sizes="60px"
                unoptimized
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-gradient-to-b from-[#FFAE33] to-[#E67E00] border-2 border-white shadow flex items-center justify-center text-white">
              <Pencil className="w-2.5 h-2.5 stroke-[2.5]" />
            </div>
          </button>

          <button
            type="button"
            onClick={() => setIsAvatarModalOpen(true)}
            className="mt-1 text-[11px] font-heading font-extrabold text-[#7A3E0F] hover:text-[#421D05] cursor-pointer text-center leading-tight whitespace-nowrap"
          >
            Bấm đổi avatar
          </button>
        </div>
      </div>

      {/* Trường 2: Họ và tên của con */}
      <Input
        id="full_name"
        label="Họ và tên của con"
        icon="🏷️"
        placeholder="Nhập họ và tên của con"
        autoComplete="name"
        disabled={isSubmitting}
        error={errors.full_name?.message}
        {...register("full_name")}
      />

      {/* Trường 3: Lớp học của con */}
      <Select
        id="class_id"
        label="Lớp học của con"
        icon="🎓"
        placeholder="Chọn lớp của con"
        sheetTitle="Chọn lớp học của con"
        sheetTone="orange"
        searchable={true}
        searchPlaceholder="Tìm lớp (vd: 1A, 2B)..."
        optionLayout="grid"
        gridCols={3}
        options={CLASS_OPTIONS.map((c) => ({ label: c, value: c }))}
        value={selectedClass}
        disabled={isSubmitting}
        error={errors.class_id?.message}
        {...register("class_id")}
      />

      {/* ========================================================================= */}
      {/* HAI Ô MÃ PIN: ĐỒNG BỘ ICON KEY 🔑 VÀ CÔNG TẮC HIỆN PIN TRÊN TIÊU ĐỀ */}
      {/* ========================================================================= */}
      <div className="flex flex-col">
        {/* Hàng nhãn kết hợp nút ẩn/hiện mã PIN */}
        <div className="flex items-center justify-between px-0.5 mb-1">
          <span className="font-heading font-extrabold text-[13px] sm:text-sm text-[#4A2307] select-none">
            Mã PIN của con (4 số)
          </span>
          <button
            type="button"
            onClick={() => setShowPins((prev) => !prev)}
            title={showPins ? "Ẩn cả hai mã PIN" : "Hiện cả hai mã PIN"}
            className="inline-flex items-center gap-1 text-xs font-heading font-extrabold text-[#7A4E26] hover:text-[#421D05] cursor-pointer select-none transition-colors"
          >
            {showPins ? (
              <>
                <EyeOff className="w-3.5 h-3.5 text-stone-500" />
                <span>Ẩn PIN</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-amber-600" />
                <span>Hiện PIN</span>
              </>
            )}
          </button>
        </div>

        {/* 2 ô PIN đặt cạnh nhau 2 cột, đều có icon 🔑 đồng bộ và đẹp mắt */}
        <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
          {/* Ô PIN 1 */}
          <Input
            id="pin_number"
            icon="🔑"
            type={showPins ? "text" : "password"}
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            autoComplete="new-password"
            placeholder="4 số PIN"
            disabled={isSubmitting}
            error={errors.pin_number?.message}
            onKeyDown={onlyNumberKeyDown}
            className={cn(
              "placeholder:tracking-normal text-center",
              currentPin ? "tracking-[0.35em]" : "tracking-normal"
            )}
            {...pinRegisterProps}
            onChange={(e) => {
              e.target.value = e.target.value.replace(/\D/g, "");
              pinRegisterProps.onChange(e);
            }}
          />

          {/* Ô PIN 2: Nhập lại PIN */}
          <Input
            id="confirm_pin_number"
            icon="🔑"
            type={showPins ? "text" : "password"}
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            autoComplete="new-password"
            placeholder="Nhập lại"
            disabled={isSubmitting}
            error={errors.confirm_pin_number?.message}
            onKeyDown={onlyNumberKeyDown}
            className={cn(
              "placeholder:tracking-normal text-center",
              currentConfirmPin ? "tracking-[0.35em]" : "tracking-normal"
            )}
            {...confirmPinRegisterProps}
            onChange={(e) => {
              e.target.value = e.target.value.replace(/\D/g, "");
              confirmPinRegisterProps.onChange(e);
            }}
          />
        </div>
      </div>

      {/* Nút bấm 3D Game Button Đăng ký tài khoản */}
      <div className="mt-1">
        <Button3D
          type="submit"
          variant="orange"
          size="lg"
          fullWidth
          loading={isSubmitting}
          className="rounded-2xl gap-2 tracking-wider uppercase text-base sm:text-lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Đang tạo tài khoản...</span>
            </>
          ) : (
            <>
              <span>ĐĂNG KÝ</span>
            </>
          )}
        </Button3D>
      </div>

      {/* Popup/Modal Chọn Avatar Chibi */}
      {isAvatarModalOpen && (
        <AvatarPickerModal
          isOpen={isAvatarModalOpen}
          onClose={() => setIsAvatarModalOpen(false)}
          currentAvatarUrl={currentAvatarUrl}
          onSelectAvatar={(url) => {
            setValue("avatar_url", url, { shouldValidate: false, shouldDirty: true });
          }}
        />
      )}
    </form>
  );
}
