"use client";

import Image from "next/image";
import {
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Minus,
  Search,
  SearchX,
  X,
} from "lucide-react";
import { WHEEL_ASSETS } from "@/constants/wheel";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useLeaderboardContext } from "../contexts/LeaderboardContext";

function RankNumberBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-yellow-100 text-yellow-800 border border-yellow-400 font-heading font-black text-xs tabular-nums">
        1
      </span>
    );
  }
  if (rank === 2) {
    return (
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-200/80 text-slate-700 border border-slate-300 font-heading font-black text-xs tabular-nums">
        2
      </span>
    );
  }
  if (rank === 3) {
    return (
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#F5E6DC] text-[#8C4320] border border-[#D4A484] font-heading font-black text-xs tabular-nums">
        3
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-slate-500 font-bold text-xs tabular-nums">
      {rank}
    </span>
  );
}

/**
 * Khung bảng xếp hạng chi tiết cho cả 3 chế độ bảng (kèm thanh tìm kiếm & ghi chú chia nhóm)
 */
export function LeaderboardTable() {
  const {
    activeBoard,
    searchQuery,
    setSearchQuery,
    filteredTopCoinsBoard,
    filteredProgressLeadersBoard,
    filteredProgressRisersBoard,
  } = useLeaderboardContext();

  const progressItems =
    activeBoard === "progress_leaders"
      ? filteredProgressLeadersBoard
      : filteredProgressRisersBoard;

  const isTopCoins = activeBoard === "top_coins";
  const isEmpty = isTopCoins
    ? filteredTopCoinsBoard.length === 0
    : progressItems.length === 0;

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs overflow-hidden">
      {/* Toolbar trong khung bảng */}
      <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <h2 className="text-sm sm:text-base font-bold text-[#0F172A]">
          {isTopCoins
            ? "Chi tiết Top Xu Tháng Này"
            : activeBoard === "progress_leaders"
            ? "Chi tiết Tiến Bộ • Nhóm Dẫn Đầu"
            : "Chi tiết Tiến Bộ • Nhóm Vươn Lên"}
        </h2>

        {/* Ô tìm kiếm học sinh */}
        <div className="relative w-full md:w-64 shrink-0">
          <Search
            className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm tên học sinh..."
            className="w-full h-9 pl-9 pr-8 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-[#0A62D6] focus:ring-2 focus:ring-[#0A62D6]/20 transition-all"
          />
          {searchQuery.length > 0 && (
            <Tooltip content="Xóa từ khóa tìm kiếm" side="top">
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Xóa từ khóa tìm kiếm"
                className="w-5 h-5 absolute right-2 top-1/2 -translate-y-1/2 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-3 h-3" aria-hidden="true" />
              </button>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Trạng thái không tìm thấy */}
      {isEmpty ? (
        <div className="py-12 px-4 text-center flex flex-col items-center justify-center">
          <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
            <SearchX className="w-5 h-5" aria-hidden="true" />
          </div>
          <p className="text-sm font-bold text-[#0F172A]">
            Không tìm thấy học sinh phù hợp
          </p>
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="mt-3 h-8 px-3.5 rounded-lg bg-[#EAF2FF] hover:bg-[#DCEAFE] text-[#0A62D6] text-xs font-semibold transition-colors cursor-pointer"
          >
            Xóa từ khóa tìm kiếm
          </button>
        </div>
      ) : isTopCoins ? (
        /* BẢNG 1: TOP XU THÁNG NÀY */
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">
                <span className="text-xs font-bold text-slate-700 select-none">
                  Hạng
                </span>
              </TableHead>
              <TableHead>
                <span className="text-xs font-bold text-slate-700 select-none">
                  Học sinh
                </span>
              </TableHead>
              <TableHead>
                <span className="text-xs font-bold text-slate-700 select-none">
                  Bài tập tháng này
                </span>
              </TableHead>
              <TableHead>
                <span className="text-xs font-bold text-slate-700 select-none">
                  So với tháng trước
                </span>
              </TableHead>
              <TableHead align="right">
                <span className="text-xs font-bold text-slate-700 select-none">
                  Xu kiếm được
                </span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTopCoinsBoard.map((item) => (
              <TableRow key={item.studentId}>
                <TableCell>
                  <RankNumberBadge rank={item.rank} />
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-3 min-w-[180px]">
                    <div className="relative w-9 h-9 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                      <Image
                        src={item.avatarUrl}
                        alt={item.fullName}
                        fill
                        sizes="36px"
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                    <p className="text-sm font-bold text-[#0F172A] leading-snug">
                      {item.fullName}
                    </p>
                  </div>
                </TableCell>

                <TableCell className="whitespace-nowrap">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 tabular-nums">
                    <CheckCircle2
                      className="w-3.5 h-3.5 text-emerald-600 shrink-0"
                      aria-hidden="true"
                    />
                    <span>
                      {item.completedMissionsCount}/{item.totalMissionsCount} bài
                    </span>
                  </span>
                </TableCell>

                <TableCell className="whitespace-nowrap">
                  {item.deltaCoins === null ? (
                    <span className="text-xs text-slate-400 italic">
                      Tháng khởi đầu
                    </span>
                  ) : item.deltaCoins > 0 ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#ECFDF3] text-[#15803D] border border-[#ABEFC6] tabular-nums">
                      <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>+{item.deltaCoins.toLocaleString("vi-VN")} xu</span>
                    </span>
                  ) : item.deltaCoins < 0 ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 tabular-nums">
                      <ArrowDownRight className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{item.deltaCoins.toLocaleString("vi-VN")} xu</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                      <Minus className="w-3 h-3" aria-hidden="true" />
                      <span>Giữ nguyên</span>
                    </span>
                  )}
                </TableCell>

                <TableCell align="right" className="whitespace-nowrap">
                  <span className="inline-flex items-center gap-1.5 font-heading font-black text-sm tabular-nums">
                    <Image
                      src={WHEEL_ASSETS.COIN}
                      alt="Xu"
                      width={16}
                      height={16}
                      unoptimized
                      style={{ height: "auto" }}
                      className="w-4 h-4 object-contain shrink-0"
                    />
                    <span className="text-[#B45309]">
                      {item.currentMonthCoins.toLocaleString("vi-VN")}
                    </span>
                    <span className="text-xs font-bold text-amber-600">xu</span>
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        /* BẢNG 2 & BẢNG 3: TOP TIẾN BỘ THEO TỪNG NHÓM */
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">
                <span className="text-xs font-bold text-slate-700 select-none">
                  Hạng
                </span>
              </TableHead>
              <TableHead>
                <span className="text-xs font-bold text-slate-700 select-none">
                  Học sinh
                </span>
              </TableHead>
              <TableHead>
                <span className="text-xs font-bold text-slate-700 select-none">
                  Hạng tháng trước
                </span>
              </TableHead>
              <TableHead>
                <span className="text-xs font-bold text-slate-700 select-none">
                  Tháng trước → Tháng này
                </span>
              </TableHead>
              <TableHead align="right">
                <span className="text-xs font-bold text-slate-700 select-none">
                  Mức tiến bộ
                </span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {progressItems.map((item) => {
              const deltaSign = item.deltaCoins > 0 ? "+" : "";

              return (
                <TableRow key={item.studentId}>
                  <TableCell>
                    <RankNumberBadge rank={item.rank} />
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-3 min-w-[180px]">
                      <div className="relative w-9 h-9 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                        <Image
                          src={item.avatarUrl}
                          alt={item.fullName}
                          fill
                          sizes="36px"
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#0F172A] leading-snug">
                          {item.fullName}
                        </p>
                        <p className="text-xs text-[#64748B]">
                          {item.completedMissionsCount}/{item.totalMissionsCount}{" "}
                          bài tập tháng này
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 tabular-nums">
                      Hạng #{item.prevMonthRank}
                    </span>
                  </TableCell>

                  <TableCell className="whitespace-nowrap">
                    <div className="inline-flex items-center gap-2 text-xs font-semibold tabular-nums">
                      <span className="text-[#64748B]">
                        {item.prevMonthCoins.toLocaleString("vi-VN")} xu
                      </span>
                      <span className="text-slate-300">→</span>
                      <span className="font-bold text-[#B45309]">
                        {item.currentMonthCoins.toLocaleString("vi-VN")} xu
                      </span>
                    </div>
                  </TableCell>

                  <TableCell align="right" className="whitespace-nowrap">
                    <div className="inline-flex flex-col items-end">
                      {item.deltaCoins === 0 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                          <Minus className="w-3 h-3" aria-hidden="true" />
                          <span>Giữ nguyên</span>
                        </span>
                      ) : (
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border tabular-nums",
                            item.isImproved
                              ? "bg-[#ECFDF3] text-[#15803D] border-[#ABEFC6]"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                          )}
                        >
                          {item.isImproved ? (
                            <ArrowUpRight
                              className="w-3.5 h-3.5"
                              aria-hidden="true"
                            />
                          ) : (
                            <ArrowDownRight
                              className="w-3.5 h-3.5"
                              aria-hidden="true"
                            />
                          )}
                          <span>
                            {deltaSign}
                            {item.deltaCoins.toLocaleString("vi-VN")} xu
                          </span>
                        </span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
