import { Metadata } from "next";
import { TestAiSubmissionView } from "@/features/test-ai/components/TestAiSubmissionView";

export const metadata: Metadata = {
  title: "Nộp bài tập về nhà - AI Chấm điểm | Student Coin Portal",
  description: "Trang nộp bài tập về nhà với tính năng tự động nén ảnh và chấm điểm thông minh bằng AI",
};

export default function TestAiPage() {
  return <TestAiSubmissionView />;
}

