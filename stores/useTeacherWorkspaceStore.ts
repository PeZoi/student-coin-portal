import { create } from "zustand";
import { persist } from "zustand/middleware";
import { TeacherAssignedClassItem } from "@/features/teacher/class-management/types";
import { teacherClassService } from "@/features/teacher/class-management/services/classService";

interface TeacherWorkspaceState {
  classes: TeacherAssignedClassItem[];
  selectedClassId: string | null;
  isLoading: boolean;
  error: string | null;
  setSelectedClassId: (id: string) => void;
  fetchMyClasses: () => Promise<void>;
  getSelectedClass: () => TeacherAssignedClassItem | null;
  resetWorkspace: () => void;
}

export const TEACHER_WORKSPACE_COOKIE_NAME = "teacher_selected_class_id";

function syncWorkspaceClassCookie(classId: string | null) {
  if (typeof document === "undefined") return;
  if (classId) {
    document.cookie = `${TEACHER_WORKSPACE_COOKIE_NAME}=${classId}; path=/; max-age=31536000; SameSite=Lax`;
  } else {
    document.cookie = `${TEACHER_WORKSPACE_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
  }
}

/**
 * Store quản lý không gian làm việc (Workspace / Lớp phụ trách) của Giáo viên & Quản trị viên
 * - Tự động ghi nhớ lớp học đang chọn vào localStorage (persist)
 * - Tự động đồng bộ cookie teacher_selected_class_id để Server Components đọc được trực tiếp
 * - Tự động đồng bộ danh sách lớp học theo phân quyền (/api/teacher/my-classes)
 */
export const useTeacherWorkspaceStore = create<TeacherWorkspaceState>()(
  persist(
    (set, get) => ({
      classes: [],
      selectedClassId: null,
      isLoading: false,
      error: null,

      setSelectedClassId: (id: string) => {
        set({ selectedClassId: id });
        syncWorkspaceClassCookie(id);
      },

      fetchMyClasses: async () => {
        set({ isLoading: true, error: null });
        try {
          const list = await teacherClassService.getMyClasses();
          const currentId = get().selectedClassId;

          // Nếu lớp đang chọn trước đó vẫn hợp lệ thì giữ nguyên,
          // ngược lại tự động chọn lớp đầu tiên trong danh sách
          const isValidCurrent = list.some((c) => c.id === currentId);
          const nextSelectedId = isValidCurrent
            ? currentId
            : list.length > 0
            ? list[0].id
            : null;

          set({
            classes: list,
            selectedClassId: nextSelectedId,
            isLoading: false,
          });
          syncWorkspaceClassCookie(nextSelectedId);
        } catch (err: unknown) {
          const error = err instanceof Error ? err : new Error(String(err));
          set({ error: error.message, isLoading: false });
        }
      },

      getSelectedClass: () => {
        const { classes, selectedClassId } = get();
        return classes.find((c) => c.id === selectedClassId) || null;
      },

      resetWorkspace: () => {
        set({ classes: [], selectedClassId: null, error: null, isLoading: false });
        syncWorkspaceClassCookie(null);
        useTeacherWorkspaceStore.persist?.clearStorage();
      },
    }),
    {
      name: "teacher-workspace-storage",
      partialize: (state) => ({ selectedClassId: state.selectedClassId }),
      onRehydrateStorage: () => (state) => {
        if (state?.selectedClassId) {
          syncWorkspaceClassCookie(state.selectedClassId);
        }
      },
    }
  )
);
