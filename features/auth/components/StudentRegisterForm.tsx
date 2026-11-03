"use client";

import { Button3D } from "@/components/ui/Button3D";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { StudentRegisterFormValues } from "../types";

interface StudentRegisterFormProps {
  form: UseFormReturn<StudentRegisterFormValues>;
  onSubmit: (values: StudentRegisterFormValues) => void;
  isSubmitting: boolean;
  onSwitchToLogin: () => void;
}

const CLASS_OPTIONS = [
  "Lớp 1A",
  "Lớp 1B",
  "Lớp 2A",
  "Lớp 2B",
  "Lớp 3A",
  "Lớp 3B",
  "Lớp 4A",
  "Lớp 4B",
  "Lớp 5A",
  "Lớp 5B",
];

export function StudentRegisterForm({
  form,
  onSubmit,
  isSubmitting,
  onSwitchToLogin,
}: StudentRegisterFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col">
      {/* Trường 1: Họ và tên (bảng `users.full_name`) */}
      <Input
        id="full_name"
        label="Họ và tên của bé"
        icon="👤"
        type="text"
        placeholder="Ví dụ: Nguyễn Gia Bảo"
        disabled={isSubmitting}
        error={errors.full_name?.message}
        wrapperClassName="mb-3"
        {...register("full_name")}
      />

      {/* Trường 2: Lớp học & Số điện thoại Zalo (2 cột) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <Select
          id="class_id"
          label="Lớp học của con"
          icon="🏫"
          disabled={isSubmitting}
          error={errors.class_id?.message}
          options={CLASS_OPTIONS.map((cls) => ({ label: cls, value: cls }))}
          {...register("class_id")}
        />

        <Input
          id="phone_zalo"
          label="Số điện thoại Zalo"
          icon="📱"
          type="tel"
          placeholder="0912345678"
          disabled={isSubmitting}
          error={errors.phone_zalo?.message}
          {...register("phone_zalo")}
        />
      </div>

      {/* Trường 3: Mã PIN & Xác nhận PIN (2 cột) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
        <Input
          id="pin_number"
          label="Mã PIN (4 số)"
          icon="🔑"
          type={showPin ? "text" : "password"}
          inputMode="numeric"
          maxLength={4}
          placeholder="4 số PIN"
          disabled={isSubmitting}
          error={errors.pin_number?.message}
          className="tracking-widest"
          rightElement={
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              tabIndex={-1}
              className="p-0.5 text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
            >
              {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          }
          {...register("pin_number")}
        />

        <Input
          id="confirm_pin_number"
          label="Nhập lại PIN"
          icon="🔐"
          type={showConfirmPin ? "text" : "password"}
          inputMode="numeric"
          maxLength={4}
          placeholder="Nhập lại"
          disabled={isSubmitting}
          error={errors.confirm_pin_number?.message}
          className="tracking-widest"
          rightElement={
            <button
              type="button"
              onClick={() => setShowConfirmPin(!showConfirmPin)}
              tabIndex={-1}
              className="p-0.5 text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
            >
              {showConfirmPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          }
          {...register("confirm_pin_number")}
        />
      </div>

      {/* Nút bấm 3D Game Button tái sử dụng từ components/ui/Button3D */}
      <Button3D
        type="submit"
        variant="orange"
        size="lg"
        fullWidth
        disabled={isSubmitting}
        className="rounded-2xl gap-2 tracking-wider uppercase text-base sm:text-lg"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Đang tạo tài khoản...</span>
          </>
        ) : (
          <>
            <span className="text-xl">✨</span>
            <span>TẠO TÀI KHOẢN NGAY!</span>
          </>
        )}
      </Button3D>

      {/* Nút quay lại Đăng nhập */}
      <div className="mt-3.5 text-center">
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-heading font-extrabold text-[#7A3E0F] hover:text-[#421D05] cursor-pointer transition-colors"
        >
          <span>Bé đã có tài khoản rồi?</span>
          <span className="text-[#0284C7] underline underline-offset-2">Đăng nhập ngay</span>
        </button>
      </div>
    </form>
  );
}

