"use client";

import { ArrowLeft, CalendarClock, Sparkles, Trophy } from "lucide-react";
import { useLeaderboardContext } from "../contexts/LeaderboardContext";

/**
 * Màn hình thông báo khi hệ thống mới khởi động / tháng trước chưa có dữ liệu
 * để chia nhóm và đối chiếu mức độ tiến bộ
 */
export function ProgressBoardLockedState() {
  const { activeBoard, currentDataset, setActiveBoard } =
    useLeaderboardContext();

  const boardName =
    activeBoard === "progress_leaders"
      ? "Tiến Bộ • Nhóm Dẫn Đầu"
      : "Tiến Bộ • Nhóm Vươn Lên";

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs p-8 sm:p-12 text-center flex flex-col items-center justify-center">
      <div className="relative mb-5">
        <div className="w-16 h-16 rounded-2xl bg-[#EAF2FF] text-[#0A62D6] border border-[#CFE1FB] flex items-center justify-center">
          <CalendarClock className="w-8 h-8" aria-hidden="true" />
        </div>
        <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 border-2 border-white flex items-center justify-center absolute -bottom-1.5 -right-1.5 shadow-xs">
          <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
        </div>
      </div>

      <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold mb-3">
        {boardName} • Chưa mở kỳ này
      </span>

      <h2 className="text-lg sm:text-xl font-heading font-black text-[#0F172A] max-w-md">
        Chưa có dữ liệu tháng trước để mở bảng xếp hạng tiến bộ
      </h2>

      <p className="text-sm text-[#475569] mt-2 max-w-lg leading-relaxed">
        <strong>{currentDataset.label}</strong> là tháng khởi đầu chưa có số liệu tích xu của tháng liền trước. Hệ thống cần dữ liệu tháng trước để chia đôi 2 nhóm thi đua (Nhóm Dẫn Đầu &amp; Nhóm Vươn Lên) và tính mức độ bứt phá công bằng cho các em.
      </p>

      <div className="mt-6 w-full max-w-lg rounded-2xl bg-slate-50 border border-slate-200/80 p-4 text-left space-y-2">
        <p className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
          Bảng tiến bộ sẽ tự động mở ở tháng kế tiếp:
        </p>
        <ul className="text-xs text-[#475569] space-y-1.5 list-disc pl-4">
          <li>
            Kết quả <strong>Top Xu Tháng Này</strong> sẽ trở thành mốc chia 2 nhóm cho tháng sau.
          </li>
          <li>
            Nửa trên vào bảng <strong>Nhóm Dẫn Đầu</strong>, nửa dưới (gồm phần dư nếu sĩ số lẻ) vào bảng <strong>Nhóm Vươn Lên</strong>.
          </li>
        </ul>
      </div>

      <button
        type="button"
        onClick={() => setActiveBoard("top_coins")}
        className="mt-6 h-10 px-5 rounded-xl bg-[#0A62D6] hover:bg-[#0850B0] text-white text-sm font-semibold inline-flex items-center gap-2 transition-colors shadow-2xs cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        <Trophy className="w-4 h-4" aria-hidden="true" />
        <span>Xem Top Xu Tháng Này</span>
      </button>
    </div>
  );
}
