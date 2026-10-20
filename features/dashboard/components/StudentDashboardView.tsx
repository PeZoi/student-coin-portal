"use client";

import { NavigationGrid } from "./NavigationGrid";
import { PiggyBankCard } from "./PiggyBankCard";

export function StudentDashboardView() {
  return (
    <div className="relative w-full flex-1 flex flex-col justify-start lg:justify-center items-center px-3 sm:px-6 lg:px-8 pt-8 pb-8 sm:pt-10 sm:pb-10 lg:py-4 min-h-full overflow-visible">
      {/* Decorative Fireworks & Festive Background Effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden select-none">
        {/* Top-right Fireworks burst */}
        <div className="absolute top-6 right-8 w-44 h-44 opacity-80">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="2" fill="#FFE600" />
            <path d="M50 20 L50 35" stroke="#FFE600" strokeWidth="2" strokeLinecap="round" />
            <path d="M50 65 L50 80" stroke="#FFE600" strokeWidth="2" strokeLinecap="round" />
            <path d="M20 50 L35 50" stroke="#FF4D4D" strokeWidth="2" strokeLinecap="round" />
            <path d="M65 50 L80 50" stroke="#FF4D4D" strokeWidth="2" strokeLinecap="round" />
            <path d="M28 28 L39 39" stroke="#00E5FF" strokeWidth="2" strokeLinecap="round" />
            <path d="M61 61 L72 72" stroke="#00E5FF" strokeWidth="2" strokeLinecap="round" />
            <path d="M28 72 L39 61" stroke="#00E676" strokeWidth="2" strokeLinecap="round" />
            <path d="M61 39 L72 28" stroke="#00E676" strokeWidth="2" strokeLinecap="round" />
            <circle cx="50" cy="15" r="3" fill="#FFE600" />
            <circle cx="85" cy="50" r="3" fill="#FF4D4D" />
            <circle cx="76" cy="24" r="2.5" fill="#00E676" />
            <circle cx="24" cy="76" r="2.5" fill="#00E5FF" />
          </svg>
        </div>

        {/* Top-left Fireworks burst */}
        <div className="absolute top-12 left-6 w-32 h-32 opacity-70">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <path d="M50 25 L50 38" stroke="#00E5FF" strokeWidth="2" strokeLinecap="round" />
            <path d="M50 62 L50 75" stroke="#00E5FF" strokeWidth="2" strokeLinecap="round" />
            <path d="M25 50 L38 50" stroke="#FFE600" strokeWidth="2" strokeLinecap="round" />
            <path d="M62 50 L75 50" stroke="#FFE600" strokeWidth="2" strokeLinecap="round" />
            <path d="M32 32 L41 41" stroke="#FF4D4D" strokeWidth="2" strokeLinecap="round" />
            <path d="M59 59 L68 68" stroke="#FF4D4D" strokeWidth="2" strokeLinecap="round" />
            <circle cx="50" cy="20" r="2.5" fill="#00E5FF" />
            <circle cx="20" cy="50" r="2.5" fill="#FFE600" />
            <circle cx="70" cy="30" r="2" fill="#FF007A" />
          </svg>
        </div>

        {/* Soft glowing ambient circles */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-sky-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-4 left-10 w-72 h-72 bg-blue-400/30 rounded-full blur-2xl" />
      </div>

      {/* Main Content Layout Container - 5:7 Golden Ratio */}
      <main className="relative z-10 w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-stretch my-auto pt-3 lg:pt-0">
        {/* Left Column: Heo Đất & Vòng quay (5 cols on lg - snug & well-fitted) */}
        <section className="lg:col-span-5 flex flex-col pt-3 lg:pt-0">
          <PiggyBankCard />
        </section>

        {/* Right Column: Nhiệm vụ nhận xu (7 cols on lg - spacious for 4 cards) */}
        <section className="lg:col-span-7 flex flex-col">
          <NavigationGrid />
        </section>
      </main>
    </div>
  );
}
