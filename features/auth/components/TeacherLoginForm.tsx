"use client";

import { Button3D } from "@/components/ui/Button3D";
import { Input } from "@/components/ui/Input";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { TeacherLoginFormValues } from "../types";

interface TeacherLoginFormProps {
  form: UseFormReturn<TeacherLoginFormValues>;
  onSubmit: (values: TeacherLoginFormValues) => void;
  isSubmitting: boolean;
  showPassword: boolean;
  onTogglePassword: () => void;
}

export function TeacherLoginForm({
  form,
  onSubmit,
  isSubmitting,
  showPassword,
  onTogglePassword,
}: TeacherLoginFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col">
      {/* Trường 1: Tên đăng nhập (bảng `users.username`) */}
      <Input
        id="teacher_username"
        label="Tên đăng nhập"
        icon="👨‍🏫"
        type="text"
        autoComplete="username"
        placeholder="Nhập tên đăng nhập (vd: cogaomai)..."
        disabled={isSubmitting}
        error={errors.username?.message}
        wrapperClassName="mb-4"
        {...register("username")}
      />

      {/* Trường 2: Mật khẩu quản trị (bảng `users.password`) */}
      <Input
        id="teacher_password"
        label="Mật khẩu"
        icon="🔒"
        type={showPassword ? "text" : "password"}
        autoComplete="current-password"
        placeholder="Nhập mật khẩu..."
        disabled={isSubmitting}
        error={errors.password?.message}
        wrapperClassName="mb-4"
        rightElement={
          <button
            type="button"
            onClick={onTogglePassword}
            tabIndex={-1}
            aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            className="p-1 text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        }
        {...register("password")}
      />

      {/* Ghi nhớ đăng nhập */}
      <div className="flex items-center justify-between mb-6 px-1">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            className="w-4 h-4 rounded text-blue-600 border-stone-300 focus:ring-blue-500"
            {...register("remember_me")}
          />
          <span className="font-sans font-bold text-xs sm:text-sm text-[#5C2F0E]">
            Ghi nhớ trên thiết bị này
          </span>
        </label>
        <button
          type="button"
          onClick={() => alert("Thầy cô vui lòng liên hệ Admin nhà trường để đặt lại mật khẩu.")}
          className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
        >
          Quên mật khẩu?
        </button>
      </div>

      {/* Nút bấm 3D Game Button tái sử dụng từ components/ui/Button3D */}
      <Button3D
        type="submit"
        variant="blue"
        size="lg"
        fullWidth
        disabled={isSubmitting}
        className="rounded-2xl gap-2 tracking-wider uppercase text-base sm:text-lg"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Đang xác thực...</span>
          </>
        ) : (
          <>
            <span className="text-xl">📚</span>
            <span>VÀO TRANG QUẢN LÝ</span>
          </>
        )}
      </Button3D>
    </form>
  );
}

