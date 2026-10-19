import { create } from "zustand";
import { toast } from "sonner";
import { Mission, StudentProfile } from "@/features/dashboard/types";
import { initialMissions, initialStudent } from "@/features/dashboard/data/initialData";

interface UserState {
  student: StudentProfile;
  missions: Mission[];
  selectedMission: Mission | null;
  isModalOpen: boolean;
  
  // Actions
  openSubmitModal: (mission: Mission) => void;
  closeSubmitModal: () => void;
  submitMission: (missionId: string, proof?: string) => void;
  addCoins: (amount: number, reason?: string) => void;
  spinLuckyWheel: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  student: initialStudent,
  missions: initialMissions,
  selectedMission: null,
  isModalOpen: false,

  openSubmitModal: (mission: Mission) => {
    set({ selectedMission: mission, isModalOpen: true });
  },

  closeSubmitModal: () => {
    set({ selectedMission: null, isModalOpen: false });
  },

  submitMission: (missionId: string) => {
    const { missions, student } = get();
    const mission = missions.find((m) => m.id === missionId);

    if (!mission) return;

    const reward = mission.rewardCoins;
    const newCoins = student.currentCoins + reward;

    set({
      student: {
        ...student,
        currentCoins: newCoins,
      },
      missions: missions.map((m) =>
        m.id === missionId ? { ...m, status: "completed" as const } : m
      ),
      isModalOpen: false,
      selectedMission: null,
    });

    toast.success(`Chúc mừng Gia Bảo! Bạn đã nhận được +${reward} xu 🎉`, {
      description: `Đã hoàn thành: "${mission.title}"`,
      duration: 3500,
    });
  },

  addCoins: (amount: number, reason = "Thưởng hoàn thành nhiệm vụ") => {
    set((state) => ({
      student: {
        ...state.student,
        currentCoins: state.student.currentCoins + amount,
      },
    }));
    toast.success(`+${amount} xu! ${reason}`);
  },

  spinLuckyWheel: () => {
    const rewards = [10, 20, 30, 50, 100];
    const wonReward = rewards[Math.floor(Math.random() * rewards.length)];
    
    get().addCoins(wonReward, "Vòng quay may mắn trúng thưởng! 🎡");
  },
}));
