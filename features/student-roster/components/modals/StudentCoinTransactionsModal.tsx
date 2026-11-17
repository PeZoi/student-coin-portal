"use client";

import Image from "next/image";
import {
  Sparkles,
  BookOpenCheck,
  Mic,
  Dices,
  Gift,
  Trophy,
  SlidersHorizontal,
  Inbox,
  Loader2,
  Coins,
  type LucideIcon,
} from "lucide-react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal";
import { TeacherRosterStudent, RosterCoinTransactionItem } from "../../types";
import { useRosterCoinTransactionsInfinite } from "../../hooks/useRosterCoinTransactionsInfinite";
import { getCoinSourceConfig } from "@/constants/coins";
import { formatDate } from "@/lib/date";

/** Bảng ánh xạ icon component từ Lucide tương ứng với từng loại giao dịch */
const ICON_MAP: Record<string, LucideIcon> = {
  BookOpenCheck,
  Sparkles,
  Mic,
  SlidersHorizontal,
  Gift,
  Trophy,
  Dices,
  Coins,
};

interface StudentCoinTransactionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: TeacherRosterStudent | null;
}

/**
 * Modal hiển thị Lịch sử giao dịch ví xu Heo Đất của học sinh trong danh sách sổ lớp
 * - Đồng bộ 100% với giao diện bên quản lý học sinh và bảng DB `coin_transactions`
 * - Hỗ trợ cuộn vô tận (Infinite Scroll) mượt mà
 */
export function StudentCoinTransactionsModal({
  isOpen,
  onClose,
  student,
}: StudentCoinTransactionsModalProps) {
  if (!isOpen || !student) return null;

  return (
    <StudentCoinTransactionsDialogContent
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

function StudentCoinTransactionsDialogContent({
  student,
  onClose,
}: DialogContentProps) {
  const {
    transactions,
    totalCount,
    isLoadingMore,
    isReachingEnd,
    containerRef,
    sentinelRef,
  } = useRosterCoinTransactionsInfinite(student);

  return (
    <Modal
      maxWidth="lg"
      onClose={onClose}
      className="h-[82vh] max-h-[700px] flex flex-col"
    >
      <ModalHeader
        icon={<Coins className="w-6 h-6 text-[#0A62D6]" />}
        title="Lịch sử giao dịch ví xu"
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

      <ModalBody className="p-4 sm:p-5 flex-1 min-h-0 overflow-hidden flex flex-col gap-3.5">
        {/* Thanh tóm tắt ngang (Summary Ribbon) rõ ràng, dễ nhìn */}
        <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50/90 border border-slate-200/90 text-xs sm:text-sm shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Số dư ví:</span>
            <span className="inline-flex items-center gap-1 font-heading font-black text-amber-950 tabular-nums">
              <Image
                src="/wheel/coin.webp"
                alt="Xu ví"
                width={16}
                height={16}
                unoptimized
                style={{ height: "auto" }}
                className="w-4 h-4 object-contain shrink-0"
              />
              {student.current_coins.toLocaleString("vi-VN")} xu
            </span>
          </div>

          <span className="text-slate-300">•</span>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Đã tích lũy:</span>
            <span className="font-bold text-slate-800 tabular-nums">
              {(student.total_earned_coins ?? student.current_coins).toLocaleString("vi-VN")} xu
            </span>
          </div>

          <span className="text-slate-300">•</span>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Tổng GD:</span>
            <span className="font-bold text-slate-700 tabular-nums">
              {totalCount} lần
            </span>
          </div>
        </div>

        {/* Vùng danh sách giao dịch dạng Infinite Scroll - VÙNG CUỘN DUY NHẤT */}
        <div
          ref={containerRef}
          className="flex-1 min-h-0 overflow-y-auto pr-1 divide-y divide-slate-100 border border-slate-200/90 rounded-xl bg-white shadow-2xs overflow-hidden"
        >
            {transactions.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center p-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-2.5 text-slate-400">
                  <Inbox className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-700">
                  Chưa có giao dịch xu nào
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Học sinh chưa có biến động cộng hoặc trừ xu.
                </p>
              </div>
            ) : (
              <>
                {transactions.map((tx) => (
                  <CompactTransactionRow key={tx.id} tx={tx} />
                ))}

                {/* Sentinel trigger infinite scroll khi cuộn tới cuối */}
                <div
                  ref={sentinelRef}
                  className="py-2.5 px-3 flex items-center justify-center bg-slate-50/50"
                >
                  {isLoadingMore ? (
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500 py-1">
                      <Loader2 className="w-4 h-4 animate-spin text-[#0A62D6]" />
                      <span>Đang tải thêm giao dịch cũ hơn...</span>
                    </div>
                  ) : isReachingEnd && transactions.length > 0 ? (
                    <span className="text-[11px] font-medium text-slate-400 py-0.5">
                      Đã hiển thị toàn bộ {totalCount} giao dịch
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
  );
}

/**
 * Hàng hiển thị chi tiết 1 giao dịch xu:
 * Dòng 1: [Badge nguồn] Mô tả / Lý do                 +XX xu
 * Dòng 2: Thời gian • Người điều chỉnh / Hệ thống • Trước → Sau
 */
function CompactTransactionRow({ tx }: { tx: RosterCoinTransactionItem }) {
  const isPositive = tx.amount > 0;
  const config = getCoinSourceConfig(tx.tx_type);
  const IconComponent = ICON_MAP[config.iconName] || Coins;

  const actorText = tx.creator_name
    ? `${tx.creator_name}${tx.creator_role ? ` (${formatRoleShort(tx.creator_role)})` : ""}`
    : "Hệ thống";

  return (
    <div className="p-3 px-3.5 hover:bg-slate-50/90 transition-colors flex items-center gap-3.5">
      {/* Icon riêng biệt cho từng nguồn */}
      <div
        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 ${config.iconBg}`}
        title={config.label}
      >
        <IconComponent className={`w-4.5 h-4.5 sm:w-5 sm:h-5 ${config.iconColor}`} />
      </div>

      {/* Thông tin chính */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold shrink-0 border ${config.badgeBg} ${config.badgeBorder} ${config.badgeText}`}
          >
            {config.shortLabel}
          </span>
          <p className="text-xs sm:text-sm font-semibold text-[#0F172A] truncate">
            {tx.description}
          </p>
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-1.5 flex-wrap mt-1 font-sans">
          <span>{formatDate(tx.created_at, "HH:mm, dd/MM/yyyy")}</span>
          <span className="text-slate-300">•</span>
          <span
            className={
              tx.creator_name
                ? "text-[#0A62D6] font-medium"
                : "text-slate-600 font-medium"
            }
          >
            Bởi {actorText}
          </span>
        </div>
      </div>

      {/* Cột phải: Mức biến động xu & Số dư Trước -> Sau */}
      <div className="text-right shrink-0">
        <span
          className={`inline-flex items-center gap-1 text-sm sm:text-base font-heading font-black tabular-nums ${
            isPositive ? "text-emerald-600" : "text-rose-600"
          }`}
        >
          <span>
            {isPositive
              ? `+${tx.amount.toLocaleString("vi-VN")}`
              : tx.amount.toLocaleString("vi-VN")}
          </span>
          <Image
            src="/wheel/coin.webp"
            alt="Xu"
            width={16}
            height={16}
            unoptimized
            style={{ height: "auto" }}
            className="w-4 h-4 object-contain shrink-0 drop-shadow-2xs"
          />
        </span>

        <div className="text-xs text-slate-400 font-mono tabular-nums leading-none mt-1">
          <span>{tx.balance_before.toLocaleString("vi-VN")}</span>
          <span className="mx-1 text-slate-300">→</span>
          <strong className="font-bold text-slate-700">
            {tx.balance_after.toLocaleString("vi-VN")}
          </strong>
          <span className="ml-0.5 text-[11px] text-slate-400 font-sans">xu</span>
        </div>
      </div>
    </div>
  );
}

function formatRoleShort(role?: string | null): string {
  if (!role) return "";
  if (role === "admin") return "Admin";
  if (role === "super_teacher") return "Tổ trưởng";
  if (role === "teacher") return "GV";
  return role;
}
