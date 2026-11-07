"use client";

import { useState } from "react";
import {
  School,
  Plus,
  Search,
  Users,
  Coins,
  UserPlus,
  Edit,
} from "lucide-react";

interface MockClassData {
  id: string;
  name: string;
  grade: string;
  studentCount: number;
  totalCoins: number;
  teachers: {
    name: string;
    role: string;
  }[];
  isActive: boolean;
}

const mockClasses: MockClassData[] = [
  {
    id: "c-1",
    name: "Lớp 3A1",
    grade: "Khối 3",
    studentCount: 32,
    totalCoins: 24850,
    teachers: [
      { name: "Cô Trần Thị Lan", role: "Chủ nhiệm / Toán" },
      { name: "Thầy Nguyễn Văn Nam", role: "Tiếng Anh" },
    ],
    isActive: true,
  },
  {
    id: "c-2",
    name: "Lớp 3A2",
    grade: "Khối 3",
    studentCount: 30,
    totalCoins: 21300,
    teachers: [
      { name: "Cô Nguyễn Thu Hà", role: "Chủ nhiệm" },
      { name: "Cô Trần Thị Lan", role: "Toán bộ môn" },
    ],
    isActive: true,
  },
  {
    id: "c-3",
    name: "Lớp 2A1",
    grade: "Khối 2",
    studentCount: 31,
    totalCoins: 18900,
    teachers: [{ name: "Thầy Lê Minh Quân", role: "Chủ nhiệm" }],
    isActive: true,
  },
  {
    id: "c-4",
    name: "Lớp 2A2",
    grade: "Khối 2",
    studentCount: 29,
    totalCoins: 17450,
    teachers: [{ name: "Cô Phạm Mai Anh", role: "Chủ nhiệm" }],
    isActive: true,
  },
  {
    id: "c-5",
    name: "Lớp 1A1",
    grade: "Khối 1",
    studentCount: 32,
    totalCoins: 15200,
    teachers: [{ name: "Cô Hoàng Bích Ngọc", role: "Chủ nhiệm" }],
    isActive: true,
  },
  {
    id: "c-6",
    name: "Lớp 1A2",
    grade: "Khối 1",
    studentCount: 32,
    totalCoins: 14600,
    teachers: [{ name: "Cô Đặng Thùy Dương", role: "Chủ nhiệm" }],
    isActive: true,
  },
];

export function TeacherClassesView() {
  const [selectedGrade, setSelectedGrade] = useState<string>("all");

  const filteredClasses =
    selectedGrade === "all"
      ? mockClasses
      : mockClasses.filter((c) => c.grade === selectedGrade);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1">
            <span>QUẢN TRỊ TRƯỜNG HỌC</span>
            <span>/</span>
            <span className="text-indigo-700">QUẢN LÝ LỚP HỌC</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-heading flex items-center gap-2">
            <span>Quản Lý Lớp Học & Khối Lớp 🏫</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Theo dõi danh sách các lớp học, sĩ số học sinh và phân công giáo viên phụ trách theo khối.
          </p>
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>+ Tạo lớp học mới</span>
        </button>
      </div>

      {/* KPI Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase">Tổng số lớp</div>
          <div className="text-xl font-black text-slate-900 mt-1">6 lớp học</div>
          <div className="text-[11px] text-indigo-600 font-semibold mt-0.5">3 khối lớp (1, 2, 3)</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase">Tổng sĩ số</div>
          <div className="text-xl font-black text-emerald-600 mt-1">186 học sinh</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Trung bình 31 HS/lớp</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase">Giáo viên phụ trách</div>
          <div className="text-xl font-black text-blue-600 mt-1">8 giáo viên</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Đã phân công đầy đủ</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase">Tổng xu toàn trường</div>
          <div className="text-xl font-black text-amber-600 mt-1">112,300 xu</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Tích lũy từ đầu năm</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Grade Tabs */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <button
            type="button"
            onClick={() => setSelectedGrade("all")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
              selectedGrade === "all"
                ? "bg-slate-900 text-white shadow-2xs"
                : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60"
            }`}
          >
            Tất cả các khối (6)
          </button>
          <button
            type="button"
            onClick={() => setSelectedGrade("Khối 3")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
              selectedGrade === "Khối 3"
                ? "bg-slate-900 text-white shadow-2xs"
                : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60"
            }`}
          >
            Khối 3 (2 lớp)
          </button>
          <button
            type="button"
            onClick={() => setSelectedGrade("Khối 2")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
              selectedGrade === "Khối 2"
                ? "bg-slate-900 text-white shadow-2xs"
                : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60"
            }`}
          >
            Khối 2 (2 lớp)
          </button>
          <button
            type="button"
            onClick={() => setSelectedGrade("Khối 1")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
              selectedGrade === "Khối 1"
                ? "bg-slate-900 text-white shadow-2xs"
                : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60"
            }`}
          >
            Khối 1 (2 lớp)
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm tên lớp hoặc giáo viên..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              readOnly
            />
          </div>
        </div>
      </div>

      {/* Grid of Classes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClasses.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
          >
            <div>
              {/* Header: Class Name + Badge */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 font-black text-sm flex items-center justify-center border border-indigo-100">
                    <School className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{item.name}</h3>
                    <span className="text-[11px] text-slate-500 font-semibold">{item.grade}</span>
                  </div>
                </div>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Hoạt động
                </span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 my-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <div className="text-[11px] text-slate-500 font-medium">Sĩ số:</div>
                  <div className="text-xs font-bold text-slate-900 mt-0.5 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    <span>{item.studentCount} học sinh</span>
                  </div>
                </div>

                <div>
                  <div className="text-[11px] text-slate-500 font-medium">Heo đất lớp:</div>
                  <div className="text-xs font-black text-amber-700 mt-0.5 flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5 text-amber-500" />
                    <span>{item.totalCoins.toLocaleString()} xu</span>
                  </div>
                </div>
              </div>

              {/* Teachers assigned */}
              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Giáo viên phụ trách ({item.teachers.length})
                </div>
                <div className="space-y-1.5">
                  {item.teachers.map((t, idx) => (
                    <div
                      key={idx}
                      className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200/80 flex items-center justify-between text-xs"
                    >
                      <span className="font-semibold text-slate-800">{t.name}</span>
                      <span className="text-[10px] font-medium text-slate-500">{t.role}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Phân công GV</span>
              </button>

              <button
                type="button"
                className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors"
                title="Chỉnh sửa lớp"
              >
                <Edit className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
