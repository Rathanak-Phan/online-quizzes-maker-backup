// src/app/api/student/quizzes/pending/route.ts
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
      status: { $in: ["not-started", "in-progress", "pending"] },
    })
      .populate("quiz", "title description timeLimit category")
      .populate("class", "name")
      .select("startedAt timeSpent status")
      .sort({ startedAt: -1 })
      .lean();

    return NextResponse.json({ success: true, pending: attempts });
  } catch (error) {
    console.error("GET pending quizzes:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ✅ Helper function to fix TS error
function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
