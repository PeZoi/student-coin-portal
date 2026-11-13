-- Migration: Xóa cột icon_name khỏi bảng wheel_prizes
-- Lý do: Hệ thống hiện đã chuyển hoàn toàn sang sử dụng hình ảnh 3D WebP theo prize_type (WheelPrizeImage).

ALTER TABLE wheel_prizes DROP COLUMN IF EXISTS icon_name;
