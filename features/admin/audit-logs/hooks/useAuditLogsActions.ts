"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { KeyedMutator } from "swr";
import {
  ACTIVITY_SCOPE_LABELS,
  AUTH_ACTION_LABELS,
  DEVICE_LABELS,
  ROLE_LABELS,
} from "../constants";
import {
  ActivityLogItem,
  AuditLogsPagePayload,
  AuditLogsTab,
  AuthLogItem,
} from "../types";

function escapeCsvCell(value: string): string {
  const safe = value.replace(/"/g, '""');
  return `"${safe}"`;
}

interface UseAuditLogsActionsProps {
  activeTab: AuditLogsTab;
  authLogs: AuthLogItem[];
  activityLogs: ActivityLogItem[];
  mutate: KeyedMutator<AuditLogsPagePayload>;
}

/**
 * Micro-Hook 3: Xử lý thao tác Làm mới dữ liệu & Xuất báo cáo CSV
 */
export function useAuditLogsActions({
  activeTab,
  authLogs,
  activityLogs,
  mutate,
}: UseAuditLogsActionsProps) {
  const handleRefresh = useCallback(async () => {
    try {
      await mutate();
      toast.success("Đã làm mới dữ liệu nhật ký an ninh!");
    } catch {
      toast.error("Không thể làm mới dữ liệu nhật ký. Vui lòng thử lại.");
    }
  }, [mutate]);

  const handleExportCsv = useCallback(() => {
    const hasRows =
      activeTab === "auth" ? authLogs.length > 0 : activityLogs.length > 0;
    if (!hasRows) {
      toast.warning("Không có bản ghi nào để xuất báo cáo.");
      return;
    }

    const lines: string[] = [];

    if (activeTab === "auth") {
      lines.push(
        [
          "Thời gian",
          "Họ và tên",
          "Tài khoản",
          "Vai trò",
          "Hành động",
          "Kết quả",
          "Ghi chú",
          "Thiết bị",
          "Địa chỉ truy cập",
          "Vị trí",
        ]
          .map(escapeCsvCell)
          .join(",")
      );

      for (const item of authLogs) {
        lines.push(
          [
            item.timestamp,
            item.fullName,
            item.accountIdentifier,
            ROLE_LABELS[item.role],
            AUTH_ACTION_LABELS[item.action],
            item.status === "success" ? "Thành công" : "Thất bại",
            item.reasonText ?? "",
            DEVICE_LABELS[item.deviceType],
            item.ipAddress,
            item.location,
          ]
            .map(escapeCsvCell)
            .join(",")
        );
      }
    } else {
      lines.push(
        [
          "Thời gian",
          "Người thực hiện",
          "Vai trò",
          "Thao tác",
          "Phạm vi",
          "Chi tiết",
        ]
          .map(escapeCsvCell)
          .join(",")
      );

      for (const item of activityLogs) {
        lines.push(
          [
            item.timestamp,
            item.actorName,
            ROLE_LABELS[item.actorRole],
            item.actionLabel,
            ACTIVITY_SCOPE_LABELS[item.scope],
            item.description,
          ]
            .map(escapeCsvCell)
            .join(",")
        );
      }
    }

    const blob = new Blob(["\uFEFF" + lines.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download =
      activeTab === "auth"
        ? "lich-su-dang-nhap.csv"
        : "lich-su-thao-tac-du-lieu.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Đã xuất tệp báo cáo CSV thành công!");
  }, [activeTab, activityLogs, authLogs]);

  return {
    handleRefresh,
    handleExportCsv,
  };
}
