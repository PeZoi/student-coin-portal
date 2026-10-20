import { create } from "zustand";
import { Mission, StudentProfile } from "@/features/dashboard/types";
import { initialMissions, initialStudent } from "@/features/dashboard/data/initialData";

interface UserState {
  student: StudentProfile;
  missions: Mission[];
}

export const useUserStore = create<UserState>(() => ({
  student: initialStudent,
  missions: initialMissions,
}));
