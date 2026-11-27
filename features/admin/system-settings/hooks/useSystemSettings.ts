"use client";

import { SystemSettingsPayload } from "../types";
import { useSystemSettingsData } from "./useSystemSettingsData";
import { useSystemSettingsForm } from "./useSystemSettingsForm";
import { useSystemSettingsMutations } from "./useSystemSettingsMutations";

/**
 * Root Orchestrator Hook: Kết hợp 3 Micro-Hooks cho trang Cài đặt hệ thống
 */
export function useSystemSettings(initialData?: SystemSettingsPayload) {
  const data = useSystemSettingsData(initialData);

  const form = useSystemSettingsForm({
    serverSettings: data.serverSettings,
  });

  const mutations = useSystemSettingsMutations({
    formState: form.formState,
    hasStoredAiApiKey: data.hasStoredAiApiKey,
    mutate: data.mutate,
    clearDraft: form.clearDraft,
  });

  return {
    ...data,
    ...form,
    ...mutations,
  };
}
