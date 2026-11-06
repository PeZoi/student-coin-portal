import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { SystemPublicConfigs } from "@/types/systemConfig";
import { systemConfigService } from "@/features/system/services/systemConfigService";
import { isPublicPage } from "@/lib/auth/routes";

interface ConfigState {
  configs: SystemPublicConfigs | null;
  isLoading: boolean;
  fetchConfigs: (force?: boolean) => Promise<SystemPublicConfigs | null>;
  clearConfigs: () => void;
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set, get) => ({
      configs: null,
      isLoading: true,

      fetchConfigs: async (force: boolean = false) => {
        // Nếu đang ở màn hình công khai (chưa đăng nhập, ví dụ /login) và không ép buộc -> Tuyệt đối không gọi API
        if (!force && typeof window !== "undefined" && isPublicPage(window.location.pathname)) {
          set({ isLoading: false });
          return null;
        }

        // Nếu đã có cache trong store/localStorage, không kích hoạt layout loading spinner
        if (!get().configs) {
          set({ isLoading: true });
        }

        try {
          const data = await systemConfigService.getPublicConfigs();
          if (data) {
            set({ configs: data, isLoading: false });
            return data;
          }
          set({ isLoading: false });
          return null;
        } catch {
          set({ isLoading: false });
          return null;
        }
      },

      clearConfigs: () => {
        set({ configs: null, isLoading: false });
        useConfigStore.persist?.clearStorage();
      },
    }),
    {
      name: "system_configs_storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ configs: state.configs }),
      skipHydration: true, // Kiểm soát hydration bằng UserInitializer để chống mismatch Next.js SSR
    }
  )
);
