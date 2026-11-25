/**
 * ==============================================================================
 * TIỆN ÍCH TÍNH TOÁN TIẾN ĐỘ BÀI TẬP HỌC SINH (STACKED PROGRESS BAR METRICS)
 * - Tái sử dụng đồng bộ giữa StudentRosterTable và StudentAssignedMissionsModal
 * - Tuân thủ Quy tắc DRY (Quy tắc 1 AGENTS.md)
 * ==============================================================================
 */

export interface StudentMissionProgressMetrics {
  /** Tổng số bài tập được giao */
  total: number;
  /** Số bài đã duyệt hoàn thành (Xanh lá) */
  approved: number;
  /** Số bài đã nộp đang chờ cô chấm (Vàng cam) */
  submitted: number;
  /** Số bài được miễn làm ngoại lệ (Tím) */
  exempt: number;
  /** Số bài chưa làm (Xám) */
  unsubmitted: number;
  /** Tổng số bài đã được xử lý (approved + submitted + exempt) */
  handled: number;
  /** % Tiến độ tổng quát đã xử lý */
  progressPercent: number;
  /** % Phân đoạn Đã duyệt (Xanh lá) */
  approvedPercent: number;
  /** % Phân đoạn Chờ duyệt (Vàng cam) */
  submittedPercent: number;
  /** % Phân đoạn Miễn làm (Tím) */
  exemptPercent: number;
}

export interface CalculateMissionProgressParams {
  total: number;
  approved: number;
  submitted?: number;
  exempt?: number;
}

/**
 * Tính toán tỷ lệ phần trăm và các phân đoạn màu cho thanh tiến độ bài tập
 */
export function calculateStudentMissionProgress(
  params: CalculateMissionProgressParams
): StudentMissionProgressMetrics {
  const total = Math.max(0, params.total || 0);
  const approved = Math.max(0, params.approved || 0);
  const submitted = Math.max(0, params.submitted || 0);
  const exempt = Math.max(0, params.exempt || 0);

  // Số bài đã xử lý = Đã hoàn thành + Đang chờ chấm + Miễn làm
  const handled = approved + submitted + exempt;
  const unsubmitted = Math.max(0, total - handled);

  // Tỷ lệ % tiến độ tổng đã xử lý
  const progressPercent =
    total > 0 ? Math.min(100, Math.round((handled / total) * 100)) : 0;

  // Phân bổ phần trăm sơ bộ
  let approvedPercent = total > 0 ? Math.round((approved / total) * 100) : 0;
  let submittedPercent = total > 0 ? Math.round((submitted / total) * 100) : 0;
  let exemptPercent = total > 0 ? Math.round((exempt / total) * 100) : 0;

  // Cân đối làm tròn để thanh khít 100% khi xử lý xong hoặc chuẩn xác theo progressPercent
  if (handled >= total && total > 0) {
    if (exemptPercent > 0) {
      exemptPercent = Math.max(0, 100 - approvedPercent - submittedPercent);
    } else if (submittedPercent > 0) {
      submittedPercent = Math.max(0, 100 - approvedPercent);
    } else {
      approvedPercent = 100;
    }
  } else if (handled > 0 && total > 0) {
    const sumSegments = approvedPercent + submittedPercent + exemptPercent;
    if (sumSegments < progressPercent) {
      const diff = progressPercent - sumSegments;
      if (exemptPercent > 0) exemptPercent += diff;
      else if (submittedPercent > 0) submittedPercent += diff;
      else approvedPercent += diff;
    } else if (sumSegments > progressPercent) {
      const diff = sumSegments - progressPercent;
      if (exemptPercent > 0) exemptPercent = Math.max(0, exemptPercent - diff);
      else if (submittedPercent > 0) submittedPercent = Math.max(0, submittedPercent - diff);
    }
  }

  return {
    total,
    approved,
    submitted,
    exempt,
    unsubmitted,
    handled,
    progressPercent,
    approvedPercent,
    submittedPercent,
    exemptPercent,
  };
}
