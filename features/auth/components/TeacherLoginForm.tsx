"use client";

import { UseFormReturn } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Button3D } from "@/components/ui/Button3D";
import { Input } from "@/components/ui/Input";
import { PasswordToggle } from "@/components/ui/PasswordToggle";
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
    <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-4">
      {/* Trường 1: Tên đăng nhập (bảng `users.username`) */}
      <Input
        id="teacher_username"
        label="Tên đăng nhập"
        icon="👨‍🏫"
        type="text"
        autoComplete="username"
        placeholder="Nhập tên đăng nhập"
        disabled={isSubmitting}
        error={errors.username?.message}
        {...register("username")}
      />

      {/* Trường 2: Mật khẩu quản trị (bảng `users.password`) */}
      <Input
        id="teacher_password"
        label="Mật khẩu quản trị"
        icon="🔒"
        type={showPassword ? "text" : "password"}
        autoComplete="current-password"
        placeholder="Nhập mật khẩu"
        disabled={isSubmitting}
        error={errors.password?.message}
        rightElement={
          <PasswordToggle
            show={showPassword}
            onToggle={onTogglePassword}
            fieldType="password"
            disabled={isSubmitting}
          />
        }
        {...register("password")}
      />

      {/* Nút bấm 3D Game Button màu xanh dương */}
      <div className="mt-2">
        <Button3D
          type="submit"
          variant="green"
          size="lg"
          fullWidth
          loading={isSubmitting}
          className="rounded-2xl gap-2 tracking-wider uppercase text-base sm:text-lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Đang vào hệ thống...</span>
            </>
          ) : (
            <>
              <span>ĐĂNG NHẬP</span>
            </>
          )}
        </Button3D>
      </div>
    </form>
  );
}
