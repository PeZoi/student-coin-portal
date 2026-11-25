"use client";

import { useState } from "react";
import {
  Search,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Laptop,
  History,
  Lock,
} from "lucide-react";

interface MockAuthLog {
  id: string;
  userIdentifier: string;
  role: string;
  action: "LOGIN" | "LOGOUT";
  status: "SUCCESS" | "FAILED";
  reason?: string;
  ip: string;
  device: "mobile" | "desktop";
  timestamp: string;
}

interface MockAuditLog {
  id: string;
  actor: string;
  action: string;
  entity: string;
  description: string;
  timestamp: string;
}

const mockAuthLogs: MockAuthLog[] = [
  {
    id: "log-1",
    userIdentifier: "0904 112 233 (Đỗ Thùy Linh)",
    role: "student",
    action: "LOGIN",
    status: "FAILED",
    reason: "WRONG_PIN (Lần 5)",
    ip: "14.232.18.91",
    device: "mobile",
    timestamp: "10 phút trước",
  },
  {
    id: "log-2",
    userIdentifier: "0904 112 233 (Đỗ Thùy Linh)",
    role: "student",
    action: "LOGIN",
    status: "FAILED",
    reason: "ACCOUNT_LOCKED (15 phút)",
    ip: "14.232.18.91",
    device: "mobile",
    timestamp: "9 phút trước",
  },
  {
    id: "log-3",
    userIdentifier: "lan_teacher3a1 (Cô Trần Thị Lan)",
    role: "teacher",
    action: "LOGIN",
    status: "SUCCESS",
    ip: "118.69.155.12",
    device: "desktop",
    timestamp: "25 phút trước",
  },
  {
    id: "log-4",
    userIdentifier: "0912 345 678 (Nguyễn Minh An)",
    role: "student",
    action: "LOGIN",
    status: "SUCCESS",
    ip: "27.72.102.45",
    device: "mobile",
    timestamp: "40 phút trước",
  },
  {
    id: "log-5",
    userIdentifier: "admin_hung (Nguyễn Văn Hùng)",
    role: "admin",
    action: "LOGIN",
    status: "SUCCESS",
    ip: "115.79.20.10",
    device: "desktop",
    timestamp: "1 giờ trước",
  },
];

const mockAuditLogs: MockAuditLog[] = [
  {
    id: "aud-1",
    actor: "Nguyễn Văn Hùng (Admin)",
    action: "CẬP NHẬT PHÂN CÔNG",
    entity: "teacher_classes",
    description: "Phân công Thầy Nam phụ trách môn Tiếng Anh lớp 3A1 và 2A1",
    timestamp: "35 phút trước",
  },
  {
    id: "aud-2",
    actor: "Trần Thị Minh Tâm (Khối Trưởng)",
    action: "ĐẶT LẠI MÃ PIN",
    entity: "users",
    description: "Đặt lại mã PIN 4 số và mở khóa tài khoản cho học sinh Đỗ Thùy Linh (3A1)",
    timestamp: "1 giờ trước",
  },
  {
    id: "aud-3",
    actor: "Nguyễn Văn Hùng (Admin)",
    action: "CHỈNH SỬA TỶ LỆ",
    entity: "wheel_prizes",
    description: "Tăng xác suất ô +20 xu từ 25% lên 30% trên vòng quay may mắn",
    timestamp: "2 giờ trước",
  },
];

export function TeacherAuditLogsView() {
  const [activeTab, setActiveTab] = useState<"auth" | "audit">("auth");

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1">
            <span>QUẢN TRỊ HỆ THỐNG</span>
            <span>/</span>
            <span className="text-purple-700">NHẬT KÝ AN NINH</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
            Nhật Ký An Ninh & Kiểm Toán 🛡️
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Theo dõi toàn bộ lịch sử đăng nhập, cảnh báo tài khoản bị khóa và các thay đổi dữ liệu nhạy cảm.
          </p>
        </div>

        <button
          type="button"
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          Xuất file báo cáo Log (CSV)
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("auth")}
          className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === "auth"
              ? "bg-purple-600 text-white shadow-2xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Nhật ký Đăng nhập (auth_logs)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("audit")}
          className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === "audit"
              ? "bg-purple-600 text-white shadow-2xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <History className="w-4 h-4" />
          <span>Nhật ký Thao tác Dữ liệu (audit_logs)</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-4">
        <div className="relative flex-1 md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo IP, số điện thoại, tài khoản..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
            readOnly
          />
        </div>
      </div>

      {/* TAB 1: AUTH LOGS */}
      {activeTab === "auth" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Thời gian</th>
                  <th className="py-3 px-4">Tài khoản truy cập</th>
                  <th className="py-3 px-4">Vai trò</th>
                  <th className="py-3 px-4">Hành động</th>
                  <th className="py-3 px-4">Kết quả & Lý do</th>
                  <th className="py-3 px-4 text-right">Địa chỉ IP & Thiết bị</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mockAuthLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                      {log.timestamp}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {log.userIdentifier}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
                        {log.role}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {log.action}
                    </td>

                    <td className="py-3.5 px-4">
                      {log.status === "SUCCESS" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Thành công
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          <AlertCircle className="w-3 h-3" /> {log.reason || "Thất bại"}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono text-[11px] text-slate-600">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        {log.device === "mobile" ? (
                          <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                        ) : (
                          <Laptop className="w-3.5 h-3.5 text-slate-400" />
                        )}
                        <span>{log.ip}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: AUDIT LOGS */}
      {activeTab === "audit" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Thời gian</th>
                  <th className="py-3 px-4">Người thực hiện</th>
                  <th className="py-3 px-4">Thao tác</th>
                  <th className="py-3 px-4">Bảng dữ liệu</th>
                  <th className="py-3 px-4 text-right">Chi tiết mô tả</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mockAuditLogs.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                      {item.timestamp}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {item.actor}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                        {item.action}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                      {item.entity}
                    </td>

                    <td className="py-3.5 px-4 text-right text-slate-700 font-medium">
                      {item.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
