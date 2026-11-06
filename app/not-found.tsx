import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center p-4 text-center selection:bg-yellow-300 selection:text-blue-900 bg-[#1672EA]"
      style={{
        backgroundImage: `
          radial-gradient(ellipse 130% 70% at 50% 105%, rgba(225, 248, 255, 0.92) 0%, rgba(140, 218, 255, 0.55) 30%, rgba(55, 165, 252, 0.2) 60%, transparent 80%),
          linear-gradient(180deg, #0C5FD6 0%, #1573EB 32%, #268DFF 68%, #4DB0FF 100%)
        `,
        backgroundAttachment: "fixed",
      }}
    >
      <div className="bg-white/95 backdrop-blur-md border-4 border-amber-300 rounded-3xl p-8 max-w-md w-full shadow-[0_12px_40px_rgba(0,0,0,0.25)] flex flex-col items-center">
        {/* Số 404 hoạt hình nổi bật */}
        <div className="text-7xl font-heading font-black bg-gradient-to-b from-[#FF8C00] via-[#FF5E00] to-[#E64A00] bg-clip-text text-transparent drop-shadow-[0_4px_0_#9E2A00]">
          404
        </div>

        <h1 className="mt-3 text-2xl font-heading font-black text-slate-800">
          Ôi! Trang không tồn tại rồi
        </h1>

        <p className="mt-2 text-slate-600 text-sm leading-relaxed">
          Đường dẫn này có thể đã đổi hoặc không tồn tại. Con hãy quay về trang chủ để tiếp tục tích lũy xu nhé!
        </p>

        {/* Nút hành động */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3 w-full">
          <Link
            href="/student"
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-heading font-black text-base text-[#451A03] bg-gradient-to-b from-[#FFE84D] via-[#FFC72C] to-[#FFAA00] border-2 border-amber-300 shadow-[0_4px_10px_rgba(255,170,0,0.4)] hover:brightness-105 active:scale-95 transition-all"
          >
            <Home className="w-5 h-5" />
            <span>Trang chủ</span>
          </Link>

          <Link
            href="/login"
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-heading font-bold text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 active:scale-95 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Đăng nhập</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
