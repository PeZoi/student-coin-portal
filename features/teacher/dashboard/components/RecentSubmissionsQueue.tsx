"use client";

import Link from "next/link";
import Image from "next/image";
import { AppRoutes } from "@/constants/routes";
import { formatDate } from "@/lib/date";
import {
  FileCheck2,
  ChevronRight,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Image as ImageIcon,
  Check,
  X,
  Phone,
  Eye,
  ArrowRight,
} from "lucide-react";
import { useTeacherDashboardContext } from "../contexts/TeacherDashboardContext";

export function RecentSubmissionsQueue() {
  const { recentSubmissions: submissions, kpis } = useTeacherDashboardContext();
  const totalPendingCount = kpis.pending_submissions_count;

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
      <div>
        {/* Header khối */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold border border-amber-200/80 shrink-0">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#0F172A] font-heading">
                Bài tập nộp gần nhất cần duyệt
              </h2>
              <p className="text-xs text-slate-500">
                AI đã hỗ trợ chấm trước, cô giáo xem trước bài làm và xác nhận cộng xu cho học sinh
              </p>
            </div>
          </div>

          <Link
            href={AppRoutes.TEACHER.SUBMISSIONS}
            className="text-xs font-bold text-[#0A62D6] hover:text-[#0850B0] flex items-center gap-1 group transition-colors shrink-0"
          >
            <span>Studio duyệt bài ({totalPendingCount})</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Danh sách bài nộp dạng Hàng ngang */}
        {submissions.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500/60 mb-2" />
            <p className="text-sm font-semibold text-slate-600">
              Hiện chưa có bài nộp nào chờ duyệt.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Bài làm mới của học sinh sẽ tự động hiển thị tại đây.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {submissions.map((sub) => (
              <div
                key={sub.id}
                className="p-3.5 sm:p-4 rounded-xl border bg-slate-50/60 hover:bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
                  {/* Phần trái: Avatar + Tên + Thông tin bài nộp & Thống kê AI */}
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <Image
                        src={sub.student_avatar}
                        alt={sub.student_name}
                        width={44}
                        height={44}
                        style={{ height: "auto" }}
                        className="w-11 h-11 rounded-full border border-slate-200/90 object-cover bg-white shadow-2xs"
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-sm text-[#0F172A]">
                          {sub.student_name}
                        </span>
                        {sub.student_phone && (
                          <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1 tabular-nums">
                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{sub.student_phone}</span>
                          </span>
                        )}
                      </div>

                      <p className="text-xs font-semibold text-slate-700 mt-0.5 line-clamp-1">
                        {sub.mission_title}
                      </p>

                      <div className="flex items-center gap-2.5 sm:gap-3 text-[11px] text-slate-600 mt-1.5 flex-wrap">
                        {/* Thời gian nộp */}
                        <span className="flex items-center gap-1 text-slate-500 tabular-nums">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>
                            {formatDate(sub.submitted_at, "HH:mm - dd/MM")}
                          </span>
                        </span>

                        <span className="text-slate-300">•</span>

                        {/* Số lượng ảnh */}
                        <span className="flex items-center gap-1 text-slate-500">
                          <ImageIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{sub.proof_image_count} ảnh</span>
                        </span>

                        <span className="text-slate-300">•</span>

                        {/* Trạng thái Đúng hạn / Nộp muộn */}
                        <span
                          className={`inline-flex items-center gap-1 font-semibold ${
                            sub.is_late
                              ? "text-orange-600 font-bold"
                              : "text-emerald-700"
                          }`}
                        >
                          {sub.is_late ? (
                            <AlertTriangle className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          )}
                          <span>{sub.is_late ? "Nộp muộn" : "Đúng hạn"}</span>
                        </span>

                        {/* Badge AI điểm số */}
                        {sub.ai_score !== null && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/80 font-bold tabular-nums">
                              <Sparkles className="w-3 h-3 text-indigo-500 shrink-0" />
                              <span>AI: {sub.ai_score}/10</span>
                            </span>
                          </>
                        )}

                        {/* Tỷ lệ đúng / sai (chỉ hiển thị khi AI đã tách số câu) */}
                        {sub.correct_count !== null &&
                          sub.incorrect_count !== null && (
                            <span className="inline-flex items-center gap-2 tabular-nums font-semibold">
                              <span className="inline-flex items-center gap-0.5 text-emerald-700">
                                <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                                <span>{sub.correct_count} đúng</span>
                              </span>
                              <span className="inline-flex items-center gap-0.5 text-rose-600">
                                <X className="w-3 h-3 text-rose-500 shrink-0" />
                                <span>{sub.incorrect_count} sai</span>
                              </span>
                            </span>
                          )}
                      </div>
                    </div>
                  </div>

                  {/* Phần phải: Nút Xem bài mở thẳng màn hình chấm bài của học sinh */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <Link
                      href={AppRoutes.TEACHER.STUDENT_GRADING(
                        sub.mission_id,
                        sub.student_id
                      )}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs font-bold border border-slate-200/90 hover:border-slate-300 transition-all shadow-2xs group"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
                      <span>Xem bài</span>
                      <ChevronRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer mở Studio */}
      <div className="pt-4 mt-3 border-t border-slate-100 text-center">
        <Link
          href={AppRoutes.TEACHER.SUBMISSIONS}
          className="text-xs font-bold text-[#0A62D6] hover:text-[#0850B0] inline-flex items-center gap-1.5 transition-colors"
        >
          <span>Mở toàn bộ danh sách trong Studio Chấm Bài Tập</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
