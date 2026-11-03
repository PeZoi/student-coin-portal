"use client";

import { cn } from "@/lib/utils";
import { AuthMode, UserRole } from "../types";
import { BottomPlaque } from "./BottomPlaque";
import { StudentLoginForm } from "./StudentLoginForm";
import { StudentRegisterForm } from "./StudentRegisterForm";
import { TeacherLoginForm } from "./TeacherLoginForm";
import { useAuthForm } from "../hooks/useAuthForm";

interface AuthCardProps {
  initialRole?: UserRole;
  initialMode?: AuthMode;
}

export function AuthCard({ initialRole = "student", initialMode = "login" }: AuthCardProps) {
  const {
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
  } = useAuthForm(initialRole, initialMode);

  return (
    <div className="w-full max-w-[440px] flex flex-col items-center">
      {/* ========================================================================= */}
      {/* KHUNG BẢNG GỖ HOẠT HÌNH (THE WOODEN GAME BOARD) */}
      {/* ========================================================================= */}
      <div className="w-full bg-[#663311] border-4 border-[#3D1A05] rounded-[32px] sm:rounded-[36px] shadow-[0_22px_50px_rgba(2,12,35,0.55),inset_0_2px_4px_rgba(255,255,255,0.25),inset_0_-4px_6px_rgba(0,0,0,0.4)] p-3 sm:p-4 select-none transition-all">
        {/* ========================================================================= */}
        {/* HEADER TABS (HỌC SINH VS GIÁO VIÊN & ADMIN) */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {/* Tab 1: Học sinh */}
          <button
            type="button"
            onClick={() => switchRole("student")}
            className={cn(
              "flex items-center justify-center gap-2 py-2.5 sm:py-3 px-3 rounded-2xl font-heading font-black text-sm sm:text-base tracking-wide transition-all cursor-pointer",
              role === "student"
                ? "bg-gradient-to-b from-[#FFAE33] to-[#F59300] text-[#3B1700] border-2 border-[#FFE885] shadow-[inset_0_2px_0_rgba(255,255,255,0.7),0_4px_8px_rgba(0,0,0,0.25)] scale-[1.02]"
                : "bg-[#4D2307] text-[#D8BEA7] hover:bg-[#572709] border-2 border-[#381602] shadow-inner opacity-80 hover:opacity-100"
            )}
          >
            <span className="text-xl sm:text-2xl leading-none select-none flex-shrink-0 drop-shadow-sm" aria-hidden="true">
              🎒
            </span>
            <span className="truncate">Học sinh</span>
          </button>

          {/* Tab 2: Giáo viên & Admin */}
          <button
            type="button"
            onClick={() => switchRole("teacher")}
            className={cn(
              "flex items-center justify-center gap-2 py-2.5 sm:py-3 px-2 sm:px-3 rounded-2xl font-heading font-black text-xs sm:text-sm tracking-wide transition-all cursor-pointer",
              role === "teacher"
                ? "bg-gradient-to-b from-[#FFAE33] to-[#F59300] text-[#3B1700] border-2 border-[#FFE885] shadow-[inset_0_2px_0_rgba(255,255,255,0.7),0_4px_8px_rgba(0,0,0,0.25)] scale-[1.02]"
                : "bg-[#4D2307] text-[#D8BEA7] hover:bg-[#572709] border-2 border-[#381602] shadow-inner opacity-80 hover:opacity-100"
            )}
          >
            <span className="text-xl sm:text-2xl leading-none select-none flex-shrink-0 drop-shadow-sm" aria-hidden="true">
              🍎
            </span>
            <span className="truncate">Giáo viên & Admin</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* RUỘT THẺ GIẤY VÀNG KEM (INNER VANILLA CARD) */}
        {/* ========================================================================= */}
        <div className="bg-[#FFF9EA] border-[3px] border-[#DFCBB2] rounded-[24px] p-4 sm:p-6 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06),0_6px_12px_rgba(0,0,0,0.15)] flex flex-col items-center">
          {/* Thanh chuyển đổi Đăng nhập / Đăng ký dành riêng cho Học sinh */}
          {role === "student" && (
            <div className="w-full flex items-center p-1 bg-[#E8D7BF] rounded-full border border-[#D5C0A5] mb-4">
              <button
                type="button"
                onClick={() => switchMode("login")}
                className={cn(
                  "flex-1 py-1.5 px-3 rounded-full font-heading font-extrabold text-xs sm:text-sm tracking-wide transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                  mode === "login"
                    ? "bg-white text-[#421D05] shadow-[0_2px_4px_rgba(0,0,0,0.1)] scale-[1.02]"
                    : "text-[#7A5433] hover:text-[#421D05]"
                )}
              >
                <span>🚀</span>
                <span>Đăng nhập</span>
              </button>
              <button
                type="button"
                onClick={() => switchMode("register")}
                className={cn(
                  "flex-1 py-1.5 px-3 rounded-full font-heading font-extrabold text-xs sm:text-sm tracking-wide transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                  mode === "register"
                    ? "bg-white text-[#421D05] shadow-[0_2px_4px_rgba(0,0,0,0.1)] scale-[1.02]"
                    : "text-[#7A5433] hover:text-[#421D05]"
                )}
              >
                <span>✨</span>
                <span>Đăng ký mới</span>
              </button>
            </div>
          )}

          {/* Render form tương ứng */}
          {role === "student" ? (
            mode === "login" ? (
              <StudentLoginForm
                form={studentLoginForm}
                onSubmit={handleStudentLogin}
                isSubmitting={isSubmitting}
                showPin={showPin}
                onTogglePin={togglePinVisibility}
                onSwitchToRegister={() => switchMode("register")}
              />
            ) : (
              <StudentRegisterForm
                form={studentRegisterForm}
                onSubmit={handleStudentRegister}
                isSubmitting={isSubmitting}
                onSwitchToLogin={() => switchMode("login")}
              />
            )
          ) : (
            <TeacherLoginForm
              form={teacherLoginForm}
              onSubmit={handleTeacherLogin}
              isSubmitting={isSubmitting}
              showPassword={showPassword}
              onTogglePassword={togglePasswordVisibility}
            />
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TẤM BIỂN GỖ PHỤ PHÍA DƯỚI (BOTTOM PLAQUE) */}
      {/* ========================================================================= */}
      <BottomPlaque
        role={role}
        mode={mode}
        onSwitchMode={switchMode}
      />
    </div>
  );
}

