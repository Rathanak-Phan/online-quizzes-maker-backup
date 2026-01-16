// src/app/api/student/quizzes/[id]/start/route.ts

import { JwtPayload, verifyToken } from "@/lib/auth";
import Quiz from "@/lib/models/Quiz";
import QuizAttempt from "@/lib/models/QuizAttempt";
import connectDB from "@/lib/mongodb";
import { forbidden, unauthorized } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  await connectDB();

  const token = req.cookies.get("token")?.value;
  if (!token) return unauthorized();

  const user = verifyToken(token);
  if (!user || user.role !== "user") return unauthorized();

  // Check access (public, class member, etc.)
  const quiz = await Quiz.findById(id);
  if (!quiz || !canAccessQuiz(quiz, user)) return forbidden();

  // Find or create attempt
  let attempt = await QuizAttempt.findOne({ quiz: id, student: user._id });

  if (!attempt) {
    attempt = await QuizAttempt.create({
      quiz: id,
      student: user._id,
      status: "in-progress",
      startedAt: new Date(),
      totalPoints: quiz.questions.reduce((sum: number, q: any) => sum + (q.points || 1), 0),
    });
  }

  return NextResponse.json({ success: true, attempt });
}

function canAccessQuiz(quiz: any, user: JwtPayload) {
    throw new Error("Function not implemented.");
}
