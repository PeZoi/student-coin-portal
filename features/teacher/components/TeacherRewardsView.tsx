"use client";

import { useState } from "react";
import {
  Plus,
  CheckCircle2,
  Clock,
  PackageCheck,
  Package,
  Coins,
  Edit,
} from "lucide-react";

interface MockRewardRequest {
  id: string;
  studentName: string;
  avatar: string;
  className: string;
  giftName: string;
  coinsSpent: number;
  requestedAt: string;
  status: "pending" | "fulfilled";
}

interface MockInventoryItem {
  id: string;
  name: string;
  category: string;
  coinPrice: number;
  stock: number;
  redeemedCount: number;
}

const mockRequests: MockRewardRequest[] = [
  {
    id: "req-1",
    studentName: "Phạm Tuấn Kiệt",
    avatar: "TK",
    className: "Lớp 3A1",
    giftName: "Hộp bút màu vẽ 24 màu cao cấp",
    coinsSpent: 150,
    requestedAt: "09:30 sáng nay",
    status: "pending",
  },
  {
    id: "req-2",
    studentName: "Đỗ Thùy Linh",
    avatar: "TL",
    className: "Lớp 3A1",
    giftName: "Sổ tay phi hành gia vũ trụ có khóa",
    coinsSpent: 80,
    requestedAt: "16:45 hôm qua",
    status: "pending",
  },
  {
    id: "req-3",
    studentName: "Vũ Minh Đăng",
    avatar: "MĐ",
    className: "Lớp 3A1",
    giftName: "Thước kẻ đa năng xoay góc 30cm",
    coinsSpent: 40,
    requestedAt: "02 ngày trước",
    status: "fulfilled",
  },
];

const mockInventory: MockInventoryItem[] = [
  {
    id: "inv-1",
    name: "Hộp bút màu vẽ 24 màu",
    category: "Đồ dùng học tập",
    coinPrice: 150,
    stock: 5,
    redeemedCount: 12,
  },
  {
    id: "inv-2",
    name: "Sổ tay phi hành gia",
    category: "Văn phòng phẩm",
    coinPrice: 80,
    stock: 8,
    redeemedCount: 20,
  },
  {
    id: "inv-3",
    name: "Thước kẻ đa năng 30cm",
    category: "Đồ dùng học tập",
    coinPrice: 40,
    stock: 15,
    redeemedCount: 35,
  },
  {
    id: "inv-4",
    name: "Gấu bông mini đeo balo",
    category: "Đồ chơi / Quà lưu niệm",
    coinPrice: 200,
    stock: 3,
    redeemedCount: 8,
  },
  {
    id: "inv-5",
    name: "Phiếu miễn 1 lần trực nhật",
    category: "Đặc quyền lớp học",
    coinPrice: 120,
    stock: 99,
    redeemedCount: 18,
  },
  {
    id: "inv-6",
    name: "Bút máy ngòi mài chữ đẹp",
    category: "Đồ dùng học tập",
    coinPrice: 90,
    stock: 7,
    redeemedCount: 14,
  },
];

export function TeacherRewardsView() {
  const [activeTab, setActiveTab] = useState<"requests" | "inventory">("requests");

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1">
            <span>GÓC GIÁO VIÊN</span>
            <span>/</span>
            <span className="text-emerald-700">KHO & ĐỔI QUÀ</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
            Quản Lý Quà Tặng & Đổi Thưởng 🎁
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Theo dõi học sinh dùng xu đổi quà để trao tận tay tại lớp và kiểm kê kho quà tặng.
          </p>
        </div>

        {activeTab === "inventory" && (
          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Thêm món quà mới</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("requests")}
          className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === "requests"
              ? "bg-slate-900 text-white shadow-2xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <PackageCheck className="w-4 h-4" />
          <span>Yêu cầu đổi quà chờ trao (2)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("inventory")}
          className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === "inventory"
              ? "bg-slate-900 text-white shadow-2xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Danh mục quà tặng trong kho (6)</span>
        </button>
      </div>

      {/* TAB 1: YÊU CẦU ĐỔI QUÀ */}
      {activeTab === "requests" && (
        <div className="space-y-3">
          {mockRequests.map((req) => (
            <div
              key={req.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-slate-300 transition-all shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-black text-sm flex items-center justify-center shrink-0">
                  {req.avatar}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{req.studentName}</span>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {req.className}
                    </span>
                  </div>

                  <div className="text-xs font-bold text-slate-800 mt-1 flex items-center gap-2">
                    <span>{req.giftName}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                      -{req.coinsSpent} xu
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" /> {req.requestedAt}
                    </span>
                    {req.status === "pending" ? (
                      <span className="text-rose-600 font-semibold">Chưa trao quà</span>
                    ) : (
                      <span className="text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Đã trao tận tay
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                {req.status === "pending" ? (
                  <button
                    type="button"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Xác nhận đã trao quà</span>
                  </button>
                ) : (
                  <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-500 text-xs font-bold border border-slate-200">
                    Đã hoàn thành
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: KHO QUÀ TẶNG */}
      {activeTab === "inventory" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockInventory.map((item) => (
            <div
              key={item.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-slate-300 transition-all shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span className="font-semibold">{item.category}</span>
                  <span className="text-[11px] text-slate-600">
                    Đã đổi: {item.redeemedCount} lượt
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm mt-1">{item.name}</h3>

                <div className="mt-3 flex items-center justify-between">
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-xs font-black">
                    <Coins className="w-3.5 h-3.5 text-amber-600" />
                    <span>{item.coinPrice} xu</span>
                  </div>

                  <span className="text-xs font-semibold text-slate-600">
                    Kho còn: <span className="font-bold text-slate-900">{item.stock}</span>
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  className="px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-semibold transition-colors flex items-center gap-1"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Sửa</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
