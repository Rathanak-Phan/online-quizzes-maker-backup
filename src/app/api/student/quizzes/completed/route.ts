// src/app/api/student/quizzes/completed/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import QuizAttempt from "@/lib/models/QuizAttempt";
import { verifyToken } from "@/lib/jwt";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const token = req.cookies.get("token")?.value;
    if (!token) return unauthorized();

    const user = verifyToken(token);
    if (!user || user.role !== "user") return unauthorized();

    const attempts = await QuizAttempt.find({
      student: user.id,
      status: { $in: ["submitted", "completed"] }
    })
      .populate("quiz", "title description category")
      .populate("class", "name")
      .select("score percentage submittedAt timeSpent")
      .sort({ submittedAt: -1 })
      .lean();

    return NextResponse.json({ success: true, completed: attempts });
  } catch (error) {
    console.error("GET completed quizzes:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}