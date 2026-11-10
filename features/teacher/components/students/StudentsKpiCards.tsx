import { Users, CheckCircle2, ShieldAlert, Coins } from "lucide-react";
import { useManageStudentsContext } from "../../contexts/ManageStudentsContext";

interface StudentsKpiCardsProps {
  totalStudents?: number;
  activeStudents?: number;
  lockedPinStudents?: number;
  totalCoins?: number;
}

export function StudentsKpiCards(props?: StudentsKpiCardsProps) {
  const context = useManageStudentsContext();
  const totalStudents = props?.totalStudents ?? context.totalStudents;
  const activeStudents = props?.activeStudents ?? context.activeStudents;
  const lockedPinStudents =
    props?.lockedPinStudents ?? context.lockedPinStudents;
  const totalCoins = props?.totalCoins ?? context.totalCoins;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Tổng học sinh */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs text-left">
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-semibold text-[#475569]">
            Tổng học sinh
          </span>
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

      {/* 2. Đang học */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs text-left">
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-semibold text-[#475569]">
            Đang học tập
          </span>
          <div className="w-10 h-10 rounded-xl bg-[#ECFDF3] text-[#15803D] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="text-3xl font-heading font-extrabold text-[#0F172A] tracking-tight">
            {activeStudents}
          </span>
          <span className="text-sm font-semibold text-slate-500">em</span>
        </div>
      </div>

      {/* 3. Khóa PIN / Cần hỗ trợ */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs text-left">
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-semibold text-[#475569]">
            Khóa mã PIN
          </span>
          <div className="w-10 h-10 rounded-xl bg-[#FFF1F2] text-[#E11D48] flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="text-3xl font-heading font-extrabold text-[#0F172A] tracking-tight">
            {lockedPinStudents}
          </span>
          <span className="text-sm font-semibold text-slate-500">em</span>
        </div>
      </div>

      {/* 4. Tổng số xu */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs text-left">
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-semibold text-[#475569]">
            Tổng số xu
          </span>
          <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] text-[#B45309] flex items-center justify-center shrink-0">
            <Coins className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="text-3xl font-heading font-extrabold text-[#0F172A] tracking-tight">
            {totalCoins.toLocaleString("vi-VN")}
          </span>
          <span className="text-sm font-semibold text-slate-500">xu</span>
        </div>
      </div>
    </div>
  );
}

