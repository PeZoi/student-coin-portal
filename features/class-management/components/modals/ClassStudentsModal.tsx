"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import {
  Users,
  Search,
  X,
  AlertCircle,
  Phone,
  Calendar,
  LayoutGrid,
  List,
} from "lucide-react";
import Image from "next/image";
import { formatDate } from "@/lib/date";
import { Tooltip } from "@/components/ui/tooltip";
import { Modal, ModalHeader, ModalBody, ModalFooter, ModalLoading } from "@/components/ui/modal";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { cn, getInitials } from "@/lib/utils";
import { MockClassItem } from "@/features/class-management/types";
import { teacherClassService } from "@/features/class-management/services/classService";
import { CACHE_KEYS } from "@/constants";
import { useTeacherClassesContext } from "@/features/class-management/contexts/TeacherClassesContext";
import { normalizeText } from "@/features/class-management/utils";
import { StudentCoinsBadge } from "@/features/student-management/components/StudentBadges";

interface ClassStudentsModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  item?: MockClassItem | null;
}

/**
 * Modal hiển thị danh sách học sinh của một lớp học cụ thể
 * - Sử dụng SWR để tự động cache và deduplicate request
 * - Hỗ trợ tìm kiếm nhanh học sinh theo tên, SĐT hoặc username
 * - Hỗ trợ 2 chế độ hiển thị: Dạng Bảng (Table) và Dạng Lưới (Grid)
 * - Hiển thị ảnh xu vàng 3D (/wheel/coin.webp) và avatar tối ưu
 */
export function ClassStudentsModal(props?: ClassStudentsModalProps) {
  const context = useTeacherClassesContext();
  const isOpen = props?.isOpen ?? context.isStudentsModalOpen;
  const onClose = props?.onClose ?? context.handleCloseStudentsModal;
  const item = props?.item !== undefined ? props.item : context.viewingStudentsClass;

  if (!isOpen || !item) return null;

  return (
    <ClassStudentsModalContent
      key={item.id}
      item={item}
      onClose={onClose}
    />
  );
}

interface ClassStudentsModalContentProps {
  item: MockClassItem;
  onClose: () => void;
}

function ClassStudentsModalContent({ item, onClose }: ClassStudentsModalContentProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Gọi SWR lấy danh sách học sinh của lớp học
  const {
    data: students = [],
    isLoading,
    error,
    mutate,
  } = useSWR(
    item.id ? CACHE_KEYS.CLASSES.STUDENTS(item.id) : null,
    () => teacherClassService.getClassStudents(item.id),
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  );

  // Lọc học sinh theo từ khóa tìm kiếm
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const query = normalizeText(searchQuery);

    return students.filter((s) => {
      const matchName = normalizeText(s.full_name).includes(query);
      const matchPhone = s.phone_zalo ? normalizeText(s.phone_zalo).includes(query) : false;
      const matchUsername = s.username ? normalizeText(s.username).includes(query) : false;
      return matchName || matchPhone || matchUsername;
    });
  }, [students, searchQuery]);

  // Thống kê tổng số xu hiện tại và tổng số xu tích lũy của cả lớp
  const totalCurrentCoins = useMemo(
    () => students.reduce((sum, s) => sum + (s.current_coins ?? 0), 0),
    [students]
  );
  const totalEarnedCoins = useMemo(
    () =>
      students.reduce(
        (sum, s) => sum + (s.total_earned_coins ?? s.current_coins ?? 0),
        0
      ),
    [students]
  );

  return (
    <Modal isOpen onClose={onClose} maxWidth="3xl">
      {/* 1. Header */}
      <ModalHeader
        icon={<Users className="w-5 h-5 text-[#0A62D6]" />}
        title={
          <div className="flex items-center gap-2 flex-wrap">
            <span>Danh sách học sinh</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#EAF2FF] text-[#0A62D6] border border-[#0A62D6]/20">
              {item.class_name}
            </span>
          </div>
        }
        description={
          <div className="flex items-center gap-2 flex-wrap text-slate-600 text-xs sm:text-[13px] mt-0.5">
            <span>
              Sĩ số:{" "}
              <strong className="text-slate-800 font-semibold">{students.length} học sinh</strong>
            </span>
            {students.length > 0 && (
              <>
                <span className="text-slate-300">•</span>
                <span className="inline-flex items-center gap-1">
                  <Image
                    src="/wheel/coin.webp"
                    alt="Ví xu"
                    width={14}
                    height={14}
                    unoptimized
                    style={{ height: "auto" }}
                    className="w-3.5 h-3.5 object-contain shrink-0"
                  />
                  <span>Ví lớp:</span>
                  <strong className="text-amber-800 font-bold tabular-nums">
                    {totalCurrentCoins.toLocaleString("vi-VN")}
                  </strong>{" "}
                  xu
                </span>
                <span className="text-slate-300">•</span>
                <span className="inline-flex items-center gap-1">
                  <Image
                    src="/wheel/coin.webp"
                    alt="Tổng xu"
                    width={14}
                    height={14}
                    unoptimized
                    style={{ height: "auto" }}
                    className="w-3.5 h-3.5 object-contain shrink-0"
                  />
                  <span>Tổng tích lũy:</span>
                  <strong className="text-slate-700 font-bold tabular-nums">
                    {totalEarnedCoins.toLocaleString("vi-VN")}
                  </strong>{" "}
                  xu
                </span>
              </>
            )}
          </div>
        }
        onClose={onClose}
      />

      {/* 2. Body */}
      <ModalBody className="p-4 sm:p-6 space-y-4">
        {/* Hàng công cụ: Ô tìm kiếm học sinh + Nút chuyển chế độ xem (Bảng / Lưới) */}
        <div className="flex items-center gap-2.5">
          {/* Ô tìm kiếm */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên học sinh, số điện thoại..."
              className="w-full h-11 pl-10 pr-9 rounded-xl bg-slate-50 border border-slate-200 text-sm text-[#0F172A] placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#0A62D6] focus:ring-2 focus:ring-[#0A62D6]/20 transition-all"
            />
            {searchQuery.length > 0 && (
              <Tooltip content="Xóa từ khóa tìm kiếm" side="top">
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="w-6 h-6 absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </Tooltip>
            )}
          </div>

          {/* Cụm nút chuyển đổi Chế độ xem: Bảng (Table) hoặc Lưới (Grid) */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 shrink-0">
            <Tooltip content="Chế độ xem bảng chi tiết" side="top">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                  viewMode === "table"
                    ? "bg-white text-[#0A62D6] shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">Bảng</span>
              </button>
            </Tooltip>

            <Tooltip content="Chế độ xem thẻ lưới" side="top">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                  viewMode === "grid"
                    ? "bg-white text-[#0A62D6] shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">Lưới</span>
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Trạng thái Loading xoay xoay chuẩn modal */}
        {isLoading && <ModalLoading text="Đang tải danh sách học sinh..." />}

        {/* Trạng thái Lỗi */}
        {!isLoading && error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>Không thể tải danh sách học sinh. Vui lòng thử lại.</span>
            </div>
            <button
              type="button"
              onClick={() => mutate()}
              className="px-3 py-1 bg-white hover:bg-rose-100 rounded-lg border border-rose-200 text-xs font-semibold cursor-pointer transition-colors shrink-0"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Danh sách học sinh */}
        {!isLoading && !error && (
          <>
            {filteredStudents.length === 0 ? (
              <div className="py-12 text-center flex flex-col items-center justify-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
                  <Users className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-semibold text-slate-800 mb-1">
                  {students.length === 0
                    ? "Lớp học chưa có học sinh nào"
                    : "Không tìm thấy học sinh phù hợp"}
                </h4>
                <p className="text-xs text-slate-500 max-w-sm">
                  {students.length === 0
                    ? "Học sinh được phân công vào lớp này sẽ tự động xuất hiện tại đây."
                    : `Không có học sinh nào khớp với từ khóa "${searchQuery}".`}
                </p>
              </div>
            ) : viewMode === "table" ? (
              /* ================= MODE 1: DẠNG BẢNG (TABLE MODE) ================= */
              <div className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs max-h-[50vh] overflow-y-auto">
                <Table containerClassName="overflow-x-auto scrollbar-none">
                  <TableHeader className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200 shadow-2xs">
                    <TableRow className="hover:bg-transparent">
                      <TableHead align="center" className="w-12 text-xs font-bold text-slate-500 uppercase tracking-wider py-3 whitespace-nowrap">
                        STT
                      </TableHead>
                      <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider py-3">
                        Học sinh
                      </TableHead>
                      <TableHead align="center" className="text-xs font-bold text-slate-500 uppercase tracking-wider py-3 whitespace-nowrap">
                        Số xu (Ví / Tổng)
                      </TableHead>
                      <TableHead align="right" className="text-xs font-bold text-slate-500 uppercase tracking-wider py-3 whitespace-nowrap">
                        Ngày vào
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student, index) => {
                      const formattedDate = formatDate(student.created_at);

                      return (
                        <TableRow
                          key={student.id}
                          className="hover:bg-[#EAF2FF]/40 transition-colors"
                        >
                          {/* 1. STT */}
                          <TableCell align="center" className="font-semibold text-xs text-slate-400 tabular-nums py-3 whitespace-nowrap">
                            {index + 1}
                          </TableCell>

                          {/* 2. Avatar & Họ tên kèm SĐT nhỏ ở dưới */}
                          <TableCell className="py-3">
                            <div className="flex items-center gap-3">
                              {student.avatar_url ? (
                                <Image
                                  src={student.avatar_url}
                                  alt={student.full_name || "Học sinh"}
                                  width={40}
                                  height={40}
                                  style={{ height: "auto" }}
                                  className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-200/80 shadow-2xs"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                                  {getInitials(student.full_name)}
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="font-bold text-sm text-[#0F172A] truncate">
                                  {student.full_name || "..."}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  {student.phone_zalo ? (
                                    <Tooltip content="Bấm để gọi hoặc liên hệ Zalo" side="top">
                                      <a
                                        href={`tel:${student.phone_zalo}`}
                                        className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-[#0A62D6] transition-colors"
                                      >
                                        <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                                        <span>{student.phone_zalo}</span>
                                      </a>
                                    </Tooltip>
                                  ) : (
                                    <span className="text-xs text-slate-400 font-medium">
                                      {student.username ? `@${student.username}` : "..."}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </TableCell>

                          {/* 3. Số xu: Hộp 2 tầng mini gọn gàng (Tái sử dụng StudentCoinsBadge) */}
                          <TableCell align="center" className="py-2.5 whitespace-nowrap">
                            <StudentCoinsBadge
                              currentCoins={student.current_coins}
                              totalEarnedCoins={student.total_earned_coins}
                            />
                          </TableCell>

                          {/* 4. Ngày tham gia */}
                          <TableCell align="right" className="py-3 text-xs text-slate-500 tabular-nums whitespace-nowrap">
                            {formattedDate ? (
                              <span className="inline-flex items-center gap-1 text-slate-500">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                <span>{formattedDate}</span>
                              </span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              /* ================= MODE 2: DẠNG LƯỚI (GRID MODE) ================= */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[52vh] overflow-y-auto pr-1">
                {filteredStudents.map((student, index) => {
                  const formattedDate = formatDate(student.created_at);

                  return (
                    <div
                      key={student.id}
                      className="p-3.5 rounded-2xl border border-slate-200/80 bg-white hover:border-[#0A62D6]/40 hover:shadow-2xs transition-all flex flex-col justify-between gap-3 shadow-2xs relative"
                    >
                      {/* Hàng 1: STT + Ngày vào lớp */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-500 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200/60 tabular-nums">
                          {index + 1}
                        </span>

                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{formattedDate}</span>
                        </span>
                      </div>

                      {/* Hàng 2: Avatar to + Tên học sinh + SĐT */}
                      <div className="flex items-center gap-3 min-w-0">
                        {student.avatar_url ? (
                          <Image
                            src={student.avatar_url}
                            alt={student.full_name || "Học sinh"}
                            width={48}
                            height={48}
                            style={{ height: "auto" }}
                            className="w-12 h-12 rounded-2xl object-cover shrink-0 border border-slate-200/80 shadow-2xs"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 text-white font-extrabold text-sm flex items-center justify-center shrink-0 shadow-2xs ring-2 ring-amber-100">
                            {getInitials(student.full_name)}
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-[15px] text-[#0F172A] truncate leading-snug">
                            {student.full_name || "..."}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                            {student.phone_zalo ? (
                              <Tooltip content="Bấm để gọi hoặc liên hệ Zalo" side="top">
                                <a
                                  href={`tel:${student.phone_zalo}`}
                                  className="inline-flex items-center gap-1.5 font-medium text-slate-500 hover:text-[#0A62D6] transition-colors truncate"
                                >
                                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <span className="truncate">{student.phone_zalo}</span>
                                </a>
                              </Tooltip>
                            ) : (
                              <span className="text-slate-400 font-medium truncate">
                                {student.username ? `@${student.username}` : "..."}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Hàng 3: 2 Ô chỉ số Mini Stat Cards song song hiện đại */}
                      <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-slate-100">
                        {/* Ô 1: Ví xu hiện tại */}
                        <div className="p-2 rounded-xl bg-gradient-to-br from-amber-50/90 to-orange-50/50 border border-amber-200/70 flex items-center gap-2">
                          <Image
                            src="/wheel/coin.webp"
                            alt="Ví xu"
                            width={20}
                            height={20}
                            unoptimized
                            style={{ height: "auto" }}
                            className="w-5 h-5 object-contain shrink-0 drop-shadow-xs"
                          />
                          <div className="min-w-0 leading-tight">
                            <p className="text-[10px] font-bold text-amber-700/80 uppercase tracking-wide truncate">
                              Ví hiện có
                            </p>
                            <p className="font-heading font-black text-sm text-amber-950 tabular-nums truncate">
                              {(student.current_coins ?? 0).toLocaleString("vi-VN")}{" "}
                              <span className="text-[10px] font-semibold text-amber-700 font-sans">xu</span>
                            </p>
                          </div>
                        </div>

                        {/* Ô 2: Tổng tích lũy */}
                        <div className="p-2 rounded-xl bg-slate-50/80 border border-slate-200/80 flex items-center gap-2">
                          <Image
                            src="/wheel/coin.webp"
                            alt="Tổng xu"
                            width={20}
                            height={20}
                            unoptimized
                            style={{ height: "auto" }}
                            className="w-5 h-5 object-contain shrink-0 drop-shadow-xs"
                          />
                          <div className="min-w-0 leading-tight">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide truncate">
                              Tổng tích lũy
                            </p>
                            <p className="font-heading font-black text-sm text-slate-800 tabular-nums truncate">
                              {(student.total_earned_coins ?? student.current_coins ?? 0).toLocaleString("vi-VN")}{" "}
                              <span className="text-[10px] font-semibold text-slate-500 font-sans">xu</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </ModalBody>

      {/* 3. Footer chuẩn hóa */}
      <ModalFooter
        leftNode={
          <span>
            Hiển thị{" "}
            <strong className="text-slate-800 font-bold">{filteredStudents.length}</strong> /{" "}
            {students.length} học sinh
          </span>
        }
        showCancel
        cancelLabel="Đóng"
        onCancel={onClose}
        showSubmit={false}
      />
    </Modal>
  );
}
