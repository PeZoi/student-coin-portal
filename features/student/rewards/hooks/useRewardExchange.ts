"use client";

import { useUserStore } from "@/stores/useUserStore";
import { useConfigStore } from "@/stores/useConfigStore";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  COIN_STEP,
  VND_PER_STEP,
  ExchangeChoiceType,
} from "@/constants/rewards";
import {
  calculateFirstValidCashCoins,
  evaluateExchangeEligibility,
  normalizeExchangeConfig,
} from "@/lib/system/exchangeRules";
import { ExchangeSettingConfig } from "@/types/systemConfig";
import { rewardExchangeService } from "../services/rewardExchangeService";

export { COIN_STEP, VND_PER_STEP };

interface UseRewardExchangeOptions {
  initialExchangeConfig?: ExchangeSettingConfig;
  currentVietnamDay?: number;
}

export function useRewardExchange(options: UseRewardExchangeOptions = {}) {
  const { initialExchangeConfig, currentVietnamDay } = options;
  const { student, setStudent } = useUserStore();
  const { configs } = useConfigStore();

  // Ưu tiên cấu hình tươi từ SSR, fallback sang client store nếu render không qua SSR
  const exchangeConfig = useMemo(
    () =>
      normalizeExchangeConfig(
        initialExchangeConfig ?? configs?.exchange_setting
      ),
    [initialExchangeConfig, configs?.exchange_setting]
  );

  const {
    step_coins: stepCoins,
    vnd_per_step: vndPerStep,
    min_exchange_coins: minExchangeCoins,
  } = exchangeConfig;

  const firstValidCashCoins = useMemo(
    () => calculateFirstValidCashCoins(exchangeConfig),
    [exchangeConfig]
  );

  // State điều khiển mở popup / modal
  const [isCashModalOpen, setIsCashModalOpen] = useState(false);
  const [isShopeeModalOpen, setIsShopeeModalOpen] = useState(false);

  // Trạng thái đang gửi yêu cầu
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Đánh giá toàn diện điều kiện mở cổng đổi quà (khung ngày + số xu tối thiểu)
  const currentCoins = student?.current_coins ?? 0;
  const eligibility = useMemo(
    () =>
      evaluateExchangeEligibility(
        exchangeConfig,
        currentCoins,
        currentVietnamDay
      ),
    [exchangeConfig, currentCoins, currentVietnamDay]
  );

  // Điều kiện riêng cho đổi tiền mặt: cần đạt mốc bội số hợp lệ đầu tiên
  const canExchangeCash =
    eligibility.canExchange && currentCoins >= firstValidCashCoins;

  // Xác nhận đổi tiền mặt trong popup
  const handleConfirmCashExchange = useCallback(
    async (coinsToExchange: number) => {
      if (!eligibility.isWindowOpen) {
        toast.error(
          eligibility.blockReason || "Cổng đổi quà hiện đang đóng!"
        );
        return false;
      }

      if (currentCoins < minExchangeCoins || coinsToExchange < minExchangeCoins) {
        toast.error(
          `Số xu tối thiểu để mở cổng đổi quà là ${minExchangeCoins.toLocaleString("vi-VN")} xu!`
        );
        return false;
      }

      if (coinsToExchange % stepCoins !== 0) {
        toast.error(
          `Số xu đổi tiền mặt phải là bội số của ${stepCoins.toLocaleString("vi-VN")} xu!`
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
    [
      currentCoins,
      eligibility.blockReason,
      eligibility.isWindowOpen,
      minExchangeCoins,
      setStudent,
      stepCoins,
    ]
  );

  // Xác nhận đổi quà tự chọn trong popup (tự động tính số xu theo tỷ giá động)
  const handleConfirmShopeeExchange = useCallback(
    async (
      link: string,
      giftNote: string = "",
      itemPriceVnd?: number,
      coinsToExchange?: number
    ) => {
      if (!eligibility.isWindowOpen) {
        toast.error(
          eligibility.blockReason || "Cổng đổi quà hiện đang đóng!"
        );
        return false;
      }

      if (!eligibility.hasEnoughCoins) {
        toast.error(
          eligibility.blockReason ||
            `Con cần có ít nhất ${minExchangeCoins.toLocaleString("vi-VN")} xu để mở cổng đổi quà!`
        );
        return false;
      }

      const trimmedLink = link.trim();

      if (!trimmedLink) {
        toast.warning("Con hãy dán link món quà con muốn đổi nhé!");
        return false;
      }

      if (!itemPriceVnd || itemPriceVnd <= 0) {
        toast.warning("Con hãy nhập giá tiền hợp lệ của món quà nhé!");
        return false;
      }

      // Tính số xu cần chính xác theo tỷ giá (không làm tròn theo mốc tiền mặt)
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
    [
      currentCoins,
      eligibility.blockReason,
      eligibility.hasEnoughCoins,
      eligibility.isWindowOpen,
      minExchangeCoins,
      setStudent,
      stepCoins,
      vndPerStep,
    ]
  );

  return {
    student,
    exchangeConfig,
    canExchange: eligibility.canExchange,
    canExchangeCash,
    isWindowOpen: eligibility.isWindowOpen,
    hasEnoughCoins: eligibility.hasEnoughCoins,
    missingCoins: eligibility.missingCoins,
    windowLabel: eligibility.windowLabel,
    blockReason: eligibility.blockReason,
    firstValidCashCoins,
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
