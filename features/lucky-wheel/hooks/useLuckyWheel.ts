import { useState, useRef, useCallback, useMemo } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { useUserStore } from "@/stores/useUserStore";
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
    "student-wheel-data",
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
      : config.allow_free_spin
      ? (wheelData?.free_spins ?? 0)
      : 0;

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

  // Xử lý quay vòng quay kết nối trực tiếp Server-Authoritative API
  const handleSpin = useCallback(async () => {
    if (isSpinning || isProcessingSpinRef.current) return;

    if (config.is_maintenance) {
      wheelAudio.playError();
      toast.error(
        "Vòng quay may mắn hiện đang tạm dừng bảo trì. Bé vui lòng quay lại sau nhé!"
      );
      return;
    }

    if (config.prizes.length < WHEEL_CONSTANTS.MIN_SLOTS) {
      wheelAudio.playError();
      toast.error(
        "Vòng quay hiện đang được giáo viên cập nhật phần thưởng. Bé vui lòng quay lại sau nhé!"
      );
      return;
    }

    const isFree = config.allow_free_spin && freeSpinsLeft > 0;
    if (!isFree && currentCoins < config.spin_cost) {
      wheelAudio.playError();
      toast.error(
        `Bạn cần ít nhất ${config.spin_cost.toLocaleString("vi-VN")} xu để quay lượt này! Hãy làm bài tập để tích lũy thêm xu nhé!`
      );
      return;
    }

    // Khóa đồng bộ ngay lập tức chống Spam Click
    isProcessingSpinRef.current = true;
    wheelAudio.unlock();

    try {
      const clientSlotIds = config.prizes.map((p) => p.id);
      const response = await luckyWheelService.spinWheel(clientSlotIds);

      // Nếu giáo viên vừa thay đổi cơ cấu giải thưởng trong lúc học sinh đang mở trang (Desync Animation Guard)
      if (response.config_changed && response.updated_data) {
        isProcessingSpinRef.current = false;
        await mutate(response.updated_data, false);
        currentRotationRef.current = 0;
        setRotation(0);
        toast.info(
          "Giáo viên vừa cập nhật cơ cấu giải thưởng mới! Đĩa quay đã được làm mới, bé hãy bấm quay lại nhé!"
        );
        return;
      }

      const prizeIndex = response.prize_index ?? 0;
      const selectedPrize =
        response.winning_prize || config.prizes[prizeIndex];
      const spinResult = response.spin_result;

      if (!selectedPrize || !spinResult) {
        isProcessingSpinRef.current = false;
        toast.error("Không thể lấy kết quả vòng quay. Vui lòng thử lại!");
        return;
      }

      // Cập nhật số dư sau khi trừ phí quay (trước khi nhận thưởng lúc đĩa dừng)
      if (!spinResult.is_free_spin && spinResult.spin_cost > 0) {
        setStudent({
          current_coins: Math.max(0, currentCoins - spinResult.spin_cost),
        });
      }
      if (spinResult.is_free_spin) {
        setLocalFreeSpins(
          Math.max(0, spinResult.free_spins - spinResult.actual_reward_free_spins)
        );
      }

      wheelAudio.playSpinStart();
      setIsSpinning(true);
      setWinningPrize(null);

      // Tính toán góc dừng chính xác theo prizeIndex do Server chỉ định
      const segmentAngle = 360 / config.prizes.length;
      const midAngle = prizeIndex * segmentAngle + segmentAngle / 2;
      const targetOffset = (360 - midAngle) % 360;

      // Độ lệch ngẫu nhiên an toàn bên trong nan quạt
      const safeJitterMax = Math.min(
        WHEEL_CONSTANTS.JITTER_ANGLE_RANGE / 2,
        segmentAngle * 0.22
      );
      const randomJitter = (Math.random() - 0.5) * (safeJitterMax * 2);

      // Quay thêm từ MIN_EXTRA_ROUNDS đến MAX_EXTRA_ROUNDS vòng đầy đủ
      const extraRoundRange =
        WHEEL_CONSTANTS.MAX_EXTRA_ROUNDS - WHEEL_CONSTANTS.MIN_EXTRA_ROUNDS + 1;
      const extraRounds =
        (WHEEL_CONSTANTS.MIN_EXTRA_ROUNDS +
          Math.floor(Math.random() * extraRoundRange)) *
        360;

      const currentBase = Math.floor(currentRotationRef.current / 360) * 360;
      const nextRotation =
        currentBase + extraRounds + targetOffset + randomJitter;

      currentRotationRef.current = nextRotation;
      setRotation(nextRotation);

      // Kết thúc sau khi đĩa quay dừng (SPIN_DURATION_MS)
      setTimeout(() => {
        setIsSpinning(false);
        isProcessingSpinRef.current = false;
        setWinningPrize(selectedPrize);
        setShowPrizeModal(true);

        // Đồng bộ số dư xu và lượt quay cuối cùng từ CSDL
        setStudent({
          current_coins: spinResult.current_coins,
        });
        setLocalFreeSpins(spinResult.free_spins);

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
      }, WHEEL_CONSTANTS.SPIN_DURATION_MS);
    } catch (err: unknown) {
      isProcessingSpinRef.current = false;
      setIsSpinning(false);
      wheelAudio.playError();
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(error.message || "Không thể thực hiện lượt quay lúc này.");
    }
  }, [
    isSpinning,
    config,
    freeSpinsLeft,
    currentCoins,
    student,
    setStudent,
    mutate,
  ]);

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
    handleClosePrizeModal,
  };
}
