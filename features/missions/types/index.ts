export type MissionCategory = "today" | "week" | "completed";
export type MissionFilter = "all" | "pending" | "completed";
export type MissionDifficulty = "easy" | "medium" | "hard";

export interface MissionItem {
  id: string;
  category: MissionCategory;
  title: string;
  rewardCoins: number;
  difficulty: MissionDifficulty;
  difficultyLabel: string;
  difficultyStars: number;
  description: string;
  themeColor: "blue" | "purple" | "green" | "orange";
  iconType: "notebook" | "book-pen" | "flags-en-vi" | "flags-vi-en";
  isCompleted?: boolean;
  assignedAt: string; // Thời gian giao
  dueAt: string; // Hạn nộp
}
