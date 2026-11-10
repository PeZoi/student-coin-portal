"use client";

import { useState, useCallback } from "react";
import { Coins, PlusCircle, MinusCircle, Sparkles } from "lucide-react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal";
import { StudentItem, AdjustCoinsValues } from "./types";
import { useManageStudentsContext } from "../../contexts/ManageStudentsContext";

interface AdjustStudentCoinsModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  studentItem?: StudentItem | null;
  onSubmit?: (values: AdjustCoinsValues) => Promise<boolean | void> | boolean | void;
  isSubmitting?: boolean;
}

export function AdjustStudentCoinsModal(props?: AdjustStudentCoinsModalProps) {
  const context = useManageStudentsContext();
  const isOpen = props?.isOpen ?? context.isAdjustCoinsOpen;
  const onClose = props?.onClose ?? context.handleCloseAdjustCoins;
  const studentItem =
    props?.studentItem !== undefined
      ? props.studentItem
      : context.adjustingCoinsStudent;
  const onSubmit = props?.onSubmit ?? context.handleAdjustCoinsSubmit;
  const isSubmitting = props?.isSubmitting ?? context.isSubmitting;

  if (!isOpen || !studentItem) return null;

  return (
    <AdjustStudentCoinsDialogContent
      key={studentItem.id}
      studentItem={studentItem}
      onClose={onClose}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
    />
  );
}

interface AdjustStudentCoinsDialogContentProps {
  studentItem: StudentItem;
  onClose: () => void;
  onSubmit: (values: AdjustCoinsValues) => Promise<boolean | void> | boolean | void;
  isSubmitting: boolean;
}

function AdjustStudentCoinsDialogContent({
  studentItem,
  onClose,
  onSubmit,
  isSubmitting,
}: AdjustStudentCoinsDialogContentProps) {
  const [type, setType] = useState<"add" | "deduct">("add");
  const [amount, setAmount] = useState<number>(50);
  const [spinsChange, setSpinsChange] = useState<number>(0);
  const [reason, setReason] = useState("Thưởng làm bài tập chăm chỉ và đạt điểm cao");
  const [errorMessage, setErrorMessage] = useState("");

  const currentCoins = studentItem.current_coins;
  const calculatedBalance =
    type === "add"
      ? currentCoins + (Number(amount) || 0)
      : Math.max(0, currentCoins - (Number(amount) || 0));

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      onClose();
    }
  }, [isSubmitting, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = Number(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage("Vui lòng nhập số xu hợp lệ lớn hơn 0.");
      return;
    }

    if (type === "deduct" && parsedAmount > currentCoins) {
      setErrorMessage(
        `Số xu trừ (${parsedAmount.toLocaleString()} xu) vượt quá số dư hiện tại của bé (${currentCoins.toLocaleString()} xu).`
      );
      return;
    }

    setErrorMessage("");
    await onSubmit({
      student_id: studentItem.id,
      student_name: studentItem.full_name,
      type,
      amount: parsedAmount,
      spins_change: spinsChange > 0 ? spinsChange : undefined,
      reason: reason.trim() || (type === "add" ? "Thưởng xu học sinh" : "Khấu trừ xu"),
    });
  };

  return (
    <Modal maxWidth="md" onClose={handleClose} disabled={isSubmitting}>
      <ModalHeader
        icon={<Coins className="w-5 h-5 text-amber-500" />}
        title="Thưởng / Trừ số xu"
        description={
          <>
            Học sinh:{" "}
            <span className="font-bold text-[#0F172A]">
              {studentItem.full_name}
            </span>{" "}
            • Lớp:{" "}
            <span className="font-bold text-[#0A62D6]">
              {studentItem.class_name}
            </span>
          </>
        }
        onClose={handleClose}
        disabled={isSubmitting}
      />

      <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
        <ModalBody>
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-600">
              {errorMessage}
            </div>
          )}

          {/* 1. Chọn loại thao tác: Thưởng hoặc Trừ */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setType("add");
                setReason("Thưởng làm bài tập chăm chỉ và đạt điểm cao");
                if (errorMessage) setErrorMessage("");
              }}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-bold transition-all cursor-pointer ${
                type === "add"
                  ? "bg-amber-50 border-amber-300 text-amber-900 shadow-2xs ring-2 ring-amber-400/20"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <PlusCircle className="w-4 h-4 text-amber-600" />
              <span>Thưởng nóng xu</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setType("deduct");
                setReason("Khấu trừ xu đổi quà hoặc điều chỉnh sai lệch");
                if (errorMessage) setErrorMessage("");
              }}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-bold transition-all cursor-pointer ${
                type === "deduct"
                  ? "bg-rose-50 border-rose-300 text-rose-900 shadow-2xs ring-2 ring-rose-400/20"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <MinusCircle className="w-4 h-4 text-rose-600" />
              <span>Trừ bớt xu</span>
            </button>
          </div>

          {/* 2. Thẻ hiển thị số dư hiện tại -> Số dư sau khi thay đổi */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500">Số dư hiện tại</span>
              <div className="font-extrabold text-base text-[#0F172A]">
                {currentCoins.toLocaleString("vi-VN")} xu
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-medium text-slate-500">Sau điều chỉnh</span>
              <div
                className={`font-black text-lg ${
                  type === "add" ? "text-emerald-700" : "text-rose-700"
                }`}
              >
                {calculatedBalance.toLocaleString("vi-VN")} xu
              </div>
            </div>
          </div>

          {/* 3. Số lượng xu */}
          <div>
            <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">
              Số lượng xu {type === "add" ? "thưởng" : "trừ"} <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Coins className="w-4 h-4 text-amber-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="number"
                min={1}
                step={10}
                value={amount}
                onChange={(e) => {
                  setAmount(Math.max(1, Number(e.target.value)));
                  if (errorMessage) setErrorMessage("");
                }}
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-white border border-slate-300 text-base font-bold text-[#0F172A] transition-all focus:outline-none focus:border-[#0A62D6] focus:ring-2 focus:ring-[#0A62D6]/20"
              />
            </div>

            {/* Quick buttons */}
            <div className="flex items-center gap-2 mt-2">
              {[20, 50, 100, 200, 500].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val)}
                  className={`flex-1 h-8 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                    amount === val
                      ? "bg-amber-500 text-white border-amber-600 shadow-2xs"
                      : "bg-white hover:bg-slate-100 text-slate-700 border-slate-200"
                  }`}
                >
                  +{val}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Thêm lượt quay miễn phí (nếu cộng xu thưởng) */}
          {type === "add" && (
            <div>
              <label className="block text-sm font-semibold text-[#0F172A] mb-1.5 flex items-center justify-between">
                <span>Tặng thêm lượt quay may mắn</span>
                <span className="text-xs text-purple-600 font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Vòng quay may mắn
                </span>
              </label>
              <div className="flex items-center gap-2">
                {[0, 1, 2, 3, 5].map((spin) => (
                  <button
                    key={spin}
                    type="button"
                    onClick={() => setSpinsChange(spin)}
                    className={`flex-1 h-9 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      spinsChange === spin
                        ? "bg-purple-600 text-white border-purple-700 shadow-2xs"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    {spin === 0 ? "Không tặng" : `+${spin} lượt`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 5. Lý do điều chỉnh */}
          <div>
            <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">
              Lý do ghi nhận vào sổ nhật ký
            </label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập lý do thưởng hoặc trừ xu..."
              className="w-full p-3 rounded-xl bg-white border border-slate-300 text-sm text-[#0F172A] placeholder-slate-400 transition-all focus:outline-none focus:border-[#0A62D6] focus:ring-2 focus:ring-[#0A62D6]/20 resize-none"
            />
          </div>
        </ModalBody>

        <ModalFooter>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="h-10 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`h-10 px-5 rounded-xl text-white text-sm font-semibold transition-all shadow-xs cursor-pointer active:scale-98 disabled:opacity-60 inline-flex items-center gap-2 ${
              type === "add"
                ? "bg-amber-500 hover:bg-amber-600"
                : "bg-rose-600 hover:bg-rose-700"
            }`}
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Đang lưu...</span>
              </>
            ) : (
              <span>{type === "add" ? "Xác nhận thưởng xu" : "Xác nhận trừ xu"}</span>
            )}
          </button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

