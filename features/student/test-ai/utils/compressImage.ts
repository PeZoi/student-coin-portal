import { CompressionStats } from "../types";

export interface CompressImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeMB?: number;
  fileType?: "image/jpeg" | "image/webp";
}

/**
 * Nén ảnh trên Client bằng HTML5 Canvas API với cơ chế tự động cân chỉnh độ phân giải và chất lượng
 * Đảm bảo dung lượng nhỏ gọn nhưng chữ viết tay trong bài tập vẫn cực kỳ sắc nét cho AI chấm bài.
 */
export async function compressImageClient(
  file: File,
  options: CompressImageOptions = {}
): Promise<{ compressedFile: File; stats: CompressionStats }> {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.75,
    maxSizeMB = 0.8,
    fileType = "image/jpeg",
  } = options;

  const startTime = performance.now();
  const originalSize = file.size;

  return new Promise((resolve, reject) => {
    // Nếu không phải là file ảnh (ví dụ PDF), không nén ảnh
    if (!file.type.startsWith("image/")) {
      return reject(new Error("File không phải là định dạng hình ảnh hợp lệ"));
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = async () => {
      URL.revokeObjectURL(objectUrl);

      const originalWidth = img.naturalWidth || img.width;
      const originalHeight = img.naturalHeight || img.height;

      // Tính toán kích thước mới giữ nguyên tỉ lệ (Aspect Ratio)
      let targetWidth = originalWidth;
      let targetHeight = originalHeight;

      if (targetWidth > maxWidth || targetHeight > maxHeight) {
        const ratio = Math.min(maxWidth / targetWidth, maxHeight / targetHeight);
        targetWidth = Math.round(targetWidth * ratio);
        targetHeight = Math.round(targetHeight * ratio);
      }

      // Khởi tạo Canvas để vẽ lại và nén ảnh
      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return reject(new Error("Không thể khởi tạo Canvas 2D context"));
      }

      // Cấu hình vẽ mượt mà chất lượng cao
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Đổ nền trắng (hữu ích cho ảnh PNG trong suốt khi chuyển sang JPEG)
      if (fileType === "image/jpeg") {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, targetWidth, targetHeight);
      }

      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      // Thử nén ảnh và lặp giảm nhẹ quality nếu dung lượng vẫn lớn hơn maxSizeMB
      let currentQuality = quality;
      const maxTargetBytes = maxSizeMB * 1024 * 1024;
      let compressedBlob: Blob | null = null;

      for (let iteration = 0; iteration < 4; iteration++) {
        compressedBlob = await new Promise<Blob | null>((res) => {
          canvas.toBlob((blob) => res(blob), fileType, currentQuality);
        });

        if (!compressedBlob) break;

        // Nếu đã nhỏ hơn mục tiêu hoặc chất lượng đã xuống mức tối thiểu, dừng lại
        if (compressedBlob.size <= maxTargetBytes || currentQuality <= 0.45) {
          break;
        }

        // Giảm bớt 15% chất lượng cho lần thử tiếp theo
        currentQuality = Math.max(0.45, currentQuality - 0.15);
      }

      if (!compressedBlob) {
        return reject(new Error("Không thể xuất dữ liệu ảnh nén"));
      }

      const extension = fileType === "image/webp" ? ".webp" : ".jpg";
      const baseName = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
      const compressedFileName = `${baseName}_compressed${extension}`;

      const compressedFile = new File([compressedBlob], compressedFileName, {
        type: fileType,
        lastModified: Date.now(),
      });

      const compressedSize = compressedFile.size;
      const compressionRatio = Math.round(
        ((originalSize - compressedSize) / originalSize) * 100
      );
      const timeTakenMs = Math.round(performance.now() - startTime);

      const stats: CompressionStats = {
        originalSize,
        compressedSize,
        compressionRatio: compressionRatio > 0 ? compressionRatio : 0,
        originalWidth,
        originalHeight,
        compressedWidth: targetWidth,
        compressedHeight: targetHeight,
        qualityUsed: Math.round(currentQuality * 100) / 100,
        timeTakenMs,
      };

      resolve({ compressedFile, stats });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Không thể giải mã tệp hình ảnh"));
    };

    img.src = objectUrl;
  });
}

/**
 * Định dạng dung lượng byte sang KB / MB dễ đọc
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

