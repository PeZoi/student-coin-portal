"use client";

import {
  Coins,
  Bot,
  Save,
  Lock,
} from "lucide-react";

export function TeacherSystemSettingsView() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1">
            <span>QUẢN TRỊ HỆ THỐNG</span>
            <span>/</span>
            <span className="text-purple-700">CẤU HÌNH HỆ THỐNG</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-heading flex items-center gap-2">
            <span>Cấu Hình Hệ Thống & Bảo Mật ⚙️</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Quản trị các tham số bảo mật PIN, tỷ lệ kinh tế xu và cài đặt chấm bài tự động AI toàn trường.
          </p>
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-98"
        >
          <Save className="w-4 h-4" />
          <span>Lưu thay đổi</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CARD 1: BẢO MẬT MÃ PIN & KHÓA TÀI KHOẢN */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Bảo mật PIN & Chống Brute-force</h2>
              <p className="text-xs text-slate-500">Giới hạn số lần thử nhằm ngăn ngừa học sinh đoán mã PIN</p>
            </div>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Số lần nhập sai PIN tối đa trước khi khóa:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  defaultValue={5}
                  className="w-24 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
                <span className="text-slate-500">lần liên tiếp</span>
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Thời gian khóa tài khoản tạm thời:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  defaultValue={15}
                  className="w-24 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
                <span className="text-slate-500">phút</span>
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 rounded text-purple-600 border-slate-300 focus:ring-purple-500"
                />
                <span className="text-xs text-slate-700 font-medium">
                  Tự động đặt lại số lần sai về 0 sau khi nhập đúng
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* CARD 2: CƠ CHẾ KINH TẾ XU & QUY ĐỔI */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Kinh Tế Xu & Quy Đổi Thưởng</h2>
              <p className="text-xs text-slate-500">Quy định giá trị của Heo Đất và hạn mức đổi quà</p>
            </div>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Tỷ giá quy đổi quy ước (10 xu tương đương):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  defaultValue={1000}
                  className="w-32 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
                <span className="text-slate-500">VNĐ</span>
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Số xu Heo Đất tối đa của 1 học sinh:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  defaultValue={10000}
                  className="w-32 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
                <span className="text-slate-500">xu</span>
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 rounded text-purple-600 border-slate-300 focus:ring-purple-500"
                />
                <span className="text-xs text-slate-700 font-medium">
                  Cho phép học sinh gửi yêu cầu đổi quà tại lớp
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* CARD 3: CẤU HÌNH TRÍ TUỆ NHÂN TẠO CHẤM BÀI (AI GRADING) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 lg:col-span-2">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Động Cơ Chấm Bài Trí Tuệ Nhân Tạo (AI Engine)</h2>
              <p className="text-xs text-slate-500">Tùy biến mô hình nhận diện chữ viết và phân tích ảnh nộp bài</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Mô hình suy luận AI:
              </label>
              <select
                defaultValue="gemini-flash"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              >
                <option value="gemini-flash">Gemini Flash Multimodal (Nhanh & Tối ưu)</option>
                <option value="gemini-pro">Gemini Pro Vision (Chính xác cao)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Độ nhạy phân tích chữ viết:
              </label>
              <select
                defaultValue="balanced"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              >
                <option value="lenient">Dễ (Khuyến khích học sinh nhỏ)</option>
                <option value="balanced">Cân bằng (Tiêu chuẩn tiểu học)</option>
                <option value="strict">Nghiêm ngặt (Bắt buộc đúng từng nét)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Chế độ tự động phê duyệt:
              </label>
              <select
                defaultValue="manual"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              >
                <option value="manual">Yêu cầu giáo viên bấm duyệt (An toàn)</option>
                <option value="auto_95">Tự duyệt khi AI chấm đạt từ 95%</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
