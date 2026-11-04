"use client";

import { cn } from "@/lib/utils";
import { AUTH_THEME } from "../constants/authTheme";
import { useAuthForm } from "../hooks/useAuthForm";
import { AuthMode, UserRole } from "../types";
import { BottomPlaque } from "./BottomPlaque";
import { StudentLoginForm } from "./StudentLoginForm";
import { StudentRegisterForm } from "./StudentRegisterForm";
import { TeacherLoginForm } from "./TeacherLoginForm";

interface AuthCardProps {
  initialRole?: UserRole;
  initialMode?: AuthMode;
}

interface RoleTabConfig {
  id: UserRole;
  label: string;
  emoji: string;
}

const ROLE_TABS: RoleTabConfig[] = [
  { id: "student", label: "Học sinh", emoji: "🎒" },
  { id: "teacher", label: "Giáo viên", emoji: "🍎" },
];

export function AuthCard({
  initialRole = "student",
  initialMode = "login",
}: AuthCardProps) {
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
      {/* KHUNG BẢNG GỖ HOẠT HÌNH 3D (THE WOODEN GAME BOARD) */}
      {/* ========================================================================= */}
      <div
        className={cn(
          "relative w-full p-3 sm:p-4 select-none transition-all",
          AUTH_THEME.board.gradient,
          AUTH_THEME.board.border,
          AUTH_THEME.board.shadow,
          AUTH_THEME.board.rounded
        )}
      >
        {/* ĐINH TÁN VÀNG ĐỒNG ~8PX Ở 2 GÓC DƯỚI (CÁCH MÉP ~5-6PX, KHÔNG ĐÈ TAB/THẺ Ở 320–480PX) */}
        <div
          className={cn("absolute bottom-1.5 left-2.5 pointer-events-none", AUTH_THEME.rivet.wrapper)}
          aria-hidden="true"
        />
        <div
          className={cn("absolute bottom-1.5 right-2.5 pointer-events-none", AUTH_THEME.rivet.wrapper)}
          aria-hidden="true"
        />

        {/* ========================================================================= */}
        {/* HEADER TABS VAI TRÒ (HỌC SINH VS GIÁO VIÊN) */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {ROLE_TABS.map((tab) => {
            const isSelected = role === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => switchRole(tab.id)}
                className={cn(
                  "flex items-center justify-center gap-2 py-2.5 sm:py-3 px-3 rounded-2xl font-heading font-black text-sm tracking-wide transition-all cursor-pointer",
                  isSelected
                    ? AUTH_THEME.roleTab.active
                    : AUTH_THEME.roleTab.inactive
                )}
              >
                <span className="text-xl sm:text-2xl leading-none flex-shrink-0">
                  {tab.emoji}
                </span>
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ========================================================================= */}
        {/* RUỘT THẺ GIẤY VÀNG KEM (INNER VANILLA CARD) */}
        {/* ========================================================================= */}
        <div
          className={cn(
            "p-4 sm:p-5 flex flex-col items-center",
            AUTH_THEME.card.bg,
            AUTH_THEME.card.border,
            AUTH_THEME.card.shadow,
            AUTH_THEME.card.rounded
          )}
        >
          {/* Thanh chuyển đổi Đăng nhập / Đăng ký dành riêng cho Học sinh */}
          {role === "student" && (
            <div className={cn("w-full flex items-center mb-3", AUTH_THEME.modeTab.wrapper)}>
              <button
                type="button"
                onClick={() => switchMode("login")}
                className={cn(
                  "flex-1 py-1.5 px-3 rounded-full font-heading font-extrabold text-xs sm:text-sm tracking-wide transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                  mode === "login"
                    ? AUTH_THEME.modeTab.active
                    : AUTH_THEME.modeTab.inactive
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
                    ? AUTH_THEME.modeTab.active
                    : AUTH_THEME.modeTab.inactive
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
      <BottomPlaque role={role} mode={mode} onSwitchMode={switchMode} />
    </div>
  );
}
