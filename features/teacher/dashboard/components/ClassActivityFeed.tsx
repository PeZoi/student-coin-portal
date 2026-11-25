"use client";

import Image from "next/image";
import { Activity, FileCheck2, Gift, Award, Sparkles } from "lucide-react";
import { DashboardClassActivityItem } from "../types";

interface ClassActivityFeedProps {
  activities: DashboardClassActivityItem[];
}

export function ClassActivityFeed({ activities }: ClassActivityFeedProps) {
  const getIcon = (type: DashboardClassActivityItem["type"]) => {
    switch (type) {
      case "submission":
        return <FileCheck2 className="w-3 h-3 text-blue-600" />;
      case "reward_exchange":
        return <Gift className="w-3 h-3 text-rose-600" />;
      case "coin_awarded":
        return <Award className="w-3 h-3 text-emerald-600" />;
      case "wheel_spin":
        return <Sparkles className="w-3 h-3 text-purple-600" />;
    }
  };

  const getBadgeBg = (type: DashboardClassActivityItem["type"]) => {
    switch (type) {
      case "submission":
        return "bg-blue-50 border border-blue-200";
      case "reward_exchange":
        return "bg-rose-50 border border-rose-200";
      case "coin_awarded":
        return "bg-emerald-50 border border-emerald-200";
      case "wheel_spin":
        return "bg-purple-50 border border-purple-200";
    }
  };

  const getActivityTypeTag = (type: DashboardClassActivityItem["type"]) => {
    switch (type) {
      case "submission":
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/80 shrink-0">
            Nộp bài
          </span>
        );
      case "reward_exchange":
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200/80 shrink-0">
            Đổi quà
          </span>
        );
      case "coin_awarded":
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shrink-0">
            Thưởng nóng
          </span>
        );
      case "wheel_spin":
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200/80 shrink-0">
            Vòng quay
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 sm:p-6 shadow-2xs">
      {/* Header khối: Cỡ chữ & Icon đồng bộ 100% với RecentSubmissionsQueue */}
      <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-100">
        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold border border-blue-200/80 shrink-0">
          <Activity className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-base font-extrabold text-[#0F172A] font-heading">
            Hoạt động sôi nổi gần đây
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Biến động xu & nộp bài tập thời gian thực của lớp học
          </p>
        </div>
      </div>

      {/* Danh sách sự kiện: Nâng cấp kích thước tương xứng với cột chính (2/3 chiều rộng) */}
      {activities.length === 0 ? (
        <div className="py-10 text-center text-slate-400">
          <p className="text-sm font-semibold text-slate-600">
            Chưa có hoạt động nào gần đây trong lớp học.
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Các lượt nộp bài, quay thưởng hoặc đổi quà sẽ xuất hiện tức thì tại đây.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((act) => {
            const isPositive = act.coins_delta > 0;

            return (
              <div
                key={act.id}
                className="p-3.5 sm:p-4 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-white hover:border-slate-300 hover:shadow-xs transition-all flex items-center justify-between gap-3.5"
              >
                {/* Phần trái: Avatar lớn (44px) + Icon hành động + Tên học sinh + Mô tả */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="relative shrink-0">
                    <Image
                      src={act.student_avatar}
                      alt={act.student_name}
                      width={44}
                      height={44}
                      style={{ height: "auto" }}
                      className="w-11 h-11 rounded-full border border-slate-200/90 object-cover bg-white shadow-2xs"
                    />
                    <div
                      className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white shadow-2xs ${getBadgeBg(
                        act.type
                      )}`}
                    >
                      {getIcon(act.type)}
                    </div>
                  </div>

                  <div className="min-w-0">
                    {/* Hàng 1: Tên học sinh + Thời gian + Tag loại hoạt động */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-extrabold text-[#0F172A] truncate">
                        {act.student_name}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        • {act.time_ago}
                      </span>
                      {getActivityTypeTag(act.type)}
                    </div>

                    {/* Hàng 2: Mô tả hoạt động */}
                    <p className="text-xs font-medium text-slate-600 mt-1 line-clamp-1">
                      {act.description}
                    </p>
                  </div>
                </div>

                {/* Phần phải: Biến động xu nổi bật, kích thước chuẩn sắc nét */}
                <div className="shrink-0 text-right pl-2">
                  <div
                    className={`inline-flex items-center gap-1.5 font-black text-sm sm:text-base tabular-nums font-heading ${
                      isPositive ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    <Image
                      src="/wheel/coin.webp"
                      alt="Xu"
                      width={18}
                      height={18}
                      style={{ height: "auto" }}
                      className="w-4.5 h-4.5 select-none"
                    />
                    <span>
                      {isPositive ? `+${act.coins_delta}` : act.coins_delta} xu
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
