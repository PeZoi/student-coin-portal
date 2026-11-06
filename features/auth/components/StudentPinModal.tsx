"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AlertTriangle, ArrowLeft, Loader2, Lock, X } from "lucide-react";
import { Button3D } from "@/components/ui/Button3D";
import { cn } from "@/lib/utils";
import { AUTH_THEME } from "../constants/authTheme";
import { PinVerificationError, StudentLookupData } from "../types";

interface StudentPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentLookupData | null;
  onConfirmPin: (pin: string) => Promise<void>;
  isVerifying: boolean;
  onChangePhone: () => void;
}

export function StudentPinModal({
  isOpen,
  onClose,
  student,
  onConfirmPin,
  isVerifying,
  onChangePhone,
}: StudentPinModalProps) {
  const [pinDigits, setPinDigits] = useState<string[]>(["", "", "", ""]);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [focusedIndex, setFocusedIndex] = useState<number>(0);

  // Quản lý trạng thái khóa tài khoản và số lần thử còn lại
  const [isLocked, setIsLocked] = useState<boolean>(student?.is_locked ?? false);
  const [lockRemainingMinutes, setLockRemainingMinutes] = useState<number>(student?.remaining_minutes ?? 0);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(student?.remaining_attempts ?? null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const modalRef = useRef<HTMLDivElement | null>(null);

  // Đồng bộ trạng thái khóa từ dữ liệu học sinh khi mở modal
  useEffect(() => {
    if (student) {
      const locked = student.is_locked ?? false;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLocked(locked);
      setLockRemainingMinutes(student.remaining_minutes ?? 0);
      setRemainingAttempts(student.remaining_attempts ?? null);
      if (locked) {
        setErrorMessage(
          `Tài khoản của con đang bị tạm khóa. Vui lòng thử lại sau ${student.remaining_minutes || 15} phút nữa nhé!`
        );
      } else {
        setErrorMessage("");
      }
    }
  }, [student, isOpen]);

  // Bộ đếm ngược tự động giảm số phút khóa theo thời gian thực
  useEffect(() => {
    if (!isLocked || lockRemainingMinutes <= 0) return;
    const interval = setInterval(() => {
      setLockRemainingMinutes((prev) => {
        if (prev <= 1) {
          setIsLocked(false);
          setErrorMessage("");
          return 0;
        }
        return prev - 1;
      });
    }, 60000);
    return () => clearInterval(interval);
  }, [isLocked, lockRemainingMinutes]);

  // Khóa cuộn trang nền và tự động focus vào ô OTP đầu tiên nếu chưa bị khóa
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const timer = setTimeout(() => {
      if (!isLocked) {
        inputRefs.current[0]?.focus();
        setFocusedIndex(0);
      }
    }, 120);

    return () => {
      document.body.style.overflow = originalOverflow;
      clearTimeout(timer);
    };
  }, [isOpen, isLocked]);

  // Lắng nghe phím ESC để đóng modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isVerifying) {
        setPinDigits(["", "", "", ""]);
        setErrorMessage("");
        setFocusedIndex(0);
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isVerifying, onClose]);

  // Xử lý đóng modal an toàn và reset các ô PIN
  const handleClose = () => {
    if (!isVerifying) {
      setPinDigits(["", "", "", ""]);
      setErrorMessage("");
      setFocusedIndex(0);
      onClose();
    }
  };

  // Xử lý đổi số điện thoại và reset các ô PIN
  const handleChangePhone = () => {
    if (!isVerifying) {
      setPinDigits(["", "", "", ""]);
      setErrorMessage("");
      setFocusedIndex(0);
      onChangePhone();
    }
  };

  if (!isOpen || !student) return null;

  // Xử lý gửi mã PIN lên hệ thống và bắt thông tin lỗi/khóa tài khoản
  const handlePinSubmit = async (fullPin: string) => {
    if (isLocked) return;

    try {
      setErrorMessage("");
      await onConfirmPin(fullPin);
    } catch (err: unknown) {
      if (err instanceof PinVerificationError) {
        setErrorMessage(err.message);
        if (err.isLocked) {
          setIsLocked(true);
          setLockRemainingMinutes(err.remainingMinutes || 15);
          setRemainingAttempts(0);
        } else {
          setRemainingAttempts(err.remainingAttempts);
        }
      } else {
        const error = err instanceof Error ? err : new Error(String(err));
        setErrorMessage(error.message);
      }
      setPinDigits(["", "", "", ""]);
      if (!isLocked) {
        inputRefs.current[0]?.focus();
        setFocusedIndex(0);
      }
    }
  };

  // Hàm áp dụng chữ số tại ô index, cập nhật state và tự động chuyển sang ô kế tiếp
  const applyDigit = (index: number, digit: string) => {
    if (isLocked) return;
    setErrorMessage("");
    const newDigits = [...pinDigits];
    newDigits[index] = digit;
    setPinDigits(newDigits);

    // Nếu vừa nhập xong một số, tự động chuyển focus sang ô kế tiếp và bôi đen
    if (digit && index < 3) {
      const nextInput = inputRefs.current[index + 1];
      nextInput?.focus();
      nextInput?.select();
      setFocusedIndex(index + 1);
    }

    // Nếu đã nhập đủ 4 số, tự động kích hoạt xác nhận
    const fullPin = newDigits.join("");
    if (fullPin.length === 4 && !newDigits.includes("")) {
      handlePinSubmit(fullPin);
    }
  };

  // Xử lý khi gõ từng ô số (onChange - hỗ trợ cả mobile, autofill và dán)
  const handleDigitChange = (index: number, value: string) => {
    const digitsOnly = value.replace(/\D/g, "");
    if (!digitsOnly) {
      applyDigit(index, "");
      return;
    }

    if (digitsOnly.length === 1) {
      applyDigit(index, digitsOnly);
      return;
    }

    // Khi ô đã có số và người dùng nhập thêm (bất kể cursor đứng trước hay sau số cũ)
    const oldDigit = pinDigits[index];
    let newDigit = "";
    if (digitsOnly[0] === oldDigit) {
      // Con trỏ ở sau: ví dụ cũ "3", gõ "1" -> "31" -> lấy "1"
      newDigit = digitsOnly[1];
    } else if (digitsOnly[1] === oldDigit) {
      // Con trỏ ở trước: ví dụ cũ "3", gõ "1" -> "13" -> lấy "1"
      newDigit = digitsOnly[0];
    } else {
      // Trường hợp khác: lấy ký tự cuối cùng
      newDigit = digitsOnly.slice(-1);
    }

    applyDigit(index, newDigit);
  };

  // Xử lý phím (onKeyDown - can thiệp trực tiếp để thay thế số ngay dù cursor ở bất kỳ vị trí nào)
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Nếu gõ trực tiếp chữ số 0-9: thay thế ngay lập tức số của ô đó và nhảy sang ô kế tiếp
    if (/^[0-9]$/.test(e.key)) {
      e.preventDefault();
      applyDigit(index, e.key);
      return;
    }

    if (e.key === "Backspace") {
      if (!pinDigits[index] && index > 0) {
        // Nếu ô hiện tại rỗng, lùi về ô trước và xóa số ô đó
        e.preventDefault();
        const newDigits = [...pinDigits];
        newDigits[index - 1] = "";
        setPinDigits(newDigits);
        inputRefs.current[index - 1]?.focus();
        inputRefs.current[index - 1]?.select();
        setFocusedIndex(index - 1);
      } else if (pinDigits[index]) {
        // Xóa số ở ô hiện tại
        e.preventDefault();
        const newDigits = [...pinDigits];
        newDigits[index] = "";
        setPinDigits(newDigits);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
      inputRefs.current[index - 1]?.select();
      setFocusedIndex(index - 1);
    } else if (e.key === "ArrowRight" && index < 3) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
      inputRefs.current[index + 1]?.select();
      setFocusedIndex(index + 1);
    }
  };

  // Xử lý dán chuỗi 4 số (Paste)
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);

    if (pastedText.length > 0) {
      const newDigits = ["", "", "", ""];
      for (let i = 0; i < pastedText.length; i++) {
        newDigits[i] = pastedText[i];
      }
      setPinDigits(newDigits);

      const nextIndex = Math.min(pastedText.length, 3);
      inputRefs.current[nextIndex]?.focus();
      setFocusedIndex(nextIndex);

      if (pastedText.length === 4) {
        handlePinSubmit(pastedText);
      }
    }
  };

  // Submit thủ công khi bấm nút "VÀO LỚP NGAY"
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;

    const fullPin = pinDigits.join("");
    if (fullPin.length < 4) {
      setErrorMessage("Con hãy nhập đủ 4 số PIN nhé!");
      const firstEmptyIndex = pinDigits.findIndex((d) => d === "");
      if (firstEmptyIndex !== -1) {
        inputRefs.current[firstEmptyIndex]?.focus();
        setFocusedIndex(firstEmptyIndex);
      }
      return;
    }

    handlePinSubmit(fullPin);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pin-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-black/70 backdrop-blur-xs p-4 sm:p-6 [@media(max-height:700px)]:p-2.5 pt-[max(1rem,env(safe-area-inset-top))] [@media(max-height:700px)]:pt-[max(0.5rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] flex justify-center items-start sm:items-center animate-in fade-in duration-200 motion-reduce:animate-none"
    >
      {/* Khung Bảng Gỗ Hoạt Hình 3D (The Wooden Game Board) */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className={cn(
          "relative w-full max-w-[420px] my-auto [@media(max-height:700px)]:my-0 [@media(max-height:700px)]:mt-1 select-none p-3 sm:p-4 [@media(max-height:700px)]:p-2.5 focus:outline-none animate-in zoom-in-95 duration-200 motion-reduce:animate-none",
          AUTH_THEME.board.gradient,
          AUTH_THEME.board.border,
          AUTH_THEME.board.rounded,
          AUTH_THEME.board.shadow
        )}
      >
        {/* Nút đóng tròn màu đỏ 3D (44x44px, đặt ở góc phải trên) */}
        <button
          type="button"
          onClick={handleClose}
          disabled={isVerifying}
          aria-label="Đóng cửa sổ"
          className="absolute -top-3 -right-3 [@media(max-height:700px)]:-top-2 [@media(max-height:700px)]:-right-2 w-11 h-11 rounded-full bg-gradient-to-b from-[#FF5252] via-[#E53935] to-[#B71C1C] border-2 border-[#7F1D1D] shadow-[0_4px_10px_rgba(0,0,0,0.4),inset_0_1.5px_2px_rgba(255,255,255,0.6)] flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all cursor-pointer z-30 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 disabled:opacity-50"
        >
          <X className="w-5 h-5 drop-shadow-sm stroke-[3]" />
        </button>

        {/* Ruột thẻ giấy kem vàng */}
        <div
          className={cn(
            "p-4 sm:p-5 [@media(max-height:700px)]:p-3 flex flex-col items-center",
            AUTH_THEME.card.bg,
            AUTH_THEME.card.border,
            AUTH_THEME.card.rounded,
            AUTH_THEME.card.shadow
          )}
        >
          {/* ========================================================================= */}
          {/* 1. TIÊU ĐỀ THÂN THIỆN */}
          {/* ========================================================================= */}
          <h2
            id="pin-modal-title"
            className="font-heading font-black text-lg sm:text-xl [@media(max-height:700px)]:text-base text-[#5A2A08] text-center mb-3 sm:mb-4 [@media(max-height:700px)]:mb-1.5 select-none leading-tight"
          >
            ✨ Chào mừng con trở lại! ✨
          </h2>

          {/* ========================================================================= */}
          {/* 2. THẺ PROFILE HỌC SINH NỔI BẬT (LOANG MÀU THỞ CHẬM HIỆN ĐẠI) */}
          {/* ========================================================================= */}
          <div className="relative overflow-hidden w-full bg-[#FFFDF8] border-2 border-[#EBD6BE] rounded-[22px] p-3.5 sm:p-4 [@media(max-height:700px)]:p-2.5 flex flex-col items-center shadow-[0_4px_16px_rgba(150,75,10,0.06),inset_0_1.5px_2px_rgba(255,255,255,0.9)] mb-4 [@media(max-height:700px)]:mb-2">
            {/* Lớp hào quang loang màu thở chậm mờ ảo (Ambient Aura Breathing Glow) */}
            <div
              aria-hidden="true"
              className="absolute -top-12 -left-8 w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-gradient-to-br from-[#FFE4A0] via-[#FFC570] to-transparent blur-2xl pointer-events-none animate-ambient-glow-1 motion-reduce:animate-none"
            />
            <div
              aria-hidden="true"
              className="absolute -bottom-10 -right-6 w-44 h-44 sm:w-52 sm:h-52 rounded-full bg-gradient-to-tl from-[#FFB37C] via-[#FFD39B] to-transparent blur-2xl pointer-events-none animate-ambient-glow-2 motion-reduce:animate-none"
            />
            <div
              aria-hidden="true"
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-amber-100/40 blur-xl pointer-events-none"
            />

            {/* Nội dung bên trong: Dọc khi màn cao ≥700px; Ngang khi màn thấp <700px */}
            <div className="relative z-10 flex flex-col [@media(max-height:700px)]:flex-row items-center [@media(max-height:700px)]:items-center w-full gap-0 [@media(max-height:700px)]:gap-3">
              {/* Avatar Chibi Khung Huy Chương Vàng 3D (56px khi màn thấp <700px) */}
              <div className="relative h-20 w-20 sm:h-24 sm:w-24 [@media(max-height:700px)]:h-14 [@media(max-height:700px)]:w-14 rounded-full p-1 sm:p-1.5 [@media(max-height:700px)]:p-0.5 bg-gradient-to-b from-[#FFEAA7] via-[#FFD76A] to-[#E59819] shadow-[0_6px_14px_rgba(229,152,25,0.25)] flex items-center justify-center flex-shrink-0">
                <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-white bg-white shadow-inner">
                  <Image
                    src={student.avatar_url || "/avatar.jpg"}
                    alt={student.full_name}
                    fill
                    sizes="(max-width: 640px) 80px, 96px"
                    unoptimized
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Khối thông tin: căn giữa khi dọc, căn trái khi ngang */}
              <div className="flex flex-col items-center [@media(max-height:700px)]:items-start w-full min-w-0">
                {/* Họ và tên học sinh - Cho phép xuống tối đa 2 dòng, text-base khi màn thấp */}
                <h3 className="font-heading font-black text-xl sm:text-2xl [@media(max-height:700px)]:text-base text-[#3D1A04] tracking-wide mt-2 [@media(max-height:700px)]:mt-0 text-center [@media(max-height:700px)]:text-left line-clamp-2 break-words leading-tight">
                  {student.full_name}
                </h3>

                {/* Hai chip: Lớp học & Số điện thoại Zalo */}
                <div className="flex flex-wrap items-center justify-center [@media(max-height:700px)]:justify-start gap-1.5 mt-1.5 [@media(max-height:700px)]:mt-1">
                  {student.class_name && (
                    <span className="inline-flex items-center gap-1.5 bg-[#FFF0E0] border border-[#F4CBA0] text-[#92400E] text-xs sm:text-sm [@media(max-height:700px)]:text-xs font-bold px-3 py-1 [@media(max-height:700px)]:px-2 [@media(max-height:700px)]:py-0.5 rounded-full shadow-xs">
                      <span>🎒</span>
                      <span>{student.class_name}</span>
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5 bg-[#F7F1E6] border border-[#E5D5BF] text-[#6B4A2B] text-xs sm:text-sm [@media(max-height:700px)]:text-xs font-bold px-3 py-1 [@media(max-height:700px)]:px-2 [@media(max-height:700px)]:py-0.5 rounded-full shadow-xs">
                    <span>📱</span>
                    <span>{student.phone_zalo}</span>
                  </span>
                </div>

                {/* Badge cam 3D Heo Đất & Xu Vàng (chữ tăng lên 13-14px rõ ràng, chuẩn LuckyWheelView) */}
                <div className="mt-3.5 [@media(max-height:700px)]:mt-1.5 flex items-center justify-center [@media(max-height:700px)]:justify-start gap-2 [@media(max-height:700px)]:gap-1.5 px-3.5 sm:px-4 [@media(max-height:700px)]:px-2.5 py-1.5 sm:py-2 [@media(max-height:700px)]:py-1 rounded-full bg-gradient-to-b from-[#FFA238] via-[#FF6A00] to-[#E04F00] border-2 border-white/95 shadow-[0_4px_12px_rgba(224,79,0,0.35),0_1.5px_0_#8F2800,inset_0_1.5px_2px_rgba(255,255,255,0.85),inset_0_-1.5px_2px_rgba(143,40,0,0.4)] select-none">
                  <div className="relative w-5 h-5 sm:w-6 sm:h-6 [@media(max-height:700px)]:w-4.5 [@media(max-height:700px)]:h-4.5 flex-shrink-0 drop-shadow-[0_1.5px_2px_rgba(100,25,0,0.45)]">
                    <Image
                      src="/coin.png"
                      alt="Xu"
                      width={24}
                      height={24}
                      unoptimized
                      style={{ height: "auto" }}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex items-baseline gap-1 font-heading leading-none">
                    <span className="text-[13px] sm:text-[14px] font-bold text-amber-100 [text-shadow:0_1px_2px_rgba(100,20,0,0.9)]">
                      Heo đất của con:
                    </span>
                    <span className="font-heading font-black text-lg sm:text-xl [@media(max-height:700px)]:text-base text-white tracking-tight drop-shadow-[0_1.5px_2px_rgba(100,20,0,0.9)]">
                      {student.current_coins.toLocaleString("vi-VN")}
                    </span>
                    <span className="text-[13px] sm:text-[14px] font-black text-[#FEF08A] uppercase [text-shadow:0_1px_2px_rgba(100,20,0,0.9)]">
                      xu
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 3. KHU VỰC NHẬP MÃ PIN DẠNG OTP 4 Ô VUÔNG */}
          {/* ========================================================================= */}
          <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
            {/* Nhãn căn giữa */}
            <label className="block text-center text-sm [@media(max-height:700px)]:text-xs font-heading font-black text-[#5A2A08] mb-2.5 [@media(max-height:700px)]:mb-1 select-none">
              🔑 Nhập mã PIN 4 số của con
            </label>

            {/* 4 ô PIN co giãn đều trong grid 4 cột */}
            <div className="grid grid-cols-4 gap-2.5 sm:gap-3 [@media(max-height:700px)]:gap-2 w-full max-w-[300px] mx-auto mb-2 [@media(max-height:700px)]:mb-1">
              {pinDigits.map((digit, index) => {
                const isCurrent = focusedIndex === index;
                const hasValue = Boolean(digit);
                const hasError = Boolean(errorMessage);

                return (
                  <div key={index} className="relative flex items-center justify-center">
                    <input
                      ref={(el) => {
                        inputRefs.current[index] = el;
                      }}
                      type="password"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={2}
                      value={digit}
                      disabled={isVerifying || isLocked}
                      onFocus={(e) => {
                        if (!isLocked) {
                          setFocusedIndex(index);
                          e.target.select();
                        }
                      }}
                      onClick={(e) => {
                        if (!isLocked) {
                          e.currentTarget.select();
                        }
                      }}
                      onChange={(e) => handleDigitChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={handlePaste}
                      aria-label={`Số PIN thứ ${index + 1}`}
                      className={cn(
                        "w-full h-14 sm:h-16 [@media(max-height:700px)]:h-11 text-3xl sm:text-4xl [@media(max-height:700px)]:text-2xl text-[#3D1A04] font-heading font-black text-center rounded-2xl [@media(max-height:700px)]:rounded-xl select-none transition-all duration-150 outline-none",
                        isLocked
                          ? "bg-slate-100/90 border-2 sm:border-[2.5px] border-slate-300 text-slate-400 opacity-60 cursor-not-allowed shadow-none"
                          : hasError
                          ? "border-2 sm:border-[2.5px] border-[#DC2626] bg-[#FFF5F5] ring-2 ring-red-500/20 cursor-text"
                          : isCurrent
                          ? "bg-white border-2 sm:border-[2.5px] border-[#D97706] ring-4 ring-amber-500/30 scale-105 shadow-[0_4px_12px_rgba(217,119,6,0.25)] cursor-text"
                          : hasValue
                          ? "bg-white border-2 sm:border-[2.5px] border-[#B08A52] shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] cursor-text"
                          : "bg-[#FFFDF7] border-2 sm:border-[2.5px] border-[#B08A52] shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] cursor-text"
                      )}
                    />

                    {/* Dấu chấm tròn placeholder khi ô trống và không được focus */}
                    {!hasValue && !isCurrent && (
                      <span
                        className={cn(
                          "absolute pointer-events-none h-2 w-2 rounded-full",
                          isLocked ? "bg-slate-400/30" : "bg-[#B08A52]/40"
                        )}
                        aria-hidden="true"
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* ========================================================================= */}
            {/* THÔNG BÁO TRỰC TIẾP TRÊN GIAO DIỆN (KHÔNG DÙNG TOAST) */}
            {/* ========================================================================= */}
            {isLocked ? (
              /* Hộp thông báo tài khoản đang bị tạm khóa */
              <div className="w-full bg-rose-50 border-2 border-rose-300 text-rose-900 rounded-2xl p-3 sm:p-3.5 my-2 text-center animate-shake motion-reduce:animate-none shadow-sm flex flex-col items-center select-none">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-rose-100 border-2 border-rose-300 flex items-center justify-center text-rose-600 mb-1.5 shadow-xs">
                  <Lock className="w-5 h-5 stroke-[2.5]" />
                </div>
                <h4 className="font-heading font-black text-sm sm:text-base text-rose-800 leading-tight">
                  Tài khoản đang bị tạm khóa!
                </h4>
                <p className="text-xs sm:text-sm text-rose-700 font-bold mt-1 leading-snug">
                  Con đã nhập sai mã PIN nhiều lần. Vui lòng thử lại sau{" "}
                  <span className="font-heading font-black text-rose-950 text-sm sm:text-base underline underline-offset-2">
                    {lockRemainingMinutes} phút
                  </span>{" "}
                  nữa nhé!
                </p>
                <span className="text-[11px] sm:text-xs text-rose-500 font-semibold mt-1">
                  (Hoặc con có thể nhờ thầy cô giáo mở khóa giúp nhé)
                </span>
              </div>
            ) : errorMessage ? (
              /* Hộp thông báo sai mã PIN và hiển thị số lần thử còn lại */
              <div className="w-full bg-amber-50 border-2 border-amber-300 text-amber-900 rounded-2xl p-2.5 sm:p-3 my-2 text-center animate-shake motion-reduce:animate-none shadow-xs flex items-center justify-center gap-2 select-none">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <div className="flex flex-col text-left">
                  <span className="text-xs sm:text-sm font-bold text-amber-900 leading-tight">
                    {errorMessage}
                  </span>
                  {typeof remainingAttempts === "number" && remainingAttempts > 0 && (
                    <span className="text-[11px] sm:text-xs text-amber-800 font-semibold mt-0.5">
                      Bé còn{" "}
                      <strong className="text-amber-950 font-black text-xs sm:text-sm">
                        {remainingAttempts} lần thử
                      </strong>{" "}
                      trước khi tài khoản bị tạm khóa.
                    </span>
                  )}
                </div>
              </div>
            ) : null}

            {/* Nút Đăng nhập 3D */}
            <div className="w-full mt-3 [@media(max-height:700px)]:mt-1.5">
              <Button3D
                type="submit"
                variant={isLocked ? "disabled" : "green"}
                size="lg"
                fullWidth
                disabled={isVerifying || isLocked}
                loading={isVerifying}
                className="rounded-2xl gap-2 tracking-wider uppercase text-base sm:text-lg [@media(max-height:700px)]:py-2 [@media(max-height:700px)]:text-base"
              >
                {isLocked ? (
                  <span className="flex items-center justify-center gap-1.5 opacity-80">
                    <Lock className="w-4 h-4 stroke-[2.5]" />
                    <span>ĐANG TẠM KHÓA ({lockRemainingMinutes} PHÚT)</span>
                  </span>
                ) : isVerifying ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin motion-reduce:animate-none" />
                    <span>Đang vào lớp...</span>
                  </>
                ) : (
                  <span>🚀 VÀO LỚP NGAY!</span>
                )}
              </Button3D>
            </div>

            {/* Nút đổi số điện thoại nếu không phải con */}
            <button
              type="button"
              onClick={handleChangePhone}
              disabled={isVerifying}
              className="mt-2 [@media(max-height:700px)]:mt-0.5 min-h-11 [@media(max-height:700px)]:min-h-8 inline-flex items-center justify-center gap-1.5 text-sm [@media(max-height:700px)]:text-xs font-heading font-black text-[#8C4A14] hover:text-[#B5661F] transition-colors cursor-pointer disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-[#D97706] focus-visible:outline-offset-2 rounded-lg [@media(max-height:700px)]:py-0.5 select-none underline"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Không phải con? Đổi số điện thoại khác</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
