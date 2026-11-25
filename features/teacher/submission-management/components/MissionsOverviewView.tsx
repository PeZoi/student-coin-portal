"use client";

import { useMemo, useState } from "react";
import {
  BookOpen,
  FileCheck2,
  CheckCircle2,
  RotateCcw,
  Search,
  X,
} from "lucide-react";
import { cn, normalizeText } from "@/lib/utils";
import { SUBMISSION_GRADING_CONFIG } from "../constants";
import { useManageSubmissionsContext } from "../contexts/ManageSubmissionsContext";
import { MissionOverviewCard } from "./MissionOverviewCard";
import { SubmissionKpiCard } from "./shared/SubmissionKpiCard";
import { SubmissionsSkeleton } from "./SubmissionsSkeleton";

type OverviewTimeFilter = "all" | "active";

/**
 * Màn hình Tổng quan Danh sách Bài tập Cần duyệt (Level 1 - Assignment Hub)
 * - Chỉ hiển thị bài còn hạn và bài quá hạn trong vòng `OVERVIEW_EXPIRED_WINDOW_DAYS` (7 ngày)
 * - Hỗ trợ tìm kiếm & lọc nhanh theo trạng thái hạn nộp (Tất cả / Còn hạn)
 */
export function MissionsOverviewView() {
  const {
    missionsOverview,
    totalMissionsCount,
    totalPendingAllMissions,
    totalApprovedAllMissions,
    totalRejectedAllMissions,
    isLoadingOverview,
  } = useManageSubmissionsContext();

  const [timeFilter, setTimeFilter] = useState<OverviewTimeFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { activeCount, filteredMissions } = useMemo(() => {
    let active = 0;
    const query = normalizeText(searchQuery);
    const list: typeof missionsOverview = [];

    for (const m of missionsOverview) {
      if (!m.is_expired) active += 1;

      if (timeFilter === "active" && m.is_expired) continue;
      if (query && !normalizeText(m.title).includes(query)) continue;
      list.push(m);
    }

    return {
      activeCount: active,
      filteredMissions: list,
    };
  }, [missionsOverview, timeFilter, searchQuery]);

  if (isLoadingOverview && missionsOverview.length === 0) {
    return <SubmissionsSkeleton />;
  }

  const filterTabs: {
    key: OverviewTimeFilter;
    label: string;
    count: number;
  }[] = [
    { key: "all", label: "Tất cả", count: missionsOverview.length },
    { key: "active", label: "Còn hạn", count: activeCount },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header Trang Tổng Quan */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] font-heading tracking-tight">
            Duyệt bài tập
          </h1>
          <p className="text-sm sm:text-[15px] text-[#475569] mt-1">
            Hiển thị các bài tập đang mở và bài quá hạn trong{" "}
            {SUBMISSION_GRADING_CONFIG.OVERVIEW_EXPIRED_WINDOW_DAYS} ngày gần
            nhất để đối chiếu AI &amp; duyệt thưởng xu Heo Đất.
          </p>
        </div>
      </div>

      {/* 2. 4 Thẻ KPI Toàn hệ thống */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SubmissionKpiCard
          label="Bài tập gần đây"
          value={totalMissionsCount}
          unit="bài tập"
          icon={<BookOpen className="w-5 h-5" />}
          iconWrapperClassName="bg-[#EAF2FF] text-[#0A62D6]"
        />

        <SubmissionKpiCard
          label="Bài chờ duyệt"
          value={totalPendingAllMissions}
          unit="bài nộp"
          icon={<FileCheck2 className="w-5 h-5" />}
          iconWrapperClassName="bg-amber-50 text-amber-600"
          valueClassName="text-amber-600"
          badge={
            totalPendingAllMissions > 0 ? (
              <span className="ml-auto text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/80">
                Cần duyệt
              </span>
            ) : undefined
          }
        />

        <SubmissionKpiCard
          label="Đã duyệt xong"
          value={totalApprovedAllMissions}
          unit="bài nộp"
          icon={<CheckCircle2 className="w-5 h-5" />}
          iconWrapperClassName="bg-[#ECFDF3] text-[#15803D]"
        />

        <SubmissionKpiCard
          label="Cần sửa / Nộp lại"
          value={totalRejectedAllMissions}
          unit="bài nộp"
          icon={<RotateCcw className="w-5 h-5" />}
          iconWrapperClassName="bg-[#FFF1F2] text-[#E11D48]"
          valueClassName={
            totalRejectedAllMissions > 0 ? "text-rose-600" : "text-[#0F172A]"
          }
        />
      </div>

      {/* 3. Thanh lọc nhanh (Tất cả / Còn hạn) & Tìm kiếm bài tập */}
      {missionsOverview.length > 0 && (
        <div className="bg-white p-3 sm:p-3.5 rounded-2xl border border-[#E2E8F0] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto">
            {filterTabs.map((tab) => {
              const isActive = timeFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setTimeFilter(tab.key)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer",
                    isActive
                      ? "bg-white text-[#0F172A] shadow-xs"
                      : "text-slate-600 hover:text-[#0F172A]"
                  )}
                >
                  <span>{tab.label}</span>
                  <span className="text-[11px] opacity-75">({tab.count})</span>
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm tên bài tập..."
              className="w-full h-9 pl-9 pr-8 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-[#0F172A] placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#0A62D6] focus:ring-2 focus:ring-[#0A62D6]/20 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                aria-label="Xóa từ khóa tìm kiếm"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 4. Lưới Thẻ Bài Tập hoặc Trạng thái trống */}
      {missionsOverview.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs p-12 text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#EAF2FF] text-[#0A62D6] flex items-center justify-center mx-auto mb-3">
            <BookOpen className="w-7 h-7" />
          </div>
          <h2 className="text-base sm:text-lg font-extrabold text-[#0F172A]">
            Chưa có bài tập nào cần duyệt
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Lớp học đang chọn hiện chưa có bài tập còn hạn hoặc quá hạn trong{" "}
            {SUBMISSION_GRADING_CONFIG.OVERVIEW_EXPIRED_WINDOW_DAYS} ngày gần
            nhất.
          </p>
        </div>
      ) : filteredMissions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs p-10 text-center space-y-2">
          <p className="text-sm font-bold text-[#0F172A]">
            Không tìm thấy bài tập nào khớp bộ lọc
          </p>
          <button
            type="button"
            onClick={() => {
              setTimeFilter("all");
              setSearchQuery("");
            }}
            className="text-xs text-[#0A62D6] font-bold underline cursor-pointer"
          >
            Đặt lại bộ lọc
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 items-stretch">
          {filteredMissions.map((mission) => (
            <MissionOverviewCard key={mission.id} mission={mission} />
          ))}
        </div>
      )}
    </div>
  );
}
