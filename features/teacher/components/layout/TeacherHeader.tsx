"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useUserStore } from "@/stores/useUserStore";
import { useTeacherWorkspaceStore } from "@/stores/useTeacherWorkspaceStore";
import { UserRole } from "@/constants/auth";
import {
  Menu,
  LogOut,
  ChevronDown,
  Bell,
  School,
  Search,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  Check,
  Users,
  Loader2,
} from "lucide-react";

interface TeacherHeaderProps {
  onToggleSidebar: () => void;
}

export function TeacherHeader({ onToggleSidebar }: TeacherHeaderProps) {
  const { student, logout } = useUserStore();
  const isAdmin = student?.role === UserRole.ADMIN;
  const isSuperTeacher = student?.role === UserRole.SUPER_TEACHER;

  const {
    classes,
    selectedClassId,
    setSelectedClassId,
    fetchMyClasses,
    isLoading: isLoadingClasses,
  } = useTeacherWorkspaceStore();

  const [isClassDropdownOpen, setIsClassDropdownOpen] = useState(false);
  const [classSearch, setClassSearch] = useState("");
  const classDropdownRef = useRef<HTMLDivElement | null>(null);

  // Tự động gọi API lấy danh sách lớp học theo phân quyền khi vào trang quản trị
  useEffect(() => {
    fetchMyClasses();
  }, [fetchMyClasses]);

  // Đóng dropdown khi click ra ngoài hoặc bấm phím Escape
  useEffect(() => {
    if (!isClassDropdownOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        classDropdownRef.current &&
        !classDropdownRef.current.contains(e.target as Node)
      ) {
        setIsClassDropdownOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsClassDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isClassDropdownOpen]);

  // Lớp đang chọn hiện tại (nếu chưa chọn thì lấy lớp đầu tiên)
  const currentClass = useMemo(() => {
    if (!classes.length) return null;
    return classes.find((c) => c.id === selectedClassId) || classes[0];
  }, [classes, selectedClassId]);

  // Lọc danh sách lớp học theo từ khóa tìm kiếm trong popover
  const filteredClasses = useMemo(() => {
    if (!classSearch.trim()) return classes;
    const query = classSearch.toLowerCase().trim();
    return classes.filter((c) => c.class_name.toLowerCase().includes(query));
  }, [classes, classSearch]);

  const displayName =
    student?.full_name || (isAdmin ? "Quản trị viên" : "Giáo viên");

  const roleLabel = isAdmin
    ? "Quản trị viên"
    : isSuperTeacher
    ? "Giáo viên trưởng"
    : "Giáo viên";

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 z-30 h-16 bg-white/85 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between transition-all">
      {/* 1. KHU VỰC BÊN TRÁI: Toggle Mobile & Selector Lớp học */}
      <div className="flex items-center gap-3">
        {/* Nút Toggle mở Sidebar trên Mobile */}
        <button
          type="button"
          onClick={onToggleSidebar}
          title="Mở menu điều hướng"
          className="lg:hidden w-9 h-9 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Workspace / Class Selector Container */}
        <div className="relative" ref={classDropdownRef}>
          {/* Nút Pill chọn lớp */}
          <button
            type="button"
            onClick={() => setIsClassDropdownOpen((prev) => !prev)}
            title="Bấm để chuyển đổi lớp học"
            className="group inline-flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-slate-300 shadow-2xs transition-all cursor-pointer select-none"
          >
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#0A62D6] flex items-center justify-center shrink-0 border border-blue-100/80 group-hover:bg-blue-100/70 transition-colors">
              <School className="w-4 h-4" />
            </div>

            <div className="flex flex-col text-left leading-tight">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden sm:block">
                Lớp học
              </span>
              <span className="text-xs sm:text-[13px] font-bold text-slate-900 truncate max-w-[120px] sm:max-w-[160px]">
                {isLoadingClasses && classes.length === 0
                  ? "Đang tải lớp..."
                  : currentClass
                  ? currentClass.class_name
                  : "Chưa có lớp"}
              </span>
            </div>

            {/* Badge sĩ số học sinh của lớp đang chọn */}
            {currentClass && (
              <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-[11px] font-semibold text-blue-700 border border-blue-100">
                <Users className="w-3 h-3 text-blue-500" />
                <span>{currentClass.student_count ?? 0} hs</span>
              </span>
            )}

            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform ml-0.5 shrink-0 ${
                isClassDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Popover Menu Dropdown Danh sách lớp học */}
          {isClassDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              {/* Header của Popover */}
              <div className="px-3.5 py-2 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <School className="w-3.5 h-3.5 text-[#0A62D6]" />
                  <span className="text-xs font-bold text-slate-800">
                    Chọn lớp học
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  {classes.length} lớp
                </span>
              </div>

              {/* Ô tìm kiếm nhanh lớp học nếu danh sách từ 5 lớp trở lên */}
              {classes.length >= 5 && (
                <div className="p-2 border-b border-slate-100">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={classSearch}
                      onChange={(e) => setClassSearch(e.target.value)}
                      placeholder="Tìm kiếm theo tên lớp..."
                      className="w-full h-8 pl-8 pr-2.5 text-xs rounded-lg bg-slate-50 border border-slate-200/80 focus:bg-white focus:border-[#0A62D6] focus:ring-1 focus:ring-[#0A62D6] outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>
              )}

              {/* Danh sách các lớp học thuần túy (Không có Toàn hệ thống) */}
              <div className="max-h-64 overflow-y-auto px-1.5 py-1 space-y-0.5">
                {isLoadingClasses && classes.length === 0 ? (
                  <div className="flex items-center justify-center gap-2 py-6 text-xs text-slate-500">
                    <Loader2 className="w-4 h-4 animate-spin text-[#0A62D6]" />
                    <span>Đang tải danh sách lớp...</span>
                  </div>
                ) : filteredClasses.length === 0 ? (
                  <div className="text-center py-6 px-4">
                    <p className="text-xs font-medium text-slate-500">
                      {classes.length === 0
                        ? "Bạn chưa được phân công phụ trách lớp học nào."
                        : "Không tìm thấy lớp học phù hợp."}
                    </p>
                  </div>
                ) : (
                  filteredClasses.map((cls) => {
                    const isSelected = cls.id === currentClass?.id;
                    return (
                      <button
                        key={cls.id}
                        type="button"
                        onClick={() => {
                          setSelectedClassId(cls.id);
                          setIsClassDropdownOpen(false);
                          setClassSearch("");
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all cursor-pointer ${
                          isSelected
                            ? "bg-blue-50 text-blue-900 font-semibold"
                            : "hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                              isSelected
                                ? "bg-[#0A62D6] text-white border-[#0A62D6]"
                                : "bg-slate-100 text-slate-500 border-slate-200/80"
                            }`}
                          >
                            <School className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0 flex flex-col">
                            <span className="text-xs truncate">
                              {cls.class_name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-normal">
                              Sĩ số: {cls.student_count ?? 0} học sinh
                            </span>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-[#0A62D6] text-white flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. KHU VỰC Ở GIỮA: Ô tìm kiếm nhanh tinh gọn */}
      <div className="hidden md:flex items-center">
        <div className="relative w-56 lg:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Tìm học sinh, nhiệm vụ, lớp..."
            className="w-full h-9 pl-9 pr-3 rounded-xl bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-xs text-slate-800 placeholder-slate-400 border border-transparent focus:border-[#0A62D6] focus:ring-2 focus:ring-[#0A62D6]/20 transition-all outline-none"
          />
        </div>
      </div>

      {/* 3. KHU VỰC BÊN PHẢI: Chuông thông báo & Phù hiệu Chức danh */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Nút Chuông thông báo */}
        <button
          type="button"
          title="Thông báo mới"
          className="relative w-9 h-9 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-transparent hover:border-slate-200 flex items-center justify-center transition-all cursor-pointer"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
          </span>
        </button>

        <div className="h-6 w-px bg-slate-200 hidden sm:block" />

        {/* Khung Phù hiệu Chức danh & Họ tên Giáo viên */}
        <div className="flex items-center gap-2.5 pl-2 pr-1.5 py-1.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all">
          {/* Biểu tượng Phù hiệu Chức danh */}
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
              isAdmin
                ? "bg-rose-50 text-rose-600 border-rose-200/70"
                : isSuperTeacher
                ? "bg-indigo-50 text-indigo-600 border-indigo-200/70"
                : "bg-blue-50 text-[#0A62D6] border-blue-200/70"
            }`}
          >
            {isAdmin ? (
              <ShieldCheck className="w-4 h-4" />
            ) : isSuperTeacher ? (
              <Sparkles className="w-4 h-4" />
            ) : (
              <GraduationCap className="w-4 h-4" />
            )}
          </div>

          {/* Họ tên & Chức vụ */}
          <div className="flex flex-col text-left leading-tight pr-1">
            <span className="text-xs font-bold text-slate-900 max-w-[140px] truncate">
              {displayName}
            </span>
            <span className="text-[10px] font-semibold text-slate-500 mt-0.5">
              {roleLabel}
            </span>
          </div>

          <div className="h-5 w-px bg-slate-200 hidden sm:block" />

          {/* Nút Đăng xuất */}
          <button
            type="button"
            onClick={logout}
            title="Đăng xuất khỏi tài khoản"
            className="w-8 h-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
