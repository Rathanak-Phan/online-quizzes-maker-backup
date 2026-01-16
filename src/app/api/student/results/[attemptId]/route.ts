// src/app/api/student/results/[attemptId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import QuizAttempt from "@/lib/models/QuizAttempt";
import Quiz from "@/lib/models/Quiz";
import { verifyToken } from "@/lib/jwt";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    await connectDB();

    const { attemptId } = await params;

    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = verifyToken(token);
    if (!user || user.role !== "user") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const attempt = await QuizAttempt.findOne({
      _id: attemptId,
      student: user._id
    }).lean();

    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    const quiz = await Quiz.findById(attempt.quiz).lean();

    return NextResponse.json({
      success: true,
      attempt,
      quiz,
    });
  } catch (error: any) {
    console.error("GET student result error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}