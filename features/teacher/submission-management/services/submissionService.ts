import { http } from "@/lib/http/httpClient";
import { AppRoutes } from "@/constants/routes";
import { ApiResponse } from "@/types/api";
import {
  ApproveSubmissionResult,
  BatchApproveSubmissionsResult,
  MissionSubmissionDetailPayload,
  MissionSubmissionSummary,
  RejectSubmissionResult,
} from "../types";
import {
  ApproveSubmissionPayload,
  BatchApproveSubmissionsPayload,
  RejectSubmissionPayload,
} from "../schemas/submissionSchemas";

/**
 * Client HTTP Service cho phân hệ Duyệt bài tập (`/api/teacher/submissions/*`)
 */
export const submissionService = {
  /**
   * Level 1: Lấy danh sách tổng quan các bài tập cần duyệt theo lớp đang chọn
   */
  async getMissionsOverview(
    classId?: string | null
  ): Promise<MissionSubmissionSummary[]> {
    const res = await http.get<ApiResponse<MissionSubmissionSummary[]>>(
      AppRoutes.API.TEACHER.SUBMISSIONS,
      {
        params: classId ? { classId } : undefined,
      }
    );
    return res.data ?? [];
  },

  /**
   * Level 2: Lấy chi tiết 1 bài tập + danh sách học sinh (Roster) + bài nộp & lỗi AI
   */
  async getMissionDetail(
    missionId: string,
    classId?: string | null
  ): Promise<MissionSubmissionDetailPayload | null> {
    const res = await http.get<ApiResponse<MissionSubmissionDetailPayload | null>>(
      AppRoutes.API.TEACHER.SUBMISSION_MISSION_DETAIL(missionId),
      {
        params: classId ? { classId } : undefined,
      }
    );
    return res.data ?? null;
  },

  /**
   * Duyệt 1 bài nộp & cộng xu Heo Đất (Atomic RPC)
   */
  async approveSubmission(
    submissionId: string,
    payload: ApproveSubmissionPayload
  ): Promise<ApproveSubmissionResult> {
    const res = await http.post<ApiResponse<ApproveSubmissionResult>>(
      AppRoutes.API.TEACHER.SUBMISSION_APPROVE(submissionId),
      payload
    );
    if (!res.data) {
      throw new Error(res.message || "Không nhận được kết quả duyệt bài.");
    }
    return res.data;
  },

  /**
   * Từ chối / Yêu cầu học sinh nộp lại bài (Atomic RPC)
   */
  async rejectSubmission(
    submissionId: string,
    payload: RejectSubmissionPayload
  ): Promise<RejectSubmissionResult> {
    const res = await http.post<ApiResponse<RejectSubmissionResult>>(
      AppRoutes.API.TEACHER.SUBMISSION_REJECT(submissionId),
      payload
    );
    if (!res.data) {
      throw new Error(res.message || "Không nhận được kết quả yêu cầu nộp lại.");
    }
    return res.data;
  },

  /**
   * Duyệt nhanh hàng loạt các bài nộp hợp lệ trong 1 round-trip RPC
   */
  async batchApproveSubmissions(
    payload: BatchApproveSubmissionsPayload
  ): Promise<BatchApproveSubmissionsResult> {
    const res = await http.post<ApiResponse<BatchApproveSubmissionsResult>>(
      AppRoutes.API.TEACHER.SUBMISSION_BATCH_APPROVE,
      payload
    );
    if (!res.data) {
      throw new Error(res.message || "Không nhận được kết quả duyệt hàng loạt.");
    }
    return res.data;
  },
};
