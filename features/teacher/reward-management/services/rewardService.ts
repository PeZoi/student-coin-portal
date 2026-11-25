import {
  TeacherExchangeRequestItem,
  ExchangeFilterStatus,
  ExchangeFilterChoiceType,
} from "../types";

export interface GetRewardsParams {
  month?: number | "all";
  year?: number | "all";
  status?: ExchangeFilterStatus;
  choice_type?: ExchangeFilterChoiceType;
  class_id?: string;
  search?: string;
}

/**
 * Tầng Service Client gọi các Route Handlers của hệ thống đổi quà
 */
export const rewardService = {
  /**
   * Lấy danh sách yêu cầu đổi quà kèm bộ lọc
   */
  async getRewards(params?: GetRewardsParams): Promise<TeacherExchangeRequestItem[]> {
    const searchParams = new URLSearchParams();
    if (params?.month !== undefined && params.month !== "all") {
      searchParams.set("month", String(params.month));
    }
    if (params?.year !== undefined && params.year !== "all") {
      searchParams.set("year", String(params.year));
    }
    if (params?.status && params.status !== "all") searchParams.set("status", params.status);
    if (params?.choice_type && params.choice_type !== "all") {
      searchParams.set("choice_type", params.choice_type);
    }
    if (params?.class_id && params.class_id !== "all") {
      searchParams.set("class_id", params.class_id);
    }
    if (params?.search && params.search.trim()) {
      searchParams.set("search", params.search.trim());
    }

    const query = searchParams.toString();
    const url = `/api/teacher/rewards${query ? `?${query}` : ""}`;
    const res = await fetch(url, { method: "GET" });
    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data?.message || "Không thể tải danh sách đổi quà");
    }

    return (data.data?.requests ?? data.data ?? []) as TeacherExchangeRequestItem[];
  },

  /**
   * Duyệt yêu cầu đổi quà của học sinh
   */
  async approveReward(id: string): Promise<void> {
    const res = await fetch(`/api/teacher/rewards/${id}/approve`, {
      method: "POST",
    });
    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data?.message || "Không thể duyệt yêu cầu đổi quà");
    }
  },

  /**
   * Duyệt hàng loạt danh sách yêu cầu đổi quà
   */
  async batchApproveRewards(requestIds: string[]): Promise<{ approvedCount: number }> {
    const res = await fetch("/api/teacher/rewards/batch-approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestIds }),
    });
    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data?.message || "Không thể duyệt hàng loạt yêu cầu");
    }

    return { approvedCount: data.data?.approvedCount ?? 0 };
  },

  /**
   * Từ chối yêu cầu đổi quà & hoàn xu vào Heo Đất
   */
  async rejectReward(id: string, reason: string): Promise<void> {
    const res = await fetch(`/api/teacher/rewards/${id}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data?.message || "Không thể từ chối yêu cầu đổi quà");
    }
  },
};
