"use client";

import { useState, useCallback, MouseEvent } from "react";

interface UseImageViewerParams {
  totalPhotos: number;
  activePhotoIndex: number;
  setActivePhotoIndex: (idx: number) => void;
}

/**
 * Custom Hook quản lý trạng thái Soi ảnh đa trang (1–5 ảnh):
 * - Phóng to / Thu nhỏ (Zoom 50% -> 250%)
 * - Xoay ảnh 90° Trái / Phải (dành cho ảnh phụ huynh/học sinh chụp ngang)
 * - Kéo rê ảnh (Drag-to-Pan) khi đang phóng to
 * - Chuyển trang ảnh (Trang 1 -> Trang 5)
 */
export function useImageViewer({
  totalPhotos,
  activePhotoIndex,
  setActivePhotoIndex,
}: UseImageViewerParams) {
  const [zoom, setZoom] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  const handleResetView = useCallback(() => {
    setZoom(100);
    setRotation(0);
    setPanOffset({ x: 0, y: 0 });
  }, []);

  const handleSelectPhoto = useCallback(
    (index: number) => {
      if (index >= 0 && index < totalPhotos) {
        setActivePhotoIndex(index);
        setZoom(100);
        setRotation(0);
        setPanOffset({ x: 0, y: 0 });
      }
    },
    [totalPhotos, setActivePhotoIndex]
  );

  const handlePrevPhoto = useCallback(() => {
    if (activePhotoIndex > 0) {
      handleSelectPhoto(activePhotoIndex - 1);
    }
  }, [activePhotoIndex, handleSelectPhoto]);

  const handleNextPhoto = useCallback(() => {
    if (activePhotoIndex < totalPhotos - 1) {
      handleSelectPhoto(activePhotoIndex + 1);
    }
  }, [activePhotoIndex, totalPhotos, handleSelectPhoto]);

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(250, prev + 25));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => {
      const next = Math.max(50, prev - 25);
      if (next <= 100) {
        setPanOffset({ x: 0, y: 0 });
      }
      return next;
    });
  }, []);

  const handleRotateLeft = useCallback(() => {
    setRotation((prev) => (prev - 90 + 360) % 360);
  }, []);

  const handleRotateRight = useCallback(() => {
    setRotation((prev) => (prev + 90) % 360);
  }, []);

  const handleMouseDown = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (zoom <= 100) return;
      setIsDragging(true);
      setDragStart({
        x: e.clientX - panOffset.x,
        y: e.clientY - panOffset.y,
      });
    },
    [zoom, panOffset]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (!isDragging) return;
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    },
    [isDragging, dragStart]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  return {
    zoom,
    rotation,
    isFullscreen,
    isDragging,
    panOffset,
    hasPrevPhoto: activePhotoIndex > 0,
    hasNextPhoto: activePhotoIndex < totalPhotos - 1,
    handleSelectPhoto,
    handlePrevPhoto,
    handleNextPhoto,
    handleZoomIn,
    handleZoomOut,
    handleRotateLeft,
    handleRotateRight,
    handleResetView,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    toggleFullscreen,
  };
}
