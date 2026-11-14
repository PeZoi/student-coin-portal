"use client";

import { createContext, useContext, ReactNode } from "react";
import { useWheelConfig } from "../hooks/useWheelConfig";
import { InitialWheelConfigData } from "../services/wheelServerService";

export type WheelConfigContextType = ReturnType<typeof useWheelConfig>;

const WheelConfigContext = createContext<WheelConfigContextType | null>(null);

interface WheelConfigProviderProps {
  children: ReactNode;
  initialData?: InitialWheelConfigData;
}

/**
 * Feature Provider cho module Cấu hình vòng quay may mắn
 * - Quản lý tập trung State UI, danh sách ô, thiết lập kinh tế, thống kê động và các Modals
 * - Loại bỏ hoàn toàn Prop Drilling qua nhiều tầng component con (Quy tắc 10 AGENTS.md)
 */
export function WheelConfigProvider({
  children,
  initialData,
}: WheelConfigProviderProps) {
  const value = useWheelConfig(initialData);

  return (
    <WheelConfigContext.Provider value={value}>
      {children}
    </WheelConfigContext.Provider>
  );
}

/**
 * Hook truy xuất context Cấu hình vòng quay
 * - Bắt buộc phải sử dụng bên trong <WheelConfigProvider>
 */
export function useWheelConfigContext(): WheelConfigContextType {
  const context = useContext(WheelConfigContext);
  if (!context) {
    throw new Error(
      "useWheelConfigContext phải được sử dụng bên trong WheelConfigProvider"
    );
  }
  return context;
}
