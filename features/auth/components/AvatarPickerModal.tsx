"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Check, Sparkles, X } from "lucide-react";
import { Button3D } from "@/components/ui/Button3D";
import { cn } from "@/lib/utils";
import {
  CHIBI_AVATARS,
  ChibiAvatar,
  ChibiGender,
  FEMALE_CHIBI_AVATARS,
  MALE_CHIBI_AVATARS,
} from "../constants/chibiAvatars";

interface AvatarPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatarUrl?: string;
  onSelectAvatar: (avatarUrl: string) => void;
}

export function AvatarPickerModal({
  isOpen,
  onClose,
  currentAvatarUrl,
  onSelectAvatar,
}: AvatarPickerModalProps) {
  // Xác định tab ban đầu dựa trên trường gender của avatar trong danh sách hằng số
  const initialTab: ChibiGender =
    CHIBI_AVATARS.find((a) => a.url === currentAvatarUrl)?.gender ?? "male";

  const [activeTab, setActiveTab] = useState<ChibiGender>(initialTab);
  const [selectedUrl, setSelectedUrl] = useState<string>(
    currentAvatarUrl || MALE_CHIBI_AVATARS[0].url
  );

  const modalRef = useRef<HTMLDivElement | null>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  // Khóa cuộn trang nền và quản lý focus khi mở / đóng modal
  useEffect(() => {
    if (!isOpen) return;

    // Lưu lại phần tử đang được focus trước khi mở modal để trả lại sau khi đóng
    previousActiveElementRef.current = document.activeElement as HTMLElement | null;

    // Khóa cuộn nền trang
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus vào modal
    modalRef.current?.focus();

    return () => {
      document.body.style.overflow = originalOverflow;
      previousActiveElementRef.current?.focus();
    };
  }, [isOpen]);

  // Đóng bằng phím Escape & Bẫy Focus (Focus Trap)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      // Xử lý Focus Trap bằng phím Tab
      if (e.key === "Tab" && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          // Tab lùi
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab tới
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onSelectAvatar(selectedUrl);
    onClose();
  };

  const currentChibi =
    CHIBI_AVATARS.find((a) => a.url === selectedUrl) || MALE_CHIBI_AVATARS[0];

  const displayedAvatars =
    activeTab === "female" ? FEMALE_CHIBI_AVATARS : MALE_CHIBI_AVATARS;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="avatar-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200 motion-reduce:animate-none"
    >
      {/* Khung Bảng Gỗ Hoạt Hình 3D (The Wooden Game Board) - Chiều cao tối đa theo viewport */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative w-full max-w-lg max-h-[calc(100dvh-20px)] sm:max-h-[calc(100dvh-32px)] flex flex-col bg-gradient-to-b from-[#B5661F] via-[#8C4A14] to-[#6E380C] border-4 border-[#4A2208] rounded-[28px] sm:rounded-[36px] shadow-[0_25px_60px_rgba(0,0,0,0.6),inset_0_2px_4px_rgba(255,214,150,0.5)] p-2.5 sm:p-4 select-none animate-in zoom-in-95 duration-200 motion-reduce:animate-none focus:outline-none"
      >
        {/* Nút đóng tròn 3D góc phải (vùng bấm 40x40px đạt chuẩn truy cập) */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng cửa sổ chọn ảnh đại diện"
          className="absolute -top-3 -right-3 sm:-top-3.5 sm:-right-3.5 w-10 h-10 rounded-full bg-gradient-to-b from-[#EF4444] to-[#B91C1C] border-2 border-[#7F1D1D] shadow-[0_4px_8px_rgba(0,0,0,0.35),inset_0_1px_2px_rgba(255,255,255,0.4)] flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all cursor-pointer z-20 focus-visible:outline-2 focus-visible:outline-white"
        >
          <X className="w-5 h-5 drop-shadow-sm stroke-[2.5]" />
        </button>

        {/* Ruột thẻ giấy kem vàng - Linh hoạt cuộn phần nội dung giữa */}
        <div className="bg-[#FFF8E6] border-[3px] border-[#E8D2A8] rounded-[20px] sm:rounded-[24px] p-3 sm:p-4 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06),0_6px_12px_rgba(0,0,0,0.15)] flex flex-col flex-1 overflow-hidden">
          {/* Header Tiêu đề cố định */}
          <div className="flex items-center justify-center gap-2 mb-2 text-center flex-shrink-0">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 animate-pulse motion-reduce:animate-none" />
            <h2
              id="avatar-modal-title"
              className="font-heading font-black text-sm sm:text-base md:text-lg text-[#4A2307] tracking-wide uppercase"
            >
              Chọn ảnh đại diện của con
            </h2>
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 animate-pulse motion-reduce:animate-none" />
          </div>

          {/* ========================================================================= */}
          {/* VÙNG NỘI DUNG CUỘN ĐƯỢC (TABS + SPOTLIGHT + LƯỚI 3X3) */}
          {/* ========================================================================= */}
          <div className="flex-1 overflow-y-auto scrollbar-thin pr-1 -mr-1 flex flex-col items-center">
            {/* Thanh 2 TAB: BÉ TRAI (MALE) VS BÉ GÁI (FEMALE) */}
            <div
              role="tablist"
              aria-label="Chọn giới tính avatar"
              className="grid grid-cols-2 gap-2 w-full mb-2.5 p-1 bg-[#EAD6BD] rounded-xl border border-[#D5BEA0] flex-shrink-0"
            >
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "male"}
                onClick={() => setActiveTab("male")}
                className={cn(
                  "flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg font-heading font-black text-xs sm:text-sm tracking-wide transition-all cursor-pointer",
                  activeTab === "male"
                    ? "bg-gradient-to-b from-[#38BDF8] to-[#0284C7] text-white border-2 border-[#BAE6FD] shadow-[0_3px_6px_rgba(2,132,199,0.35),inset_0_1px_2px_rgba(255,255,255,0.4)] scale-[1.02]"
                    : "text-[#7A4E26] hover:text-[#421D05] hover:bg-white/40"
                )}
              >
                <span className="text-base select-none" aria-hidden="true">👨🏻‍🦰</span>
                <span>Bé Trai</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "female"}
                onClick={() => setActiveTab("female")}
                className={cn(
                  "flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg font-heading font-black text-xs sm:text-sm tracking-wide transition-all cursor-pointer",
                  activeTab === "female"
                    ? "bg-gradient-to-b from-[#F472B6] to-[#DB2777] text-white border-2 border-[#FCE7F3] shadow-[0_3px_6px_rgba(219,39,119,0.35),inset_0_1px_2px_rgba(255,255,255,0.4)] scale-[1.02]"
                    : "text-[#7A4E26] hover:text-[#421D05] hover:bg-white/40"
                )}
              >
                <span className="text-base select-none" aria-hidden="true">👩🏻‍🦰</span>
                <span>Bé Gái</span>
              </button>
            </div>

            {/* Khung xem trước lớn (Preview Spotlight) */}
            <div className="flex items-center gap-3 p-2 sm:p-2.5 mb-2.5 w-full bg-gradient-to-r from-[#FFF0D4] via-[#FFE8BD] to-[#FFF0D4] rounded-2xl border-2 border-[#F5D298] shadow-inner flex-shrink-0">
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-amber-500 shadow-md flex-shrink-0 bg-white">
                <Image
                  src={currentChibi.url}
                  alt={currentChibi.name}
                  fill
                  sizes="64px"
                  priority
                  unoptimized
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span
                    className={cn(
                      "inline-block px-2 py-0.5 rounded-full text-[11px] font-heading font-black text-white",
                      currentChibi.gender === "female" ? "bg-pink-500" : "bg-sky-600"
                    )}
                  >
                    {currentChibi.gender === "female" ? "👩🏻‍🦰 BÉ GÁI" : "👨🏻‍🦰 BÉ TRAI"}
                  </span>
                  <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-heading font-black bg-amber-500 text-white">
                    ĐANG CHỌN
                  </span>
                </div>
                <h3 className="font-heading font-black text-xs sm:text-sm text-[#4A2307] truncate">
                  {currentChibi.name}
                </h3>
                <p className="font-sans text-[11px] sm:text-xs text-[#7A5433] truncate">
                  {currentChibi.description}
                </p>
              </div>
            </div>

            {/* Lưới danh sách Avatar Chibi theo Tab (Grid 3x3 = đúng 9 ảnh) */}
            <div className="grid grid-cols-3 gap-2 sm:gap-2.5 w-full p-1">
              {displayedAvatars.map((avatar: ChibiAvatar) => {
                const isSelected = avatar.url === selectedUrl;
                return (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => setSelectedUrl(avatar.url)}
                    className={cn(
                      "relative flex flex-col items-center p-1.5 sm:p-2 rounded-2xl border-2 transition-all cursor-pointer group text-center",
                      isSelected
                        ? "bg-[#FEF3C7] border-[#D97706] shadow-[0_4px_10px_rgba(217,119,6,0.35)] scale-[1.03]"
                        : "bg-white border-[#B08A52]/60 hover:border-[#D97706] hover:bg-[#FFFDF7] hover:scale-[1.02]"
                    )}
                  >
                    {/* Badge tích chọn */}
                    {isSelected && (
                      <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white shadow flex items-center justify-center text-white z-10 animate-in zoom-in-75 motion-reduce:animate-none">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}

                    {/* Ảnh Chibi sắc nét 3x3 */}
                    <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden mb-1 shadow-sm bg-stone-50">
                      <Image
                        src={avatar.url}
                        alt={avatar.name}
                        fill
                        sizes="64px"
                        unoptimized
                        className="object-cover transition-transform duration-200 group-hover:scale-105 motion-reduce:transform-none"
                      />
                    </div>

                    {/* Tên Chibi */}
                    <span
                      className={cn(
                        "font-heading font-extrabold text-[11px] sm:text-xs truncate max-w-full px-0.5 leading-tight",
                        isSelected ? "text-[#92400E]" : "text-[#5C2F0E]"
                      )}
                    >
                      {avatar.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* NÚT BẤM HÀNH ĐỘNG CỐ ĐỊNH Ở ĐÁY KHÔNG BỊ TRÀN VIEWPORT */}
          {/* ========================================================================= */}
          <div className="flex items-center gap-2.5 w-full pt-2.5 sm:pt-3 border-t border-[#E8D2A8] mt-1 flex-shrink-0">
            <Button3D
              type="button"
              variant="gray"
              size="md"
              onClick={onClose}
              className="flex-1 rounded-2xl text-xs sm:text-sm font-heading min-h-11"
            >
              Để sau
            </Button3D>

            <Button3D
              type="button"
              variant="yellow"
              size="md"
              onClick={handleConfirm}
              className="flex-[2] rounded-2xl gap-1.5 text-xs sm:text-sm md:text-base font-heading min-h-11"
            >
              <span>XÁC NHẬN CHỌN!</span>
            </Button3D>
          </div>
        </div>
      </div>
    </div>
  );
}
