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
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal";
import { StudentItem, StudentCoinTransactionItem } from "../../types";
import { useOptionalManageStudentsContext } from "../../contexts/ManageStudentsContext";
import { useOptionalStudentRosterContext } from "@/features/teacher/student-roster/contexts/StudentRosterContext";
import { useStudentCoinTransactionsInfinite } from "../../hooks/useStudentCoinTransactionsInfinite";
import { getCoinSourceConfig } from "@/constants/coins";
import { formatDate } from "@/lib/date";

/** Bảng ánh xạ icon component từ Lucide */
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

export function StudentCoinTransactionsModal() {
  const manageCtx = useOptionalManageStudentsContext();
  const rosterCtx = useOptionalStudentRosterContext();

  const isOpen = manageCtx
    ? manageCtx.isTransactionsOpen
    : (rosterCtx?.isHistoryModalOpen ?? false);
  const onClose = manageCtx
    ? manageCtx.handleCloseTransactions
    : (rosterCtx?.handleCloseHistoryModal ?? (() => {}));
  const studentItem = manageCtx
    ? manageCtx.viewingTransactionsStudent
    : (rosterCtx?.toStudentItem(rosterCtx.historyStudent) ?? null);

  if (!isOpen || !studentItem) return null;

  return (
    <StudentCoinTransactionsDialogContent
      key={studentItem.id}
      studentItem={studentItem}
      onClose={onClose}
    />
  );
}

interface DialogContentProps {
  studentItem: StudentItem;
  onClose: () => void;
}

function StudentCoinTransactionsDialogContent({
  studentItem,
  onClose,
}: DialogContentProps) {
  const {
    transactions,
    totalCount,
    isInitialLoading,
    isLoadingMore,
    isReachingEnd,
    error,
    containerRef,
    sentinelRef,
  } = useStudentCoinTransactionsInfinite(studentItem?.id);

  return (
    <Modal maxWidth="xl" onClose={onClose}>
      <ModalHeader
        icon={<Coins className="w-5 h-5 text-amber-500" />}
        title="Lịch sử giao dịch ví xu"
        description={
          <span className="text-xs text-slate-500">
            Học sinh:{" "}
            <span className="font-bold text-[#0F172A]">
              {studentItem.full_name}
            </span>{" "}
            • Lớp:{" "}
            <span className="font-bold text-[#0A62D6]">
              {studentItem.class_name || "Chưa phân lớp"}
            </span>
          </span>
        }
        onClose={onClose}
      />

      <ModalBody className="p-3.5 sm:p-5 space-y-3">
        {/* Thanh tóm tắt 3 chỉ số nhỏ gọn, hiện đại */}
        <div className="grid grid-cols-3 gap-2">
          <div className="px-3 py-2 rounded-xl bg-amber-50/70 border border-amber-200/80">
            <span className="text-[11px] font-medium text-amber-800 block">Số dư hiện tại</span>
            <div className="inline-flex items-center gap-1 mt-0.5">
              <Image
                src="/wheel/coin.webp"
                alt="Xu ví"
                width={14}
                height={14}
                unoptimized
                style={{ height: "auto" }}
                className="w-3.5 h-3.5 object-contain shrink-0"
              />
              <span className="font-heading font-black text-amber-950 text-xs sm:text-sm tabular-nums">
                {studentItem.current_coins.toLocaleString("vi-VN")} xu
              </span>
            </div>
          </div>

          <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] font-medium text-slate-500 block">Đã tích lũy</span>
            <span className="font-heading font-bold text-slate-800 text-xs sm:text-sm tabular-nums mt-0.5 block">
              {studentItem.total_earned_coins.toLocaleString("vi-VN")} xu
            </span>
          </div>

          <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] font-medium text-slate-500 block">Tổng giao dịch</span>
            <span className="font-heading font-bold text-slate-700 text-xs sm:text-sm tabular-nums mt-0.5 block">
              {totalCount} lần
            </span>
          </div>
        </div>

        {/* Vùng danh sách giao dịch dạng Infinite Scroll */}
        <div
          ref={containerRef}
          className="max-h-[350px] overflow-y-auto divide-y divide-slate-100 border border-slate-200/90 rounded-xl bg-white shadow-2xs"
        >
          {isInitialLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin text-[#0A62D6]" />
              <span className="text-xs font-medium">Đang tải lịch sử giao dịch...</span>
            </div>
          ) : error ? (
            <div className="py-8 text-center text-xs text-rose-600 font-medium">
              Không thể tải lịch sử giao dịch. Vui lòng thử lại sau.
            </div>
          ) : transactions.length === 0 ? (
            <div className="py-10 flex flex-col items-center justify-center text-center p-4">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-2 text-slate-400">
                <Inbox className="w-5 h-5" />
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-700">
                Chưa có giao dịch xu nào
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
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
                className="py-2 px-3 flex items-center justify-center bg-slate-50/50"
              >
                {isLoadingMore ? (
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 py-0.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0A62D6]" />
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

      <ModalFooter className="flex items-center justify-end pt-2 pb-0">
        <button
          type="button"
          onClick={onClose}
          className="h-9 px-4 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
        >
          Đóng
        </button>
      </ModalFooter>
    </Modal>
  );
}

/**
 * Dòng giao dịch tối ưu, thanh lịch, chuẩn UI/UX:
 * Dòng 1: [Badge nguồn] Mô tả / Lý do                 +XX xu
 * Dòng 2: Thời gian • Người điều chỉnh / Hệ thống • Trước → Sau
 */
function CompactTransactionRow({ tx }: { tx: StudentCoinTransactionItem }) {
  const isPositive = tx.amount > 0;
  // Nhận diện nguồn xu thuần túy từ tx_type
  const config = getCoinSourceConfig(tx.tx_type);
  const IconComponent = ICON_MAP[config.iconName] || Coins;

  // Xác định người thực hiện: nếu creator_name/created_by là null thì luôn là "Hệ thống"
  const actorText = tx.creator_name
    ? `${tx.creator_name}${tx.creator_role ? ` (${formatRoleShort(tx.creator_role)})` : ""}`
    : "Hệ thống";

  return (
    <div className="py-2.5 px-3 sm:px-3.5 hover:bg-slate-50/80 transition-colors flex items-center gap-3">
      {/* Icon riêng biệt cho từng nguồn */}
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${config.iconBg}`}
        title={config.label}
      >
        <IconComponent className={`w-4 h-4 ${config.iconColor}`} />
      </div>

      {/* Thông tin chính */}
      <div className="flex-1 min-w-0">
        {/* Dòng 1: Tag nguồn + Mô tả / Lý do */}
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 border ${config.badgeBg} ${config.badgeBorder} ${config.badgeText}`}
          >
            {config.shortLabel}
          </span>
          <p
            className="text-xs sm:text-[13px] font-semibold text-[#0F172A] truncate"
            title={tx.description}
          >
            {tx.description}
          </p>
        </div>

        {/* Dòng 2: Metadata phụ */}
        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5 font-sans">
          <span>{formatDate(tx.created_at, "HH:mm, dd/MM/yyyy")}</span>
          <span className="text-slate-300">•</span>
          <span className={tx.creator_name ? "text-[#0A62D6] font-medium" : "text-slate-500 font-medium"}>
            Bởi {actorText}
          </span>
        </div>
      </div>

      {/* Cột phải: Mức biến động xu & Số dư Trước -> Sau */}
      <div className="text-right shrink-0">
        <span
          className={`inline-flex items-center gap-1 text-xs sm:text-sm font-heading font-black tabular-nums ${
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
            width={14}
            height={14}
            unoptimized
            style={{ height: "auto" }}
            className="w-3.5 h-3.5 object-contain shrink-0 drop-shadow-2xs"
          />
        </span>

        {/* Hiển thị rõ số dư: Trước -> Sau */}
        <div className="text-[11px] text-slate-400 font-mono tabular-nums leading-tight mt-0.5">
          <span>{tx.balance_before.toLocaleString("vi-VN")}</span>
          <span className="mx-0.5 text-slate-300">→</span>
          <strong className="font-semibold text-slate-700">{tx.balance_after.toLocaleString("vi-VN")}</strong>
          <span className="ml-0.5 text-[10px] text-slate-400 font-sans">xu</span>
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
