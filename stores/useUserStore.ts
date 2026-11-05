import { create } from "zustand";
import { Mission, StudentProfile } from "@/features/dashboard/types";
import { initialMissions, defaultStudentProfile } from "@/features/dashboard/data/initialData";
import { getDisplayName } from "@/lib/utils";

export interface StudentSessionPayload {
  id?: string;
  full_name: string;
  phone_zalo: string;
  avatar_url?: string | null;
  current_coins?: number;
  class_name?: string | null;
  role?: string;
}

interface UserState {
  student: StudentProfile;
  missions: Mission[];
  addCoins: (amount: number) => void;
  deductCoins: (amount: number) => boolean;
  setStudent: (student: Partial<StudentProfile>) => void;
  loginStudent: (payload: StudentSessionPayload | string) => boolean;
}

export const useUserStore = create<UserState>((set, get) => ({
  student: defaultStudentProfile,
  missions: initialMissions,
  addCoins: (amount: number) => {
    set((state) => {
      const nextCoins = (state.student.current_coins ?? state.student.currentCoins ?? 0) + amount;
      return {
        student: {
          ...state.student,
          current_coins: nextCoins,
          currentCoins: nextCoins,
        },
      };
    });
  },
  deductCoins: (amount: number) => {
    const current = get().student.current_coins ?? get().student.currentCoins ?? 0;
    if (current < amount) return false;
    const nextCoins = current - amount;
    set((state) => ({
      student: {
        ...state.student,
        current_coins: nextCoins,
        currentCoins: nextCoins,
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
  loginStudent: (payload) => {
    if (typeof payload === "string") {
      const cleanPhone = payload.trim();
      const shortName = cleanPhone ? `Bé (${cleanPhone.slice(-4)})` : statePhoneFallback();
      set((state) => ({
        student: {
          ...state.student,
          full_name: shortName,
          displayName: shortName,
          name: shortName,
        },
      }));
      return true;
    }

    const displayName = getDisplayName(payload.full_name);
    const piggyTitle = `HEO ĐẤT CỦA ${displayName.toUpperCase()}`;

    set((state) => {
      const avatar = payload.avatar_url || state.student.avatar_url || "/avatar.jpg";
      const coins = payload.current_coins ?? state.student.current_coins ?? 0;
      const className = payload.class_name || state.student.class_name || "Lớp học";

      return {
        student: {
          ...state.student,
          id: payload.id || state.student.id,
          full_name: payload.full_name,
          displayName,
          phone_zalo: payload.phone_zalo,
          avatar_url: avatar,
          current_coins: coins,
          class_name: className,
          role: payload.role || state.student.role || "student",
          piggy_title: piggyTitle,

          // Đồng bộ các thuộc tính tương thích ngược
          name: displayName,
          avatarUrl: avatar,
          currentCoins: coins,
          classGroup: className,
          piggyTitle,
        },
      };
    });
    return true;
  },
}));

function statePhoneFallback(): string {
  return "Học sinh";
}
