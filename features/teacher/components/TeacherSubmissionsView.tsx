"use client";

import {
  Search,
  Filter,
  Check,
  X,
  Eye,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface MockSubmission {
  id: string;
  studentName: string;
  avatar: string;
  className: string;
  missionTitle: string;
  subject: string;
  subjectColor: string;
  submittedAt: string;
  coins: number;
  aiFeedback: string;
  aiStatus: "passed" | "warning";
  status: "pending" | "approved" | "rejected";
}

const mockSubmissions: MockSubmission[] = [
  {
    id: "sub-1",
    studentName: "Nguyễn Minh An",
    avatar: "MA",
    className: "Lớp 3A1",
    missionTitle: "Toán: Ôn tập bảng nhân 7 và giải toán có lời văn",
    subject: "Toán học",
    subjectColor: "bg-blue-50 text-blue-700 border-blue-200",
    submittedAt: "15 phút trước",
    coins: 30,
    aiFeedback: "AI đánh giá: 9/10 câu chính xác, chữ viết rõ nét",
    aiStatus: "passed",
    status: "pending",
  },
  {
    id: "sub-2",
    studentName: "Trần Bảo Ngọc",
    avatar: "BN",
    className: "Lớp 3A1",
    missionTitle: "Tiếng Việt: Luyện viết chính tả bài 'Bàn tay mẹ'",
    subject: "Tiếng Việt",
    subjectColor: "bg-purple-50 text-purple-700 border-purple-200",
    submittedAt: "45 phút trước",
    coins: 25,
    aiFeedback: "AI đánh giá: Đúng quy cách chữ viết, trình bày sạch",
    aiStatus: "passed",
    status: "pending",
  },
  {
    id: "sub-3",
    studentName: "Lê Hoàng Nam",
    avatar: "HN",
    className: "Lớp 3A1",
    missionTitle: "Rèn luyện: Đọc sách 20 phút mỗi tối cùng gia đình",
    subject: "Kỹ năng",
    subjectColor: "bg-amber-50 text-amber-700 border-amber-200",
    submittedAt: "2 giờ trước",
    coins: 20,
    aiFeedback: "AI phát hiện: Ảnh hợp lệ, có chữ ký xác nhận của PH",
    aiStatus: "passed",
    status: "pending",
  },
  {
    id: "sub-4",
    studentName: "Vũ Gia Hưng",
    avatar: "GH",
    className: "Lớp 3A1",
    missionTitle: "Tiếng Anh: Quay video đọc 5 từ vựng Unit 4",
    subject: "Tiếng Anh",
    subjectColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    submittedAt: "3 giờ trước",
    coins: 35,
    aiFeedback: "AI đánh giá: Phát âm rõ ràng, thời lượng video 45s",
    aiStatus: "passed",
    status: "pending",
  },
  {
    id: "sub-5",
    studentName: "Đặng Mai Phương",
    avatar: "MP",
    className: "Lớp 3A1",
    missionTitle: "Toán: Vẽ sơ đồ tư duy hình học phẳng",
    subject: "Toán học",
    subjectColor: "bg-blue-50 text-blue-700 border-blue-200",
    submittedAt: "5 giờ trước",
    coins: 40,
    aiFeedback: "AI cảnh báo: Ảnh chụp hơi mờ ở góc dưới bên phải",
    aiStatus: "warning",
    status: "pending",
  },
];

export function TeacherSubmissionsView() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1">
            <span>GÓC GIÁO VIÊN</span>
            <span>/</span>
            <span className="text-emerald-700">DUYỆT BÀI TẬP</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
            Duyệt Bài Tập Học Sinh 📝
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kiểm tra ảnh bài làm của học sinh, tham khảo gợi ý từ AI và xác nhận thưởng xu Heo Đất.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Duyệt nhanh tất cả hợp lệ (4)</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <button
            type="button"
            className="px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold transition-colors whitespace-nowrap"
          >
            Chờ duyệt (5)
          </button>
          <button
            type="button"
            className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-semibold transition-colors border border-slate-200/60 whitespace-nowrap"
          >
            Đã duyệt (24)
          </button>
          <button
            type="button"
            className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-semibold transition-colors border border-slate-200/60 whitespace-nowrap"
          >
            Cần làm lại (2)
          </button>
          <button
            type="button"
            className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-semibold transition-colors border border-slate-200/60 whitespace-nowrap"
          >
            Tất cả
          </button>
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo tên học sinh..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              readOnly
            />
          </div>
          <button
            type="button"
            className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Bộ lọc môn học"
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Submissions List */}
      <div className="space-y-3">
        {mockSubmissions.map((sub) => (
          <div
            key={sub.id}
            className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-slate-300 transition-all shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4"
          >
            {/* Student & Mission info */}
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-black text-sm flex items-center justify-center shrink-0">
                {sub.avatar}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm text-slate-900">{sub.studentName}</span>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {sub.className}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${sub.subjectColor}`}>
                    {sub.subject}
                  </span>
                </div>

                <h3 className="text-xs sm:text-sm font-semibold text-slate-800 mt-1">
                  {sub.missionTitle}
                </h3>

                {/* AI Assessment & Time */}
                <div className="flex items-center gap-4 mt-2 flex-wrap text-xs">
                  <span className="text-slate-500 flex items-center gap-1 text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {sub.submittedAt}
                  </span>

                  <div
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${
                      sub.aiStatus === "passed"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}
                  >
                    {sub.aiStatus === "passed" ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-3 h-3 text-amber-600" />
                    )}
                    <span>{sub.aiFeedback}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Thumbnail Placeholder & Actions */}
            <div className="flex items-center justify-between lg:justify-end gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
              {/* Photo Preview Button (Symbolic) */}
              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-slate-500" />
                <span>Xem ảnh bài làm</span>
              </button>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Làm lại</span>
                </button>

                <button
                  type="button"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Duyệt (+{sub.coins} xu)</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
