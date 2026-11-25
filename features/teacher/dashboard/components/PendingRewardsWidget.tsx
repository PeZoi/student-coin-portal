"use client";

import { useState, useMemo } from "react";
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
import { DashboardPendingRewardItem } from "../types";
import { TeacherRewardDetailModal } from "@/features/teacher/reward-management/components/TeacherRewardDetailModal";
import type { TeacherExchangeRequestItem } from "@/features/student/rewards/types";
import {
  ExchangeChoiceType,
  ExchangeRequestStatus,
  type ExchangeChoiceTypeValue,
} from "@/constants/rewards";

interface PendingRewardsWidgetProps {
  rewards: DashboardPendingRewardItem[];
  onHandoverReward: (rewardId: string) => void;
  onRejectReward?: (rewardId: string) => void;
}

export function PendingRewardsWidget({
  rewards,
  onHandoverReward,
  onRejectReward,
}: PendingRewardsWidgetProps) {
  const pendingRewards = rewards.filter((r) => r.status === "pending");

  // State mở Modal chi tiết yêu cầu đổi thưởng (Tái sử dụng TeacherRewardDetailModal)
  const [selectedReward, setSelectedReward] =
    useState<DashboardPendingRewardItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Chuyển đổi dữ liệu Dashboard sang TeacherExchangeRequestItem để nạp vào form modal
  const selectedExchangeRequest = useMemo<TeacherExchangeRequestItem | null>(() => {
    if (!selectedReward) return null;
    return {
      id: selectedReward.id,
      month: 11,
      year: 2026,
      student_id: selectedReward.student_id,
      student_name: selectedReward.student_name,
      student_avatar: selectedReward.student_avatar,
      class_id: selectedReward.class_id,
      class_name: selectedReward.class_name,
      choice_type: selectedReward.choice_type as ExchangeChoiceTypeValue,
      coins_to_exchange: selectedReward.coins_to_exchange,
      amount_vnd: selectedReward.amount_vnd,
      shopee_product_url: selectedReward.shopee_product_url ?? null,
      shopee_note: selectedReward.item_name,
      status:
        selectedReward.status === "completed"
          ? ExchangeRequestStatus.COMPLETED
          : selectedReward.status === "rejected"
            ? ExchangeRequestStatus.REJECTED
            : ExchangeRequestStatus.PENDING,
      created_at: selectedReward.created_at,
    };
  }, [selectedReward]);

  const handleOpenDetail = (reward: DashboardPendingRewardItem) => {
    setSelectedReward(reward);
    setIsModalOpen(true);
  };

  const handleCloseDetail = () => {
    setIsModalOpen(false);
    setSelectedReward(null);
  };

  // Render badge type món quà (Đồng bộ chuẩn 100% style cột Hình thức trong TeacherRewardsTable)
  const renderChoiceTypeBadge = (choiceType: string) => {
    if (choiceType === "cash") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[11px] font-bold whitespace-nowrap">
          <Banknote className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Tiền mặt</span>
        </span>
      );
    }
    if (choiceType === "spin_gift") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-purple-50 text-purple-700 border border-purple-200/80 text-[11px] font-bold whitespace-nowrap">
          <Gift className="w-3.5 h-3.5 text-purple-600 shrink-0" />
          <span>Quà tuỳ chọn (Spin)</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-orange-50 text-orange-700 border border-orange-200/80 text-[11px] font-bold whitespace-nowrap">
        <ShoppingBag className="w-3.5 h-3.5 text-orange-600 shrink-0" />
        <span>Quà tuỳ chọn</span>
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-2xs">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold border border-rose-100">
            <Gift className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#0F172A]">
              Quà chờ duyệt ({pendingRewards.length})
            </h2>
            <p className="text-[11px] text-slate-500">
              Đổi quà Heo Đất & phần thưởng vòng quay
            </p>
          </div>
        </div>

        <Link
          href={AppRoutes.TEACHER.REWARDS}
          className="text-xs font-bold text-[#0A62D6] hover:text-[#0850B0] flex items-center gap-0.5"
        >
          <span>Quản lý</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Danh sách quà (Chỉ hiển thị các phần quà chưa được duyệt - pending) */}
      {pendingRewards.length === 0 ? (
        <div className="py-6 text-center text-slate-400">
          <p className="text-xs font-medium">
            Hiện không có phần quà nào chờ trao.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {pendingRewards.map((reward) => {
            return (
              <div
                key={reward.id}
                className="p-3 rounded-xl border transition-all flex items-center justify-between gap-2.5 bg-slate-50/70 hover:bg-white border-slate-200/80 hover:shadow-2xs"
              >
                {/* Phần trái: Avatar + Tên học sinh + Quy đổi + Badge hình thức */}
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
                    {/* 1. Tên học sinh */}
                    <span className="text-xs font-bold text-[#0F172A] block truncate">
                      {reward.student_name}
                    </span>

                    {/* 2. Thông tin quy đổi (-xu -> VNĐ) */}
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-600 mt-0.5">
                      <span className="text-[10px] text-slate-400 font-normal">
                        Quy đổi:
                      </span>
                      <div className="inline-flex items-center gap-0.5">
                        <Image
                          src="/wheel/coin.webp"
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

                    {/* 3. Badge hình thức thống nhất nằm dưới quy đổi */}
                    <div className="mt-1.5">
                      {renderChoiceTypeBadge(reward.choice_type)}
                    </div>
                  </div>
                </div>

                {/* Phần phải: Nút Xem chi tiết để mở popup duyệt */}
                <div className="shrink-0 flex items-center">
                  <button
                    type="button"
                    onClick={() => handleOpenDetail(reward)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 active:scale-95 text-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    <span>Xem</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Popup chi tiết yêu cầu đổi thưởng (Tái sử dụng TeacherRewardDetailModal, duyệt trực tiếp) */}
      <TeacherRewardDetailModal
        key={selectedReward?.id ?? "empty"}
        isOpen={isModalOpen}
        onClose={handleCloseDetail}
        request={selectedExchangeRequest}
        onApproveAndDeliver={(req) => {
          onHandoverReward(req.id);
          handleCloseDetail();
        }}
        onReject={(req) => {
          if (onRejectReward) {
            onRejectReward(req.id);
          }
          handleCloseDetail();
        }}
      />
    </div>
  );
}
