"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { DEFAULT_SYSTEM_SETTINGS } from "../constants";
import { SystemSettingsFormState, SystemSettingsTabId } from "../types";

interface UseSystemSettingsFormParams {
  serverSettings: SystemSettingsFormState;
}

/**
 * Micro-Hook 2: Quản lý trạng thái Form & Tab điều hướng
 * - Dùng pattern draftState ?? serverSettings: tuyệt đối không gọi setState đồng bộ trong useEffect (Quy tắc 8 AGENTS.md)
 */
export function useSystemSettingsForm({
  serverSettings,
}: UseSystemSettingsFormParams) {
  const [activeTab, setActiveTab] = useState<SystemSettingsTabId>("exchange");
  const [draftSettings, setDraftSettings] =
    useState<SystemSettingsFormState | null>(null);

  const formState = draftSettings ?? serverSettings;
  const hasChanges = draftSettings !== null;

  const updateSection = useCallback(
    <K extends keyof SystemSettingsFormState>(
      key: K,
      nextValue: SystemSettingsFormState[K]
    ) => {
      setDraftSettings((prev) => ({
        ...(prev ?? serverSettings),
        [key]: nextValue,
      }));
    },
    [serverSettings]
  );

  const handleResetToDefault = useCallback(() => {
    setDraftSettings(DEFAULT_SYSTEM_SETTINGS);
    toast.info(
      "Đã khôi phục giá trị mặc định trên biểu mẫu. Bấm Lưu cài đặt để áp dụng."
    );
  }, []);

  const clearDraft = useCallback(() => {
    setDraftSettings(null);
  }, []);

  return {
    activeTab,
    setActiveTab,
    formState,
    hasChanges,
    updateSection,
    handleResetToDefault,
    clearDraft,
  };
}
