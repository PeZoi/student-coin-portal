import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SubmissionKpiCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon: ReactNode;
  iconWrapperClassName: string;
  valueClassName?: string;
  badge?: ReactNode;
  className?: string;
}

/**
 * Thẻ KPI chuẩn hóa dùng chung cho cả MissionsOverviewView (4 thẻ) và MissionDetailHeader (5 thẻ)
 */
export function SubmissionKpiCard({
  label,
  value,
  unit,
  icon,
  iconWrapperClassName,
  valueClassName = "text-[#0F172A]",
  badge,
  className,
}: SubmissionKpiCardProps) {
  return (
    <div
      className={cn(
        "bg-white p-4 xl:p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs text-left",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-semibold text-[#475569]">{label}</span>
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
            iconWrapperClassName
          )}
        >
          {icon}
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-1.5 flex-wrap">
        <span
          className={cn(
            "text-3xl font-heading font-extrabold tracking-tight tabular-nums",
            valueClassName
          )}
        >
          {value}
        </span>
        {unit && (
          <span className="text-xs sm:text-sm font-semibold text-slate-500 tabular-nums">
            {unit}
          </span>
        )}
        {badge}
      </div>
    </div>
  );
}
