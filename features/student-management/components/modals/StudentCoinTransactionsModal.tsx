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
import { useManageStudentsContext } from "../../contexts/ManageStudentsContext";
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

interface StudentCoinTransactionsModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  studentItem?: StudentItem | null;
}

export function StudentCoinTransactionsModal(
  props?: StudentCoinTransactionsModalProps
) {
  const context = useManageStudentsContext();
  const isOpen = props?.isOpen ?? context.isTransactionsOpen;
  const onClose = props?.onClose ?? context.handleCloseTransactions;
  const studentItem =
    props?.studentItem !== undefined
      ? props.studentItem
      : context.viewingTransactionsStudent;

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
    <Modal maxWidth="lg" onClose={onClose}>
      <ModalHeader
        icon={<Coins className="w-6 h-6 text-[#0A62D6]" />}
        title="Lịch sử giao dịch ví xu"
        description={
          <span className="text-xs sm:text-sm">
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

      <ModalBody>
        <div className="space-y-4">
          {/* Thanh tóm tắt ngang (Summary Ribbon) rõ ràng, dễ nhìn */}
          <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50/90 border border-slate-200/90 text-xs sm:text-sm">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Số dư ví:</span>
              <span className="inline-flex items-center gap-1 font-heading font-black text-amber-950 tabular-nums">
                <Image
                  src="/coin.png"
                  alt="Xu ví"
                  width={16}
                  height={16}
                  unoptimized
                  style={{ height: "auto" }}
                  className="w-4 h-4 object-contain shrink-0"
                />
                {studentItem.current_coins.toLocaleString("vi-VN")} xu
              </span>
            </div>

            <span className="text-slate-300">•</span>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Đã tích lũy:</span>
              <span className="font-bold text-slate-800 tabular-nums">
                {studentItem.total_earned_coins.toLocaleString("vi-VN")} xu
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

          {/* Vùng danh sách giao dịch dạng Infinite Scroll */}
          <div
            ref={containerRef}
            className="max-h-[420px] overflow-y-auto pr-1 divide-y divide-slate-100 border border-slate-200/90 rounded-xl bg-white shadow-2xs overflow-hidden"
          >
            {isInitialLoading ? (
              <div className="py-14 flex flex-col items-center justify-center gap-2.5 text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin text-[#0A62D6]" />
                <span className="text-xs sm:text-sm font-medium">Đang tải lịch sử giao dịch...</span>
              </div>
            ) : error ? (
              <div className="py-10 text-center text-xs sm:text-sm text-rose-600 font-medium">
                Không thể tải lịch sử giao dịch. Vui lòng thử lại sau.
              </div>
            ) : transactions.length === 0 ? (
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
 * Dòng giao dịch tối ưu, to rõ, dễ nhìn:
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
    <div className="p-3 px-3.5 hover:bg-slate-50/90 transition-colors flex items-center gap-3.5">
      {/* Icon riêng biệt cho từng nguồn với màu sắc đặc trưng (kích thước lớn hơn) */}
      <div
        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 ${config.iconBg}`}
        title={config.label}
      >
        <IconComponent className={`w-4.5 h-4.5 sm:w-5 sm:h-5 ${config.iconColor}`} />
      </div>

      {/* Thông tin chính (2 dòng to rõ) */}
      <div className="flex-1 min-w-0">
        {/* Dòng 1: Tag nguồn + Mô tả / Lý do */}
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

        {/* Dòng 2: Metadata phụ */}
        <div className="text-xs text-slate-500 flex items-center gap-1.5 flex-wrap mt-1 font-sans">
          <span>{formatDate(tx.created_at, "HH:mm, dd/MM/yyyy")}</span>
          <span className="text-slate-300">•</span>
          <span className={tx.creator_name ? "text-[#0A62D6] font-medium" : "text-slate-600 font-medium"}>
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
            src="/coin.png"
            alt="Xu"
            width={16}
            height={16}
            unoptimized
            style={{ height: "auto" }}
            className="w-4 h-4 object-contain shrink-0 drop-shadow-2xs"
          />
        </span>

        {/* Hiển thị rõ số dư: Trước -> Sau */}
        <div className="text-xs text-slate-400 font-mono tabular-nums leading-none mt-1">
          <span>{tx.balance_before.toLocaleString("vi-VN")}</span>
          <span className="mx-1 text-slate-300">→</span>
          <strong className="font-bold text-slate-700">{tx.balance_after.toLocaleString("vi-VN")}</strong>
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
