// lib/types/quiz.ts
export interface Quiz {
  _id: string;
  title: string;
  description?: string;
  status: "active" | "draft" | "archived";
  category?: string;
  avgScore?: number | null;
  createdAt: string;
  lastUsed?: string | null;
}
