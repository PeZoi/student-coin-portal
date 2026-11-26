"use client";

import { useState } from "react";
import { toast } from "sonner";
import { SystemSettingsHeader } from "./SystemSettingsHeader";
import {
  SecuritySettingsCard,
  SecuritySettingsFormState,
} from "./SecuritySettingsCard";
import {
  ExchangeSettingsCard,
  ExchangeSettingsFormState,
} from "./ExchangeSettingsCard";
import {
  MonthlyRewardSettingsCard,
  MonthlyRewardSettingsFormState,
} from "./MonthlyRewardSettingsCard";
import {
  SubmissionArchiveSettingsCard,
  SubmissionArchiveSettingsFormState,
} from "./SubmissionArchiveSettingsCard";
import {
  AiGradingSettingsCard,
  AiGradingSettingsFormState,
} from "./AiGradingSettingsCard";

interface SystemSettingsFormState {
  security: SecuritySettingsFormState;
  exchange: ExchangeSettingsFormState;
  monthlyReward: MonthlyRewardSettingsFormState;
  submissionArchive: SubmissionArchiveSettingsFormState;
  aiGrading: AiGradingSettingsFormState;
}

const DEFAULT_SYSTEM_SETTINGS_STATE: SystemSettingsFormState = {
  security: {
    maxFailedAttempts: 5,
    lockoutMinutes: 15,
    autoResetOnSuccess: true,
    allowTeacherPinReset: true,
  },
  exchange: {
    stepCoins: 50,
    vndPerStep: 250,
    minExchangeCoins: 1000,
    isExchangeWindowEnabled: true,
    exchangeOpenDay: 25,
    exchangeCloseDay: 31,
    allowCustomGiftLink: true,
  },
  monthlyReward: {
    top1BonusCoins: 500,
    top2BonusCoins: 300,
    top3BonusCoins: 200,
    progressRewardMode: "all_qualifying",
  },
  submissionArchive: {
    lateSubmissionGraceDays: 7,
    maxUploadFileSizeMb: 5,
    autoPurgeOldMedia: true,
    mediaRetentionDays: 30,
  },
  aiGrading: {
    isAiGradingEnabled: true,
    gradingModel: "balanced_fast",
    gradingStrictness: "balanced",
    approvalMode: "manual",
    maxRewardScoreThreshold: 9,
    feedbackStyleGuide:
      "Nhận xét bằng giọng văn ấm áp, gần gũi, xưng cô - con. Luôn khen ngợi điểm làm tốt trước khi góp ý nhẹ nhàng những chỗ cần cẩn thận hơn.",
  },
};

/**
 * Trang Cài đặt hệ thống (Giao diện chuẩn Design System Góc Giáo Viên)
 * - Hiện tại chỉ quản lý state giao diện cục bộ, sẵn sàng kết nối API/Server Service ở giai đoạn sau.
 */
export function TeacherSystemSettingsView() {
  const [formState, setFormState] = useState<SystemSettingsFormState>(
    DEFAULT_SYSTEM_SETTINGS_STATE
  );
  const [hasChanges, setHasChanges] = useState(false);

  const updateSection = <K extends keyof SystemSettingsFormState>(
    key: K,
    nextValue: SystemSettingsFormState[K]
  ) => {
    setFormState((prev) => ({
      ...prev,
      [key]: nextValue,
    }));
    setHasChanges(true);
  };

  const handleReset = () => {
    setFormState(DEFAULT_SYSTEM_SETTINGS_STATE);
    setHasChanges(false);
    toast.info("Đã khôi phục các giá trị cài đặt mặc định.");
  };

  const handleSave = () => {
    setHasChanges(false);
    toast.success("Đã ghi nhận giao diện cài đặt hệ thống.");
  };

  return (
    <div className="space-y-6 pb-8">
      {/* 1. Header trang */}
      <SystemSettingsHeader
        hasChanges={hasChanges}
        onReset={handleReset}
        onSave={handleSave}
      />

      {/* 2. Lưới các nhóm cấu hình */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        <SecuritySettingsCard
          value={formState.security}
          onChange={(next) => updateSection("security", next)}
        />

        <ExchangeSettingsCard
          value={formState.exchange}
          onChange={(next) => updateSection("exchange", next)}
        />

        <MonthlyRewardSettingsCard
          value={formState.monthlyReward}
          onChange={(next) => updateSection("monthlyReward", next)}
        />

        <SubmissionArchiveSettingsCard
          value={formState.submissionArchive}
          onChange={(next) => updateSection("submissionArchive", next)}
        />

        <AiGradingSettingsCard
          value={formState.aiGrading}
          onChange={(next) => updateSection("aiGrading", next)}
        />
      </div>
    </div>
  );
}
