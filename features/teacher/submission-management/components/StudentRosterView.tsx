"use client";

import { useMemo, useState } from "react";
import { SubmissionApprovalStatus } from "@/constants";
import { normalizeText } from "@/lib/utils";
import { useManageSubmissionsContext } from "../contexts/ManageSubmissionsContext";
import { SubmissionStatusFilter } from "../types";
import { StudentRosterToolbar } from "./roster/StudentRosterToolbar";
import { StudentRosterCard } from "./roster/StudentRosterCard";
import { BatchApproveConfirmModal } from "./roster/BatchApproveConfirmModal";

/**
 * Giao diện Danh sách toàn bộ Học sinh của Bài tập (Student Roster View)
 * - Đã tách gọn Toolbar, StudentRosterCard & BatchApproveConfirmModal
 */
export function StudentRosterView() {
  const {
    studentRoster,
    selectedMission,
    selectedMissionId,
    validAiPendingCount,
    validAiPendingTotalCoins,
    isSubmitting,
    handleBatchApproveValid,
  } = useManageSubmissionsContext();

  const [statusFilter, setStatusFilter] =
    useState<SubmissionStatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);

  // Đếm số lượng cho từng tab lọc
  const counts = useMemo(() => {
    let pending = 0;
    let approved = 0;
    let rejected = 0;
    let unsubmitted = 0;

    for (const s of studentRoster) {
      if (s.approval_status === SubmissionApprovalStatus.PENDING_APPROVAL) {
        pending += 1;
      } else if (s.approval_status === SubmissionApprovalStatus.APPROVED) {
        approved += 1;
      } else if (s.approval_status === SubmissionApprovalStatus.REJECTED) {
        rejected += 1;
      } else if (s.approval_status === "unsubmitted") {
        unsubmitted += 1;
      }
    }

    return {
      all: studentRoster.length,
      pending,
      approved,
      rejected,
      unsubmitted,
    };
  }, [studentRoster]);

  // Danh sách học sinh sau khi lọc
  const filteredRoster = useMemo(() => {
    const query = normalizeText(searchQuery);
    return studentRoster.filter((s) => {
      if (statusFilter !== "all" && s.approval_status !== statusFilter) {
        return false;
      }
      if (query) {
        const matchName = normalizeText(s.student_name).includes(query);
        const matchPhone = (s.student_phone ?? "").includes(query);
        if (!matchName && !matchPhone) return false;
      }
      return true;
    });
  }, [studentRoster, statusFilter, searchQuery]);

  return (
    <div className="space-y-4">
      <StudentRosterToolbar
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        counts={counts}
        validAiPendingCount={validAiPendingCount}
        isSubmitting={isSubmitting}
        onBatchApprove={() => setIsBatchModalOpen(true)}
      />

      <BatchApproveConfirmModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        onConfirm={handleBatchApproveValid}
        isSubmitting={isSubmitting}
        validCount={validAiPendingCount}
        totalEstimatedCoins={validAiPendingTotalCoins}
      />

      {filteredRoster.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-10 text-center space-y-2 shadow-2xs">
          <p className="text-sm font-bold text-[#0F172A]">
            Không tìm thấy học sinh nào khớp bộ lọc
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("all");
            }}
            className="text-xs text-[#0A62D6] font-bold underline cursor-pointer"
          >
            Đặt lại bộ lọc
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {filteredRoster.map((student) => (
            <StudentRosterCard
              key={student.id}
              student={student}
              missionId={selectedMissionId ?? selectedMission?.id ?? ""}
              selectedMission={selectedMission}
            />
          ))}
        </div>
      )}
    </div>
  );
}
