"use client";

import { useState, useCallback } from "react";
import { TeacherExchangeRequestItem } from "../types";

/**
 * Micro-hook chuyên trách: Quản lý trạng thái mở/đóng và dữ liệu của các Modals Đổi thưởng
 * - Modal Chi tiết Đổi quà (TeacherRewardDetailModal)
 * - Modal Từ chối Yêu cầu & Hoàn xu Heo Đất (TeacherRewardRejectModal)
 * - Tuân thủ Quy tắc 12 AGENTS.md (Kiến trúc Micro-Hooks)
 */
export function useRewardModals() {
  // 1. Quản lý Modal Chi tiết yêu cầu đổi thưởng
  const [selectedRequest, setSelectedRequest] =
    useState<TeacherExchangeRequestItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const handleOpenDetail = useCallback((req: TeacherExchangeRequestItem) => {
    setSelectedRequest(req);
    setIsDetailModalOpen(true);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setIsDetailModalOpen(false);
    setSelectedRequest(null);
  }, []);

  // 2. Quản lý Modal Từ chối yêu cầu
  const [rejectModalRequest, setRejectModalRequest] =
    useState<TeacherExchangeRequestItem | null>(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  const handleOpenRejectModal = useCallback(
    (req: TeacherExchangeRequestItem) => {
      setRejectModalRequest(req);
      setIsRejectModalOpen(true);
    },
    []
  );

  const handleCloseRejectModal = useCallback(() => {
    setIsRejectModalOpen(false);
    setRejectModalRequest(null);
  }, []);

  return {
    // Modal Chi tiết
    selectedRequest,
    isDetailModalOpen,
    handleOpenDetail,
    handleCloseDetail,

    // Modal Từ chối
    rejectModalRequest,
    isRejectModalOpen,
    handleOpenRejectModal,
    handleCloseRejectModal,
  };
}
