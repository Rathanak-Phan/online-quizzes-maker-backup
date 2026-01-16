// src/lib/types/quiz.ts

export type QuestionType = "multiple-choice" | "true-false" | "short-answer" | "essay";

export interface Question {
  _id: string;
  text: string;
  type: QuestionType;
  points: number;
  options?: string[]; // for multiple-choice
  correctAnswer?: number | boolean | string; // depending on type
  explanation?: string; // optional explanation
}

// Quiz type for your QuizCard component
export interface Quiz {
  _id: string;
  title: string;
  description?: string;
  category?: string;
  timeLimit: number;
  questions: Question[];
  createdBy: { name: string; email: string };
  
  // Fields needed by QuizCard
  assignedClasses: number;
  avgScore: number | null;
  status: "active" | "completed" | "draft";
  lastUsed: string;
  isTemplate: boolean;
}
