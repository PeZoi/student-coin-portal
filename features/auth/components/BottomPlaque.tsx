import { HelpCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserRole as SystemRole } from "@/constants";
import { AuthMode, UserRole } from "../types";
import { AUTH_THEME } from "../constants/authTheme";

interface BottomPlaqueProps {
  role: UserRole;
  mode: AuthMode;
  onSwitchMode?: (mode: AuthMode) => void;
}

export function BottomPlaque({ role, mode }: BottomPlaqueProps) {
  // Xác định icon và nội dung hiển thị dựa trên role và mode
  const renderContent = () => {
    if (role === SystemRole.STUDENT && mode === "login") {
      return (
        <>
          <HelpCircle className="w-4 h-4 text-[#FFD76A] flex-shrink-0" />
          <span className="font-heading font-extrabold text-xs sm:text-sm text-[#FFF4E5] drop-shadow-sm">
            Quên mã PIN? Nhờ cô giáo cấp lại nhé!
          </span>
        </>
      );
    }

    if (role === SystemRole.STUDENT && mode === "register") {
      return (
        <>
          <Sparkles className="w-4 h-4 text-[#FFD76A] flex-shrink-0" />
          <span className="font-heading font-extrabold text-xs sm:text-sm text-[#FFF4E5] drop-shadow-sm">
            Đăng ký để có thể đăng nhập vô hệ thống nhé! ✨
          </span>
        </>
      );
    }

    return (
      <>
        <HelpCircle className="w-4 h-4 text-[#FFD76A] flex-shrink-0" />
        <span className="font-heading font-extrabold text-xs sm:text-sm text-[#FFF4E5] drop-shadow-sm">
          Quên mật khẩu? Liên hệ quản trị viên nhé!
        </span>
      </>
    );
  };

  return (
    <div
      className={cn(
        "w-full max-w-[400px] mx-auto mt-3 sm:mt-4 px-4 py-2.5 rounded-2xl border-2 border-[#4A2208] flex items-center justify-center gap-2 select-none text-center shadow-[0_6px_14px_rgba(0,0,0,0.35),inset_0_1px_2px_rgba(255,214,150,0.3)]",
        AUTH_THEME.board.gradient
      )}
    >
      {renderContent()}
    </div>
  );
}
