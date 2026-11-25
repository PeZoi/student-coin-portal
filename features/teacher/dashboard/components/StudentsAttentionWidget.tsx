"use client";

import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { AppRoutes } from "@/constants/routes";
import {
  BellRing,
  ChevronRight,
  Clock,
  Phone,
  Eye,
  AlertTriangle,
  Copy,
} from "lucide-react";
import { DashboardStudentAttentionItem } from "../types";

interface StudentsAttentionWidgetProps {
  items: DashboardStudentAttentionItem[];
}

export function StudentsAttentionWidget({
  items,
}: StudentsAttentionWidgetProps) {
  const handleCopyPhone = (studentName: string, phone: string) => {
    navigator.clipboard.writeText(phone);
    toast.success(`Đã sao chép SĐT phụ huynh em ${studentName}: ${phone}`);
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 sm:p-6 shadow-2xs">
      {/* Header khối: Đồng bộ 100% kích thước với RecentSubmissionsQueue */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold border border-rose-200/80 shrink-0">
            <BellRing className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[#0F172A] font-heading">
              Học sinh cần nhắc nhở ({items.length})
            </h2>
            <p className="text-xs text-slate-500">
              Các em chưa nộp bài sắp hết hạn hoặc có bài bị trả về cần làm lại
            </p>
          </div>
        </div>

        <Link
          href={AppRoutes.TEACHER.STUDENTS}
          className="text-xs font-bold text-[#0A62D6] hover:text-[#0850B0] flex items-center gap-1 group transition-colors shrink-0"
        >
          <span>Danh sách lớp</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Danh sách học sinh cần theo dõi */}
      {items.length === 0 ? (
        <div className="py-10 text-center text-slate-400">
          <p className="text-sm font-semibold text-slate-600">
            Tuyệt vời! Tất cả học sinh đều đã hoàn thành bài tập đúng hạn.
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Không có học sinh nào cần nhắc nhở vào lúc này.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const isRevision = item.attention_type === "needs_revision";
            const targetHref = isRevision
              ? AppRoutes.TEACHER.STUDENT_GRADING(
                  item.mission_id,
                  item.student_id
                )
              : AppRoutes.TEACHER.SUBMISSION_DETAIL(item.mission_id);

            return (
              <div
                key={item.id}
                className="p-3.5 sm:p-4 rounded-xl border bg-slate-50/60 hover:bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
                  {/* Phần trái: Avatar + Tên + Lý do + Bài tập + Thời hạn */}
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <Image
                        src={item.student_avatar}
                        alt={item.student_name}
                        width={44}
                        height={44}
                        style={{ height: "auto" }}
                        className="w-11 h-11 rounded-full border border-slate-200/90 object-cover bg-white shadow-2xs"
                      />
                    </div>

                    <div className="min-w-0">
                      {/* Hàng 1: Tên học sinh + SĐT + Badge cảnh báo */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-sm text-[#0F172A]">
                          {item.student_name}
                        </span>

                        {item.student_phone && (
                          <button
                            type="button"
                            onClick={() =>
                              handleCopyPhone(
                                item.student_name,
                                item.student_phone as string
                              )
                            }
                            title="Nhấn để sao chép SĐT phụ huynh"
                            className="text-[11px] text-slate-400 hover:text-[#0A62D6] font-medium flex items-center gap-1 tabular-nums transition-colors cursor-pointer group"
                          >
                            <Phone className="w-3 h-3 text-slate-400 group-hover:text-[#0A62D6] shrink-0" />
                            <span>{item.student_phone}</span>
                            <Copy className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        )}

                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border shrink-0 ${
                            isRevision
                              ? "bg-rose-50 text-rose-700 border-rose-200/80"
                              : "bg-amber-50 text-amber-800 border-amber-200/80"
                          }`}
                        >
                          <AlertTriangle className="w-3 h-3 shrink-0" />
                          <span>{item.reason_badge}</span>
                        </span>
                      </div>

                      {/* Hàng 2: Tên bài tập liên quan */}
                      <p className="text-xs font-semibold text-slate-700 mt-0.5 line-clamp-1">
                        {item.mission_title}
                      </p>

                      {/* Hàng 3: Thời hạn nộp */}
                      <div className="flex items-center gap-1.5 text-[11px] mt-1.5">
                        <Clock
                          className={`w-3.5 h-3.5 shrink-0 ${
                            item.is_overdue ? "text-rose-500" : "text-slate-400"
                          }`}
                        />
                        <span
                          className={
                            item.is_overdue
                              ? "font-bold text-rose-600"
                              : "text-slate-500 font-medium"
                          }
                        >
                          {item.due_label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Phần phải: Nút Xem / Kiểm tra */}
                  <div className="shrink-0 flex items-center gap-2 self-end sm:self-center">
                    <Link
                      href={targetHref}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs hover:border-slate-300"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      <span>{isRevision ? "Kiểm tra" : "Xem tiến độ"}</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
