// src/app/api/student/quizzes/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Quiz from "@/lib/models/Quiz";
import QuizAttempt from "@/lib/models/QuizAttempt";
import Class from "@/lib/models/Class";
import Challenge from "@/lib/models/Challenge";
import { verifyToken } from "@/lib/jwt";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user || user.role !== "user") { // "user" = student
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "assigned";
    const search = searchParams.get("search");

    let quizzes = [];

    if (type === "assigned") {
      // Get classes student is in
      const classes = await Class.find({ students: user._id }).lean();
      const classIds = classes.map(c => c._id);

      // Get quizzes assigned to those classes
      quizzes = await Quiz.find({ assignedToClasses: { $in: classIds } }).lean();
    } else if (type === "public") {
      quizzes = await Quiz.find({ isPublic: true }).lean();
    } else if (type === "challenges") {
      quizzes = await Challenge.find({ class: { $in: await Class.find({ students: user._id }).distinct("_id") } })
        .populate("quiz")
        .lean();
      quizzes = quizzes.map(c => c.quiz);
    } else if (type === "attempts") {
      quizzes = await QuizAttempt.find({ student: user._id })
        .populate("quiz")
        .lean();
      quizzes = quizzes.map(a => ({
        ...a.quiz,
        status: a.status,
      }));
    }

    // Apply search if provided
    if (search) {
      quizzes = quizzes.filter(q => q.title.toLowerCase().includes(search.toLowerCase()));
    }

    // Add derived fields
    quizzes = quizzes.map(q => ({
      _id: q._id,
      title: q.title,
      description: q.description,
      category: q.category,
      timeLimit: q.timeLimit,
      questionsCount: q.questions.length,
      status: q.status || "not-started",
      type: type,
    }));

    return NextResponse.json({
      success: true,
      quizzes,
    });
  } catch (error: any) {
    console.error("GET student quizzes error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}