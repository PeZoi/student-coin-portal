import { HelpCircle, Sparkles } from "lucide-react";
import { AuthMode, UserRole } from "../types";

interface BottomPlaqueProps {
  role: UserRole;
  mode: AuthMode;
  onSwitchMode?: (mode: AuthMode) => void;
}

export function BottomPlaque({ role, mode, onSwitchMode }: BottomPlaqueProps) {
  if (role === "student" && mode === "login") {
    return (
      <div className="w-full max-w-[380px] mx-auto mt-3 sm:mt-4 px-4 py-2 sm:py-2.5 rounded-2xl bg-[#52270A] border-2 border-[#361603] shadow-[0_4px_10px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2 select-none text-center">
        <HelpCircle className="w-4 h-4 text-amber-300 flex-shrink-0" />
        <span className="font-sans font-bold text-xs sm:text-sm text-[#FFF4E5] drop-shadow-sm">
          Quên mã PIN? Nhờ cô giáo cấp lại nhé!
        </span>
      </div>
    );
  }

  if (role === "student" && mode === "register") {
    return (
      <div className="w-full max-w-[380px] mx-auto mt-3 sm:mt-4 px-4 py-2 sm:py-2.5 rounded-2xl bg-[#52270A] border-2 border-[#361603] shadow-[0_4px_10px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2 select-none text-center">
        <Sparkles className="w-4 h-4 text-yellow-300 flex-shrink-0 animate-pulse" />
        <span className="font-sans font-bold text-xs sm:text-sm text-[#FFF4E5] drop-shadow-sm">
          Bé đã có tài khoản rồi?{" "}
          <button
            type="button"
            onClick={() => onSwitchMode?.("login")}
            className="text-amber-300 underline underline-offset-2 hover:text-amber-200 cursor-pointer font-extrabold"
          >
            Đăng nhập ngay
          </button>
        </span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[380px] mx-auto mt-3 sm:mt-4 px-4 py-2 sm:py-2.5 rounded-2xl bg-[#52270A] border-2 border-[#361603] shadow-[0_4px_10px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2 select-none text-center">
      <HelpCircle className="w-4 h-4 text-amber-300 flex-shrink-0" />
      <span className="font-sans font-bold text-xs sm:text-sm text-[#FFF4E5] drop-shadow-sm">
        Quên mật khẩu? Liên hệ quản trị viên trường nhé!
      </span>
    </div>
  );
}

