"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppRoutes } from "@/constants/routes";
import {
  LayoutDashboard,
  FileCheck2,
  ListTodo,
  Gift,
  Users,
  Trophy,
  GraduationCap,
  X,
  School,
  Contact,
  UserCog,
  Sliders,
  CircleDot,
  ShieldAlert,
} from "lucide-react";
import { useUserStore } from "@/stores/useUserStore";

interface TeacherSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  badge?: string | number;
  badgeColor?: string;
}

export function TeacherSidebar({ isOpen = false, onClose }: TeacherSidebarProps) {
  const pathname = usePathname();
  const { student } = useUserStore();
  const isAdmin = student?.role === "admin";
  const isSuperTeacher = student?.role === "super_teacher";

  const navItems: NavItem[] = [
    {
      label: "Bàn làm việc",
      href: AppRoutes.TEACHER.DASHBOARD,
      icon: LayoutDashboard,
    },
    {
      label: "Duyệt bài tập",
      href: AppRoutes.TEACHER.SUBMISSIONS,
      icon: FileCheck2,
      badge: 5,
      badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
    },
    {
      label: "Nhiệm vụ lớp",
      href: AppRoutes.TEACHER.MISSIONS,
      icon: ListTodo,
    },
    {
      label: "Kho & Đổi quà",
      href: AppRoutes.TEACHER.REWARDS,
      icon: Gift,
      badge: 2,
      badgeColor: "bg-rose-100 text-rose-800 border-rose-200",
    },
    {
      label: "Học sinh & Lớp",
      href: AppRoutes.TEACHER.STUDENTS,
      icon: Users,
    },
    {
      label: "Bảng xếp hạng",
      href: AppRoutes.TEACHER.LEADERBOARD,
      icon: Trophy,
    },
  ];

  const managementItems: NavItem[] = [
    {
      label: "Quản lý Lớp học",
      href: AppRoutes.TEACHER.CLASSES,
      icon: School,
    },
    {
      label: "Quản lý Học sinh",
      href: AppRoutes.TEACHER.MANAGE_STUDENTS,
      icon: Contact,
    },
    {
      label: "Quản lý Giáo viên",
      href: AppRoutes.TEACHER.MANAGE_TEACHERS,
      icon: UserCog,
    },
    {
      label: "Cấu hình Vòng quay",
      href: AppRoutes.TEACHER.WHEEL_CONFIG,
      icon: CircleDot,
    },
  ];

  const adminItems: NavItem[] = [
    {
      label: "Cấu hình Hệ thống",
      href: AppRoutes.TEACHER.SYSTEM_SETTINGS,
      icon: Sliders,
    },
    {
      label: "Nhật ký An ninh & Logs",
      href: AppRoutes.TEACHER.AUDIT_LOGS,
      icon: ShieldAlert,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand / Logo */}
        <div className="h-16 px-4 border-b border-[#E2E8F0] flex items-center justify-between bg-white">
          <Link
            href={AppRoutes.TEACHER.DASHBOARD}
            className="group flex items-center gap-3 focus:outline-none"
          >
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#0A62D6] to-[#074799] text-white flex items-center justify-center shadow-[0_4px_12px_-2px_rgba(10,98,214,0.4)] ring-1 ring-[#0A62D6]/20 shrink-0 group-hover:scale-[1.03] transition-transform">
              <GraduationCap className="w-5 h-5 text-white stroke-[2.2]" />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>
            <div className="leading-tight">
              <div className="font-heading font-extrabold text-[15px] text-[#0F172A] tracking-tight group-hover:text-[#0A62D6] transition-colors">
                Góc Giáo Viên
              </div>
              <p className="text-[11px] text-[#64748B] font-semibold tracking-wide mt-0.5">
                Student Coin Portal
              </p>
            </div>
          </Link>

          {/* Mobile close button */}
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Đóng thanh điều hướng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Lớp học
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === AppRoutes.TEACHER.DASHBOARD
                ? pathname === AppRoutes.TEACHER.DASHBOARD
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200/90 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive
                        ? "text-emerald-700"
                        : "text-slate-400 group-hover:text-slate-700"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-black px-1.5 py-0.5 rounded-full border ${
                      item.badgeColor || "bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Quản lý cấp Trường (Dành riêng cho Super-Teacher & Admin) */}
          {(isAdmin || isSuperTeacher) && (
            <div className="pt-3 mt-2 border-t border-slate-100 space-y-1">
              <div className="px-3 py-1 text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Tiện ích</span>
              </div>

              {managementItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? "bg-indigo-50 text-indigo-900 border border-indigo-200/90 shadow-2xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 transition-colors ${
                          isActive
                            ? "text-indigo-700"
                            : "text-slate-400 group-hover:text-slate-700"
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>

                    {item.badge !== undefined && (
                      <span
                        className={`text-[10px] font-black px-1.5 py-0.5 rounded-full border ${
                          item.badgeColor || "bg-slate-100 text-slate-700 border-slate-200"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Quản trị Hệ thống Tối cao (Độc quyền Admin) */}
          {isAdmin && (
            <div className="pt-3 mt-2 border-t border-slate-100 space-y-1">
              <div className="px-3 py-1 text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Quản trị hệ thống</span>
              </div>

              {adminItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? "bg-purple-50 text-purple-900 border border-purple-200/90 shadow-2xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 transition-colors ${
                          isActive
                            ? "text-purple-700"
                            : "text-slate-400 group-hover:text-slate-700"
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>

                    {item.badge !== undefined && (
                      <span
                        className={`text-[10px] font-black px-1.5 py-0.5 rounded-full border ${
                          item.badgeColor || "bg-slate-100 text-slate-700 border-slate-200"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </nav>
      </aside>
    </>
  );
}
