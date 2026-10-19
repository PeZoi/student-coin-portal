"use client";

import React from "react";
import Image from "next/image";
import { Sparkles } from "lucide-react";
import { useUserStore } from "@/stores/useUserStore";
import { MissionCard } from "./MissionCard";

export function MissionGrid() {
  const { missions } = useUserStore();

  return (
    <div className="relative w-full flex flex-col justify-between">
      {/* Section Header with 3D text and Coin */}
      <div className="relative flex items-center justify-center gap-2 mb-3 select-none">
        {/* Festive background sparks - static */}
        <div className="absolute -top-3 left-4 text-yellow-300 opacity-80 pointer-events-none">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="absolute -top-2 right-4 text-pink-300 opacity-80 pointer-events-none">
          <Sparkles className="w-6 h-6" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-heading font-black uppercase tracking-wider text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] [text-shadow:_0_2px_0_#005bb5,_0_4px_6px_rgba(0,0,0,0.3)] flex items-center gap-2.5">
          <span>NHIỆM VỤ NHẬN XU</span>
          <div className="w-7 h-7 sm:w-8 sm:h-8 relative inline-block drop-shadow-md">
            <Image
              src="/coin.png"
              alt="Coin"
              fill
              sizes="32px"
              unoptimized
              className="object-contain"
            />
          </div>
        </h2>
      </div>

      {/* 2x2 Mission Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 w-full">
        {missions.map((mission) => (
          <MissionCard key={mission.id} mission={mission} />
        ))}
      </div>
    </div>
  );
}
