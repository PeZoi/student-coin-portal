"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  Coins,
  KeyRound,
  ArrowRightLeft,
  CheckCircle2,
  AlertCircle,
  Phone,
} from "lucide-react";

interface MockStudentItem {
  id: string;
  fullName: string;
  code: string;
  avatar: string;
  className: string;
  parentPhone: string;
  coins: number;
  level: string;
  pinStatus: "ok" | "locked";
  failedAttempts: number;
}

const mockAllStudents: MockStudentItem[] = [
  {
    id: "st-1",
    fullName: "Nguyễn Minh An",
    code: "HS3A1-01",
    avatar: "MA",
    className: "Lớp 3A1",
    parentPhone: "0912 345 678",
    coins: 1250,
    level: "Cấp 4 - Heo Hoàng Kim",
    pinStatus: "ok",
    failedAttempts: 0,
  },
  {
    id: "st-2",
    fullName: "Trần Bảo Ngọc",
    code: "HS3A1-02",
    avatar: "BN",
    className: "Lớp 3A1",
    parentPhone: "0988 765 432",
    coins: 980,
    level: "Cấp 3 - Heo Bạc",
    pinStatus: "ok",
    failedAttempts: 1,
  },
  {
    id: "st-3",
    fullName: "Đỗ Thùy Linh",
    code: "HS3A1-05",
    avatar: "TL",
    className: "Lớp 3A1",
    parentPhone: "0904 112 233",
    coins: 690,
    level: "Cấp 2 - Heo Đồng",
    pinStatus: "locked",
    failedAttempts: 5,
  },
  {
    id: "st-4",
    fullName: "Hoàng Gia Bảo",
    code: "HS2A1-08",
    avatar: "GB",
    className: "Lớp 2A1",
    parentPhone: "0977 445 566",
    coins: 840,
    level: "Cấp 3 - Heo Bạc",
    pinStatus: "ok",
    failedAttempts: 0,
  },
  {
    id: "st-5",
    fullName: "Lê Phương Thảo",
    code: "HS2A2-12",
    avatar: "PT",
    className: "Lớp 2A2",
    parentPhone: "0933 889 900",
    coins: 520,
    level: "Cấp 1 - Heo Nhỏ",
    pinStatus: "locked",
    failedAttempts: 5,
  },
  {
    id: "st-6",
    fullName: "Vũ Hải Đăng",
    code: "HS1A1-03",
    avatar: "HĐ",
    className: "Lớp 1A1",
    parentPhone: "0966 332 211",
    coins: 610,
    level: "Cấp 2 - Heo Đồng",
    pinStatus: "ok",
    failedAttempts: 0,
  },
];

export function TeacherManageStudentsView() {
  const [selectedClass, setSelectedClass] = useState<string>("all");

  const filteredStudents =
    selectedClass === "all"
      ? mockAllStudents
      : mockAllStudents.filter((s) => s.className === selectedClass);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1">
            <span className="text-indigo-700">QUẢN LÝ HỌC SINH</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
            Quản Lý Học Sinh Toàn Trường 🎒
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tra cứu toàn bộ học sinh các khối lớp, quản trị bảo mật mã PIN và phân bổ chuyển lớp.
          </p>
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>+ Thêm học sinh</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Class Filter Dropdown */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <label className="text-xs font-bold text-slate-500 shrink-0">Lọc theo lớp:</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="all">Toàn bộ các lớp (186 học sinh)</option>
            <option value="Lớp 3A1">Lớp 3A1 (32 học sinh)</option>
            <option value="Lớp 3A2">Lớp 3A2 (30 học sinh)</option>
            <option value="Lớp 2A1">Lớp 2A1 (31 học sinh)</option>
            <option value="Lớp 2A2">Lớp 2A2 (29 học sinh)</option>
            <option value="Lớp 1A1">Lớp 1A1 (32 học sinh)</option>
          </select>
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo họ tên, mã HS hoặc SĐT Zalo..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              readOnly
            />
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Học sinh</th>
                <th className="py-3 px-4">Lớp học</th>
                <th className="py-3 px-4">SĐT Zalo Phụ huynh</th>
                <th className="py-3 px-4">Số dư Heo Đất</th>
                <th className="py-3 px-4">Trạng thái mã PIN</th>
                <th className="py-3 px-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((st) => (
                <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-black text-xs flex items-center justify-center shrink-0">
                        {st.avatar}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-xs">{st.fullName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{st.code}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-bold text-xs px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {st.className}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-semibold text-slate-700">
                    <span className="flex items-center gap-1.5 font-mono text-[11px]">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {st.parentPhone}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-black text-xs">
                      <Coins className="w-3.5 h-3.5 text-amber-600" />
                      <span>{st.coins.toLocaleString()} xu</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    {st.pinStatus === "ok" ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Hoạt động
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        <AlertCircle className="w-3 h-3" /> Tạm khóa (sai 5 lần)
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        className={`p-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                          st.pinStatus === "locked"
                            ? "bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                        title="Đặt lại mã PIN / Mở khóa"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        className="p-1.5 rounded-lg bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 text-slate-600 text-xs font-semibold transition-colors"
                        title="Chuyển lớp học"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" />
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
