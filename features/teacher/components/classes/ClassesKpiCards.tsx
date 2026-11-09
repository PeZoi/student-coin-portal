import { School, CheckCircle2, Users, UserCheck } from "lucide-react";

interface ClassesKpiCardsProps {
  totalClasses: number;
  activeClasses: number;
  totalStudents: number;
  totalTeachers: number;
}

export function ClassesKpiCards({
  totalClasses,
  activeClasses,
  totalStudents,
  totalTeachers,
}: ClassesKpiCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Tổng số lớp */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs text-left">
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-semibold text-[#475569]">Tổng số lớp</span>
          <div className="w-10 h-10 rounded-xl bg-[#EAF2FF] text-[#0A62D6] flex items-center justify-center shrink-0">
            <School className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="text-3xl font-heading font-extrabold text-[#0F172A] tracking-tight">
            {totalClasses}
          </span>
          <span className="text-sm font-semibold text-slate-500">lớp</span>
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
            {activeClasses}
          </span>
          <span className="text-sm font-semibold text-slate-500">lớp</span>
        </div>
      </div>

      {/* 3. Tổng sĩ số */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs text-left">
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-semibold text-[#475569]">Tổng sĩ số</span>
          <div className="w-10 h-10 rounded-xl bg-[#EAF2FF] text-[#0A62D6] flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="text-3xl font-heading font-extrabold text-[#0F172A] tracking-tight">
            {totalStudents}
          </span>
          <span className="text-sm font-semibold text-slate-500">học sinh</span>
        </div>
      </div>

      {/* 4. Giáo viên phụ trách */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs text-left">
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-semibold text-[#475569]">Giáo viên phụ trách</span>
          <div className="w-10 h-10 rounded-xl bg-[#EAF2FF] text-[#0A62D6] flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="text-3xl font-heading font-extrabold text-[#0F172A] tracking-tight">
            {totalTeachers}
          </span>
          <span className="text-sm font-semibold text-slate-500">giáo viên</span>
        </div>
      </div>
    </div>
  );
}
