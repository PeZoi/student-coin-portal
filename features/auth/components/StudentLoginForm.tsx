"use client";

import { UseFormReturn } from "react-hook-form";
import { Eye, EyeOff, Loader2, Sparkles } from "lucide-react";
import { Button3D } from "@/components/ui/Button3D";
import { Input } from "@/components/ui/Input";
import { StudentLoginFormValues } from "../types";

interface StudentLoginFormProps {
  form: UseFormReturn<StudentLoginFormValues>;
  onSubmit: (values: StudentLoginFormValues) => void;
  isSubmitting: boolean;
  showPin: boolean;
  onTogglePin: () => void;
  onSwitchToRegister: () => void;
}

export function StudentLoginForm({
  form,
  onSubmit,
  isSubmitting,
  showPin,
  onTogglePin,
  onSwitchToRegister,
}: StudentLoginFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col">

      {/* Trường 1: Số điện thoại Zalo (bảng `users.phone_zalo`) */}
      <Input
        id="phone_zalo"
        label="Số điện thoại Zalo"
        icon="📱"
        type="tel"
        autoComplete="username"
        placeholder="Nhập số điện thoại Zalo..."
        disabled={isSubmitting}
        error={errors.phone_zalo?.message}
        wrapperClassName="mb-4"
        {...register("phone_zalo")}
      />

      {/* Trường 2: Mã PIN 4 số (bảng `users.pin_number`) */}
      <Input
        id="pin_number"
        label="Mã PIN (4 số)"
        icon="🔑"
        type={showPin ? "text" : "password"}
        inputMode="numeric"
        maxLength={4}
        placeholder="Nhập 4 số PIN"
        disabled={isSubmitting}
        error={errors.pin_number?.message}
        className="tracking-widest"
        wrapperClassName="mb-6"
        rightElement={
          <button
            type="button"
            onClick={onTogglePin}
            tabIndex={-1}
            aria-label={showPin ? "Ẩn mã PIN" : "Hiện mã PIN"}
            className="p-1 text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
          >
            {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        }
        {...register("pin_number")}
      />

      {/* Nút bấm 3D Game Button tái sử dụng từ components/ui/Button3D */}
      <Button3D
        type="submit"
        variant="green"
        size="lg"
        fullWidth
        disabled={isSubmitting}
        className="rounded-2xl gap-2 tracking-wider uppercase text-base sm:text-lg"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Đang vào lớp...</span>
          </>
        ) : (
          <>
            <span className="text-xl">🚀</span>
            <span>VÀO HỌC NGAY!</span>
          </>
        )}
      </Button3D>

      {/* Nút chuyển đổi nhanh sang Đăng ký */}
      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-heading font-extrabold text-[#7A3E0F] hover:text-[#421D05] cursor-pointer transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Bé chưa có tài khoản?</span>
          <span className="text-[#0284C7] underline underline-offset-2">Đăng ký nhận xu ngay</span>
        </button>
      </div>
    </form>
  );
}

