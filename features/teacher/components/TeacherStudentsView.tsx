"use client";

import {
  Search,
  Filter,
  Coins,
  KeyRound,
  Award,
  History,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface MockStudent {
  id: string;
  code: string;
  fullName: string;
  avatar: string;
  coins: number;
  level: string;
  completedMissions: number;
  lastActive: string;
  pinStatus: "ok" | "locked";
}

const mockStudents: MockStudent[] = [
  {
    id: "st-1",
    code: "HS3A1-01",
    fullName: "Nguyễn Minh An",
    avatar: "MA",
    coins: 1250,
    level: "Cấp 4 - Heo Hoàng Kim",
    completedMissions: 42,
    lastActive: "15 phút trước",
    pinStatus: "ok",
  },
  {
    id: "st-2",
    code: "HS3A1-02",
    fullName: "Trần Bảo Ngọc",
    avatar: "BN",
    coins: 980,
    level: "Cấp 3 - Heo Bạc Tinh Anh",
    completedMissions: 38,
    lastActive: "45 phút trước",
    pinStatus: "ok",
  },
  {
    id: "st-3",
    code: "HS3A1-03",
    fullName: "Lê Hoàng Nam",
    avatar: "HN",
    coins: 840,
    level: "Cấp 3 - Heo Bạc Tinh Anh",
    completedMissions: 35,
    lastActive: "2 giờ trước",
    pinStatus: "ok",
  },
  {
    id: "st-4",
    code: "HS3A1-04",
    fullName: "Phạm Tuấn Kiệt",
    avatar: "TK",
    coins: 720,
    level: "Cấp 2 - Heo Đồng Chăm Chỉ",
    completedMissions: 31,
    lastActive: "Hôm nay 09:30",
    pinStatus: "ok",
  },
  {
    id: "st-5",
    code: "HS3A1-05",
    fullName: "Đỗ Thùy Linh",
    avatar: "TL",
    coins: 690,
    level: "Cấp 2 - Heo Đồng Chăm Chỉ",
    completedMissions: 29,
    lastActive: "Hôm qua 16:45",
    pinStatus: "locked",
  },
  {
    id: "st-6",
    code: "HS3A1-06",
    fullName: "Vũ Gia Hưng",
    avatar: "GH",
    coins: 650,
    level: "Cấp 2 - Heo Đồng Chăm Chỉ",
    completedMissions: 27,
    lastActive: "3 giờ trước",
    pinStatus: "ok",
  },
];

export function TeacherStudentsView() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1">
            <span>GÓC GIÁO VIÊN</span>
            <span>/</span>
            <span className="text-emerald-700">HỌC SINH & LỚP HỌC</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
            Hồ Sơ Học Sinh Lớp 3A1 👥
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Danh sách 32 học sinh, theo dõi số dư Heo Đất, tiến độ rèn luyện và hỗ trợ cấp lại mã PIN.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            Xuất danh sách (Excel)
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase">Sĩ số lớp</div>
          <div className="text-xl font-black text-slate-900 mt-1">32 học sinh</div>
          <div className="text-[11px] text-slate-500 mt-0.5">16 bạn nam, 16 bạn nữ</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase">Tổng xu cả lớp</div>
          <div className="text-xl font-black text-amber-600 mt-1">24,850 xu</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Trung bình 776 xu/bạn</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase">Hoàn thành bài</div>
          <div className="text-xl font-black text-emerald-600 mt-1">87.5%</div>
          <div className="text-[11px] text-slate-500 mt-0.5">28 bạn nộp hôm nay</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase">Cần hỗ trợ PIN</div>
          <div className="text-xl font-black text-rose-600 mt-1">1 học sinh</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Bị khóa do sai 5 lần</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo họ tên hoặc mã học sinh..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            readOnly
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            type="button"
            className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>Xếp theo: Xu nhiều nhất</span>
          </button>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Học sinh</th>
                <th className="py-3 px-4">Số dư Heo Đất</th>
                <th className="py-3 px-4">Cấp bậc</th>
                <th className="py-3 px-4">Bài hoàn thành</th>
                <th className="py-3 px-4">Trạng thái PIN</th>
                <th className="py-3 px-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockStudents.map((st) => (
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
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-black text-xs">
                      <Coins className="w-3.5 h-3.5 text-amber-600" />
                      <span>{st.coins.toLocaleString()} xu</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-semibold text-slate-700">
                    {st.level}
                  </td>

                  <td className="py-3.5 px-4 font-semibold text-slate-700">
                    {st.completedMissions} bài
                  </td>

                  <td className="py-3.5 px-4">
                    {st.pinStatus === "ok" ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Hoạt động
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        <AlertCircle className="w-3 h-3" /> Tạm khóa
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        className="p-1.5 rounded-lg bg-slate-50 hover:bg-amber-50 hover:text-amber-700 border border-slate-200 text-slate-600 text-xs font-semibold transition-colors"
                        title="Thưởng nóng xu"
                      >
                        <Award className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        className={`p-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                          st.pinStatus === "locked"
                            ? "bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                        title="Đặt lại mã PIN"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-semibold transition-colors"
                        title="Lịch sử giao dịch"
                      >
                        <History className="w-3.5 h-3.5" />
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
