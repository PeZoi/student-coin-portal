import { create } from "zustand";
import { Mission, StudentProfile } from "@/features/dashboard/types";
import { initialMissions, initialStudent } from "@/features/dashboard/data/initialData";

interface UserState {
  student: StudentProfile;
  missions: Mission[];
  addCoins: (amount: number) => void;
  deductCoins: (amount: number) => boolean;
}

export const useUserStore = create<UserState>((set, get) => ({
  student: initialStudent,
  missions: initialMissions,
  addCoins: (amount: number) => {
    set((state) => ({
      student: {
        ...state.student,
        currentCoins: state.student.currentCoins + amount,
      },
    }));
  },
  deductCoins: (amount: number) => {
    const current = get().student.currentCoins;
    if (current < amount) return false;
    set((state) => ({
      student: {
        ...state.student,
        currentCoins: state.student.currentCoins - amount,
      },
    }));
    return true;
  },
}));
