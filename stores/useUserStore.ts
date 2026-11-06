import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Mission, StudentProfile } from "@/features/dashboard/types";
import { initialMissions } from "@/features/dashboard/data/initialData";
import { getDisplayName } from "@/lib/utils";
import { authService } from "@/features/auth/services/authService";
import { useConfigStore } from "./useConfigStore";

export interface StudentSessionPayload {
  id?: string;
  full_name: string;
  phone_zalo: string;
  avatar_url?: string | null;
  current_coins?: number;
  class_name?: string | null;
  role?: string;
}

/**
 * Hàm tiện ích chuyển đổi dữ liệu từ API thành StudentProfile hoàn chỉnh
 */
export function buildStudentProfile(payload: StudentSessionPayload): StudentProfile {
  const displayName = getDisplayName(payload.full_name);
  const piggyTitle = `HEO ĐẤT CỦA ${displayName.toUpperCase()}`;
  const avatar = payload.avatar_url || "/avatar.jpg";
  const coins = payload.current_coins ?? 0;
  const className = payload.class_name || "Lớp học";

  return {
    id: payload.id,
    full_name: payload.full_name,
    display_name: displayName,
    phone_zalo: payload.phone_zalo,
    avatar_url: avatar,
    current_coins: coins,
    class_name: className,
    role: payload.role || "student",
    piggy_title: piggyTitle,
    next_tier_coins: 100,
    next_tier_title: "Heo Đất Nhỏ",
  };
}

interface UserState {
  student: StudentProfile | null;
  isLoading: boolean;
  missions: Mission[];
  addCoins: (amount: number) => void;
  deductCoins: (amount: number) => boolean;
  setStudent: (student: Partial<StudentProfile>) => void;
  loginStudent: (payload: StudentSessionPayload | string) => boolean;
  fetchCurrentUser: () => Promise<boolean>;
  logout: () => Promise<void>;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      student: null,
      isLoading: true,
      missions: initialMissions,

      addCoins: (amount: number) => {
        set((state) => {
          if (!state.student) return state;
          const nextCoins = (state.student.current_coins ?? 0) + amount;
          return {
            student: {
              ...state.student,
              current_coins: nextCoins,
            },
          };
        });
      },

      deductCoins: (amount: number) => {
        const currentStudent = get().student;
        if (!currentStudent) return false;

        const current = currentStudent.current_coins ?? 0;
        if (current < amount) return false;

        const nextCoins = current - amount;
        set((state) => {
          if (!state.student) return state;
          return {
            student: {
              ...state.student,
              current_coins: nextCoins,
            },
          };
        });
        return true;
      },

      setStudent: (updatedProfile) => {
        set((state) => {
          if (!state.student) return state;
          return {
            student: {
              ...state.student,
              ...updatedProfile,
            },
          };
        });
      },

      loginStudent: (payload) => {
        if (typeof payload === "string") {
          const cleanPhone = payload.trim();
          const shortName = cleanPhone ? `Bé (${cleanPhone.slice(-4)})` : "Học sinh";
          const profile = buildStudentProfile({
            full_name: shortName,
            phone_zalo: cleanPhone,
          });
          set({ student: profile, isLoading: false });
          return true;
        }

        const profile = buildStudentProfile(payload);
        set({ student: profile, isLoading: false });
        return true;
      },

      fetchCurrentUser: async () => {
        // Không set isLoading = true nếu đã có student trong cache để tránh layout shift
        if (!get().student) {
          set({ isLoading: true });
        }
        try {
          const userData = await authService.getCurrentUser();
          if (userData) {
            const profile = buildStudentProfile(userData);
            set({ student: profile, isLoading: false });
            return true;
          }
          set({ student: null, isLoading: false });
          useUserStore.persist?.clearStorage();
          useConfigStore.getState().clearConfigs();
          return false;
        } catch {
          // Nếu lỗi mạng tạm thời mà đang có cached student thì vẫn giữ cached student
          set({ isLoading: false });
          return false;
        }
      },

      logout: async () => {
        try {
          await authService.logout();
        } finally {
          set({ student: null, isLoading: false });
          useUserStore.persist?.clearStorage();
          useConfigStore.getState().clearConfigs();
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
        }
      },
    }),
    {
      name: "student_profile_storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ student: state.student }),
      skipHydration: true, // Kiểm soát hydration bằng UserInitializer để tránh Hydration Mismatch trên Next.js SSR
    }
  )
);
