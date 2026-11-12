"use client";

import {
  Edit,
  Save,
  RefreshCw,
} from "lucide-react";

interface MockWheelPrize {
  slot: number;
  label: string;
  type: "coin" | "free_spin" | "gift" | "luck";
  rewardValue: string;
  probabilityWeight: number;
  percent: number;
  badgeColor: string;
}

const mockPrizes: MockWheelPrize[] = [
  {
    slot: 1,
    label: "+20 Xu Heo Đất",
    type: "coin",
    rewardValue: "+20 xu",
    probabilityWeight: 30,
    percent: 30.0,
    badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
  },
  {
    slot: 2,
    label: "+10 Xu Khuyến Khích",
    type: "coin",
    rewardValue: "+10 xu",
    probabilityWeight: 25,
    percent: 25.0,
    badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
  },
  {
    slot: 3,
    label: "+50 Xu May Mắn",
    type: "coin",
    rewardValue: "+50 xu",
    probabilityWeight: 15,
    percent: 15.0,
    badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
  },
  {
    slot: 4,
    label: "+1 Lượt Quay Thưởng",
    type: "free_spin",
    rewardValue: "+1 lượt",
    probabilityWeight: 12,
    percent: 12.0,
    badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
  },
  {
    slot: 5,
    label: "Chúc Bạn May Mắn Lần Sau",
    type: "luck",
    rewardValue: "0 xu",
    probabilityWeight: 10,
    percent: 10.0,
    badgeColor: "bg-slate-100 text-slate-700 border-slate-200",
  },
  {
    slot: 6,
    label: "+100 Xu Đột Phá",
    type: "coin",
    rewardValue: "+100 xu",
    probabilityWeight: 5,
    percent: 5.0,
    badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
  },
  {
    slot: 7,
    label: "Quà Tặng: Thước Kẻ 30cm",
    type: "gift",
    rewardValue: "Hiện vật",
    probabilityWeight: 2,
    percent: 2.0,
    badgeColor: "bg-rose-100 text-rose-800 border-rose-200",
  },
  {
    slot: 8,
    label: "Đại Tiệc Xu: +200 Xu",
    type: "coin",
    rewardValue: "+200 xu",
    probabilityWeight: 1,
    percent: 1.0,
    badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
  },
];

export function TeacherWheelConfigView() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1">
            <span className="text-indigo-700">CẤU HÌNH VÒNG QUAY</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
            Cấu Hình Vòng Quay May Mắn 🎡
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Điều chỉnh cơ cấu 8 ô phần thưởng, thiết lập trọng số xác suất và chi phí xu mỗi lượt quay.
          </p>
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Lưu tỷ lệ vòng quay</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase">Phí quay mỗi lượt</div>
          <div className="text-xl font-black text-slate-900 mt-1">20 xu / lượt</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Trừ từ Heo Đất học sinh</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase">Lượt miễn phí</div>
          <div className="text-xl font-black text-emerald-600 mt-1">1 lượt / ngày</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Reset vào 00:00 hàng ngày</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase">Tỷ lệ hoàn xu</div>
          <div className="text-xl font-black text-blue-600 mt-1">82.5%</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Cân bằng kinh tế lớp học</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase">Lượt quay hôm nay</div>
          <div className="text-xl font-black text-amber-600 mt-1">342 lượt</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Toàn trường tham gia</div>
        </div>
      </div>

      {/* 8 Slots Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="font-bold text-xs text-slate-800">
            Cơ cấu 8 ô phần thưởng trên đĩa quay (Tổng trọng số: 100%)
          </span>
          <button
            type="button"
            className="text-xs font-bold text-purple-700 hover:text-purple-800 flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Cân bằng</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4 w-16 text-center">Ô số</th>
                <th className="py-3 px-4">Tên hiển thị trên vòng quay</th>
                <th className="py-3 px-4">Loại phần thưởng</th>
                <th className="py-3 px-4">Giá trị nhận</th>
                <th className="py-3 px-4">Xác suất trúng (%)</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockPrizes.map((pz) => (
                <tr key={pz.slot} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 text-center">
                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-800 font-black text-xs inline-flex items-center justify-center">
                      #{pz.slot}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {pz.label}
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-md border ${pz.badgeColor}`}
                    >
                      {pz.type.toUpperCase()}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-black text-slate-800">
                    {pz.rewardValue}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-purple-500 rounded-full"
                          style={{ width: `${pz.percent}%` }}
                        />
                      </div>
                      <span className="font-bold text-slate-700">{pz.percent}%</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-semibold transition-colors"
                      title="Chỉnh sửa ô thưởng"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
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
