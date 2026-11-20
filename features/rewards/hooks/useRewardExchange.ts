"use client";

import { useUserStore } from "@/stores/useUserStore";
import { useConfigStore } from "@/stores/useConfigStore";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { COIN_STEP, VND_PER_STEP, ExchangeChoiceType } from "@/constants/rewards";
import { rewardExchangeService } from "../services/rewardExchangeService";

export { COIN_STEP, VND_PER_STEP };

export function useRewardExchange() {
  const { student, setStudent } = useUserStore();
  const { configs } = useConfigStore();

  // Lấy cấu hình động từ exchange_setting (tải từ API /api/system/config mỗi lần F5)
  const stepCoins = configs?.exchange_setting?.step_coins ?? COIN_STEP;
  const vndPerStep = configs?.exchange_setting?.vnd_per_step ?? VND_PER_STEP;
  const minExchangeCoins =
    configs?.exchange_setting?.min_exchange_coins ?? stepCoins;

  // State điều khiển mở popup / modal
  const [isCashModalOpen, setIsCashModalOpen] = useState(false);
  const [isShopeeModalOpen, setIsShopeeModalOpen] = useState(false);

  // Trạng thái đang gửi yêu cầu
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Học sinh có đủ số xu tối thiểu để đổi thưởng không
  const currentCoins = student?.current_coins ?? 0;
  const canExchange = currentCoins >= minExchangeCoins;

  // Xác nhận đổi tiền mặt trong popup
  const handleConfirmCashExchange = useCallback(
    async (coinsToExchange: number) => {
      if (coinsToExchange < minExchangeCoins) {
        toast.error(
          `Số xu tối thiểu để đổi là ${minExchangeCoins.toLocaleString("vi-VN")} xu!`
        );
        return false;
      }

      if (coinsToExchange % stepCoins !== 0) {
        toast.error(
          `Số xu đổi phải là bội số của ${stepCoins.toLocaleString("vi-VN")} xu!`
        );
        return false;
      }

      if (currentCoins < coinsToExchange) {
        toast.error(
          `Con không đủ ${coinsToExchange.toLocaleString("vi-VN")} xu. Hiện tại con đang có ${currentCoins.toLocaleString("vi-VN")} xu!`
        );
        return false;
      }

      setIsSubmitting(true);
      try {
        const result = await rewardExchangeService.submitExchange({
          choiceType: ExchangeChoiceType.CASH,
          coinsToExchange,
        });

        setStudent({ current_coins: result.current_coins });

        toast.success(
          `🎉 Đã gửi yêu cầu đổi ${result.amount_vnd.toLocaleString("vi-VN")}đ tiền mặt thành công! Cô sẽ sớm trao cho con nhé!`
        );
        setIsCashModalOpen(false);
        return true;
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error(String(err));
        toast.error(
          error.message || "Không thể gửi yêu cầu lúc này, vui lòng thử lại!"
        );
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [currentCoins, minExchangeCoins, setStudent, stepCoins]
  );

  // Xác nhận đổi quà tự chọn trong popup (tự động tính số xu theo config động)
  const handleConfirmShopeeExchange = useCallback(
    async (
      link: string,
      giftNote: string = "",
      itemPriceVnd?: number,
      coinsToExchange?: number
    ) => {
      const trimmedLink = link.trim();

      if (!trimmedLink) {
        toast.warning("Con hãy dán link món quà con muốn đổi nhé!");
        return false;
      }

      if (!itemPriceVnd || itemPriceVnd <= 0) {
        toast.warning("Con hãy nhập giá tiền hợp lệ của món quà nhé!");
        return false;
      }

      // Tính số xu cần chính xác theo tỷ giá (không làm tròn theo step để không gây thiệt cho học sinh)
      const coinsNeeded =
        coinsToExchange && coinsToExchange > 0
          ? coinsToExchange
          : Math.ceil((itemPriceVnd * stepCoins) / vndPerStep);

      if (currentCoins < coinsNeeded) {
        toast.error(
          `Con không đủ ${coinsNeeded.toLocaleString("vi-VN")} xu để đổi món quà này! Con đang có ${currentCoins.toLocaleString("vi-VN")} xu.`
        );
        return false;
      }

      setIsSubmitting(true);
      try {
        const trimmedNote = giftNote.trim();
        const result = await rewardExchangeService.submitExchange({
          choiceType: ExchangeChoiceType.GIFT,
          link: trimmedLink,
          priceVnd: Math.round(itemPriceVnd),
          note: trimmedNote || undefined,
        });

        setStudent({ current_coins: result.current_coins });

        const priceInfo = ` (trị giá ${result.amount_vnd.toLocaleString("vi-VN")}đ)`;
        const noteInfo = trimmedNote ? ` - Ghi chú: ${trimmedNote}` : "";

        toast.success(
          `🎉 Đã đổi ${result.coins_to_exchange.toLocaleString("vi-VN")} xu thành quà${priceInfo} thành công! Cô sẽ kiểm tra và trao quà cho con nhé!${noteInfo}`
        );
        setIsShopeeModalOpen(false);
        return true;
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error(String(err));
        toast.error(
          error.message || "Không thể gửi yêu cầu lúc này, vui lòng thử lại!"
        );
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [currentCoins, setStudent, stepCoins, vndPerStep]
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
    coinStep: stepCoins,
    vndPerStep,
    minExchangeCoins,
  };
}
