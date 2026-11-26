"use client";

import Link from "next/link";
import Image from "next/image";
import { AppRoutes } from "@/constants/routes";
import {
  Gift,
  ChevronRight,
  Eye,
  ShoppingBag,
  Banknote,
} from "lucide-react";
import {
  EXCHANGE_CHOICE_TYPE_LABELS,
  ExchangeChoiceType,
  ExchangeRequestStatus,
} from "@/constants/rewards";
import { TeacherRewardDetailModal } from "@/features/teacher/reward-management/components/TeacherRewardDetailModal";
import { DASHBOARD_ASSETS } from "../constants";
import { useTeacherDashboardContext } from "../contexts/TeacherDashboardContext";

export function PendingRewardsWidget() {
  const {
    kpis,
    pendingRewards,
    selectedReward,
    isRewardModalOpen,
    selectedExchangeRequest,
    handleOpenRewardDetail,
    handleCloseRewardDetail,
    handleHandoverReward,
    handleRejectReward,
  } = useTeacherDashboardContext();

  const visiblePendingRewards = pendingRewards.filter(
    (r) => r.status === ExchangeRequestStatus.PENDING
  );

  const renderChoiceTypeBadge = (choiceType: string) => {
    if (choiceType === ExchangeChoiceType.CASH) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[11px] font-bold whitespace-nowrap">
          <Banknote className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>{EXCHANGE_CHOICE_TYPE_LABELS[ExchangeChoiceType.CASH]}</span>
        </span>
      );
    }
    if (choiceType === ExchangeChoiceType.SPIN_GIFT) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-purple-50 text-purple-700 border border-purple-200/80 text-[11px] font-bold whitespace-nowrap">
          <Gift className="w-3.5 h-3.5 text-purple-600 shrink-0" />
          <span>{EXCHANGE_CHOICE_TYPE_LABELS[ExchangeChoiceType.SPIN_GIFT]}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-orange-50 text-orange-700 border border-orange-200/80 text-[11px] font-bold whitespace-nowrap">
        <ShoppingBag className="w-3.5 h-3.5 text-orange-600 shrink-0" />
        <span>{EXCHANGE_CHOICE_TYPE_LABELS[ExchangeChoiceType.GIFT]}</span>
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-2xs">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0A62D6] flex items-center justify-center font-bold border border-blue-200/80 shrink-0">
            <Gift className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#0F172A]">
              Quà chờ duyệt ({kpis.pending_rewards_count})
            </h2>
            <p className="text-[11px] text-slate-500">
              Đổi quà Heo Đất & phần thưởng vòng quay
            </p>
          </div>
        </div>

        <Link
          href={AppRoutes.TEACHER.REWARDS}
          className="text-xs font-bold text-[#0A62D6] hover:text-[#0850B0] flex items-center gap-0.5 shrink-0"
        >
          <span>Quản lý</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Danh sách quà chờ duyệt */}
      {visiblePendingRewards.length === 0 ? (
        <div className="py-7 text-center text-slate-400">
          <div className="w-11 h-11 rounded-full bg-blue-50/80 text-[#0A62D6]/75 border border-blue-100 mx-auto mb-2.5 flex items-center justify-center">
            <Gift className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-slate-600">
            Hiện không có phần quà nào chờ duyệt.
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Yêu cầu đổi quà mới của học sinh sẽ hiển thị tại đây.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {visiblePendingRewards.map((reward) => (
            <div
              key={reward.id}
              className="p-3 rounded-xl border transition-all flex items-center justify-between gap-2.5 bg-slate-50/70 hover:bg-white border-slate-200/80 hover:shadow-2xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Image
                  src={reward.student_avatar}
                  alt={reward.student_name}
                  width={36}
                  height={36}
                  style={{ height: "auto" }}
                  className="w-9 h-9 rounded-full border border-slate-200 object-cover bg-white shrink-0"
                />
                <div className="min-w-0">
                  <span className="text-xs font-bold text-[#0F172A] block truncate">
                    {reward.student_name}
                  </span>

                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-600 mt-0.5">
                    <span className="text-[10px] text-slate-400 font-normal">
                      Quy đổi:
                    </span>
                    <div className="inline-flex items-center gap-0.5">
                      <Image
                        src={DASHBOARD_ASSETS.COIN_ICON}
                        alt="Xu"
                        width={12}
                        height={12}
                        style={{ height: "auto" }}
                        className="w-3 h-3 select-none"
                      />
                      <span>-{reward.coins_to_exchange} xu</span>
                    </div>
                    <span className="text-slate-300 font-normal">→</span>
                    <span className="text-emerald-700 font-extrabold">
                      {reward.amount_vnd.toLocaleString("vi-VN")}đ
                    </span>
                  </div>

                  <div className="mt-1.5">
                    {renderChoiceTypeBadge(reward.choice_type)}
                  </div>
                </div>
              </div>

              <div className="shrink-0 flex items-center">
                <button
                  type="button"
                  onClick={() => handleOpenRewardDetail(reward)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 active:scale-95 text-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  <span>Xem</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Popup chi tiết yêu cầu đổi thưởng (Tái sử dụng TeacherRewardDetailModal) */}
      <TeacherRewardDetailModal
        key={selectedReward?.id ?? "empty"}
        isOpen={isRewardModalOpen}
        onClose={handleCloseRewardDetail}
        request={selectedExchangeRequest}
        onApproveAndDeliver={(req) => {
          void handleHandoverReward(req.id);
        }}
        onReject={(req) => {
          void handleRejectReward(req.id);
        }}
      />
    </div>
  );
}
