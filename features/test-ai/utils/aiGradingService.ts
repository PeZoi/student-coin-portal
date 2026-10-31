import { AiConfig, AiGradingResult, HomeworkSubmissionData } from "../types";

/**
 * Chuyển đổi File sang chuỗi Base64 DataURL
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Tạo kết quả chấm điểm giả lập sinh động phục vụ việc test giao diện khi chưa có API AI thực tế
 */
export function generateMockGradingResult(
  submission: HomeworkSubmissionData
): AiGradingResult {
  const isPlatformProof = submission.coinRewardMode === "platform_proof";
  
  // Tính toán xu thưởng theo chính sách của cô giáo
  let calculatedCoin = 50;
  let needsTeacherReview = false;
  let coinSuggestionRange: string | undefined = undefined;

  if (isPlatformProof) {
    // Minh chứng nền tảng khác: Giả lập đạt 18/20 điểm (có 2 câu sai)
    // Tùy theo kết quả: đúng hết nhận full, có câu sai nhận partial
    calculatedCoin = submission.platformProofCoins.partialScoreCoins || 20;
    needsTeacherReview = false;
  } else {
    // Bài tự luận / Đoạn văn: Đề xuất số xu nằm trong khoảng min - max
    const min = submission.subjectiveCoins.minCoins || 30;
    const max = submission.subjectiveCoins.maxCoins || 80;
    // Với điểm 8.8/10, lấy tỷ lệ khoảng 75% khoảng cách min-max
    calculatedCoin = Math.round(min + (max - min) * 0.75);
    needsTeacherReview = true;
    coinSuggestionRange = `${min} - ${max} xu`;
  }

  // Tạo tiêu đề trọng tâm chấm
  const focusLabels = submission.gradingFocus && submission.gradingFocus.length > 0
    ? submission.gradingFocus
        .map((f) => {
          if (f === "grammar") return "Ngữ pháp";
          if (f === "spelling") return "Chính tả & Dấu câu";
          if (f === "vocabulary") return "Từ vựng";
          if (f === "content") return "Bố cục & Ý tưởng";
          if (f === "task_response") return "Độ dài & Bám sát đề";
          return f;
        })
        .join(", ")
    : "Ngữ pháp & Chính tả";

  return {
    score: isPlatformProof ? 9.0 : 8.8,
    totalQuestions: isPlatformProof ? 20 : 4,
    correctCount: isPlatformProof ? 18 : 3,
    coinReward: calculatedCoin,
    coinRewardMode: submission.coinRewardMode,
    needsTeacherReview,
    coinSuggestionRange,
    transcribedText: isPlatformProof
      ? "Quizizz / Azota Screen Proof: 18/20 correct answers (90%). Accuracy: 90%."
      : "My favourite hobby is drawing and playing football. In my free time, I usually draw pictures of my house and pets. My brother play football with me every Sunday. I feel very happy and relaxing when I draw because it is beautifull.",
    suggestedRevision: isPlatformProof
      ? ""
      : "My favourite hobbies are drawing and playing football. In my free time, I usually draw pictures of my house and pets. My brother plays football with me every Sunday. I feel very happy and relaxed when I draw because it is beautiful.",
    overallComment: isPlatformProof
      ? `AI đã nhận diện kết quả bài thi trắc nghiệm đạt 18/20 điểm (90%). Theo cơ chế của cô giáo, bạn nhận được ${calculatedCoin} xu thưởng hoàn thành bài tập!`
      : `Well done! AI đã chấm trọng tâm vào [${focusLabels}] theo đúng yêu cầu của cô giáo. Đoạn văn mạch lạc, từ vựng sử dụng phong phú. AI đề xuất mức thưởng ${calculatedCoin} xu (trong khoảng ${coinSuggestionRange}) và đã chuyển để Cô giáo double-check!`,
    strengths: isPlatformProof
      ? [
          "Hoàn thành xuất sắc 18/20 câu hỏi trắc nghiệm trên ứng dụng.",
          "Nắm vững các câu hỏi ngữ pháp cơ bản và từ vựng Unit 6.",
          "Thời gian làm bài tập trung và đạt tỉ lệ điểm cao (>85%).",
        ]
      : [
          `Đạt mục đích chấm của cô [${focusLabels}]: Viết chuẩn cấu trúc và đúng trọng tâm.`,
          "Vốn từ vựng phong phú: Sử dụng chính xác các tính từ miêu tả (creative, relaxing, wonderful).",
          "Cấu trúc câu đa dạng, biết liên kết câu bằng 'because', 'and' và 'in my free time'.",
        ],
    weaknesses: isPlatformProof
      ? [
          "Câu 7 và Câu 14 chọn nhầm giới từ 'at' thay vì 'on'.",
          "Cần xem lại bảng giới từ chỉ thời gian trước khi làm bài kiểm tra tuần tới.",
        ]
      : [
          "Lỗi chia động từ (Subject-Verb Agreement): Viết 'My brother play' -> Sửa đúng là 'My brother plays'.",
          "Lỗi chính tả (Spelling): Viết 'beautifull' thừa 1 chữ l -> Sửa đúng là 'beautiful'.",
        ],
    suggestions: [
      "Hãy nhớ quy tắc thêm -s/-es cho động từ thường khi chủ ngữ là He / She / It / Danh từ số ít.",
      "Đọc to đoạn văn 2 lần trước gương để luyện ngữ điệu và phát âm chuẩn hơn nhé!",
    ],
    detailedReviews: isPlatformProof
      ? [
          {
            questionNumber: "Kết quả tổng quan ảnh chụp",
            status: "correct",
            studentAnswer: "18 / 20 câu đúng (90%)",
            correctAnswer: "Tối thiểu 16/20",
            feedback: "Ảnh chụp màn hình điểm số rõ nét, AI nhận diện chính xác 18/20.",
          },
          {
            questionNumber: "Áp dụng cơ chế thưởng xu",
            status: "partially_correct",
            studentAnswer: "Đạt 18/20 (Có 2 câu sai)",
            correctAnswer: "Đúng hết 20/20 nhận 50 xu, có sai nhận 20 xu",
            feedback: `Theo cấu hình của cô giáo: Đúng hết nhận ${submission.platformProofCoins.fullScoreCoins} xu, có câu sai nhận ${submission.platformProofCoins.partialScoreCoins} xu. Bạn được cộng ${calculatedCoin} xu!`,
          },
        ]
      : [
          {
            questionNumber: "Tiêu chí 1: Đáp ứng đề bài (Task Achievement)",
            status: "correct",
            studentAnswer: "Đoạn văn 64 từ về sở thích đọc sách & vẽ tranh",
            correctAnswer: "Đạt yêu cầu đề bài cô giao (50 - 70 từ)",
            feedback: "Độ dài chuẩn xác, nêu rõ sở thích và lý do yêu thích.",
          },
          {
            questionNumber: "Tiêu chí 2: Ngữ pháp & Cấu trúc thì (Grammar Focus)",
            status: "partially_correct",
            studentAnswer: "He play football with me every Sunday.",
            correctAnswer: "He plays football with me every Sunday.",
            feedback: "Cần thêm 's' vào sau động từ 'play' vì chủ ngữ là 'He'.",
          },
          {
            questionNumber: "Tiêu chí 3: Vốn từ vựng (Vocabulary)",
            status: "correct",
            studentAnswer: "creative, relaxing, peaceful, imagination",
            correctAnswer: "Từ vựng phù hợp chủ đề",
            feedback: "Rất tốt! Sử dụng được nhiều từ vựng nâng cao.",
          },
          {
            questionNumber: "Tiêu chí 4: Chính tả & Dấu câu (Spelling Focus)",
            status: "correct",
            studentAnswer: "Viết hoa đầu câu và dấu chấm câu",
            correctAnswer: "Chuẩn xác",
            feedback: "Trình bày sạch đẹp, chấm câu và viết hoa đúng vị trí.",
          },
        ],
    gradedAt: new Date().toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),
  };
}

/**
 * Gửi bài tập nộp đến API AI để chấm điểm
 */
export async function gradeHomeworkWithAi(
  submission: HomeworkSubmissionData,
  config: AiConfig
): Promise<AiGradingResult> {
  const imagesToUpload =
    submission.images && submission.images.length > 0
      ? submission.images
      : submission.compressedFile
      ? [
          {
            id: "legacy",
            compressedFile: submission.compressedFile,
            originalFile: submission.originalFile || submission.compressedFile,
            previewUrl: submission.previewUrl || "",
            stats: {
              originalSize: submission.originalFile?.size || 0,
              compressedSize: submission.compressedFile.size,
              compressionRatio: 0,
              originalWidth: 0,
              originalHeight: 0,
              compressedWidth: 0,
              compressedHeight: 0,
              qualityUsed: 0.8,
              timeTakenMs: 0,
            },
          },
        ]
      : [];

  if (imagesToUpload.length === 0) {
    throw new Error("Vui lòng tải lên ít nhất 1 ảnh bài làm trước khi nộp");
  }

  // Nếu người dùng bật Mock fallback hoặc URL là mock endpoint
  if (config.useMockFallback || config.apiUrl.includes("mock-ai")) {
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Giả lập độ trễ AI xử lý 2s
    return generateMockGradingResult(submission);
  }

  let body: BodyInit;
  const headers: Record<string, string> = {};

  if (config.sendFormat === "formData") {
    const formData = new FormData();
    formData.append("targetUrl", config.apiUrl);
    formData.append("apiKey", config.apiKey);

    // Đính kèm từng file ảnh đã nén vào FormData (chỉ đính kèm 1 lần)
    imagesToUpload.forEach((item) => {
      formData.append("files", item.compressedFile);
    });
    formData.append("totalImages", String(imagesToUpload.length));
    formData.append("homeworkTitle", submission.homeworkTitle);
    formData.append("subject", submission.subject);
    formData.append("teacherAssignment", submission.teacherAssignment);
    formData.append("coinRewardMode", submission.coinRewardMode);
    formData.append("platformProofCoins", JSON.stringify(submission.platformProofCoins));
    formData.append("subjectiveCoins", JSON.stringify(submission.subjectiveCoins));
    formData.append("gradingFocus", JSON.stringify(submission.gradingFocus));
    formData.append("gradingFocusCustom", submission.gradingFocusCustom || "");
    formData.append("studentNote", submission.studentNote);
    formData.append("model", config.model);
    formData.append("prompt", config.prompt);
    formData.append("thinkingMode", config.thinkingMode || "off");
    body = formData;
  } else {
    headers["Content-Type"] = "application/json";
    const imagesBase64 = await Promise.all(
      imagesToUpload.map(async (item, idx) => ({
        page: idx + 1,
        name: item.compressedFile.name,
        type: item.compressedFile.type,
        data: await fileToBase64(item.compressedFile),
      }))
    );

    body = JSON.stringify({
      targetUrl: config.apiUrl,
      apiKey: config.apiKey,
      images: imagesBase64,
      totalImages: imagesToUpload.length,
      homeworkTitle: submission.homeworkTitle,
      subject: submission.subject,
      teacherAssignment: submission.teacherAssignment,
      coinRewardMode: submission.coinRewardMode,
      platformProofCoins: submission.platformProofCoins,
      subjectiveCoins: submission.subjectiveCoins,
      gradingFocus: submission.gradingFocus,
      gradingFocusCustom: submission.gradingFocusCustom,
      studentNote: submission.studentNote,
      model: config.model,
      prompt: config.prompt,
      thinkingMode: config.thinkingMode || "off",
    });
  }

  try {
    // Gọi thông qua Next.js Server Proxy để triệt tiêu hoàn toàn lỗi CORS từ trình duyệt
    const response = await fetch("/api/test-ai/grade", {
      method: "POST",
      headers,
      body,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg = data?.error || `Lỗi từ AI Server (${response.status})`;
      throw new Error(errorMsg);
    }

    if (!data) {
      throw new Error("Không nhận được dữ liệu phản hồi từ AI Server");
    }

    // Chuẩn hóa dữ liệu trả về nếu server trả về định dạng tương đương
    return {
      readable: data.readable !== undefined ? data.readable : true,
      unreadableReason: data.unreadableReason || null,
      score: data.score ?? 8.0,
      totalQuestions: data.totalQuestions ?? 5,
      correctCount: data.correctCount ?? 4,
      coinReward: data.coinReward ?? 0,
      coinRewardMode: data.coinRewardMode || submission.coinRewardMode,
      needsTeacherReview:
        data.needsTeacherReview !== undefined
          ? data.needsTeacherReview
          : submission.coinRewardMode === "subjective_writing",
      coinSuggestionRange:
        data.coinSuggestionRange ||
        `${submission.subjectiveCoins.minCoins} - ${submission.subjectiveCoins.maxCoins} xu`,
      transcribedText: data.transcribedText || "",
      uncertainties: Array.isArray(data.uncertainties) ? data.uncertainties : [],
      errors: Array.isArray(data.errors) ? data.errors : [],
      suggestedRevision: data.suggestedRevision || "",
      overallComment:
        data.overallComment ||
        data.comment ||
        data.feedback ||
        "AI đã hoàn thành chấm điểm bài làm của bạn!",
      strengths: Array.isArray(data.strengths) ? data.strengths : [],
      weaknesses: Array.isArray(data.weaknesses) ? data.weaknesses : [],
      suggestions: Array.isArray(data.suggestions) ? data.suggestions : [],
      detailedReviews: Array.isArray(data.detailedReviews)
        ? data.detailedReviews
        : [],
      gradedAt: new Date().toLocaleTimeString("vi-VN"),
      _meta: data._meta,
    };
  } catch (error: unknown) {
    // Nếu gọi endpoint thật thất bại và có cấu hình fallback, thông báo và trả mock
    console.warn("AI API request failed, falling back to mock response:", error);
    throw error;
  }
}

