"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useUserStore } from "@/stores/useUserStore";
import { getErrorMessage } from "@/lib/http/httpClient";
import { authService } from "../services/authService";
import {
  studentLoginSchema,
  studentRegisterSchema,
  teacherLoginSchema,
} from "../schemas/authSchemas";
import { DEFAULT_CHIBI_AVATAR } from "../constants/chibiAvatars";
import {
  AuthMode,
  StudentLoginFormValues,
  StudentRegisterFormValues,
  TeacherLoginFormValues,
  UserRole,
} from "../types";

export function useAuthForm(initialRole: UserRole = "student", initialMode: AuthMode = "login") {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginStudent } = useUserStore();

  const roleParam = searchParams?.get("role");
  const modeParam = searchParams?.get("mode");

  const effectiveRole: UserRole = roleParam === "teacher" ? "teacher" : initialRole;
  const effectiveMode: AuthMode = modeParam === "register" ? "register" : initialMode;

  const [role, setRole] = useState<UserRole>(effectiveRole);
  const [mode, setMode] = useState<AuthMode>(effectiveMode);
  const [showPin, setShowPin] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form Đăng nhập học sinh (bảng `users`)
  const studentLoginForm = useForm<StudentLoginFormValues>({
    resolver: zodResolver(studentLoginSchema),
    defaultValues: {
      phone_zalo: "",
      pin_number: "",
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  // Form Đăng ký học sinh (bảng `users` & `classes`)
  const studentRegisterForm = useForm<StudentRegisterFormValues>({
    resolver: zodResolver(studentRegisterSchema),
    defaultValues: {
      full_name: "",
      phone_zalo: "",
      class_id: "",
      pin_number: "",
      confirm_pin_number: "",
      avatar_url: DEFAULT_CHIBI_AVATAR,
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  // Form Đăng nhập giáo viên (bảng `users.username` và `users.password`)
  const teacherLoginForm = useForm<TeacherLoginFormValues>({
    resolver: zodResolver(teacherLoginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  // Xử lý nộp form đăng nhập học sinh
  const handleStudentLogin = async (values: StudentLoginFormValues) => {
    setIsSubmitting(true);
    try {
      // Giả lập network delay ngắn cho trải nghiệm mượt mà
      await new Promise((resolve) => setTimeout(resolve, 500));

      const success = loginStudent(values.phone_zalo, values.pin_number);
      if (success) {
        toast.success(`Chào mừng bé đã quay lại lớp! 🎉`, {
          description: "Chúc bé có một buổi học thật nhiều niềm vui và tích lũy được nhiều xu!",
        });
        router.push("/student");
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      toast.error("Đăng nhập chưa thành công!", {
        description: err.message || "Bé kiểm tra lại số điện thoại Zalo hoặc mã PIN nhé!",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Xử lý nộp form đăng ký học sinh
  const handleStudentRegister = async (values: StudentRegisterFormValues) => {
    setIsSubmitting(true);
    try {
      // 1. Gọi Service Layer để gửi dữ liệu lên POST /api/auth/register
      await authService.registerStudent(values);

      // 2. Thông báo thành công và chuyển hướng sang chế độ đăng nhập
      toast.success("Chúc mừng bé đã tạo tài khoản thành công! 🎉", {
        description: "Bé hãy đăng nhập để bắt đầu hành trình học tập nhé!",
      });

      // Tự động điền số điện thoại Zalo vừa đăng ký vào form đăng nhập để bé tiện đăng nhập
      studentLoginForm.setValue("phone_zalo", values.phone_zalo);
      studentRegisterForm.reset();
      setMode("login");
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      toast.error("Đăng ký tài khoản chưa thành công!", {
        description: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Xử lý nộp form giáo viên
  const handleTeacherLogin = async (values: TeacherLoginFormValues) => {
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));

      toast.success("Đăng nhập giáo viên thành công! 📚", {
        description: `Chào mừng thầy/cô (${values.username}) đến với Cổng quản lý!`,
      });
      // Điều hướng về trang admin nếu có, hoặc trang student
      router.push("/student");
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      toast.error("Đăng nhập giáo viên thất bại!", {
        description: err.message || "Vui lòng kiểm tra lại thông tin đăng nhập.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePinVisibility = () => setShowPin((prev) => !prev);
  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  const switchRole = (newRole: UserRole) => {
    setRole(newRole);
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
  };

  return {
    role,
    mode,
    showPin,
    showPassword,
    isSubmitting,
    switchRole,
    switchMode,
    togglePinVisibility,
    togglePasswordVisibility,
    studentLoginForm,
    studentRegisterForm,
    teacherLoginForm,
    handleStudentLogin,
    handleStudentRegister,
    handleTeacherLogin,
  };
}

