import { create } from "zustand";
import { Mission, StudentProfile } from "@/features/dashboard/types";
import { initialMissions, initialStudent } from "@/features/dashboard/data/initialData";

interface UserState {
  student: StudentProfile;
  missions: Mission[];
  addCoins: (amount: number) => void;
  deductCoins: (amount: number) => boolean;
  setStudent: (student: Partial<StudentProfile>) => void;
  loginStudent: (phone_zalo: string, pin_number: string) => boolean;
  registerStudent: (data: { full_name: string; class_id: string; phone_zalo: string; pin_number: string; avatar_url?: string }) => boolean;
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
  setStudent: (updatedProfile) => {
    set((state) => ({
      student: {
        ...state.student,
        ...updatedProfile,
      },
    }));
  },
  loginStudent: (phone_zalo, _pin_number) => {
    set((state) => ({
      student: {
        ...state.student,
        name: phone_zalo.trim() ? `Bé (${phone_zalo.slice(-4)})` : state.student.name,
      },
    }));
    return true;
  },
  registerStudent: (data) => {
    set((state) => ({
      student: {
        ...state.student,
        name: data.full_name,
        classGroup: data.class_id,
        avatarUrl: data.avatar_url || state.student.avatarUrl,
        piggyTitle: `HEO ĐẤT CỦA ${data.full_name.toUpperCase()}`,
        currentCoins: 50,
      },
    }));
    return true;
  },
}));
