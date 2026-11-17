"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { toast } from "sonner";
import {
  BookOpenCheck,
  CheckCircle2,
  Clock,
  Calendar,
  AlertCircle,
  MessageSquare,
  ExternalLink,
  Loader2,
  Inbox,
  X,
  ShieldBan,
  RotateCcw,
} from "lucide-react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal";
import {
  TeacherRosterStudent,
  RosterAssignedMissionItem,
  RosterMissionProgressStatus,
} from "../../types";
import {
  useRosterAssignedMissionsInfinite,
  MissionFilterTab,
} from "../../hooks/useRosterAssignedMissionsInfinite";
import { formatDate } from "@/lib/date";

interface StudentAssignedMissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: TeacherRosterStudent | null;
}

export function StudentAssignedMissionsModal({
  isOpen,
  onClose,
  student,
}: StudentAssignedMissionsModalProps) {
  if (!isOpen || !student) return null;

  return (
    <StudentAssignedMissionsDialogContent
      key={student.id}
      student={student}
      onClose={onClose}
    />
  );
}

interface DialogContentProps {
  student: TeacherRosterStudent;
  onClose: () => void;
}

function StudentAssignedMissionsDialogContent({
  student,
  onClose,
}: DialogContentProps) {
  const [activeTab, setActiveTab] = useState<MissionFilterTab>("all");

  const {
    handleTabChange,
    visibleMissions,
    totalFilteredCount,
    stats,
    isLoading,
    isLoadingMore,
    isReachingEnd,
    containerRef,
    sentinelRef,
    toggleExemptMission,
  } = useRosterAssignedMissionsInfinite(student, activeTab, setActiveTab);

  // State xem phóng to ảnh minh chứng
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Xử lý miễn làm bài ngoại lệ
  const handleToggleExempt = useCallback(
    async (missionId: string) => {
      const res = await toggleExemptMission(missionId);
      if (res) {
        if (res.status === "exempt") {
          toast.success(
            `Đã miễn làm bài "${res.title}" cho học sinh ${student.full_name} (ngoại lệ).`
          );
        } else {
          toast.info(
            `Đã hủy miễn làm, mở lại bài "${res.title}" cho học sinh ${student.full_name}.`
          );
        }
      }
    },
    [toggleExemptMission, student.full_name]
  );

  return (
    <>
      <Modal
        maxWidth="3xl"
        onClose={onClose}
        className="h-[88vh] max-h-[820px] flex flex-col"
      >
        <ModalHeader
          icon={<BookOpenCheck className="w-6 h-6 text-[#0A62D6]" />}
          title="Danh sách bài tập đã giao"
          description={
            <span className="text-xs sm:text-sm">
              Học sinh:{" "}
              <span className="font-bold text-[#0F172A]">
                {student.full_name}
              </span>{" "}
              • Lớp:{" "}
              <span className="font-bold text-[#0A62D6]">
                {student.class_name || "Chưa phân lớp"}
              </span>
            </span>
          }
          onClose={onClose}
        />

        {/* ModalBody không cuộn, chỉ flex-1 để giữ thanh KPI + Filter cố định và danh sách con cuộn */}
        <ModalBody className="p-4 sm:p-5 flex-1 min-h-0 overflow-hidden flex flex-col gap-3">
          {/* 1. Thanh tóm tắt tiến độ bài tập (Cố định ở trên) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-slate-50/90 border border-slate-200/90 text-xs shrink-0">
            <div className="flex flex-col">
              <span className="text-slate-500 font-medium">Tiến độ hoàn thành:</span>
              <span className="font-heading font-black text-[#0F172A] text-sm sm:text-base mt-0.5">
                {stats.approved}/{stats.total} bài ({stats.progressPercent}%)
              </span>
              <div className="w-full h-1.5 bg-slate-200 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${stats.progressPercent}%` }}
                />
              </div>
            </div>

            <div className="flex flex-col justify-center border-l border-slate-200/70 pl-3">
              <span className="text-slate-500 font-medium">Đang chờ chấm:</span>
              <span className="font-bold text-amber-600 text-sm mt-0.5">
                {stats.submitted} bài tập
              </span>
            </div>

            <div className="flex flex-col justify-center border-l border-slate-200/70 pl-3">
              <span className="text-slate-500 font-medium">Chưa nộp bài:</span>
              <span className="font-bold text-slate-700 text-sm mt-0.5">
                {stats.assigned} bài tập
              </span>
            </div>

            <div className="flex flex-col justify-center border-l border-slate-200/70 pl-3">
              <span className="text-slate-500 font-medium">Xu đã nhận từ bài:</span>
              <span className="inline-flex items-center gap-1 font-heading font-black text-amber-950 text-sm mt-0.5">
                <Image
                  src="/wheel/coin.webp"
                  alt="Xu"
                  width={15}
                  height={15}
                  unoptimized
                  style={{ height: "auto" }}
                  className="w-3.5 h-3.5 object-contain"
                />
                +{stats.totalCoins.toLocaleString("vi-VN")} xu
              </span>
            </div>
          </div>

          {/* 2. Thanh lọc theo trạng thái bài tập - Dạng Segmented Control siêu gọn (Cố định ở trên) */}
          <div className="bg-slate-100/90 p-1 rounded-xl flex items-center gap-1 overflow-x-auto scrollbar-none shrink-0 border border-slate-200/60">
            <CompactFilterTab
              label="Tất cả"
              count={stats.total}
              isActive={activeTab === "all"}
              onClick={() => handleTabChange("all")}
            />
            <CompactFilterTab
              label="Hoàn thành"
              count={stats.approved}
              isActive={activeTab === "approved"}
              activeText="text-emerald-700"
              onClick={() => handleTabChange("approved")}
            />
            <CompactFilterTab
              label="Chờ chấm"
              count={stats.submitted}
              isActive={activeTab === "submitted"}
              activeText="text-amber-700"
              onClick={() => handleTabChange("submitted")}
            />
            <CompactFilterTab
              label="Chưa nộp"
              count={stats.assigned}
              isActive={activeTab === "assigned"}
              activeText="text-blue-700"
              onClick={() => handleTabChange("assigned")}
            />
            {stats.rejected > 0 && (
              <CompactFilterTab
                label="Cần làm lại"
                count={stats.rejected}
                isActive={activeTab === "rejected"}
                activeText="text-rose-700"
                onClick={() => handleTabChange("rejected")}
              />
            )}
            {stats.exempt > 0 && (
              <CompactFilterTab
                label="Miễn làm"
                count={stats.exempt}
                isActive={activeTab === "exempt"}
                activeText="text-purple-700"
                onClick={() => handleTabChange("exempt")}
              />
            )}
          </div>

          {/* 3. Danh sách bài tập - VÙNG CUỘN DUY NHẤT (Infinite Scroll) */}
          <div
            ref={containerRef}
            className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-3"
          >
            {isLoading ? (
              <div className="py-14 flex flex-col items-center justify-center gap-2.5 text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin text-[#0A62D6]" />
                <span className="text-xs sm:text-sm font-medium">Đang tải danh sách bài tập...</span>
              </div>
            ) : visibleMissions.length === 0 ? (
              <div className="py-14 flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-2.5 text-slate-400">
                  <Inbox className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-700">
                  Không có bài tập nào trong mục này
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Học sinh chưa có bài tập phù hợp với bộ lọc đã chọn.
                </p>
              </div>
            ) : (
              <>
                {visibleMissions.map((item) => (
                  <MissionCardItem
                    key={item.id}
                    item={item}
                    onPreviewImage={setPreviewImage}
                    onToggleExempt={handleToggleExempt}
                  />
                ))}

                {/* Sentinel trigger infinite scroll khi cuộn tới cuối */}
                <div
                  ref={sentinelRef}
                  className="py-3 flex items-center justify-center"
                >
                  {isLoadingMore ? (
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500 py-1">
                      <Loader2 className="w-4 h-4 animate-spin text-[#0A62D6]" />
                      <span>Đang tải thêm các bài tập cũ hơn...</span>
                    </div>
                  ) : isReachingEnd && visibleMissions.length > 0 ? (
                    <span className="text-[11px] font-medium text-slate-400 py-0.5">
                      Đã hiển thị toàn bộ {totalFilteredCount} bài tập
                    </span>
                  ) : null}
                </div>
              </>
            )}
          </div>
        </ModalBody>

        <ModalFooter>
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-sm font-semibold transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </ModalFooter>
      </Modal>

      {/* Lightbox xem ảnh minh chứng phóng to */}
      {previewImage && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-2xl w-full max-h-[85vh] bg-white rounded-2xl overflow-hidden shadow-2xl p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-full h-full max-h-[80vh] flex items-center justify-center overflow-auto rounded-xl">
              <Image
                src={previewImage}
                alt="Minh chứng bài nộp"
                width={800}
                height={600}
                unoptimized
                style={{ height: "auto" }}
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/** Component nút lọc trạng thái dạng Compact Segmented Tab */
function CompactFilterTab({
  label,
  count,
  isActive,
  activeText = "text-[#0A62D6]",
  onClick,
}: {
  label: string;
  count: number;
  isActive: boolean;
  activeText?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 select-none ${
        isActive
          ? `bg-white ${activeText} font-bold shadow-2xs`
          : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
      }`}
    >
      <span>{label}</span>
      <span
        className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
          isActive
            ? "bg-slate-100 text-slate-800"
            : "bg-slate-200/70 text-slate-500"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

/** Component thẻ hiển thị 1 bài tập */
function MissionCardItem({
  item,
  onPreviewImage,
  onToggleExempt,
}: {
  item: RosterAssignedMissionItem;
  onPreviewImage: (url: string) => void;
  onToggleExempt: (missionId: string) => void;
}) {
  const statusBadge = getStatusBadge(item.status);
  const isExempt = item.status === "exempt";

  // Cấu hình Icon bài tập lấy theo chuẩn trang quản lý bài tập
  const isWriting = item.submission_type === "subjective_writing";
  const missionIconSrc = isWriting
    ? "/submissions/write.webp"
    : "/submissions/capture.webp";
  const missionIconBg = isWriting
    ? "bg-purple-50 border-purple-200 text-purple-700"
    : "bg-sky-50 border-sky-200 text-sky-700";

  return (
    <div
      className={`p-3.5 sm:p-4 rounded-xl border transition-all shadow-2xs space-y-3 ${
        isExempt
          ? "bg-slate-50/70 border-slate-200 opacity-80"
          : "bg-white border-slate-200/90 hover:border-slate-300"
      }`}
    >
      {/* Hàng 1: Icon bài tập + Tiêu đề + Trạng thái + Thưởng xu */}
      <div className="flex items-start gap-3">
        {/* Icon bài tập tham khảo từ trang bài tập */}
        <div
          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 border ${missionIconBg} shadow-2xs`}
          title={isWriting ? "Vở viết tay (AI chấm)" : "Ảnh chụp minh chứng"}
        >
          <Image
            src={missionIconSrc}
            alt={isWriting ? "Viết vở" : "Minh chứng"}
            width={30}
            height={30}
            unoptimized
            style={{ height: "auto" }}
            className="w-6.5 h-6.5 sm:w-7 sm:h-7 object-contain drop-shadow-2xs"
          />
        </div>

        {/* Khối giữa: Tiêu đề và Badges */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md border ${statusBadge.className}`}
            >
              {statusBadge.icon}
              {statusBadge.label}
            </span>
          </div>

          <h4 className="text-xs sm:text-sm font-bold text-[#0F172A] leading-snug line-clamp-1">
            {item.title}
          </h4>
        </div>

        {/* Mức thưởng xu */}
        <span className="inline-flex items-center gap-1 text-xs sm:text-sm font-heading font-black text-amber-950 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 shrink-0 shadow-2xs">
          <Image
            src="/wheel/coin.webp"
            alt="Xu"
            width={14}
            height={14}
            unoptimized
            style={{ height: "auto" }}
            className="w-3.5 h-3.5 object-contain shrink-0 drop-shadow-2xs"
          />
          {item.status === "approved"
            ? `+${(item.earned_coins || item.reward_coins).toLocaleString("vi-VN")} xu`
            : `Tối đa ${item.reward_coins} xu`}
        </span>
      </div>

      {/* Hướng dẫn / Mô tả bài tập */}
      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
        {item.description}
      </p>

      {/* Dòng mốc thời gian + Nút Miễn làm ngoại lệ (CHỈ hiện khi chưa nộp hoặc đã miễn làm) */}
      <div className="flex items-center justify-between gap-2 flex-wrap pt-2 border-t border-slate-100 text-[11px] text-slate-500">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="inline-flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            Giao: {formatDate(item.assigned_at, "dd/MM/yyyy")}
          </span>
          <span className="text-slate-300">•</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            Hạn nộp: {formatDate(item.deadline, "dd/MM/yyyy")}
          </span>
          {item.submitted_at && (
            <>
              <span className="text-slate-300">•</span>
              <span className="inline-flex items-center gap-1 text-[#0A62D6] font-medium">
                Đã nộp: {formatDate(item.submitted_at, "HH:mm, dd/MM")}
              </span>
            </>
          )}
        </div>

        {/* Nút hành động dành cho giáo viên: CHỈ xuất hiện khi CHƯA NỘP (assigned) hoặc ĐÃ MIỄN LÀM (exempt) */}
        {(item.status === "assigned" || isExempt) && (
          <div>
            {isExempt ? (
              <button
                type="button"
                onClick={() => onToggleExempt(item.id)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer shadow-2xs"
                title="Hủy miễn làm và mở lại bài tập này cho học sinh"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Hủy miễn làm</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onToggleExempt(item.id)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 border border-slate-200 transition-colors cursor-pointer shadow-2xs"
                title="Học sinh không cần làm bài này vì ngoại lệ (mới chuyển vào lớp, nghỉ ốm...)"
              >
                <ShieldBan className="w-3 h-3 text-slate-500 group-hover:text-purple-600" />
                <span>Miễn làm bài này</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Ảnh minh chứng bài làm (nếu có) - CĂN SÁT LỀ TRÁI */}
      {item.proof_image_urls && item.proof_image_urls.length > 0 && (
        <div className="flex items-center gap-2.5 pt-1">
          <span className="text-[11px] font-semibold text-slate-600 shrink-0">
            Minh chứng ({item.proof_image_urls.length}):
          </span>
          <div className="flex items-center gap-2">
            {item.proof_image_urls.map((url, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onPreviewImage(url)}
                className="group relative w-11 h-11 rounded-lg border border-slate-200 overflow-hidden bg-slate-100 hover:ring-2 hover:ring-[#0A62D6] transition-all cursor-pointer shrink-0 shadow-2xs"
                title="Bấm để xem ảnh lớn"
              >
                <Image
                  src={url}
                  alt={`Minh chứng ${idx + 1}`}
                  width={44}
                  height={44}
                  unoptimized
                  style={{ height: "auto" }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <span className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                  <ExternalLink className="w-3 h-3" />
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Nhận xét của cô giáo (nếu có) - CĂN SÁT LỀ TRÁI */}
      {item.teacher_feedback && (
        <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200/80 text-xs text-amber-950 flex items-start gap-2">
          <MessageSquare className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <span className="font-bold text-amber-900 block text-[11px]">
              Nhận xét của cô giáo:
            </span>
            <p className="text-amber-800 text-[11px] mt-0.5">
              {item.teacher_feedback}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function getStatusBadge(status: RosterMissionProgressStatus) {
  switch (status) {
    case "approved":
      return {
        label: "Đã hoàn thành",
        className: "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: <CheckCircle2 className="w-3 h-3 text-emerald-600" />,
      };
    case "submitted":
      return {
        label: "Chờ cô chấm",
        className: "bg-amber-50 text-amber-700 border-amber-200",
        icon: <Clock className="w-3 h-3 text-amber-600" />,
      };
    case "rejected":
      return {
        label: "Cần làm lại",
        className: "bg-rose-50 text-rose-700 border-rose-200",
        icon: <AlertCircle className="w-3 h-3 text-rose-600" />,
      };
    case "exempt":
      return {
        label: "Miễn làm (Ngoại lệ)",
        className: "bg-purple-50 text-purple-700 border-purple-200",
        icon: <ShieldBan className="w-3 h-3 text-purple-600" />,
      };
    case "assigned":
    default:
      return {
        label: "Chưa nộp bài",
        className: "bg-blue-50 text-blue-700 border-blue-200",
        icon: <Calendar className="w-3 h-3 text-blue-600" />,
      };
  }
}
