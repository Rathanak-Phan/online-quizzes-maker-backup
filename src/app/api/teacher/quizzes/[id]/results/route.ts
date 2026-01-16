// src/app/api/teacher/quizzes/[id]/results/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Quiz from "@/lib/models/Quiz";
import QuizAttempt from "@/lib/models/QuizAttempt"; // ← Use new model
import { verifyToken } from "@/lib/jwt";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await connectDB();

    // Authentication
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user || user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Find quiz
    const quiz = await Quiz.findById(id).lean();
    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Optional: Only allow owner to see results
    // if (quiz.createdBy.toString() !== user.id) {
    //   return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    // }

    // Get all attempts (populate student name)
    const attempts = await QuizAttempt.find({ quiz: id })
      .populate("student", "name") // Get student name from User
      .sort({ submittedAt: -1 })
      .lean();

    // Format for frontend
    const formattedAttempts = attempts.map((a: any) => ({
      _id: a._id.toString(),
      student: {
        _id: a.student?._id?.toString(),
        name: a.student?.name || "Anonymous",
      },
      status: a.status,
      score: a.score,
      totalPoints: a.totalPoints,
      percentage: a.percentage,
      timeSpent: a.timeSpent,
      submittedAt: a.submittedAt?.toISOString(),
      isGraded: a.isGraded,
    }));

    return NextResponse.json({
      success: true,
      quizTitle: quiz.title || "Untitled Quiz",
      attempts: formattedAttempts,
    });
  } catch (error: any) {
    console.error("GET results error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}