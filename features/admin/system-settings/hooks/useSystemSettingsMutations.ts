"use client";

import { useCallback, useState } from "react";
import { KeyedMutator } from "swr";
import { toast } from "sonner";
import { useConfigStore } from "@/stores/useConfigStore";
import { systemSettingsUpdateSchema } from "../schemas/systemSettingsSchema";
import { systemSettingsService } from "../services/systemSettingsService";
import { SystemSettingsFormState, SystemSettingsPayload } from "../types";

interface UseSystemSettingsMutationsParams {
  formState: SystemSettingsFormState;
  hasStoredAiApiKey: boolean;
  mutate: KeyedMutator<SystemSettingsPayload>;
  clearDraft: () => void;
}

/**
 * Micro-Hook 3: Quản lý thao tác Lưu cài đặt & Kiểm tra kết nối AI
 */
export function useSystemSettingsMutations({
  formState,
  hasStoredAiApiKey,
  mutate,
  clearDraft,
}: UseSystemSettingsMutationsParams) {
  const [isSaving, setIsSaving] = useState(false);
  const [isTestingAi, setIsTestingAi] = useState(false);

  const handleSave = useCallback(async () => {
    if (isSaving) return;

    const validation = systemSettingsUpdateSchema.safeParse(formState);
    if (!validation.success) {
      const firstIssue = validation.error.issues[0];
      toast.error(firstIssue?.message || "Vui lòng kiểm tra lại dữ liệu nhập.");
      return;
    }

    try {
      setIsSaving(true);
      const updatedPayload = await systemSettingsService.saveSettings(
        validation.data
      );

      // Cập nhật SWR cache & xóa trạng thái nháp ngay lập tức
      await mutate(updatedPayload, false);
      clearDraft();

      // Đồng bộ lại Public Config Store (tỷ giá Heo Đất, bảo trì...) trên client
      void useConfigStore.getState().fetchConfigs(true);

      toast.success("Đã lưu cài đặt hệ thống thành công!");
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(error.message || "Không thể lưu cài đặt hệ thống.");
    } finally {
      setIsSaving(false);
    }
  }, [clearDraft, formState, isSaving, mutate]);

  const handleTestAiConnection = useCallback(async () => {
    if (isTestingAi) return;

    const { baseUrl, apiKey, modelName, timeoutSeconds } = formState.aiGrading;

    if (!baseUrl.trim()) {
      toast.warning("Vui lòng nhập đường dẫn máy chủ AI trước khi kiểm tra.");
      return;
    }

    if (!apiKey.trim() && !hasStoredAiApiKey) {
      toast.warning("Vui lòng nhập khóa kết nối bí mật trước khi kiểm tra.");
      return;
    }

    if (!modelName.trim()) {
      toast.warning("Vui lòng nhập tên mô hình AI trước khi kiểm tra.");
      return;
    }

    try {
      setIsTestingAi(true);
      const result = await systemSettingsService.testAiConnection({
        baseUrl: baseUrl.trim(),
        apiKey: apiKey.trim(),
        modelName: modelName.trim(),
        timeoutSeconds,
      });

      toast.success(result.message);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(error.message || "Kiểm tra kết nối máy chủ AI thất bại.");
    } finally {
      setIsTestingAi(false);
    }
  }, [formState.aiGrading, hasStoredAiApiKey, isTestingAi]);

  return {
    isSaving,
    isTestingAi,
    handleSave,
    handleTestAiConnection,
  };
}
