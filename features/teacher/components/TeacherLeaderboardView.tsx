"use client";

import { useState } from "react";
import {
  Coins,
} from "lucide-react";

interface LeaderboardItem {
  rank: number;
  fullName: string;
  avatar: string;
  coins: number;
  missionsCount: number;
  level: string;
  trend: "up" | "down" | "same";
}

const mockTop3: LeaderboardItem[] = [
  {
    rank: 1,
    fullName: "Nguyễn Minh An",
    avatar: "MA",
    coins: 1250,
    missionsCount: 42,
    level: "Cấp 4 - Heo Hoàng Kim",
    trend: "same",
  },
  {
    rank: 2,
    fullName: "Trần Bảo Ngọc",
    avatar: "BN",
    coins: 980,
    missionsCount: 38,
    level: "Cấp 3 - Heo Bạc Tinh Anh",
    trend: "up",
  },
  {
    rank: 3,
    fullName: "Lê Hoàng Nam",
    avatar: "HN",
    coins: 840,
    missionsCount: 35,
    level: "Cấp 3 - Heo Bạc Tinh Anh",
    trend: "up",
  },
];

const mockRanks: LeaderboardItem[] = [
  {
    rank: 4,
    fullName: "Phạm Tuấn Kiệt",
    avatar: "TK",
    coins: 720,
    missionsCount: 31,
    level: "Cấp 2 - Heo Đồng Chăm Chỉ",
    trend: "same",
  },
  {
    rank: 5,
    fullName: "Đỗ Thùy Linh",
    avatar: "TL",
    coins: 690,
    missionsCount: 29,
    level: "Cấp 2 - Heo Đồng Chăm Chỉ",
    trend: "down",
  },
  {
    rank: 6,
    fullName: "Vũ Gia Hưng",
    avatar: "GH",
    coins: 650,
    missionsCount: 27,
    level: "Cấp 2 - Heo Đồng Chăm Chỉ",
    trend: "up",
  },
  {
    rank: 7,
    fullName: "Đặng Mai Phương",
    avatar: "MP",
    coins: 610,
    missionsCount: 25,
    level: "Cấp 2 - Heo Đồng Chăm Chỉ",
    trend: "same",
  },
  {
    rank: 8,
    fullName: "Hoàng Đức Anh",
    avatar: "ĐA",
    coins: 580,
    missionsCount: 23,
    level: "Cấp 1 - Heo Nhỏ Khởi Đầu",
    trend: "down",
  },
];

export function TeacherLeaderboardView() {
  const [period, setPeriod] = useState<"week" | "month" | "term">("week");

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1">
            <span>GÓC GIÁO VIÊN</span>
            <span>/</span>
            <span className="text-emerald-700">BẢNG XẾP HẠNG</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
            Bảng Vàng Thi Đua Lớp 3A1 🏆
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Vinh danh các bạn học sinh chăm chỉ nhất, tích lũy được nhiều xu Heo Đất nhất.
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setPeriod("week")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              period === "week"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Tuần này
          </button>
          <button
            type="button"
            onClick={() => setPeriod("month")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              period === "month"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Tháng này
          </button>
          <button
            type="button"
            onClick={() => setPeriod("term")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              period === "term"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Học kỳ
          </button>
        </div>
      </div>

      {/* Top 3 Podium (Solid Crisp Cards - No Heavy Gradients) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* HẠNG 2: BẠC */}
        <div className="order-2 md:order-1 bg-white rounded-2xl border-2 border-slate-200 p-5 shadow-xs flex flex-col items-center text-center relative">
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 text-slate-700 font-black text-sm flex items-center justify-center absolute -top-3 left-1/2 -translate-x-1/2 shadow-xs">
            🥈 2
          </div>
          <div className="w-14 h-14 rounded-full bg-slate-100 border-2 border-slate-300 text-slate-700 font-black text-base flex items-center justify-center mt-3">
            {mockTop3[1].avatar}
          </div>
          <h3 className="font-bold text-slate-900 text-sm mt-2">{mockTop3[1].fullName}</h3>
          <span className="text-[11px] text-slate-500 font-medium">{mockTop3[1].level}</span>

          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 text-slate-800 font-black text-xs border border-slate-200">
            <Coins className="w-3.5 h-3.5 text-amber-500" />
            <span>{mockTop3[1].coins.toLocaleString()} xu</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-2">
            Đã hoàn thành {mockTop3[1].missionsCount} nhiệm vụ
          </div>
        </div>

        {/* HẠNG 1: VÀNG (Nổi bật hơn một chút với border amber tinh tế) */}
        <div className="order-1 md:order-2 bg-white rounded-2xl border-2 border-amber-300 p-6 shadow-sm flex flex-col items-center text-center relative md:-translate-y-2">
          <div className="w-9 h-9 rounded-full bg-amber-100 border-2 border-amber-400 text-amber-800 font-black text-base flex items-center justify-center absolute -top-4 left-1/2 -translate-x-1/2 shadow-xs">
            🥇 1
          </div>
          <div className="w-16 h-16 rounded-full bg-amber-50 border-2 border-amber-400 text-amber-800 font-black text-lg flex items-center justify-center mt-2">
            {mockTop3[0].avatar}
          </div>
          <h3 className="font-bold text-slate-900 text-base mt-2">{mockTop3[0].fullName}</h3>
          <span className="text-xs text-amber-700 font-bold">{mockTop3[0].level}</span>

          <div className="mt-3 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-amber-100 text-amber-900 font-black text-sm border border-amber-300 shadow-2xs">
            <Coins className="w-4 h-4 text-amber-600" />
            <span>{mockTop3[0].coins.toLocaleString()} xu</span>
          </div>
          <div className="text-xs text-emerald-700 font-bold mt-2">
            Đã hoàn thành {mockTop3[0].missionsCount} nhiệm vụ 🌟
          </div>
        </div>

        {/* HẠNG 3: ĐỒNG */}
        <div className="order-3 bg-white rounded-2xl border-2 border-slate-200 p-5 shadow-xs flex flex-col items-center text-center relative">
          <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-300 text-amber-800 font-black text-sm flex items-center justify-center absolute -top-3 left-1/2 -translate-x-1/2 shadow-xs">
            🥉 3
          </div>
          <div className="w-14 h-14 rounded-full bg-slate-100 border-2 border-slate-200 text-slate-700 font-black text-base flex items-center justify-center mt-3">
            {mockTop3[2].avatar}
          </div>
          <h3 className="font-bold text-slate-900 text-sm mt-2">{mockTop3[2].fullName}</h3>
          <span className="text-[11px] text-slate-500 font-medium">{mockTop3[2].level}</span>

          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 text-slate-800 font-black text-xs border border-slate-200">
            <Coins className="w-3.5 h-3.5 text-amber-500" />
            <span>{mockTop3[2].coins.toLocaleString()} xu</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-2">
            Đã hoàn thành {mockTop3[2].missionsCount} nhiệm vụ
          </div>
        </div>
      </div>

      {/* Ranks 4+ Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 font-bold text-xs text-slate-700">
          Bảng xếp hạng chi tiết các vị trí tiếp theo
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4 w-16 text-center">Thứ hạng</th>
                <th className="py-3 px-4">Học sinh</th>
                <th className="py-3 px-4">Cấp bậc Heo Đất</th>
                <th className="py-3 px-4">Nhiệm vụ xong</th>
                <th className="py-3 px-4 text-right">Tổng xu tích lũy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockRanks.map((item) => (
                <tr key={item.rank} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 text-center font-bold text-slate-500">
                    #{item.rank}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-black text-xs flex items-center justify-center shrink-0">
                        {item.avatar}
                      </div>
                      <span className="font-bold text-slate-900 text-xs">{item.fullName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-600">
                    {item.level}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-600">
                    {item.missionsCount} bài
                  </td>
                  <td className="py-3 px-4 text-right font-black text-amber-700">
                    {item.coins.toLocaleString()} xu
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
