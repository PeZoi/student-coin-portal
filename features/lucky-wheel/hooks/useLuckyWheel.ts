import { useState, useRef, useCallback, useMemo } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { useUserStore } from "@/stores/useUserStore";
import { CACHE_KEYS } from "@/constants";
import {
  WHEEL_CONSTANTS,
  WHEEL_PRIZE_TYPES,
  WHEEL_ASSETS,
} from "@/constants/wheel";
import {
  WheelPrize,
  WheelWinner,
  WheelConfig,
  StudentWheelInitialData,
  SpinWheelPayload,
} from "../types";
import {
  defaultWheelConfig,
  getWheelRules,
} from "../data/wheelData";
import { wheelAudio } from "../audio/wheelAudio";
import { luckyWheelService } from "../services/luckyWheelService";

export function useLuckyWheel(
  initialData?: StudentWheelInitialData,
  customConfig?: Partial<WheelConfig>
) {
  const { student, setStudent } = useUserStore();

  const { data: swrData, mutate } = useSWR(
    CACHE_KEYS.WHEEL.STUDENT_DATA,
    () => luckyWheelService.getWheelData(),
    {
      fallbackData: initialData ?? null,
      revalidateOnMount: initialData ? false : true,
      revalidateIfStale: !initialData,
      revalidateOnFocus: false,
    }
  );

  const wheelData = swrData ?? initialData;

  const config: WheelConfig = useMemo(() => {
    const baseCfg = wheelData?.config || defaultWheelConfig;
    return {
      ...baseCfg,
      ...customConfig,
      prizes: customConfig?.prizes || baseCfg.prizes || [],
    };
  }, [wheelData?.config, customConfig]);

  const rules = useMemo(() => getWheelRules(config), [config]);

  const [rotation, setRotation] = useState<number>(0);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [winningPrize, setWinningPrize] = useState<WheelPrize | null>(null);
  const [showPrizeModal, setShowPrizeModal] = useState<boolean>(false);

  const [localFreeSpins, setLocalFreeSpins] = useState<number | null>(null);
  const [localWinners, setLocalWinners] = useState<WheelWinner[]>([]);
  const [localMyHistory, setLocalMyHistory] = useState<WheelWinner[]>([]);

  const freeSpinsLeft =
    localFreeSpins !== null
      ? localFreeSpins
      : (wheelData?.free_spins ?? 0);

  const winners = useMemo(() => {
    const serverWinners = wheelData?.allWinners || [];
    const existingIds = new Set(localWinners.map((w) => w.id));
    return [
      ...localWinners,
      ...serverWinners.filter((w) => !existingIds.has(w.id)),
    ];
  }, [localWinners, wheelData?.allWinners]);

  const myHistory = useMemo(() => {
    const serverHistory = wheelData?.myHistory || [];
    const existingIds = new Set(localMyHistory.map((w) => w.id));
    return [
      ...localMyHistory,
      ...serverHistory.filter((w) => !existingIds.has(w.id)),
    ];
  }, [localMyHistory, wheelData?.myHistory]);

  const currentCoins =
    student?.current_coins ?? wheelData?.current_coins ?? 0;

  const currentRotationRef = useRef<number>(0);
  const isProcessingSpinRef = useRef<boolean>(false);

  // Xử lý bắt đầu quay: Khởi động tức thì (0ms Latency) và gọi Server API ngầm
  const handleSpin = useCallback(async (): Promise<SpinWheelPayload | null> => {
    if (isSpinning || isProcessingSpinRef.current) return null;

    if (config.is_maintenance) {
      wheelAudio.playError();
      toast.error(
        "Vòng quay may mắn hiện đang tạm dừng bảo trì. Bé vui lòng quay lại sau nhé!"
      );
      return null;
    }

    if (config.prizes.length < WHEEL_CONSTANTS.MIN_SLOTS) {
      wheelAudio.playError();
      toast.error(
        "Vòng quay hiện đang được giáo viên cập nhật phần thưởng. Bé vui lòng quay lại sau nhé!"
      );
      return null;
    }

    const isFree = freeSpinsLeft > 0;
    if (!isFree && currentCoins < config.spin_cost) {
      wheelAudio.playError();
      toast.error(
        `Bạn cần ít nhất ${config.spin_cost.toLocaleString("vi-VN")} xu để quay lượt này! Hãy làm bài tập để tích lũy thêm xu nhé!`
      );
      return null;
    }

    // 1. Phản hồi tức thì ngay tại millisecond đầu tiên (0ms Latency)
    isProcessingSpinRef.current = true;
    wheelAudio.unlock();
    wheelAudio.playSpinStart();
    setIsSpinning(true);
    setWinningPrize(null);

    // 2. Trừ số dư hiển thị tức thì (Optimistic UI)
    if (isFree) {
      setLocalFreeSpins(Math.max(0, freeSpinsLeft - 1));
    } else {
      setStudent({
        current_coins: Math.max(0, currentCoins - config.spin_cost),
      });
    }

    try {
      // 3. Gọi Server API ngầm trong lúc đĩa quay đang tăng tốc
      const clientSlotIds = config.prizes.map((p) => p.id);
      const response = await luckyWheelService.spinWheel(clientSlotIds);

      // Nếu giáo viên vừa thay đổi cơ cấu giải thưởng trong lúc học sinh đang mở trang
      if (response.config_changed && response.updated_data) {
        isProcessingSpinRef.current = false;
        setIsSpinning(false);
        await mutate(response.updated_data, false);
        toast.info(
          "Giáo viên vừa cập nhật cơ cấu giải thưởng mới! Đĩa quay đã được làm mới, bé hãy bấm quay lại nhé!"
        );
        return { prizeIndex: 0, configChanged: true };
      }

      const prizeIndex = response.prize_index ?? 0;
      const selectedPrize =
        response.winning_prize || config.prizes[prizeIndex];
      const spinResult = response.spin_result;

      if (!selectedPrize || !spinResult) {
        throw new Error("Không thể lấy kết quả vòng quay. Vui lòng thử lại!");
      }

      return {
        prizeIndex,
        winningPrize: selectedPrize,
        spinResult,
      };
    } catch (err: unknown) {
      isProcessingSpinRef.current = false;
      setIsSpinning(false);
      wheelAudio.playError();
      // Hoàn trả số dư optimistic nếu xảy ra lỗi
      if (isFree) {
        setLocalFreeSpins(freeSpinsLeft);
      } else {
        setStudent({ current_coins: currentCoins });
      }
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(error.message || "Không thể thực hiện lượt quay lúc này.");
      throw error;
    }
  }, [
    isSpinning,
    config,
    freeSpinsLeft,
    currentCoins,
    setStudent,
    mutate,
  ]);

  // Xử lý khi đĩa quay đã hãm phanh dừng lại chính xác tại ô trúng thưởng
  const handleSpinComplete = useCallback(
    (payload?: SpinWheelPayload) => {
      setIsSpinning(false);
      isProcessingSpinRef.current = false;

      // Giữ nguyên góc quay tại vị trí ô trúng thưởng
      if (typeof payload?.finalAngle === "number") {
        currentRotationRef.current = payload.finalAngle;
        setRotation(payload.finalAngle);
      }

      if (!payload || !payload.winningPrize || !payload.spinResult) {
        return;
      }

      const { winningPrize: selectedPrize, spinResult } = payload;
      setWinningPrize(selectedPrize);
      setShowPrizeModal(true);

      // Đồng bộ số dư xu và lượt quay cuối cùng từ CSDL
      setStudent({
        current_coins: spinResult.current_coins,
      });
      setLocalFreeSpins(spinResult.free_spins);

      if (wheelData) {
        mutate(
          {
            ...wheelData,
            current_coins: spinResult.current_coins,
            free_spins: spinResult.free_spins,
          },
          false
        );
      }

      // Thông báo toast theo loại giải thưởng
      if (selectedPrize.prize_type === WHEEL_PRIZE_TYPES.LUCK) {
        toast.info(
          "Lần này may mắn chưa mỉm cười, chúc bạn may mắn ở lượt tiếp theo nhé!"
        );
      } else if (selectedPrize.prize_type === WHEEL_PRIZE_TYPES.DEDUCT_COIN) {
        toast.warning(`Ôi tiếc quá! Bạn quay vào ô "${selectedPrize.label}".`);
      } else {
        toast.success(`🎉 Chúc mừng bạn đã trúng ${selectedPrize.label}!`);
      }

      const newWinner: WheelWinner = {
        id: spinResult.spin_id,
        student_name: student?.display_name || "Bạn",
        class_name: student?.class_name || "Lớp học",
        avatar_url: student?.avatar_url || WHEEL_ASSETS.DEFAULT_AVATAR,
        prize_label_snapshot: selectedPrize.label,
        prize_type_snapshot: selectedPrize.prize_type,
        reward_coins: spinResult.actual_reward_coins,
        reward_free_spins: spinResult.actual_reward_free_spins,
        created_at: "Vừa xong",
      };

      setLocalWinners((prev) => [newWinner, ...prev]);
      setLocalMyHistory((prev) => [newWinner, ...prev]);
    },
    [student, setStudent, mutate, wheelData]
  );

  const handleClosePrizeModal = useCallback(() => {
    wheelAudio.stopReward();
    setShowPrizeModal(false);
  }, []);

  return {
    config,
    prizes: config.prizes,
    rules,
    spinCost: config.spin_cost,
    allowFreeSpin: config.allow_free_spin,
    rotation,
    isSpinning,
    winningPrize,
    showPrizeModal,
    freeSpinsLeft,
    winners,
    myHistory,
    currentCoins,
    handleSpin,
    handleSpinComplete,
    handleClosePrizeModal,
  };
}
