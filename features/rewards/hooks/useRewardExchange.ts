"use client";

import { useUserStore } from "@/stores/useUserStore";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export const COIN_STEP = 5000;
export const VND_PER_STEP = 25000;

export function useRewardExchange() {
  const { student, deductCoins } = useUserStore();

  // State điều khiển mở popup / modal
  const [isCashModalOpen, setIsCashModalOpen] = useState(false);
  const [isShopeeModalOpen, setIsShopeeModalOpen] = useState(false);

  // Trạng thái đang gửi yêu cầu
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Học sinh có ít nhất 5.000 xu không
  const canExchange = student.currentCoins >= COIN_STEP;

  // Xác nhận đổi tiền mặt trong popup
  const handleConfirmCashExchange = useCallback(
    async (coinsToExchange: number) => {
      if (coinsToExchange < COIN_STEP) {
        toast.error(`Số xu tối thiểu để đổi là ${COIN_STEP.toLocaleString("vi-VN")} xu!`);
        return false;
      }

      if (student.currentCoins < coinsToExchange) {
        toast.error(
          `Con không đủ ${coinsToExchange.toLocaleString("vi-VN")} xu. Hiện tại con đang có ${student.currentCoins.toLocaleString("vi-VN")} xu!`
        );
        return false;
      }

      setIsSubmitting(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 600));
        const success = deductCoins(coinsToExchange);

        if (success) {
          const rewardAmountVnd = (coinsToExchange / COIN_STEP) * VND_PER_STEP;
          toast.success(
            `🎉 Đã gửi yêu cầu đổi ${rewardAmountVnd.toLocaleString("vi-VN")}đ tiền mặt thành công! Cô sẽ sớm trao cho con nhé!`
          );
          setIsCashModalOpen(false);
          return true;
        } else {
          toast.error("Có lỗi xảy ra khi trừ xu, con thử lại sau nhé!");
          return false;
        }
      } catch {
        toast.error("Không thể gửi yêu cầu lúc này, vui lòng thử lại!");
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [student.currentCoins, deductCoins]
  );

  // Xác nhận đổi quà tự chọn trong popup
  const handleConfirmShopeeExchange = useCallback(
    async (
      link: string,
      giftNote: string = "",
      itemPriceVnd?: number
    ) => {
      const trimmedLink = link.trim();

      if (!trimmedLink) {
        toast.warning("Con hãy dán link món quà con muốn đổi nhé! 🎁");
        return false;
      }

      setIsSubmitting(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 600));

        const displayPrice = itemPriceVnd && itemPriceVnd > 0
          ? `${itemPriceVnd.toLocaleString("vi-VN")}đ`
          : "";
        const priceInfo = displayPrice ? ` (trị giá ${displayPrice})` : "";
        const noteInfo = giftNote.trim() ? ` - Ghi chú: ${giftNote.trim()}` : "";

        toast.success(
          `🎁 Đã gửi yêu cầu đổi quà${priceInfo} thành công! Cô sẽ kiểm tra và trao quà cho con nhé!${noteInfo}`
        );
        setIsShopeeModalOpen(false);
        return true;
      } catch {
        toast.error("Không thể gửi yêu cầu lúc này, vui lòng thử lại!");
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    []
  );

  return {
    student,
    canExchange,
    isSubmitting,
    isCashModalOpen,
    setIsCashModalOpen,
    isShopeeModalOpen,
    setIsShopeeModalOpen,
    handleConfirmCashExchange,
    handleConfirmShopeeExchange,
    coinStep: COIN_STEP,
    vndPerStep: VND_PER_STEP,
  };
}
