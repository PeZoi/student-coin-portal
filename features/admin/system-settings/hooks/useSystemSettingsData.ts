"use client";

import useSWR from "swr";
import { CACHE_KEYS } from "@/constants/cacheKeys";
import { DEFAULT_SYSTEM_SETTINGS_PAYLOAD } from "../constants";
import { systemSettingsService } from "../services/systemSettingsService";
import { SystemSettingsPayload } from "../types";

/**
 * Micro-Hook 1: Quản lý Data Fetching 2 tầng (SSR initialData + SWR Cache)
 */
export function useSystemSettingsData(initialData?: SystemSettingsPayload) {
  const { data, mutate, isLoading, isValidating, error } =
    useSWR<SystemSettingsPayload>(
      CACHE_KEYS.SYSTEM.ADMIN_SETTINGS,
      () => systemSettingsService.getSettings(),
      {
        fallbackData: initialData,
        revalidateOnMount: !initialData,
        revalidateIfStale: !initialData,
        revalidateOnFocus: false,
      }
    );

  const payload = data ?? initialData ?? DEFAULT_SYSTEM_SETTINGS_PAYLOAD;

  return {
    serverSettings: payload.settings,
    hasStoredAiApiKey: payload.hasStoredAiApiKey,
    updatedAt: payload.updatedAt,
    isLoading: isLoading && !data && !initialData,
    isValidating,
    isError: Boolean(error),
    mutate,
  };
}
