"use client";

import { SubmissionApprovalStatus } from "@/constants";
import { formatDate } from "@/lib/date";
import { cn, getInitials, normalizeText } from "@/lib/utils";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock,
  Coins,
  FileCheck2,
  RotateCcw,
  Search,
  Sparkles,
  X
} from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useManageSubmissionsContext } from "../contexts/ManageSubmissionsContext";
import { SubmissionStatusFilter } from "../types";

/**
 * Chế độ xem Toàn bộ Học sinh trong Bài tập (Student Roster View)
 * - Thể hiện trực quan từng học sinh: đã nộp, chưa nộp, điểm AI, kết quả duyệt
 * - 1-Click "Chấm bài ngay" liên kết trực tiếp sang Studio Chấm Bài của học sinh đó
 */
export function StudentRosterView() {
  const { studentRoster, handleOpenStudentGrading } =
    useManageSubmissionsContext();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<SubmissionStatusFilter>("all");

  // Đếm số lượng học sinh theo từng trạng thái
  const counts = useMemo(() => {
    let pending = 0;
    let approved = 0;
    let rejected = 0;
    let unsubmitted = 0;

    for (const st of studentRoster) {
      if (st.approval_status === SubmissionApprovalStatus.PENDING_APPROVAL) {
        pending += 1;
      } else if (st.approval_status === SubmissionApprovalStatus.APPROVED) {
        approved += 1;
      } else if (st.approval_status === SubmissionApprovalStatus.REJECTED) {
        rejected += 1;
      } else if (st.approval_status === "unsubmitted") {
        unsubmitted += 1;
      }
    }

    return {
      total: studentRoster.length,
      pending,
      approved,
      rejected,
      unsubmitted,
    };
  }, [studentRoster]);

  // Lọc danh sách học sinh
  const filteredRoster = useMemo(() => {
    const query = normalizeText(searchQuery);

    return studentRoster.filter((st) => {
      // 1. Lọc trạng thái
      if (statusFilter !== "all" && st.approval_status !== statusFilter) {
        return false;
      }

      // 2. Lọc tìm kiếm
      if (query) {
        const matchName = normalizeText(st.student_name).includes(query);
        const matchPhone = normalizeText(st.student_phone ?? "").includes(query);
        if (!matchName && !matchPhone) return false;
      }

      return true;
    });
  }, [studentRoster, statusFilter, searchQuery]);

  const handleRemindStudent = (studentName: string) => {
    toast.success(`Đã gửi thông báo nhắc nộp bài đến phụ huynh em ${studentName}!`);
  };

  return (
    <div className="space-y-4">
      {/* 1. Thanh Toolbar lọc và tìm kiếm học sinh */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3.5">
        {/* Input Tìm kiếm */}
        <div className="relative flex-1 md:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên học sinh hoặc số điện thoại..."
            className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0A62D6]/20 focus:border-[#0A62D6]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Tabs Trạng thái */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/80 overflow-x-auto gap-1">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
              statusFilter === "all"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            Tất cả ({counts.total})
          </button>
          <button
            type="button"
            onClick={() =>
              setStatusFilter(SubmissionApprovalStatus.PENDING_APPROVAL)
            }
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1",
              statusFilter === SubmissionApprovalStatus.PENDING_APPROVAL
                ? "bg-white text-amber-800 shadow-2xs font-extrabold"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            {counts.pending > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            )}
            Chờ duyệt ({counts.pending})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter(SubmissionApprovalStatus.APPROVED)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
              statusFilter === SubmissionApprovalStatus.APPROVED
                ? "bg-white text-emerald-800 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            Đã duyệt ({counts.approved})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter(SubmissionApprovalStatus.REJECTED)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
              statusFilter === SubmissionApprovalStatus.REJECTED
                ? "bg-white text-rose-800 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            Cần sửa ({counts.rejected})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("unsubmitted")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
              statusFilter === "unsubmitted"
                ? "bg-white text-slate-800 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            Chưa nộp ({counts.unsubmitted})
          </button>
        </div>
      </div>

      {/* 2. Danh sách Học sinh (Cards Grid) */}
      {filteredRoster.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-12 text-center space-y-3">
          <p className="text-sm font-bold text-slate-700">
            Không có học sinh nào khớp với điều kiện lọc
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRoster.map((student) => {
            const isPending =
              student.approval_status ===
              SubmissionApprovalStatus.PENDING_APPROVAL;
            const isApproved =
              student.approval_status === SubmissionApprovalStatus.APPROVED;
            const isRejected =
              student.approval_status === SubmissionApprovalStatus.REJECTED;
            const isUnsubmitted = student.approval_status === "unsubmitted";

            return (
              <div
                key={student.id}
                className={cn(
                  "bg-white rounded-2xl border p-4.5 transition-all shadow-2xs flex flex-col justify-between gap-3.5",
                  isPending
                    ? "border-amber-200/90 bg-amber-50/20"
                    : "border-slate-200/90 hover:border-slate-300"
                )}
              >
                {/* Header Thẻ Học Sinh */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      {student.student_avatar ? (
                        <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-200 bg-slate-100">
                          <Image
                            src={student.student_avatar}
                            alt={student.student_name}
                            width={48}
                            height={48}
                            style={{ height: "auto" }}
                            className="w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-blue-100 text-[#0A62D6] font-bold text-sm flex items-center justify-center">
                          {getInitials(student.student_name)}
                        </div>
                      )}

                      {/* Trạng thái chấm màu góc avatar */}
                      <span
                        className={cn(
                          "w-3.5 h-3.5 rounded-full border-2 border-white absolute -bottom-0.5 -right-0.5",
                          isPending && "bg-amber-500",
                          isApproved && "bg-emerald-500",
                          isRejected && "bg-rose-500",
                          isUnsubmitted && "bg-slate-300"
                        )}
                      />
                    </div>

                    <div className="min-w-0">
                      <h4 className="font-extrabold text-sm text-[#0F172A] truncate">
                        {student.student_name}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {student.class_name} • SĐT: {student.student_phone || "--"}
                      </p>
                    </div>
                  </div>

                  {/* Badge Trạng thái */}
                  <div>
                    {isPending && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-extrabold">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        <span>Chờ duyệt</span>
                      </span>
                    )}
                    {isApproved && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-extrabold">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Đã duyệt</span>
                      </span>
                    )}
                    {isRejected && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200 text-[11px] font-extrabold">
                        <RotateCcw className="w-3 h-3 text-rose-600" />
                        <span>Cần sửa</span>
                      </span>
                    )}
                    {isUnsubmitted && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-semibold">
                        Chưa nộp
                      </span>
                    )}
                  </div>
                </div>

                {/* Thông tin Bài nộp & Đánh giá từ AI */}
                {student.has_submitted ? (
                  <div className="bg-slate-50/90 rounded-xl p-3 border border-slate-100 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1 text-[11px]">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {student.submitted_at
                          ? formatDate(student.submitted_at, "HH:mm - dd/MM")
                          : "--"}
                        {student.is_late && (
                          <span className="text-amber-700 font-bold ml-1">
                            (Nộp muộn)
                          </span>
                        )}
                      </span>
                      <span className="font-semibold text-slate-700 text-[11px]">
                        {student.proof_image_count} ảnh minh chứng
                      </span>
                    </div>

                    {/* AI Score & Summary */}
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/60">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {student.ai_score !== null ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-extrabold text-[11px] shrink-0">
                            <Sparkles className="w-3 h-3 text-indigo-600" />
                            <span>{student.ai_score}/10</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-amber-700 font-bold flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Ảnh mờ</span>
                          </span>
                        )}
                        <p className="text-[11px] text-slate-500 truncate">
                          {student.ai_summary || "Đã bóc tách bài làm"}
                        </p>
                      </div>

                      {student.final_coins !== null && (
                        <span className="text-[11px] font-black text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 shrink-0 flex items-center gap-1">
                          <Coins className="w-3 h-3 text-amber-600" />
                          <span>+{student.final_coins} xu</span>
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-center text-xs text-slate-500">
                    Học sinh chưa nộp bài tập này lên hệ thống.
                  </div>
                )}

                {/* Footer Thao tác: Chấm bài ngay (nếu đã nộp) hoặc Nhắc nhở (nếu chưa) */}
                <div className="pt-1">
                  {student.submission_id ? (
                    <button
                      type="button"
                      onClick={() =>
                        handleOpenStudentGrading(student.submission_id!)
                      }
                      className={cn(
                        "w-full inline-flex items-center justify-center gap-2 h-9 px-4 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-98",
                        isPending
                          ? "bg-[#0A62D6] hover:bg-[#0850B0] text-white"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-800"
                      )}
                    >
                      <FileCheck2 className="w-3.5 h-3.5" />
                      <span>
                        {isPending ? "Chấm bài em này ➜" : "Xem chi tiết bài làm"}
                      </span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleRemindStudent(student.student_name)}
                      className="w-full inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Bell className="w-3.5 h-3.5 text-slate-500" />
                      <span>Nhắc nộp bài</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
