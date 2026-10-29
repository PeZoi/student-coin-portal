"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { GraduationCap, ChevronDown, Check, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClassOption {
  id: string;
  label: string;
}

interface LeaderboardClassFilterProps {
  selectedClass: string;
  onChangeClass: (classGroup: string) => void;
  classes?: ClassOption[];
}

const DEFAULT_CLASSES: ClassOption[] = [
  { id: "all", label: "Tất cả các lớp" },
  { id: "Lớp 5A", label: "Lớp 5A" },
  { id: "Lớp 5B", label: "Lớp 5B" },
  { id: "Lớp 5C", label: "Lớp 5C" },
  { id: "Lớp 5D", label: "Lớp 5D" },
  { id: "Lớp 5E", label: "Lớp 5E" },
];

export function LeaderboardClassFilter({
  selectedClass,
  onChangeClass,
  classes = DEFAULT_CLASSES,
}: LeaderboardClassFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Tên hiển thị của lớp đang chọn
  const activeLabel = useMemo(() => {
    const match = classes.find((c) => c.id === selectedClass);
    return match ? match.label : "Tất cả các lớp";
  }, [classes, selectedClass]);

  // Lọc danh sách lớp theo ô tìm kiếm
  const filteredClasses = useMemo(() => {
    if (!searchQuery.trim()) return classes;
    const query = searchQuery.trim().toLowerCase();
    return classes.filter((cls) => cls.label.toLowerCase().includes(query));
  }, [classes, searchQuery]);

  // Tự động focus vào ô search khi mở dropdown
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setSearchQuery("");
    }
  }, [isOpen]);

  // Xử lý đóng Dropdown khi click ra ngoài hoặc bấm phím Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleSelectClass = (classId: string) => {
    onChangeClass(classId);
    setIsOpen(false);
  };

  return (
    <div
      ref={dropdownRef}
      className="relative z-30 inline-flex items-center select-none"
    >
      {/* Nút Trigger Dropdown */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={cn(
          "cursor-pointer transition-all duration-200 rounded-full px-3.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-heading tracking-wide flex items-center gap-2",
          "bg-[#0B4899]/85 hover:bg-[#0E54B0] active:scale-[0.98] backdrop-blur-md border border-sky-300/40 shadow-[0_8px_20px_rgba(0,25,75,0.35)] text-white font-black",
          isOpen && "ring-2 ring-amber-400 border-transparent shadow-[0_0_15px_rgba(251,191,36,0.4)]"
        )}
      >
        <GraduationCap className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-amber-300 flex-shrink-0" />
        <span className="truncate max-w-[140px] sm:max-w-[180px]">
          {activeLabel}
        </span>
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-200 transition-transform duration-200 flex-shrink-0",
            isOpen && "rotate-180 text-amber-300"
          )}
        />
      </button>

      {/* Menu thả xuống (Dropdown Panel) */}
      {isOpen && (
        <div className="absolute top-full mt-2 right-0 sm:right-auto sm:left-0 w-56 sm:w-64 bg-[#073F8A]/95 backdrop-blur-xl border-2 border-sky-300/60 rounded-2xl p-2 shadow-[0_16px_40px_rgba(0,20,60,0.55)] z-50 flex flex-col gap-1.5 animate-in fade-in zoom-in-95 duration-150">
          {/* Ô tìm kiếm nhanh lớp học */}
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-sky-300 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm lớp học..."
              className="w-full bg-[#042A63]/85 text-white placeholder:text-sky-300/50 text-xs font-heading font-bold pl-8 pr-2.5 py-1.5 rounded-xl border border-sky-400/30 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
            />
          </div>

          {/* Danh sách lớp hỗ trợ cuộn nếu có nhiều lớp */}
          <div className="max-h-56 sm:max-h-64 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            {filteredClasses.length > 0 ? (
              filteredClasses.map((cls) => {
                const isSelected = selectedClass === cls.id;
                return (
                  <button
                    key={cls.id}
                    type="button"
                    onClick={() => handleSelectClass(cls.id)}
                    className={cn(
                      "w-full text-left cursor-pointer transition-all duration-150 rounded-xl px-3 py-2 text-xs sm:text-sm font-heading flex items-center justify-between",
                      isSelected
                        ? "bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 font-black shadow-sm"
                        : "text-sky-100 hover:text-white hover:bg-white/15 font-bold"
                    )}
                  >
                    <span className="truncate">{cls.label}</span>
                    {isSelected && (
                      <Check className="w-4 h-4 text-slate-900 stroke-[3] flex-shrink-0" />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="py-4 text-center text-xs text-sky-200/70 font-heading">
                Không tìm thấy lớp phù hợp
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
