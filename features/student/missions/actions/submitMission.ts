/**
 * Action nộp bài nhiệm vụ học tập.
 * Hiện tại đang giả lập bằng setTimeout Promise để kiểm thử UI/UX.
 * Sẵn sàng thay thế bằng API backend trong tương lai.
 * 
 * TODO Backend:
 * - Hỗ trợ upload nhiều tệp minh chứng (multipart/form-data)
 * - Trả về `submittedFiles`, `submittedAt`, `teacherFeedback`, `status: "submitted" | "needs_redo"`
 */
export async function submitMission(
  missionId: string,
  files: File[]
): Promise<{ success: boolean; message?: string }> {
  // Giả lập thời gian gửi request 800ms
  await new Promise((resolve) => setTimeout(resolve, 800));

  if (!missionId) {
    return { success: false, message: "Không tìm thấy mã nhiệm vụ!" };
  }

  if (!files || files.length === 0) {
    return { success: false, message: "Vui lòng chọn ít nhất một tệp minh chứng bài làm!" };
  }

  // Giả lập nộp thành công
  return {
    success: true,
    message: "Nộp bài tập thành công! Bạn nhận được lời khen và chờ nhận xu nhé! 🎉",
  };
}
