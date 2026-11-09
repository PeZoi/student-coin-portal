interface StatusBadgeProps {
  isActive: boolean;
}

export function StatusBadge({ isActive }: StatusBadgeProps) {
  if (isActive) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#15803D] bg-[#ECFDF3] px-2.5 py-1 rounded-full border border-[#22C55E]/30 whitespace-nowrap">
        <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] shrink-0" />
        <span>Hoạt động</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#475569] bg-[#F1F5F9] px-2.5 py-1 rounded-full border border-slate-200 whitespace-nowrap">
      <span className="w-1.5 h-1.5 rounded-full bg-[#94A3B8] shrink-0" />
      <span>Tạm dừng</span>
    </span>
  );
}
