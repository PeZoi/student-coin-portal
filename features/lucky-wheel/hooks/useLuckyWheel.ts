import { useState, useRef, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { useUserStore } from "@/stores/useUserStore";
import { WheelPrize, WheelWinner, WheelConfig } from "../types";
import { defaultWheelConfig, initialWinners, initialMyHistory, getWheelRules } from "../data/wheelData";

export function useLuckyWheel(customConfig?: Partial<WheelConfig>) {
  const { student, addCoins, deductCoins } = useUserStore();

  // Cấu hình động: Giáo viên có thể tùy biến chi phí (ví dụ: 500 xu), bật/tắt quay miễn phí, danh sách vật phẩm & tỷ lệ
  const config: WheelConfig = useMemo(() => {
    return {
      ...defaultWheelConfig,
      ...customConfig,
      prizes: customConfig?.prizes || defaultWheelConfig.prizes,
    };
  }, [customConfig]);

  const rules = useMemo(() => getWheelRules(config), [config]);

  const [rotation, setRotation] = useState<number>(0);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [winningPrize, setWinningPrize] = useState<WheelPrize | null>(null);
  const [showPrizeModal, setShowPrizeModal] = useState<boolean>(false);

  // Nếu không cho phép quay miễn phí (allowFreeSpin = false), khởi tạo số lượt free = 0
  const [freeSpinsLeft, setFreeSpinsLeft] = useState<number>(
    config.allowFreeSpin ? config.dailyFreeSpins : 0
  );
  const [winners, setWinners] = useState<WheelWinner[]>(initialWinners);
  const [myHistory, setMyHistory] = useState<WheelWinner[]>(initialMyHistory);

  const currentRotationRef = useRef<number>(0);

  // Chọn giải thưởng theo trọng số xác suất động (Weighted Random dựa trên config.prizes)
  const getRandomPrizeIndex = useCallback((): number => {
    const totalWeight = config.prizes.reduce((sum, p) => sum + p.probabilityWeight, 0);
    let randomNum = Math.random() * totalWeight;

    for (let i = 0; i < config.prizes.length; i++) {
      if (randomNum < config.prizes[i].probabilityWeight) {
        return i;
      }
      randomNum -= config.prizes[i].probabilityWeight;
    }
    return 0;
  }, [config.prizes]);

  // Xử lý quay vòng quay
  const handleSpin = useCallback(() => {
    if (isSpinning) return;

    // 1. Kiểm tra lượt quay miễn phí hoặc trừ xu theo config
    const isFree = config.allowFreeSpin && freeSpinsLeft > 0;
    if (isFree) {
      setFreeSpinsLeft((prev) => Math.max(0, prev - 1));
    } else {
      if (student.currentCoins < config.spinCost) {
        toast.error(
          `Bạn cần ít nhất ${config.spinCost.toLocaleString("vi-VN")} xu để quay lượt này! Hãy làm bài tập để tích lũy thêm xu nhé!`
        );
        return;
      }
      const deducted = deductCoins(config.spinCost);
      if (!deducted) {
        toast.error("Không đủ xu trong tài khoản Heo Đất!");
        return;
      }
    }

    setIsSpinning(true);
    setWinningPrize(null);

    // 2. Chọn giải thưởng ngẫu nhiên theo tỷ lệ động
    const prizeIndex = getRandomPrizeIndex();
    const selectedPrize = config.prizes[prizeIndex];

    // 3. Tính toán góc quay
    // Mỗi ô chiếm (360 / số vật phẩm) độ, tâm của ô thứ i nằm tại góc (i * segmentAngle + segmentAngle / 2) độ.
    // Khi kim ở đỉnh (0 độ), để trúng ô index i thì đĩa quay phải dừng ở: (360 - midAngle) % 360
    const segmentAngle = 360 / config.prizes.length;
    const midAngle = prizeIndex * segmentAngle + segmentAngle / 2;
    const targetOffset = (360 - midAngle) % 360;

    // Độ lệch ngẫu nhiên trong khoảng an toàn (-10 đến +10 độ) để kim rơi tự nhiên bên trong nan
    const randomJitter = (Math.random() - 0.5) * 20;

    // Quay thêm từ 5 đến 7 vòng đầy đủ
    const extraRounds = (5 + Math.floor(Math.random() * 3)) * 360;

    // Tính góc quay mới (luôn quay tiếp về phía trước so với góc hiện tại)
    const currentBase = Math.floor(currentRotationRef.current / 360) * 360;
    const nextRotation = currentBase + extraRounds + targetOffset + randomJitter;

    currentRotationRef.current = nextRotation;
    setRotation(nextRotation);

    // 4. Kết thúc sau khi quay xong (5.4 giây)
    setTimeout(() => {
      setIsSpinning(false);
      setWinningPrize(selectedPrize);
      setShowPrizeModal(true);

      // Cộng xu trúng thưởng vào Heo Đất
      if (selectedPrize.rewardCoins > 0) {
        addCoins(selectedPrize.rewardCoins);
      }

      // Thông báo toast
      if (selectedPrize.type === "luck") {
        toast.info("Lần này may mắn chưa mỉm cười, bạn nhận được 5 xu khích lệ nhé! Cố lên!");
      } else {
        toast.success(`🎉 Chúc mừng bạn đã trúng ${selectedPrize.label}!`);
      }

      // Thêm học sinh hiện tại vào danh sách người vừa trúng
      const newWinner: WheelWinner = {
        id: `win-${Date.now()}`,
        studentName: student.name || "Bạn",
        classGroup: student.classGroup || "Lớp 5A",
        avatarUrl: student.avatarUrl || "/avatar.jpg",
        prizeLabel: selectedPrize.label,
        rewardCoins: selectedPrize.rewardCoins,
        wonAt: "Vừa xong",
      };

      setWinners((prev) => [newWinner, ...prev]);
      setMyHistory((prev) => [newWinner, ...prev]);
    }, 5400);
  }, [
    isSpinning,
    config,
    freeSpinsLeft,
    student,
    deductCoins,
    addCoins,
    getRandomPrizeIndex,
  ]);

  // Đóng modal nhận thưởng
  const handleClosePrizeModal = useCallback(() => {
    setShowPrizeModal(false);
  }, []);

  return {
    config,
    prizes: config.prizes,
    rules,
    spinCost: config.spinCost,
    allowFreeSpin: config.allowFreeSpin,
    rotation,
    isSpinning,
    winningPrize,
    showPrizeModal,
    freeSpinsLeft,
    winners,
    myHistory,
    currentCoins: student.currentCoins,
    handleSpin,
    handleClosePrizeModal,
  };
}
