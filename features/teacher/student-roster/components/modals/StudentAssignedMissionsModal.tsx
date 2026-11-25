"use client";

import { useState, useCallback, useMemo } from "react";
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
  Table2,
  LayoutGrid,
  ChevronsUpDown,
  ChevronUp,
  ChevronDown,
  Eye,
} from "lucide-react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  TeacherRosterStudent,
  RosterAssignedMissionItem,
  RosterMissionProgressStatus,
} from "../../types";
import {
  useRosterAssignedMissionsInfinite,
} from "../../hooks/useRosterAssignedMissionsInfinite";
import { formatDate } from "@/lib/date";
import { StudentMissionStatus } from "@/constants";
import { useStudentRosterContext } from "../../contexts/StudentRosterContext";

export function StudentAssignedMissionsModal() {
  const {
    isMissionsModalOpen: isOpen,
    handleCloseMissionsModal: onClose,
    missionsStudent: student,
  } = useStudentRosterContext();

  if (!isOpen || !student) return null;

  return (
    <StudentAssignedMissionsDialogContent
      key={student.id}
      student={student}
      onClose={onClose}
    />
  );
}

type MissionViewMode = "table" | "card";
type MissionSortField = "title" | "deadline" | "reward_coins" | "status";
type SortDirection = "asc" | "desc" | "none";

interface DialogContentProps {
  student: TeacherRosterStudent;
  onClose: () => void;
}

function StudentAssignedMissionsDialogContent({
  student,
  onClose,
}: DialogContentProps) {
  const [viewMode, setViewMode] = useState<MissionViewMode>("table");

  // Sắp xếp cột trên bảng
  const [sortField, setSortField] = useState<MissionSortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("none");

  const {
    visibleMissions,
    totalFilteredCount,
    stats,
    isLoading,
    isLoadingMore,
    isReachingEnd,
    containerRef,
    sentinelRef,
    toggleExemptMission,
  } = useRosterAssignedMissionsInfinite(student, "all", () => {});

  // Thao tác đổi thứ tự sắp xếp
  const handleSortToggle = useCallback((field: MissionSortField) => {
    if (sortField !== field) {
      setSortField(field);
      setSortDirection("asc");
    } else {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortDirection("none");
        setSortField(null);
      } else {
        setSortDirection("asc");
      }
    }
  }, [sortField, sortDirection]);

  // Icon hiển thị chiều sắp xếp ở header bảng
  const renderSortIcon = useCallback(
    (field: MissionSortField) => {
      if (sortField !== field || sortDirection === "none") {
        return (
          <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400 opacity-60" />
        );
      }
      if (sortDirection === "asc") {
        return <ChevronUp className="w-3.5 h-3.5 text-[#0A62D6]" />;
      }
      return <ChevronDown className="w-3.5 h-3.5 text-[#0A62D6]" />;
    },
    [sortField, sortDirection]
  );

  // Danh sách bài tập đã được sắp xếp
  const displayedMissions = useMemo(() => {
    if (!sortField || sortDirection === "none") {
      return visibleMissions;
    }

    return [...visibleMissions].sort((a, b) => {
      let comparison = 0;
      if (sortField === "title") {
        comparison = a.title.localeCompare(b.title, "vi");
      } else if (sortField === "deadline") {
        const timeA = a.deadline ? new Date(a.deadline).getTime() : 0;
        const timeB = b.deadline ? new Date(b.deadline).getTime() : 0;
        comparison = timeA - timeB;
      } else if (sortField === "reward_coins") {
        const coinsA =
          a.status === StudentMissionStatus.APPROVED
            ? a.earned_coins || a.reward_coins
            : a.reward_coins;
        const coinsB =
          b.status === StudentMissionStatus.APPROVED
            ? b.earned_coins || b.reward_coins
            : b.reward_coins;
        comparison = coinsA - coinsB;
      } else if (sortField === "status") {
        const rankMap: Record<string, number> = {
          [StudentMissionStatus.SUBMITTED]: 4,
          [StudentMissionStatus.APPROVED]: 3,
          [StudentMissionStatus.ASSIGNED]: 2,
          [StudentMissionStatus.REJECTED]: 1,
          [StudentMissionStatus.EXEMPT]: 0,
        };
        comparison = (rankMap[a.status] ?? 0) - (rankMap[b.status] ?? 0);
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [visibleMissions, sortField, sortDirection]);

  // State xem phóng to ảnh minh chứng
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // State theo dõi id bài tập đang xử lý miễn làm (để loading nút tương ứng)
  const [exemptingMissionId, setExemptingMissionId] = useState<string | null>(
    null
  );

  // Xử lý miễn làm bài ngoại lệ
  const handleToggleExempt = useCallback(
    async (missionId: string) => {
      if (exemptingMissionId) return;
      setExemptingMissionId(missionId);
      try {
        const res = await toggleExemptMission(missionId);
        if (res) {
          if (res.status === StudentMissionStatus.EXEMPT) {
            toast.success(
              `Đã miễn làm bài "${res.title}" cho học sinh ${student.full_name} (ngoại lệ).`
            );
          } else {
            toast.info(
              `Đã hủy miễn làm, mở lại bài "${res.title}" cho học sinh ${student.full_name}.`
            );
          }
        }
      } finally {
        setExemptingMissionId(null);
      }
    },
    [toggleExemptMission, student.full_name, exemptingMissionId]
  );

  return (
    <>
      <Modal
        maxWidth="5xl"
        onClose={onClose}
        className="h-[88vh] max-h-[840px] flex flex-col"
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

        {/* ModalBody cuộn tự nhiên toàn bộ modal */}
        <ModalBody
          ref={containerRef}
          className="p-4 sm:p-6 flex-1 min-h-0 overflow-y-auto space-y-4"
        >
          {/* 1. Thanh tóm tắt tiến độ bài tập */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-slate-50/90 border border-slate-200/90 text-xs shrink-0">
            <div className="flex flex-col">
              <span className="text-slate-500 font-medium">Tiến độ hoàn thành:</span>
              <span className="font-heading font-black text-[#0F172A] text-sm sm:text-base mt-0.5">
                {stats.approved + stats.submitted + stats.exempt}/{stats.total} bài ({stats.progressPercent}%)
              </span>
              <div className="w-full h-1.5 bg-slate-200 rounded-full mt-1.5 overflow-hidden flex">
                {stats.approvedPercent > 0 && (
                  <div
                    className="h-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${stats.approvedPercent}%` }}
                    title={`Đã duyệt: ${stats.approved} bài (${stats.approvedPercent}%)`}
                  />
                )}
                {stats.submittedPercent > 0 && (
                  <div
                    className="h-full bg-amber-400 transition-all duration-300"
                    style={{ width: `${stats.submittedPercent}%` }}
                    title={`Chờ chấm: ${stats.submitted} bài (${stats.submittedPercent}%)`}
                  />
                )}
                {stats.exemptPercent > 0 && (
                  <div
                    className="h-full bg-purple-500 transition-all duration-300"
                    style={{ width: `${stats.exemptPercent}%` }}
                    title={`Miễn làm: ${stats.exempt} bài (${stats.exemptPercent}%)`}
                  />
                )}
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

          {/* 2. Tiêu đề danh sách & Chuyển đổi chế độ xem (Bảng / Thẻ) */}
          <div className="flex items-center justify-between gap-2 flex-wrap pt-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-[#0F172A]">
                Danh sách bài tập ({stats.total} bài)
              </span>
            </div>

            {/* Chuyển đổi chế độ xem: Bảng (Table) hoặc Thẻ (Card) */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200/60 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === "table"
                    ? "bg-white text-[#0A62D6] font-bold shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
                title="Chế độ xem Bảng"
              >
                <Table2 className="w-3.5 h-3.5" />
                <span>Bảng</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("card")}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === "card"
                    ? "bg-white text-[#0A62D6] font-bold shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
                title="Chế độ xem Thẻ"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Thẻ</span>
              </button>
            </div>
          </div>

          {/* 3. Danh sách bài tập (Table hoặc Card) */}
          {isLoading ? (
            <div className="py-14 flex flex-col items-center justify-center gap-2.5 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-[#0A62D6]" />
              <span className="text-xs sm:text-sm font-medium">
                Đang tải danh sách bài tập...
              </span>
            </div>
          ) : displayedMissions.length === 0 ? (
            <div className="py-14 flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-2.5 text-slate-400">
                <Inbox className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-700">
                Không có bài tập nào
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Học sinh chưa có bài tập nào được giao.
              </p>
            </div>
          ) : (
            <>
              {viewMode === "table" ? (
                <Table
                  containerClassName="border border-slate-200 rounded-xl overflow-x-auto md:overflow-x-hidden bg-white shadow-2xs"
                  className="w-full table-fixed"
                >
                  <TableHeader className="bg-slate-50/95 border-b border-slate-200 sticky top-0 z-10">
                    <TableRow className="hover:bg-transparent">
                      <TableHead
                        className="w-[34%] cursor-pointer hover:bg-slate-100/80 transition-colors select-none py-2.5 px-3"
                        onClick={() => handleSortToggle("title")}
                      >
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                          <span>Bài tập</span>
                          {renderSortIcon("title")}
                        </div>
                      </TableHead>

                      <TableHead
                        className="w-[17%] cursor-pointer hover:bg-slate-100/80 transition-colors select-none py-2.5 px-2.5 sm:px-3"
                        onClick={() => handleSortToggle("deadline")}
                      >
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                          <span>Giao - Hạn nộp</span>
                          {renderSortIcon("deadline")}
                        </div>
                      </TableHead>

                      <TableHead
                        align="right"
                        className="w-[12%] cursor-pointer hover:bg-slate-100/80 transition-colors select-none py-2.5 px-2 sm:px-2.5 text-right"
                        onClick={() => handleSortToggle("reward_coins")}
                      >
                        <div className="flex items-center justify-end gap-1.5 text-xs font-bold text-slate-700">
                          <span>Thưởng xu</span>
                          {renderSortIcon("reward_coins")}
                        </div>
                      </TableHead>

                      <TableHead
                        className="w-[21%] cursor-pointer hover:bg-slate-100/80 transition-colors select-none py-2.5 px-2.5 sm:px-3"
                        onClick={() => handleSortToggle("status")}
                      >
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                          <span>Trạng thái</span>
                          {renderSortIcon("status")}
                        </div>
                      </TableHead>

                      <TableHead
                        align="right"
                        className="w-[16%] py-2.5 px-2.5 sm:px-3 text-right"
                      >
                        <span className="text-xs font-bold text-slate-700 select-none">
                          Thao tác
                        </span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayedMissions.map((item) => (
                      <MissionTableItem
                        key={item.id}
                        item={item}
                        onPreviewImage={setPreviewImage}
                        onToggleExempt={handleToggleExempt}
                        isExempting={exemptingMissionId === item.id}
                      />
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="space-y-3">
                  {displayedMissions.map((item) => (
                    <MissionCardItem
                      key={item.id}
                      item={item}
                      onPreviewImage={setPreviewImage}
                      onToggleExempt={handleToggleExempt}
                      isExempting={exemptingMissionId === item.id}
                    />
                  ))}
                </div>
              )}

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
                ) : isReachingEnd && displayedMissions.length > 0 ? (
                  <span className="text-[11px] font-medium text-slate-400 py-0.5">
                    Đã hiển thị toàn bộ {totalFilteredCount} bài tập
                  </span>
                ) : null}
              </div>
            </>
          )}
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
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs overscroll-contain flex items-center justify-center p-4 animate-in fade-in duration-150"
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

/** Component hàng hiển thị 1 bài tập trong chế độ Bảng */
function MissionTableItem({
  item,
  onPreviewImage,
  onToggleExempt,
  isExempting = false,
}: {
  item: RosterAssignedMissionItem;
  onPreviewImage: (url: string) => void;
  onToggleExempt: (missionId: string) => void;
  isExempting?: boolean;
}) {
  const statusBadge = getStatusBadge(item.status);
  const isExempt = item.status === StudentMissionStatus.EXEMPT;

  const isWriting = item.submission_type === "subjective_writing";
  const missionIconSrc = isWriting
    ? "/submissions/write.webp"
    : "/submissions/capture.webp";
  const missionIconBg = isWriting
    ? "bg-purple-50 border-purple-200 text-purple-700"
    : "bg-sky-50 border-sky-200 text-sky-700";

  return (
    <TableRow
      className={
        isExempt
          ? "bg-purple-50/25 hover:bg-purple-50/50"
          : undefined
      }
    >
      {/* 1. avatar + tên bài làm có thể warp 2 dòng */}
      <TableCell className="py-2.5 px-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${missionIconBg} shadow-2xs`}
            title={isWriting ? "Vở viết tay (AI chấm)" : "Ảnh chụp minh chứng"}
          >
            <Image
              src={missionIconSrc}
              alt={isWriting ? "Viết vở" : "Minh chứng"}
              width={24}
              height={24}
              unoptimized
              style={{ height: "auto" }}
              className="w-5.5 h-5.5 object-contain drop-shadow-2xs"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h4
              className="text-xs sm:text-[13px] font-bold text-[#0F172A] leading-snug line-clamp-2 break-words"
              title={item.title}
            >
              {item.title}
            </h4>
            {/* Số xu thưởng cấu hình của bài tập */}
            <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-900 bg-amber-50/90 px-1.5 py-0.5 rounded border border-amber-200/80 mt-1 shadow-2xs">
              <Image
                src="/wheel/coin.webp"
                alt="Xu"
                width={12}
                height={12}
                unoptimized
                style={{ height: "auto" }}
                className="w-3 h-3 object-contain shrink-0"
              />
              <span>
                Thưởng:{" "}
                {item.min_reward_coins && item.max_reward_coins && item.min_reward_coins !== item.max_reward_coins
                  ? `+${item.min_reward_coins} - ${item.max_reward_coins} xu`
                  : `+${item.max_reward_coins || item.reward_coins} xu`}
              </span>
            </div>
          </div>
        </div>
      </TableCell>

      {/* 2. giao - hạn nộp */}
      <TableCell className="py-2.5 px-2.5 sm:px-3 whitespace-nowrap">
        <div className="space-y-0.5 text-[11px]">
          <div className="flex items-center gap-1 text-slate-500">
            <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
            <span>Giao: {formatDate(item.assigned_at, "dd/MM/yyyy")}</span>
          </div>
          <div className="flex items-center gap-1 font-semibold text-slate-700">
            <Clock className="w-3 h-3 text-amber-500 shrink-0" />
            <span>
              Hạn: {item.deadline ? formatDate(item.deadline, "dd/MM/yyyy") : "Không có"}
            </span>
          </div>
        </div>
      </TableCell>

      {/* 3. Xu thực tế nhận (Final) */}
      <TableCell className="py-2.5 px-2 sm:px-2.5 text-right whitespace-nowrap">
        {item.status === StudentMissionStatus.APPROVED ? (
          <span
            className="inline-flex items-center gap-1 text-xs font-heading font-black text-amber-950 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 shadow-2xs"
            title={`Xu thực tế học sinh đã nhận: +${(item.earned_coins ?? item.reward_coins).toLocaleString("vi-VN")} xu`}
          >
            <Image
              src="/wheel/coin.webp"
              alt="Xu"
              width={14}
              height={14}
              unoptimized
              style={{ height: "auto" }}
              className="w-3.5 h-3.5 object-contain shrink-0 drop-shadow-2xs"
            />
            <span>+{(item.earned_coins ?? item.reward_coins).toLocaleString("vi-VN")} xu</span>
          </span>
        ) : (
          <span
            className="inline-flex items-center gap-1 text-xs font-heading font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200/90 shadow-2xs"
            title={
              item.status === StudentMissionStatus.SUBMITTED
                ? "Đang chờ cô chấm điểm, chưa nhận xu"
                : "Chưa hoàn thành, chưa nhận xu"
            }
          >
            <Image
              src="/wheel/coin.webp"
              alt="Xu"
              width={14}
              height={14}
              unoptimized
              style={{ height: "auto" }}
              className="w-3.5 h-3.5 object-contain shrink-0 opacity-40 grayscale"
            />
            <span>+0 xu</span>
          </span>
        )}
      </TableCell>

      {/* 4. trạng thái + đã nộp (vừa badge và ở dưới là ngày giờ đã nộp) */}
      <TableCell className="py-2.5 px-2.5 sm:px-3 whitespace-nowrap">
        <div className="space-y-1">
          <div>
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md border ${statusBadge.className}`}
            >
              {statusBadge.icon}
              {statusBadge.label}
            </span>
          </div>
          {item.submitted_at && (
            <div className="text-[11px] text-[#0A62D6] font-medium flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#0A62D6] shrink-0" />
              <span>Nộp: {formatDate(item.submitted_at, "HH:mm, dd/MM")}</span>
            </div>
          )}
        </div>
      </TableCell>

      {/* 5. action miễn làm nếu có */}
      <TableCell className="py-2.5 px-2.5 sm:px-3 text-right whitespace-nowrap">
        {item.status === StudentMissionStatus.ASSIGNED || isExempt ? (
          <div>
            {isExempt ? (
              <button
                type="button"
                disabled={isExempting}
                onClick={() => onToggleExempt(item.id)}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer shadow-2xs disabled:opacity-60 disabled:cursor-not-allowed group"
                title="Hủy miễn làm và mở lại bài tập này cho học sinh"
              >
                {isExempting ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin text-emerald-600" />
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-3 h-3 text-emerald-600" />
                    <span>Bỏ miễn</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                disabled={isExempting}
                onClick={() => onToggleExempt(item.id)}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer shadow-2xs disabled:opacity-60 disabled:cursor-not-allowed group"
                title="Miễn làm bài tập này cho học sinh"
              >
                {isExempting ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin text-slate-600" />
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    <ShieldBan className="w-3 h-3 text-slate-500 group-hover:text-purple-600" />
                    <span>Miễn làm</span>
                  </>
                )}
              </button>
            )}
          </div>
        ) : item.proof_image_urls && item.proof_image_urls.length > 0 ? (
          <button
            type="button"
            onClick={() => onPreviewImage(item.proof_image_urls![0])}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-[#0A62D6] hover:bg-[#EAF2FF] transition-colors cursor-pointer"
            title="Bấm để xem ảnh minh chứng bài làm"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Xem ảnh ({item.proof_image_urls.length})</span>
          </button>
        ) : (
          <span className="text-slate-300 text-xs">-</span>
        )}
      </TableCell>
    </TableRow>
  );
}

/** Component thẻ hiển thị 1 bài tập */
function MissionCardItem({
  item,
  onPreviewImage,
  onToggleExempt,
  isExempting = false,
}: {
  item: RosterAssignedMissionItem;
  onPreviewImage: (url: string) => void;
  onToggleExempt: (missionId: string) => void;
  isExempting?: boolean;
}) {
  const statusBadge = getStatusBadge(item.status);
  const isExempt = item.status === StudentMissionStatus.EXEMPT;

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
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-900 bg-amber-50/90 px-1.5 py-0.5 rounded border border-amber-200/80 shadow-2xs">
              <Image
                src="/wheel/coin.webp"
                alt="Xu"
                width={12}
                height={12}
                unoptimized
                style={{ height: "auto" }}
                className="w-3 h-3 object-contain shrink-0"
              />
              <span>
                Thưởng:{" "}
                {item.min_reward_coins && item.max_reward_coins && item.min_reward_coins !== item.max_reward_coins
                  ? `+${item.min_reward_coins} - ${item.max_reward_coins} xu`
                  : `+${item.max_reward_coins || item.reward_coins} xu`}
              </span>
            </span>
          </div>

          <h4 className="text-xs sm:text-sm font-bold text-[#0F172A] leading-snug line-clamp-1">
            {item.title}
          </h4>
        </div>

        {/* Xu thực tế nhận (Final) */}
        {item.status === StudentMissionStatus.APPROVED ? (
          <span
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-heading font-black text-amber-950 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 shrink-0 shadow-2xs"
            title={`Xu thực tế học sinh đã nhận: +${(item.earned_coins ?? item.reward_coins).toLocaleString("vi-VN")} xu`}
          >
            <Image
              src="/wheel/coin.webp"
              alt="Xu"
              width={14}
              height={14}
              unoptimized
              style={{ height: "auto" }}
              className="w-3.5 h-3.5 object-contain shrink-0 drop-shadow-2xs"
            />
            <span>+{(item.earned_coins ?? item.reward_coins).toLocaleString("vi-VN")} xu</span>
          </span>
        ) : (
          <span
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-heading font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/90 shrink-0 shadow-2xs"
            title={
              item.status === StudentMissionStatus.SUBMITTED
                ? "Đang chờ cô chấm điểm, chưa nhận xu"
                : "Chưa hoàn thành, chưa nhận xu"
            }
          >
            <Image
              src="/wheel/coin.webp"
              alt="Xu"
              width={14}
              height={14}
              unoptimized
              style={{ height: "auto" }}
              className="w-3.5 h-3.5 object-contain shrink-0 opacity-40 grayscale"
            />
            <span>+0 xu</span>
          </span>
        )}
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
        {(item.status === StudentMissionStatus.ASSIGNED || isExempt) && (
          <div>
            {isExempt ? (
              <button
                type="button"
                disabled={isExempting}
                onClick={() => onToggleExempt(item.id)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer shadow-2xs disabled:opacity-60 disabled:cursor-not-allowed"
                title="Hủy miễn làm và mở lại bài tập này cho học sinh"
              >
                {isExempting ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin text-emerald-600" />
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-3 h-3" />
                    <span>Hủy miễn làm</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                disabled={isExempting}
                onClick={() => onToggleExempt(item.id)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 border border-slate-200 transition-colors cursor-pointer shadow-2xs disabled:opacity-60 disabled:cursor-not-allowed"
                title="Học sinh không cần làm bài này vì ngoại lệ (mới chuyển vào lớp, nghỉ ốm...)"
              >
                {isExempting ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin text-purple-600" />
                    <span>Đang miễn làm...</span>
                  </>
                ) : (
                  <>
                    <ShieldBan className="w-3 h-3 text-slate-500 group-hover:text-purple-600" />
                    <span>Miễn làm bài này</span>
                  </>
                )}
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
    case StudentMissionStatus.APPROVED:
      return {
        label: "Đã hoàn thành",
        className: "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: <CheckCircle2 className="w-3 h-3 text-emerald-600" />,
      };
    case StudentMissionStatus.SUBMITTED:
      return {
        label: "Chờ cô chấm",
        className: "bg-amber-50 text-amber-700 border-amber-200",
        icon: <Clock className="w-3 h-3 text-amber-600" />,
      };
    case StudentMissionStatus.REJECTED:
      return {
        label: "Cần làm lại",
        className: "bg-rose-50 text-rose-700 border-rose-200",
        icon: <AlertCircle className="w-3 h-3 text-rose-600" />,
      };
    case StudentMissionStatus.EXEMPT:
      return {
        label: "Miễn làm",
        className: "bg-purple-50 text-purple-700 border-purple-200",
        icon: <ShieldBan className="w-3 h-3 text-purple-600" />,
      };
    case StudentMissionStatus.ASSIGNED:
    default:
      return {
        label: "Chưa nộp bài",
        className: "bg-blue-50 text-blue-700 border-blue-200",
        icon: <Calendar className="w-3 h-3 text-blue-600" />,
      };
  }
}
