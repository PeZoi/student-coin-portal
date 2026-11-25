"use client";

import { useManageMissionsContext } from "../contexts/ManageMissionsContext";
import { MissionCard } from "./MissionCard";

interface MissionsGridListProps {
  /** Nếu true, chỉ hiện trên màn hình nhỏ (dùng làm mobile fallback khi đang ở chế độ Bảng) */
  mobileOnly?: boolean;
}

export function MissionsGridList({ mobileOnly = false }: MissionsGridListProps) {
  const { paginatedMissions } = useManageMissionsContext();

  return (
    <div
      className={`p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-2 gap-4 ${
        mobileOnly ? "md:hidden" : ""
      }`}
    >
      {paginatedMissions.map((item) => (
        <MissionCard key={item.id} item={item} />
      ))}
    </div>
  );
}
