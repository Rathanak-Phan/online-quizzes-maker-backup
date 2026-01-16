// src/app/api/student/quizzes/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Quiz from "@/lib/models/Quiz";
import QuizAttempt from "@/lib/models/QuizAttempt";
import Class from "@/lib/models/Class";
import { verifyToken } from "@/lib/jwt";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // ✅ Check token
    const token = req.cookies.get("token")?.value;
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = verifyToken(token);
    if (!user || user.role !== "user") // user = student
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");

    // 1️⃣ Get classes student is enrolled in
    const classes = await Class.find({ students: user._id }).lean();
    const classIds = classes.map((c) => c._id);

    if (classIds.length === 0)
      return NextResponse.json({ quizzes: [] }); // no classes, no quizzes

    // 2️⃣ Get quizzes assigned to those classes
    let quizzes = await Quiz.find({ assignedToClasses: { $in: classIds } }).lean();

    // 3️⃣ Apply search filter
    if (search) {
      const term = search.toLowerCase();
      quizzes = quizzes.filter((q) => q.title.toLowerCase().includes(term));
    }

    // 4️⃣ Get student's quiz attempts
    const quizIds = quizzes.map((q) => q._id);
    const attempts = await QuizAttempt.find({
      student: user._id,
      quiz: { $in: quizIds },
    }).lean();

    const attemptsMap = new Map(attempts.map((a) => [a.quiz.toString(), a]));

    // 5️⃣ Map attemptStatus + percentage
    const formattedQuizzes = quizzes.map((q) => {
      const attempt = attemptsMap.get(q._id.toString());
      let attemptStatus: "not-started" | "in-progress" | "completed" = "not-started";
      let percentage: number | undefined;

      if (attempt) {
        if (attempt.status === "completed") {
          attemptStatus = "completed";
          percentage = attempt.percentage;
        } else {
          attemptStatus = "in-progress";
        }
      }

      return {
        _id: q._id,
        title: q.title,
        description: q.description,
        timeLimit: q.timeLimit,
        attemptStatus,
        percentage,
      };
    });

    return NextResponse.json({ quizzes: formattedQuizzes });
  } catch (error: any) {
    console.error("GET student quizzes error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
