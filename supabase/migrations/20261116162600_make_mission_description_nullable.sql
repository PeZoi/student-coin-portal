-- Cho phép trường hướng dẫn làm bài (description) của bài tập có thể bỏ trống (nullable, default '')
ALTER TABLE public.missions 
  ALTER COLUMN description DROP NOT NULL,
  ALTER COLUMN description SET DEFAULT '';
