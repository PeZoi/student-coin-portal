"use client";

import { UseFormReturn } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Button3D } from "@/components/ui/Button3D";
import { Input } from "@/components/ui/Input";
import { onlyNumberKeyDown } from "@/lib/utils";
import { StudentLoginFormValues } from "../types";

interface StudentLoginFormProps {
  form: UseFormReturn<StudentLoginFormValues>;
  onSubmit: (values: StudentLoginFormValues) => void;
  isSubmitting: boolean;
}

export function StudentLoginForm({
  form,
  onSubmit,
  isSubmitting,
}: StudentLoginFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  const phoneRegister = register("phone_zalo");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-4">
      {/* Trường duy nhất: Số điện thoại Zalo */}
      <Input
        id="phone_zalo"
        label="Số điện thoại Zalo của bố mẹ / bé"
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
        {...phoneRegister}
        onChange={(e) => {
          // Tự động loại bỏ bất kỳ ký tự nào không phải là chữ số
          e.target.value = e.target.value.replace(/\D/g, "").slice(0, 10);
          phoneRegister.onChange(e);
        }}
      />
      
      {/* Nút bấm 3D Game Button với hiệu ứng loading */}
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
              <span>Đang tìm bé...</span>
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
