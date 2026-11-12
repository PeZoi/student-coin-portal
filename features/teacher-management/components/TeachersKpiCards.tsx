import { Users, CheckCircle2, School, UserCheck } from "lucide-react";
import { useManageTeachersContext } from "@/features/teacher-management/contexts/ManageTeachersContext";

interface TeachersKpiCardsProps {
  totalTeachers?: number;
  activeTeachers?: number;
  assignedTeachersCount?: number;
  unassignedTeachersCount?: number;
}

export function TeachersKpiCards(props?: TeachersKpiCardsProps) {
  const context = useManageTeachersContext();
  const totalTeachers = props?.totalTeachers ?? context.totalTeachers;
  const activeTeachers = props?.activeTeachers ?? context.activeTeachers;
  const assignedTeachersCount =
    props?.assignedTeachersCount ?? context.assignedTeachersCount;
  const unassignedTeachersCount =
    props?.unassignedTeachersCount ??
    Math.max(0, totalTeachers - assignedTeachersCount);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Tổng giáo viên */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs text-left">
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-semibold text-[#475569]">Tổng giáo viên</span>
          <div className="w-10 h-10 rounded-xl bg-[#EAF2FF] text-[#0A62D6] flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="text-3xl font-heading font-extrabold text-[#0F172A] tracking-tight">
            {totalTeachers}
          </span>
          <span className="text-sm font-semibold text-slate-500">giáo viên</span>
        </div>
      </div>

      {/* 2. Đang hoạt động */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs text-left">
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-semibold text-[#475569]">Đang hoạt động</span>
          <div className="w-10 h-10 rounded-xl bg-[#ECFDF3] text-[#15803D] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="text-3xl font-heading font-extrabold text-[#0F172A] tracking-tight">
            {activeTeachers}
          </span>
          <span className="text-sm font-semibold text-slate-500">giáo viên</span>
        </div>
      </div>

      {/* 3. Đã phân công lớp */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs text-left">
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-semibold text-[#475569]">Đã phân công lớp</span>
          <div className="w-10 h-10 rounded-xl bg-[#EAF2FF] text-[#0A62D6] flex items-center justify-center shrink-0">
            <School className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="text-3xl font-heading font-extrabold text-[#0F172A] tracking-tight">
            {assignedTeachersCount}
          </span>
          <span className="text-sm font-semibold text-slate-500">giáo viên</span>
        </div>
      </div>

      {/* 4. Chưa phân công */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs text-left">
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-semibold text-[#475569]">Chưa phân công</span>
          <div className="w-10 h-10 rounded-xl bg-[#EAF2FF] text-[#0A62D6] flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="text-3xl font-heading font-extrabold text-[#0F172A] tracking-tight">
            {unassignedTeachersCount}
          </span>
          <span className="text-sm font-semibold text-slate-500">giáo viên</span>
        </div>
      </div>
    </div>
  );
}
