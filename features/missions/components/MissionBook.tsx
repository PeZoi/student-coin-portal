"use client";

import Image from "next/image";
import { useIsBookDesktop, useIsLandscapeMobile } from "@/hooks/useMediaQuery";
import { initialMissions } from "../data/mockMissions";
import { useMissionFilter } from "../hooks/useMissionFilter";
import { MissionDetailSide } from "./MissionDetailSide";
import { MissionListSide } from "./MissionListSide";
import { MissionListMobile } from "./MissionListMobile";
import { MissionDetailSheet } from "./MissionDetailSheet";

export function MissionBook() {
  const isDesktop = useIsBookDesktop();
  const isLandscapeMobile = useIsLandscapeMobile();

  const {
    selectedFilter,
    setSelectedFilter,
    selectedMissionId,
    activeMission,
    filteredMissions,
    filterCounts,
    isDetailSheetOpen,
    handleCloseDetailSheet,
    handleSelectMission,
  } = useMissionFilter(initialMissions);

  return (
    <div className="relative w-full max-w-6xl h-full flex flex-col items-center justify-start lg:justify-center min-h-0">
      {/* Khung chờ rỗng SSR-safe giữ nguyên kích thước trước khi media query resolve */}
      {isDesktop === undefined ? (
        <div
          aria-hidden="true"
          className="relative h-[min(840px,calc(100dvh-76px))] max-w-[min(96vw,1040px)] aspect-1153/1040 mx-auto opacity-0 pointer-events-none"
        />
      ) : isDesktop ? (
        /* ======================================================== */
        /* DESKTOP VIEW: Vector SVG sắc nét, vừa vặn tỷ lệ 1 trang (Hero Book), không cuộn trang */
        /* ======================================================== */
        <div className="relative h-[min(840px,calc(100dvh-76px))] max-w-[min(96vw,1040px)] aspect-1153/1040 mx-auto select-none drop-shadow-[0_24px_50px_rgba(0,18,50,0.38)]">
          {/* NỀN CUỐN SÁCH VECTOR SVG CHÍNH XÁC (book.svg) */}
          <Image
            src="/book/book.svg"
            alt="Khung cuốn sách nhiệm vụ"
            fill
            priority
            unoptimized
            className="object-contain pointer-events-none select-none z-0"
          />

          {/* TRANG TRÁI: DANH SÁCH NHIỆM VỤ (3 TAB: CHƯA XONG, ĐÃ XONG, QUÁ HẠN) */}
          <div className="absolute top-[10%] bottom-[17%] left-[8.5%] w-[38.5%] flex flex-col z-10 px-1 py-1">
            <MissionListSide
              missions={filteredMissions}
              selectedFilter={selectedFilter}
              onSelectFilter={setSelectedFilter}
              filterCounts={filterCounts}
              selectedMissionId={selectedMissionId}
              onSelectMission={handleSelectMission}
            />
          </div>

          {/* TRANG PHẢI: CHI TIẾT NHIỆM VỤ & NỘP BÀI (reset state khi đổi nhiệm vụ bằng key) */}
          <div className="absolute top-[10%] bottom-[17%] left-[53%] w-[38.5%] flex flex-col z-10 pl-1 pr-2.5 py-1">
            <MissionDetailSide
              key={activeMission?.id}
              mission={activeMission}
            />
          </div>
        </div>
      ) : isLandscapeMobile ? (
        /* ======================================================== */
        /* ĐIỆN THOẠI XOAY NGANG (chiều cao < 500px): Hiển thị trên nền giấy da không dùng SVG sách dọc */
        /* ======================================================== */
        <div className="relative w-full max-w-xl h-[calc(100dvh-24px)] my-auto bg-[#FDF8EA] border-2 border-amber-800/35 rounded-2xl shadow-xl px-3.5 py-2 flex flex-col min-h-0">
          <MissionListMobile
            missions={filteredMissions}
            selectedFilter={selectedFilter}
            onSelectFilter={setSelectedFilter}
            filterCounts={filterCounts}
            selectedMissionId={selectedMissionId}
            onSelectMission={handleSelectMission}
          />
        </div>
      ) : (
        /* ======================================================== */
        /* MOBILE & TABLET VIEW: Sổ tay ma thuật trang đơn sử dụng book-mobile.svg */
        /* Giữ danh sách nhiệm vụ luôn mounted để duy trì vị trí cuộn */
        /* ======================================================== */
        <div className="relative h-full w-full max-h-[min(740px,calc(100dvh-55px))] max-w-[min(96vw,480px)] aspect-[725/1080] mx-auto select-none drop-shadow-[0_16px_36px_rgba(0,18,50,0.35)] flex flex-col items-center justify-center min-h-0">
          {/* NỀN SỔ TAY VECTOR SVG CHÍNH XÁC (book-mobile.svg) */}
          <Image
            src="/book/book-mobile.svg"
            alt="Khung sổ tay nhiệm vụ"
            fill
            priority
            unoptimized
            className="w-full h-full object-contain pointer-events-none select-none z-0"
          />

          {/* VÙNG NỘI DUNG TRANG GIẤY BÊN TRONG CUỐN SÁCH: DANH SÁCH NHIỆM VỤ TỐI GIẢN */}
          <div className="absolute top-[20%] bottom-[22%] left-[6%] right-[6%] flex flex-col z-10 px-3.5 overflow-hidden min-h-0">
            <MissionListMobile
              missions={filteredMissions}
              selectedFilter={selectedFilter}
              onSelectFilter={setSelectedFilter}
              filterCounts={filterCounts}
              selectedMissionId={selectedMissionId}
              onSelectMission={handleSelectMission}
            />
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* BOTTOM SHEET CHI TIẾT NHIỆM VỤ VÀ LUỒNG NỘP BÀI TRÊN MOBILE */}
      {/* Chỉ kích hoạt khi ở viewport mobile / tablet (!isDesktop) */}
      {/* ======================================================== */}
      {!isDesktop && (
        <MissionDetailSheet
          mission={activeMission}
          isOpen={isDetailSheetOpen}
          onClose={handleCloseDetailSheet}
        />
      )}
    </div>
  );
}
