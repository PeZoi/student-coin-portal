"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  AiConfig,
  AiGradingResult,
  CoinRewardMode,
  HomeworkSubmissionData,
  PlatformProofCoinPolicy,
  SubjectiveWritingCoinPolicy,
  SubmissionImageItem
} from "../types";
import { gradeHomeworkWithAi } from "../utils/aiGradingService";
import { compressImageClient } from "../utils/compressImage";

const STORAGE_KEY_AI_CONFIG = "student_portal_test_ai_config";

const DEFAULT_AI_CONFIG: AiConfig = {
  apiUrl: "https://api.example.com/v1/homework/grade",
  apiKey: "sk-test-ai-key-demo-2026",
  model: "gemini-1.5-flash",
  sendFormat: "formData",
  prompt:
    "Bạn là một giáo viên Tiếng Anh tận tâm. Hãy đối chiếu ảnh bài làm của học sinh với Đề bài cô giáo đã giao (Teacher's Assignment). Kiểm tra chi tiết về: Độ dài đoạn văn, Ngữ pháp (Grammar), Từ vựng (Vocabulary), và Chính tả (Spelling). Đưa ra nhận xét tích cực, chỉ ra câu sai (nếu có) và cho điểm số trên thang điểm 10.",
  useMockFallback: true,
  thinkingMode: "off",
};

export function useTestAiSubmission() {
  // 1. Dữ liệu nộp bài tập Tiếng Anh (hỗ trợ nhiều ảnh & cấu hình của cô giáo)
  const [submission, setSubmission] = useState<HomeworkSubmissionData>({
    homeworkTitle: "",
    subject: "Tiếng Anh",
    teacherAssignment:
      "",
    studentNote: "",
    images: [],
    coinRewardMode: "subjective_writing",
    platformProofCoins: {
      fullScoreCoins: 50,
      partialScoreCoins: 20,
    },
    subjectiveCoins: {
      minCoins: 30,
      maxCoins: 80,
      requireTeacherReview: true,
    },
    gradingFocus: ["grammar", "spelling", "vocabulary"],
    gradingFocusCustom: "",
  });

  const [isCompressing, setIsCompressing] = useState(false);

  // 2. Trạng thái chấm điểm & Kết quả AI
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gradingResult, setGradingResult] = useState<AiGradingResult | null>(
    null
  );

  // 3. Cấu hình AI Endpoint & API Key để tester dễ dàng thay thế
  const [aiConfig, setAiConfig] = useState<AiConfig>(DEFAULT_AI_CONFIG);
  const [isConfigLoaded, setIsConfigLoaded] = useState(false);

  // Khôi phục cấu hình từ localStorage khi khởi động
  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem(STORAGE_KEY_AI_CONFIG);
      if (savedConfig) {
        setAiConfig(JSON.parse(savedConfig));
      }
    } catch (e) {
      console.warn("Không thể tải cấu hình AI từ localStorage:", e);
    } finally {
      setIsConfigLoaded(true);
    }
  }, []);

  // Lưu cấu hình vào localStorage khi có sự thay đổi
  const updateAiConfig = useCallback((updates: Partial<AiConfig>) => {
    setAiConfig((prev) => {
      const updated = { ...prev, ...updates };
      try {
        localStorage.setItem(STORAGE_KEY_AI_CONFIG, JSON.stringify(updated));
      } catch (e) {
        console.warn("Lỗi lưu cấu hình vào localStorage:", e);
      }
      return updated;
    });
  }, []);

  // Tổng hợp thống kê nén của tất cả ảnh
  const totalCompressionStats = useMemo(() => {
    if (submission.images.length === 0) return null;

    let totalOriginalSize = 0;
    let totalCompressedSize = 0;

    submission.images.forEach((item) => {
      totalOriginalSize += item.stats.originalSize;
      totalCompressedSize += item.stats.compressedSize;
    });

    const overallRatio =
      totalOriginalSize > 0
        ? Math.round(
          ((totalOriginalSize - totalCompressedSize) / totalOriginalSize) * 100
        )
        : 0;

    return {
      count: submission.images.length,
      totalOriginalSize,
      totalCompressedSize,
      overallRatio: overallRatio > 0 ? overallRatio : 0,
    };
  }, [submission.images]);

  // Xử lý nén và thêm 1 hoặc nhiều ảnh mới vào danh sách
  const handleSelectFiles = useCallback(
    async (fileList: FileList | File[]) => {
      const filesArray = Array.from(fileList).filter((f) =>
        f.type.startsWith("image/")
      );

      if (filesArray.length === 0) {
        toast.error("Vui lòng chọn các tệp định dạng hình ảnh hợp lệ!");
        return;
      }

      setIsCompressing(true);
      const toastId = toast.loading(
        `Đang tự động nén ${filesArray.length} ảnh bài làm...`
      );

      try {
        const compressedResults: SubmissionImageItem[] = [];

        for (const file of filesArray) {
          const previewUrl = URL.createObjectURL(file);
          const { compressedFile, stats } = await compressImageClient(file, {
            quality: 0.8,
            maxWidth: 1600,
            maxHeight: 1600,
            maxSizeMB: 1.2,
          });

          compressedResults.push({
            id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            originalFile: file,
            compressedFile,
            previewUrl,
            stats,
          });
        }

        setSubmission((prev) => ({
          ...prev,
          images: [...prev.images, ...compressedResults],
        }));

        toast.dismiss(toastId);
        toast.success(
          `Đã nén tối ưu xong ${compressedResults.length} ảnh bài làm!`
        );
      } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        toast.dismiss(toastId);
        toast.error("Lỗi khi nén ảnh: " + (err.message || "Không xác định"));
      } finally {
        setIsCompressing(false);
      }
    },
    []
  );

  // Xóa 1 ảnh cụ thể theo ID
  const handleRemoveImage = useCallback((id: string) => {
    setSubmission((prev) => {
      const target = prev.images.find((img) => img.id === id);
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return {
        ...prev,
        images: prev.images.filter((img) => img.id !== id),
      };
    });
  }, []);

  // Xóa toàn bộ ảnh
  const handleClearAllImages = useCallback(() => {
    setSubmission((prev) => {
      prev.images.forEach((img) => {
        if (img.previewUrl) {
          URL.revokeObjectURL(img.previewUrl);
        }
      });
      return {
        ...prev,
        images: [],
      };
    });
  }, []);

  // Cập nhật các trường form bài tập
  const updateFormField = useCallback(
    <K extends keyof HomeworkSubmissionData>(
      field: K,
      value: HomeworkSubmissionData[K]
    ) => {
      setSubmission((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  // Cấu hình cô giáo: Đổi chế độ xu (minh chứng nền tảng khác vs bài tự luận)
  const setCoinRewardMode = useCallback((mode: CoinRewardMode) => {
    setSubmission((prev) => ({ ...prev, coinRewardMode: mode }));
  }, []);

  // Cấu hình cô giáo: Cập nhật xu bài minh chứng
  const updatePlatformProofCoins = useCallback(
    (updates: Partial<PlatformProofCoinPolicy>) => {
      setSubmission((prev) => ({
        ...prev,
        platformProofCoins: { ...prev.platformProofCoins, ...updates },
      }));
    },
    []
  );

  // Cấu hình cô giáo: Cập nhật xu bài tự luận
  const updateSubjectiveCoins = useCallback(
    (updates: Partial<SubjectiveWritingCoinPolicy>) => {
      setSubmission((prev) => ({
        ...prev,
        subjectiveCoins: { ...prev.subjectiveCoins, ...updates },
      }));
    },
    []
  );

  // Cấu hình cô giáo: Bật/tắt tiêu chí mục đích chấm
  const toggleGradingFocus = useCallback((focusId: string) => {
    setSubmission((prev) => {
      const exists = prev.gradingFocus.includes(focusId);
      const newFocus = exists
        ? prev.gradingFocus.filter((f) => f !== focusId)
        : [...prev.gradingFocus, focusId];
      return { ...prev, gradingFocus: newFocus };
    });
  }, []);

  // Cấu hình cô giáo: Cập nhật ghi chú mục đích chấm
  const setGradingFocusCustom = useCallback((val: string) => {
    setSubmission((prev) => ({ ...prev, gradingFocusCustom: val }));
  }, []);

  // Gửi bài nộp cho AI chấm điểm
  const handleSubmitToAi = useCallback(async () => {
    if (submission.images.length === 0) {
      toast.error("Vui lòng tải lên ít nhất 1 ảnh bài làm trước khi nộp!");
      return;
    }

    const isPlatformProof = submission.coinRewardMode === "platform_proof";

    // Đối với bài viết tự luận trong vở thì bắt buộc cần đề bài để AI đối chiếu
    if (!isPlatformProof) {
      if (!submission.homeworkTitle.trim()) {
        toast.error("Vui lòng nhập tên bài tập!");
        return;
      }

      if (!submission.teacherAssignment.trim()) {
        toast.error(
          "Vui lòng nhập hoặc chọn đề bài cô giáo giao để AI đối chiếu!"
        );
        return;
      }
    }

    // Chuẩn bị submission đã chuẩn hóa tiêu đề và yêu cầu đề bài
    const finalSubmission: HomeworkSubmissionData = {
      ...submission,
      homeworkTitle:
        submission.homeworkTitle.trim() ||
        (isPlatformProof
          ? "Minh chứng kết quả trắc nghiệm online"
          : "Bài tập Tiếng Anh"),
      teacherAssignment:
        submission.teacherAssignment.trim() ||
        (isPlatformProof
          ? "Hoàn thành bài tập trắc nghiệm trên hệ thống học tập"
          : ""),
    };

    setIsSubmitting(true);
    const submitToastId = toast.loading(
      isPlatformProof
        ? "AI đang đọc kết quả từ ảnh chụp màn hình..."
        : `AI đang đọc và chấm ${submission.images.length} trang bài làm...`
    );

    try {
      const result = await gradeHomeworkWithAi(finalSubmission, aiConfig);
      setGradingResult(result);
      toast.dismiss(submitToastId);
      toast.success(
        isPlatformProof
          ? `Đã nhận diện xong kết quả! Bạn đạt ${result.correctCount}/${result.totalQuestions} (+${result.coinReward} xu)`
          : `AI đã chấm xong bài! Bạn đạt ${result.score}/10 điểm (+${result.coinReward} xu)`
      );
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      toast.dismiss(submitToastId);
      toast.error("Không thể kết nối đến AI API: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  }, [submission, aiConfig]);

  // Đặt lại bài nộp để làm bài tập mới
  const handleResetSubmission = useCallback(() => {
    handleClearAllImages();
    setGradingResult(null);
    setSubmission((prev) => ({
      ...prev,
      studentNote: "",
    }));
  }, [handleClearAllImages]);

  return {
    submission,
    updateFormField,
    setCoinRewardMode,
    updatePlatformProofCoins,
    updateSubjectiveCoins,
    toggleGradingFocus,
    setGradingFocusCustom,
    handleSelectFiles,
    handleRemoveImage,
    handleClearAllImages,
    totalCompressionStats,
    isCompressing,
    isSubmitting,
    gradingResult,
    handleSubmitToAi,
    handleResetSubmission,
    aiConfig,
    updateAiConfig,
    isConfigLoaded,
  };
}
