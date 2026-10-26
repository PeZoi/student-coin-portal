"use client";

import Image from "next/image";
import { useState } from "react";
import { initialMissions } from "../data/mockMissions";
import { MissionFilter, MissionItem } from "../types";
import { MissionDecorElements } from "./MissionDecorElements";
import { MissionDetailSide } from "./MissionDetailSide";
import { MissionListSide } from "./MissionListSide";

export function MissionBook() {
  const missions = initialMissions;
  const [selectedFilter, setSelectedFilter] = useState<MissionFilter>("all");
  const [selectedMissionId, setSelectedMissionId] = useState<string>("m1");
  const [mobileTab, setMobileTab] = useState<"list" | "detail">("list");

  // Lọc nhiệm vụ theo filter: Tất cả | Chưa xong | Đã xong
  const filteredMissions = missions.filter((m) => {
    if (selectedFilter === "pending") return !m.isCompleted;
    if (selectedFilter === "completed") return m.isCompleted;
    return true;
  });

  // Số lượng đếm cho từng tab
  const filterCounts = {
    all: missions.length,
    pending: missions.filter((m) => !m.isCompleted).length,
    completed: missions.filter((m) => m.isCompleted).length,
  };

  // Nhiệm vụ đang được chọn
  const activeMission =
    missions.find((m) => m.id === selectedMissionId) || filteredMissions[0] || missions[0];

  // Khi bấm chọn nhiệm vụ
  const handleSelectMission = (mission: MissionItem) => {
    setSelectedMissionId(mission.id);
    // Trên mobile tự động chuyển sang trang Chi tiết để xem và nộp bài
    setMobileTab("detail");
  };

  return (
    <div className="relative w-full max-w-6xl h-full flex flex-col items-center justify-start lg:justify-center min-h-0">
      {/* Trang trí nền */}
      <MissionDecorElements />

      {/* ======================================================== */}
      {/* KHUNG CUỐN SÁCH THẦN KỲ MỞ ĐÔI (OPEN FANTASY QUEST BOOK) */}
      {/* ======================================================== */}
      {/* DESKTOP VIEW (lg:): Vector SVG sắc nét, phóng to vừa vặn tỷ lệ 1 trang (Hero Book), không cuộn trang */}
      <div className="hidden lg:block relative h-[min(840px,calc(100dvh-76px))] max-w-[min(96vw,1040px)] aspect-1153/1040 mx-auto select-none drop-shadow-[0_24px_50px_rgba(0,18,50,0.38)]">
        {/* NỀN CUỐN SÁCH VECTOR SVG CHÍNH XÁC (book.svg) */}
        <Image
          src="/book/book.svg"
          alt="Khung cuốn sách nhiệm vụ"
          fill
          priority
          unoptimized
          className="object-contain pointer-events-none select-none z-0"
        />

        {/* TRANG TRÁI: DANH SÁCH NHIỆM VỤ */}
        <div className="absolute top-[10%] bottom-[17%] left-[8.5%] w-[38.5%] flex flex-col z-10 px-1 py-1">
          <MissionListSide
            missions={filteredMissions}
            selectedFilter={selectedFilter}
            onSelectFilter={setSelectedFilter}
            filterCounts={filterCounts}
            selectedMissionId={activeMission.id}
            onSelectMission={handleSelectMission}
          />
        </div>

        {/* TRANG PHẢI: CHI TIẾT NHIỆM VỤ & NỘP BÀI */}
        <div className="absolute top-[10%] bottom-[17%] left-[53%] w-[38.5%] flex flex-col z-10 pl-1 pr-2.5 py-1">
          <MissionDetailSide mission={activeMission} />
        </div>
      </div>

      {/* MOBILE & TABLET VIEW (< lg): Sổ tay ma thuật trang đơn sử dụng book-mobile.svg */}
      <div className="lg:hidden relative h-full w-full max-h-[min(680px,calc(100dvh-115px))] max-w-[min(96vw,480px)] aspect-[725/1080] mx-auto select-none drop-shadow-[0_16px_36px_rgba(0,18,50,0.35)] flex flex-col items-center justify-center min-h-0">
        {/* NỀN SỔ TAY VECTOR SVG CHÍNH XÁC (book-mobile.svg) */}
        <Image
          src="/book/book-mobile.svg"
          alt="Khung sổ tay nhiệm vụ"
          fill
          priority
          unoptimized
          className="w-full h-full object-contain pointer-events-none select-none z-0"
        />

        {/* VÙNG NỘI DUNG TRANG GIẤY BÊN TRONG CUỐN SÁCH:
            Chiều rộng bung mở vừa bằng với cuốn sách (vừa khít mép viền bìa cuốn sách) */}
        <div className="absolute top-[16%] bottom-[18%] left-[6%] right-[6%] flex flex-col z-10 px-4 overflow-hidden min-h-0">
          {mobileTab === "list" ? (
            <MissionListSide
              missions={filteredMissions}
              selectedFilter={selectedFilter}
              onSelectFilter={setSelectedFilter}
              filterCounts={filterCounts}
              selectedMissionId={activeMission.id}
              onSelectMission={handleSelectMission}
            />
          ) : (
            <MissionDetailSide
              mission={activeMission}
              onBack={() => setMobileTab("list")}
            />
          )}
        </div>
      </div>
    </div>
  );
}
