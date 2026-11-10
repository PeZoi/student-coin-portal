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
import { AppRoutes, UserRole as SystemRole } from "@/constants";
import {
  AuthMode,
  StudentLoginFormValues,
  StudentLookupData,
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
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Trạng thái Popup OTP nhập mã PIN
  const [foundStudent, setFoundStudent] = useState<StudentLookupData | null>(null);
  const [isPinModalOpen, setIsPinModalOpen] = useState<boolean>(false);
  const [isVerifyingPin, setIsVerifyingPin] = useState<boolean>(false);

  // Form Đăng nhập học sinh (bước 1: chỉ nhập Số điện thoại Zalo)
  const studentLoginForm = useForm<StudentLoginFormValues>({
    resolver: zodResolver(studentLoginSchema),
    defaultValues: {
      phone_zalo: "",
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

  // Form Đăng nhập giáo viên & admin (bảng `users.username` và `users.password`)
  const teacherLoginForm = useForm<TeacherLoginFormValues>({
    resolver: zodResolver(teacherLoginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  // Reset tất cả form liên quan đến đăng nhập về trạng thái ban đầu
  const resetAllForms = () => {
    studentLoginForm.reset({ phone_zalo: "" });
    studentRegisterForm.reset({
      full_name: "",
      phone_zalo: "",
      class_id: "",
      pin_number: "",
      confirm_pin_number: "",
      avatar_url: DEFAULT_CHIBI_AVATAR,
    });
    teacherLoginForm.reset({
      username: "",
      password: "",
    });
    setFoundStudent(null);
    setIsPinModalOpen(false);
  };

  // Bước 1: Tra cứu học sinh theo Số điện thoại Zalo
  const handleStudentPhoneSubmit = async (values: StudentLoginFormValues) => {
    setIsSubmitting(true);
    try {
      const student = await authService.lookupStudent(values.phone_zalo);
      setFoundStudent(student);
      setIsPinModalOpen(true);
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      toast.error("Chưa tìm thấy tài khoản!", {
        description: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Bước 2: Xác thực mã PIN dạng OTP trong Popup Modal
  const handleStudentPinConfirm = async (pin: string) => {
    if (!foundStudent) return;
    setIsVerifyingPin(true);
    try {
      const session = await authService.loginStudent({
        phone_zalo: foundStudent.phone_zalo,
        pin_number: pin,
      });

      // Lưu phiên học sinh vào Zustand Store
      loginStudent(session);

      toast.success(`Chào mừng con ${session.full_name} đã vào lớp học! 🎉`, {
        description: "Chúc con học tập chăm chỉ và tích lũy được thật nhiều xu nhé!",
      });

      // Reset tất cả form liên quan đến đăng nhập
      resetAllForms();
      router.push(AppRoutes.STUDENT.DASHBOARD);
    } catch (error: unknown) {
      // Ném nguyên vẹn lỗi để StudentPinModal bắt và hiển thị trực tiếp lên UI (không dùng toast)
      throw error;
    } finally {
      setIsVerifyingPin(false);
    }
  };

  // Đóng modal nhập PIN -> reset toàn bộ trạng thái về ban đầu
  const closePinModal = () => {
    if (!isVerifyingPin) {
      setIsPinModalOpen(false);
      setFoundStudent(null);
      setTimeout(() => {
        document.getElementById("phone_zalo")?.focus();
      }, 50);
    }
  };

  // Bấm đổi số điện thoại khác -> reset toàn bộ trạng thái về ban đầu
  const changePhone = () => {
    if (!isVerifyingPin) {
      setIsPinModalOpen(false);
      setFoundStudent(null);
      studentLoginForm.reset({ phone_zalo: "" });
      setTimeout(() => {
        document.getElementById("phone_zalo")?.focus();
      }, 50);
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

  // Xử lý nộp form giáo viên / admin
  const handleTeacherLogin = async (values: TeacherLoginFormValues) => {
    setIsSubmitting(true);
    try {
      const result = await authService.loginStaff(values);

      // Lưu thông tin phiên vào Zustand store
      loginStudent(result.user);

      toast.success("Đăng nhập thành công! 🌟", {
        description: `Chào mừng ${result.user.full_name} (${result.user.role === SystemRole.ADMIN ? "Quản trị viên" : "Giáo viên"})!`,
      });

      resetAllForms();
      router.push(result.redirect_url);
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      toast.error("Đăng nhập thất bại!", {
        description: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
    showPassword,
    isSubmitting,
    foundStudent,
    isPinModalOpen,
    isVerifyingPin,
    switchRole,
    switchMode,
    togglePasswordVisibility,
    studentLoginForm,
    studentRegisterForm,
    teacherLoginForm,
    handleStudentPhoneSubmit,
    handleStudentPinConfirm,
    closePinModal,
    changePhone,
    handleStudentRegister,
    handleTeacherLogin,
  };
}
