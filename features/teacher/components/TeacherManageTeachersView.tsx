"use client";

import {
  Plus,
  Search,
  School,
  ShieldCheck,
  KeyRound,
  Sparkles,
  Phone,
  Mail,
} from "lucide-react";

interface MockTeacherData {
  id: string;
  fullName: string;
  username: string;
  avatar: string;
  role: "teacher" | "super_teacher" | "admin";
  roleLabel: string;
  roleBadgeColor: string;
  assignedClasses: string[];
  phone: string;
  email: string;
  isActive: boolean;
}

const mockTeachersList: MockTeacherData[] = [
  {
    id: "tch-1",
    fullName: "Nguyễn Văn Hùng",
    username: "admin_hung",
    avatar: "VH",
    role: "admin",
    roleLabel: "Quản Trị Viên (Admin)",
    roleBadgeColor: "bg-purple-100 text-purple-800 border-purple-200",
    assignedClasses: ["Toàn bộ các lớp (Toàn trường)"],
    phone: "0901 234 567",
    email: "admin@truongtieuhoc.edu.vn",
    isActive: true,
  },
  {
    id: "tch-2",
    fullName: "Trần Thị Minh Tâm",
    username: "tam_khoitruong",
    avatar: "MT",
    role: "super_teacher",
    roleLabel: "Khối Trưởng (Super-Teacher)",
    roleBadgeColor: "bg-blue-100 text-blue-800 border-blue-200",
    assignedClasses: ["Toàn bộ khối 1, 2, 3 (Toàn trường)"],
    phone: "0903 888 999",
    email: "tam.tran@truongtieuhoc.edu.vn",
    isActive: true,
  },
  {
    id: "tch-3",
    fullName: "Cô Trần Thị Lan",
    username: "lan_teacher3a1",
    avatar: "TL",
    role: "teacher",
    roleLabel: "Giáo viên bộ môn",
    roleBadgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
    assignedClasses: ["Lớp 3A1", "Lớp 3A2"],
    phone: "0912 888 111",
    email: "lan.tran@truongtieuhoc.edu.vn",
    isActive: true,
  },
  {
    id: "tch-4",
    fullName: "Thầy Nguyễn Văn Nam",
    username: "nam_english",
    avatar: "VN",
    role: "teacher",
    roleLabel: "Giáo viên Tiếng Anh",
    roleBadgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
    assignedClasses: ["Lớp 3A1", "Lớp 2A1", "Lớp 1A1"],
    phone: "0987 654 321",
    email: "nam.nguyen@truongtieuhoc.edu.vn",
    isActive: true,
  },
  {
    id: "tch-5",
    fullName: "Cô Nguyễn Thu Hà",
    username: "ha_teacher3a2",
    avatar: "TH",
    role: "teacher",
    roleLabel: "Giáo viên bộ môn",
    roleBadgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
    assignedClasses: ["Lớp 3A2"],
    phone: "0944 555 666",
    email: "ha.nguyen@truongtieuhoc.edu.vn",
    isActive: true,
  },
  {
    id: "tch-6",
    fullName: "Thầy Lê Minh Quân",
    username: "quan_teacher2a1",
    avatar: "MQ",
    role: "teacher",
    roleLabel: "Giáo viên bộ môn",
    roleBadgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
    assignedClasses: ["Lớp 2A1"],
    phone: "0933 222 111",
    email: "quan.le@truongtieuhoc.edu.vn",
    isActive: true,
  },
];

export function TeacherManageTeachersView() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1">
            <span>QUẢN TRỊ TRƯỜNG HỌC</span>
            <span>/</span>
            <span className="text-indigo-700">QUẢN LÝ GIÁO VIÊN</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
            Quản Lý Đội Ngũ Giáo Viên 👨‍🏫
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Danh sách nhân sự, phân công các lớp giảng dạy và điều chỉnh vai trò quyền hạn.
          </p>
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>+ Thêm tài khoản Giáo viên</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase">Tổng nhân sự</div>
          <div className="text-xl font-black text-slate-900 mt-1">6 tài khoản</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Đang hoạt động 100%</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase">Giáo viên bộ môn</div>
          <div className="text-xl font-black text-emerald-600 mt-1">4 giáo viên</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Quản lý lớp phụ trách</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase">Khối Trưởng (Super)</div>
          <div className="text-xl font-black text-blue-600 mt-1">1 khối trưởng</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Giám sát toàn trường</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase">Quản trị viên (Admin)</div>
          <div className="text-xl font-black text-purple-600 mt-1">1 tài khoản</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Toàn quyền hệ thống</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-4">
        <div className="relative flex-1 md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo họ tên, username hoặc SĐT giáo viên..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            readOnly
          />
        </div>
      </div>

      {/* Teachers Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Giáo viên</th>
                <th className="py-3 px-4">Vai trò (Role)</th>
                <th className="py-3 px-4">Lớp đang phụ trách</th>
                <th className="py-3 px-4">Thông tin liên hệ</th>
                <th className="py-3 px-4 text-right">Phân công & Phân quyền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockTeachersList.map((tch) => (
                <tr key={tch.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-black text-xs flex items-center justify-center shrink-0">
                        {tch.avatar}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-xs">{tch.fullName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">@{tch.username}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-md border ${tch.roleBadgeColor}`}
                    >
                      {tch.role === "admin" ? (
                        <ShieldCheck className="w-3 h-3 text-purple-700" />
                      ) : tch.role === "super_teacher" ? (
                        <Sparkles className="w-3 h-3 text-blue-700" />
                      ) : null}
                      <span>{tch.roleLabel}</span>
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {tch.assignedClasses.map((cls, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200"
                        >
                          {cls}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-semibold text-slate-700">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 font-mono text-[11px]">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {tch.phone}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                        <Mail className="w-3 h-3 text-slate-400" />
                        {tch.email}
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors flex items-center gap-1"
                        title="Phân công lớp phụ trách"
                      >
                        <School className="w-3.5 h-3.5" />
                        <span>Gán lớp</span>
                      </button>

                      <button
                        type="button"
                        className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-semibold transition-colors"
                        title="Đổi vai trò"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-semibold transition-colors"
                        title="Đặt lại mật khẩu"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
