"use client";

import { DashboardBackgroundDecor } from "./DashboardBackgroundDecor";
import { NavigationGrid } from "./NavigationGrid";
import { PiggyBankCard } from "./PiggyBankCard";

export function StudentDashboardView() {
  return (
    <div className="relative w-full flex-1 flex flex-col justify-start lg:justify-center items-center px-3 sm:px-6 lg:px-8 pt-8 pb-8 sm:pt-10 sm:pb-10 lg:py-4 min-h-full overflow-visible">
      {/* Decorative Sky Clouds, 3D Stars & Festive Confetti Background */}
      <DashboardBackgroundDecor />

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
