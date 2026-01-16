// src/app/api/student/quizzes/[id]/submit/route.ts
import { verifyToken } from "@/lib/auth";
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

  const attempt = await QuizAttempt.findOne({ quiz: id, student: user._id });
  if (!attempt || attempt.status !== "in-progress") return forbidden();

  const quiz = await Quiz.findById(id);

  let score = 0;
  let hasPending = false;

  attempt.answers.forEach((ans: any) => {
    const q = quiz.questions.find((q: any) => q._id.toString() === ans.questionId.toString());

    if (!q) return;

    if (q.type === "multiple" || q.type === "truefalse") {
      const isCorrect = ans.selected === q.correctAnswer;
      ans.isCorrect = isCorrect;
      if (isCorrect) score += q.points;
    } else {
      // Short answer - pending manual grading
      hasPending = true;
      ans.isCorrect = null;
    }
  });

  attempt.score = score;
  attempt.percentage = (score / attempt.totalPoints) * 100;
  attempt.submittedAt = new Date();
  attempt.status = hasPending ? "pending" : "completed";
  attempt.isGraded = !hasPending;

  await attempt.save();

  return NextResponse.json({ success: true, attempt });
}