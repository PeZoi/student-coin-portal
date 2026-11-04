"use client";

import { UseFormReturn } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Button3D } from "@/components/ui/Button3D";
import { Input } from "@/components/ui/Input";
import { PasswordToggle } from "@/components/ui/PasswordToggle";
import { cn, onlyNumberKeyDown } from "@/lib/utils";
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
}: StudentLoginFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = form;

  const currentPin = watch("pin_number");
  const pinRegisterProps = register("pin_number");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-3.5">
      {/* Trường 1: Số điện thoại Zalo */}
      <Input
        id="phone_zalo"
        label="Số điện thoại Zalo"
        icon="📱"
        type="tel"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={10}
        autoComplete="username"
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

      {/* Trường 2: Mã PIN 4 số */}
      <Input
        id="pin_number"
        label="Mã PIN của con (4 số)"
        icon="🔑"
        type={showPin ? "text" : "password"}
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={4}
        autoComplete="current-password"
        placeholder="Nhập 4 số PIN"
        disabled={isSubmitting}
        error={errors.pin_number?.message}
        onKeyDown={onlyNumberKeyDown}
        className={cn(
          "placeholder:tracking-normal",
          currentPin ? "tracking-[0.35em]" : "tracking-normal"
        )}
        rightElement={
          <PasswordToggle
            show={showPin}
            onToggle={onTogglePin}
            fieldType="pin"
            disabled={isSubmitting}
          />
        }
        {...pinRegisterProps}
        onChange={(e) => {
          e.target.value = e.target.value.replace(/\D/g, "");
          pinRegisterProps.onChange(e);
        }}
      />

      {/* Nút bấm 3D Game Button với hiệu ứng loading giữ màu rực rỡ */}
      <div className="mt-1">
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
              <span>Đang vào lớp...</span>
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
