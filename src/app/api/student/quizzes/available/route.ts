// src/app/api/student/quizzes/available/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Quiz from "@/lib/models/Quiz";
import Class from "@/lib/models/Class";
import QuizAttempt from "@/lib/models/QuizAttempt";
import { verifyToken } from "@/lib/jwt";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const token = req.cookies.get("token")?.value;
    if (!token) return unauthorized();

    const user = verifyToken(token);
    if (!user || user.role !== "user")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Find classes student is in
    const classes = await Class.find({ students: user.id }).select(
      "_id quizzes"
    );

    const classIds = classes.map((c) => c._id);
    const assignedQuizzes = classes.flatMap((c) => c.quizzes);

    // Get published quizzes from classes + public ones
    const quizzes = await Quiz.find({
      $or: [
        { _id: { $in: assignedQuizzes }, status: "published" },
        { isPublic: true, status: "published" },
      ],
    }).select(
      "title description timeLimit totalPoints category createdAt assignedToClasses"
    );

    // Get attempts for these quizzes
    const attempts = await QuizAttempt.find({
      student: user.id,
      quiz: { $in: quizzes.map((q) => q._id) },
    }).select("quiz status score percentage submittedAt");

    const attemptsMap = new Map(attempts.map((a) => [a.quiz.toString(), a]));

    const enriched = quizzes
      .map((q) => {
        const attempt = attemptsMap.get(q._id.toString());

        // ✅ Fix: type annotation for 'c'
        const inClasses: string[] =
          q.assignedToClasses?.filter((c: string) => classIds.includes(c)) ||
          [];

        return {
          ...q.toObject(),
          attemptStatus: attempt?.status || "not-started",
          score: attempt?.score,
          percentage: attempt?.percentage,
          submittedAt: attempt?.submittedAt,
          classes: inClasses.length, // or populate if needed
        };
      })
      .filter((q) => q.attemptStatus !== "completed"); // Only available (not completed)

    return NextResponse.json({ success: true, quizzes: enriched });
  } catch (error) {
    console.error("GET available quizzes:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
