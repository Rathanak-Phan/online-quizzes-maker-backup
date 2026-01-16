// src/app/api/student/quizzes/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Quiz from "@/lib/models/Quiz";
import QuizAttempt from "@/lib/models/QuizAttempt";
import Class from "@/lib/models/Class";
import { verifyToken } from "@/lib/jwt";

export async function GET(req: NextRequest, { params }: { params: { quizId: string } }) {
  try {
    await connectDB();

    const token = req.cookies.get("token")?.value;
    if (!token) return unauthorized();

    const user = verifyToken(token);
    if (!user || user.role !== "user") return unauthorized();

    const quiz = await Quiz.findById(params.quizId);
    if (!quiz || quiz.status !== "published") {
      return NextResponse.json({ error: "Quiz not found or not available" }, { status: 404 });
    }

    // Check access
    let hasAccess = quiz.isPublic;
    if (!hasAccess) {
      const accessCount = await Class.countDocuments({
        _id: { $in: quiz.assignedToClasses },
        students: user.id
      });
      hasAccess = accessCount > 0;
    }
    if (!hasAccess) return NextResponse.json({ error: "Access denied" }, { status: 403 });

    // Find attempt
    const attempt = await QuizAttempt.findOne({
      quiz: quiz._id,
      student: user.id,
      status: { $in: ["in-progress", "pending"] }
    });

    const response = {
      title: quiz.title,
      description: quiz.description,
      timeLimit: quiz.timeLimit,
      totalPoints: quiz.totalPoints,
      questions: [], // Don't send questions yet
      attemptStatus: attempt?.status || "not-started"
    };

    if (attempt && ["in-progress", "pending"].includes(attempt.status)) {
      response.questions = quiz.questions.map(q => ({
        _id: q._id,
        text: q.text,
        type: q.type,
        options: q.options,
        points: q.points
      }));
    }

    return NextResponse.json({ success: true, quiz: response });
  } catch (error) {
    console.error("GET quiz details:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}