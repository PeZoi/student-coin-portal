"use client";

import { createContext, useContext, ReactNode } from "react";
import { useLuckyWheel } from "../hooks/useLuckyWheel";
import { StudentWheelInitialData, WheelConfig } from "../types";

export type LuckyWheelContextType = ReturnType<typeof useLuckyWheel>;

const LuckyWheelContext = createContext<LuckyWheelContextType | null>(null);

interface LuckyWheelProviderProps {
  children: ReactNode;
  initialData?: StudentWheelInitialData;
  initialConfig?: Partial<WheelConfig>;
}

/**
 * Feature Provider cho module Vòng quay may mắn của Học sinh
 * - Quản lý tập trung State, dữ liệu giải thưởng, số dư, hiệu ứng âm thanh và các Modals
 * - Loại bỏ hoàn toàn Prop Drilling qua nhiều tầng component con (Quy tắc 10 AGENTS.md)
 */
export function LuckyWheelProvider({
  children,
  initialData,
  initialConfig,
}: LuckyWheelProviderProps) {
  const value = useLuckyWheel(initialData, initialConfig);

  return (
    <LuckyWheelContext.Provider value={value}>
      {children}
    </LuckyWheelContext.Provider>
  );
}

/**
 * Hook truy xuất context Vòng quay may mắn (bắt buộc dùng trong Provider)
 */
export function useLuckyWheelContext(): LuckyWheelContextType {
  const context = useContext(LuckyWheelContext);
  if (!context) {
    throw new Error(
      "useLuckyWheelContext phải được sử dụng bên trong LuckyWheelProvider"
    );
  }
  return context;
}

/**
 * Hook truy xuất context Vòng quay may mắn tùy chọn (Optional Fallback)
 * - Trả về null nếu không nằm trong Provider (cho phép component tái sử dụng độc lập qua Props)
 */
export function useLuckyWheelContextOptional(): LuckyWheelContextType | null {
  return useContext(LuckyWheelContext);
}
