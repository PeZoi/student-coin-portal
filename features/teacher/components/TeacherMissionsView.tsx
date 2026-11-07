"use client";

import {
  Plus,
  Search,
  Filter,
  Coins,
  Clock,
  Edit,
  Eye,
} from "lucide-react";

interface MockMission {
  id: string;
  title: string;
  description: string;
  subject: string;
  subjectColor: string;
  type: string;
  coins: number;
  completedCount: number;
  totalStudents: number;
  deadline: string;
  status: "active" | "ended";
}

const mockMissions: MockMission[] = [
  {
    id: "m-1",
    title: "Toán: Bảng nhân 7 và bài tập vận dụng",
    description: "Học thuộc lòng bảng nhân 7, làm các bài tập 1, 2, 3 trang 35 SGK và chụp ảnh gửi lên.",
    subject: "Toán học",
    subjectColor: "bg-blue-50 text-blue-700 border-blue-200",
    type: "Hàng ngày",
    coins: 30,
    completedCount: 28,
    totalStudents: 32,
    deadline: "20:00 hôm nay",
    status: "active",
  },
  {
    id: "m-2",
    title: "Tiếng Việt: Luyện viết chính tả bài 'Bàn tay mẹ'",
    description: "Viết đoạn 1 bài Bàn tay mẹ vào vở ô ly, chú ý nét thanh nét đậm và khoảng cách chữ.",
    subject: "Tiếng Việt",
    subjectColor: "bg-purple-50 text-purple-700 border-purple-200",
    type: "Hàng ngày",
    coins: 25,
    completedCount: 24,
    totalStudents: 32,
    deadline: "21:00 hôm nay",
    status: "active",
  },
  {
    id: "m-3",
    title: "Kỹ năng: Đọc sách 20 phút mỗi tối cùng gia đình",
    description: "Đọc 1 mẩu chuyện thiếu nhi hoặc sách khoa học, chụp ảnh góc đọc sách có xác nhận của phụ huynh.",
    subject: "Rèn luyện",
    subjectColor: "bg-amber-50 text-amber-700 border-amber-200",
    type: "Hàng ngày",
    coins: 20,
    completedCount: 19,
    totalStudents: 32,
    deadline: "22:00 hôm nay",
    status: "active",
  },
  {
    id: "m-4",
    title: "Tiếng Anh: Luyện phát âm 5 từ vựng Unit 4",
    description: "Quay video ngắn 30-60 giây phát âm rõ ràng 5 từ vựng mới về chủ đề Family.",
    subject: "Tiếng Anh",
    subjectColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    type: "Hàng tuần",
    coins: 40,
    completedCount: 15,
    totalStudents: 32,
    deadline: "Chủ nhật, 21:00",
    status: "active",
  },
];

export function TeacherMissionsView() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1">
            <span>GÓC GIÁO VIÊN</span>
            <span>/</span>
            <span className="text-emerald-700">NHIỆM VỤ LỚP</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
            Quản Lý Nhiệm Vụ Học Tập 🎯
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tạo nhiệm vụ hàng ngày, đặt mức thưởng xu và theo dõi tiến độ nộp bài của cả lớp.
          </p>
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>+ Tạo nhiệm vụ mới</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <button
            type="button"
            className="px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold transition-colors whitespace-nowrap"
          >
            Tất cả (4)
          </button>
          <button
            type="button"
            className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-semibold transition-colors border border-slate-200/60 whitespace-nowrap"
          >
            Hàng ngày (3)
          </button>
          <button
            type="button"
            className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-semibold transition-colors border border-slate-200/60 whitespace-nowrap"
          >
            Hàng tuần (1)
          </button>
          <button
            type="button"
            className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-semibold transition-colors border border-slate-200/60 whitespace-nowrap"
          >
            Đã kết thúc (0)
          </button>
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm nhiệm vụ..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              readOnly
            />
          </div>
          <button
            type="button"
            className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid of Missions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockMissions.map((mission) => {
          const percent = Math.round((mission.completedCount / mission.totalStudents) * 100);

          return (
            <div
              key={mission.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header: Badges & Coins */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${mission.subjectColor}`}>
                      {mission.subject}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                      {mission.type}
                    </span>
                  </div>

                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-black">
                    <Coins className="w-3.5 h-3.5 text-amber-600" />
                    <span>+{mission.coins} xu</span>
                  </div>
                </div>

                {/* Title & Description */}
                <h3 className="font-bold text-slate-900 text-sm mt-1">{mission.title}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                  {mission.description}
                </p>

                {/* Progress Bar */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-500 font-medium">Tiến độ nộp bài:</span>
                    <span className="font-bold text-slate-800">
                      {mission.completedCount}/{mission.totalStudents} học sinh ({percent}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Footer Details & Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center gap-1 text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {mission.deadline}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-semibold transition-colors flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Xem bài nộp</span>
                  </button>

                  <button
                    type="button"
                    className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
                    title="Chỉnh sửa"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
