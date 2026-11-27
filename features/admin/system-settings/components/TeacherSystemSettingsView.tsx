"use client";

import {
  SystemSettingsProvider,
  useSystemSettingsContext,
} from "../contexts/SystemSettingsContext";
import { SystemSettingsPayload } from "../types";
import { SystemSettingsHeader } from "./SystemSettingsHeader";
import { SystemSettingsNav } from "./SystemSettingsNav";
import { ExchangeSettingsCard } from "./ExchangeSettingsCard";
import { AiGradingSettingsCard } from "./AiGradingSettingsCard";
import { SecuritySettingsCard } from "./SecuritySettingsCard";
import { SubmissionArchiveSettingsCard } from "./SubmissionArchiveSettingsCard";
import { MaintenanceSettingsCard } from "./MaintenanceSettingsCard";

function SystemSettingsContent() {
  const { activeTab } = useSystemSettingsContext();

  return (
    <div className="space-y-6 pb-8">
      <SystemSettingsHeader />

      <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-6 items-start">
        <SystemSettingsNav />

        <div className="min-w-0">
          {activeTab === "exchange" && <ExchangeSettingsCard />}
          {activeTab === "ai" && <AiGradingSettingsCard />}
          {activeTab === "security" && <SecuritySettingsCard />}
          {activeTab === "archive" && <SubmissionArchiveSettingsCard />}
          {activeTab === "maintenance" && <MaintenanceSettingsCard />}
        </div>
      </div>
    </div>
  );
}

interface TeacherSystemSettingsViewProps {
  initialData?: SystemSettingsPayload;
}

/**
 * Trang Cài đặt hệ thống (Feature Context Pattern + SSR initialData)
 */
export function TeacherSystemSettingsView({
  initialData,
}: TeacherSystemSettingsViewProps) {
  return (
    <SystemSettingsProvider initialData={initialData}>
      <SystemSettingsContent />
    </SystemSettingsProvider>
  );
}
