"use client";

import React, { useState } from "react";
import Image from "next/image";
import { X, UploadCloud, CheckCircle2 } from "lucide-react";
import { useUserStore } from "@/stores/useUserStore";

export function SubmitModal() {
  const { isModalOpen, selectedMission, closeSubmitModal, submitMission } =
    useUserStore();
  const [fileSelected, setFileSelected] = useState<string | null>(null);
  const [note, setNote] = useState("");

  if (!isModalOpen || !selectedMission) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMission(selectedMission.id, note);
    setFileSelected(null);
    setNote("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white rounded-[32px] border-4 border-yellow-300 shadow-[0_20px_60px_rgba(0,0,0,0.3)] p-6 overflow-hidden">
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-yellow-400 via-pink-400 to-sky-400" />

        {/* Close Button */}
        <button
          onClick={closeSubmitModal}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mt-2 mb-4">
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 px-3.5 py-1 rounded-full mb-2">
            <div className="w-5 h-5 relative">
              <Image src="/coin.png" alt="Coin" fill sizes="20px" unoptimized className="object-contain" />
            </div>
            <span className="text-amber-800 font-heading font-black text-sm">
              Phần thưởng: +{selectedMission.rewardCoins} xu
            </span>
          </div>

          <h3 className="text-xl font-heading font-black text-slate-800">
            {selectedMission.title}
          </h3>
          <p className="text-xs text-slate-500 mt-1 font-sans">
            Nộp bài để giáo viên duyệt và cộng xu vào Heo Đất nhé!
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Upload Dropzone */}
          <div
            onClick={() => setFileSelected("bai_tap_gia_bao.png")}
            className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
              fileSelected
                ? "border-emerald-400 bg-emerald-50/50"
                : "border-sky-300 bg-sky-50/40 hover:bg-sky-50"
            }`}
          >
            {fileSelected ? (
              <div className="flex flex-col items-center gap-1.5 text-emerald-700">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                <span className="font-heading font-bold text-sm">{fileSelected}</span>
                <span className="text-xs text-emerald-600 font-sans">
                  (Đã chọn bài nộp thành công! Bấm để đổi file khác)
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-sky-700">
                <UploadCloud className="w-9 h-9 text-sky-500" />
                <span className="font-heading font-bold text-sm">
                  Kéo thả ảnh bài làm hoặc file Excel vào đây
                </span>
                <span className="text-xs text-slate-400 font-sans">
                  Hỗ trợ định dạng: PNG, JPG, XLSX (Tối đa 10MB)
                </span>
              </div>
            )}
          </div>

          {/* Note Input */}
          <div className="flex flex-col gap-1 text-left">
            <label className="text-xs font-bold text-slate-600 font-sans">
              Lời nhắn gửi cô giáo (tùy chọn):
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Thưa cô, em đã hoàn thành bài tập rồi ạ..."
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:border-sky-400 bg-slate-50 transition-all font-sans"
            />
          </div>

          {/* Submit Action - Pure 3D Buttons without white border */}
          <div className="flex items-center gap-3 mt-3">
            <button
              type="button"
              onClick={closeSubmitModal}
              className="flex-1 py-2.5 rounded-full bg-slate-100 shadow-[0_4px_0_#CBD5E1] font-heading font-bold text-slate-600 text-sm hover:bg-slate-200 active:translate-y-[2px] active:shadow-[0_2px_0_#CBD5E1] transition-all cursor-pointer"
            >
              Để sau
            </button>
            <button
              type="submit"
              className="relative group flex-[2] py-2.5 rounded-full bg-gradient-to-b from-[#2EE86D] via-[#1EB854] to-[#0A883A] shadow-[inset_0_2px_0_rgba(255,255,255,0.65),inset_0_-2px_0_rgba(0,0,0,0.15),0_5px_0_#075E26,0_8px_14px_rgba(0,0,0,0.22)] active:translate-y-[3px] active:shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_2px_0_#075E26,0_4px_6px_rgba(0,0,0,0.2)] hover:brightness-105 text-white font-heading text-sm drop-shadow-[0_1px_0_#064D1F] transition-all flex items-center justify-center gap-1.5 cursor-pointer overflow-hidden select-none"
            >
              <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/35 to-transparent rounded-t-full pointer-events-none" />
              <span className="relative z-10">Nộp bài & Nhận xu</span>
              <span className="relative z-10 text-base">🎉</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
