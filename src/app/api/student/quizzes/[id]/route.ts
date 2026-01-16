// src/app/api/student/quizzes/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ClassModel from "@/lib/models/Class";
import { verifyToken } from "@/lib/jwt";

/* ============================
   GET: Quizzes for a class (student)
============================ */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    // ✅ unwrap params (important)
    const { id: classId } = await params;

    /* --------------------------
       Auth
    -------------------------- */
    const token = req.cookies.get("token")?.value;
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = verifyToken(token);
    if (!user || user.role !== "user")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    /* --------------------------
       Lazy load models
    -------------------------- */
    const Quiz = (await import("@/lib/models/Quiz")).default;
    const QuizAttempt = (await import("@/lib/models/QuizAttempt")).default;

    /* --------------------------
       Load class
    -------------------------- */
    const cls = await ClassModel.findById(classId)
      .populate({
        path: "quizzes",
        select: "title timeLimit status",
      })
      .lean();

    if (!cls)
      return NextResponse.json(
        { success: false, error: "Class not found" },
        { status: 404 }
      );

    /* --------------------------
       Ensure student is in class
    -------------------------- */
    const studentId = user._id || user.id;

    const isStudentInClass = cls.students
      .map((s: any) => s.toString())
      .includes(studentId.toString());

    if (!isStudentInClass)
      return NextResponse.json(
        { success: false, error: "Not enrolled in this class" },
        { status: 403 }
      );

    /* --------------------------
       Build quizzes with attempt status
    -------------------------- */
    const quizzesWithStatus = await Promise.all(
      (cls.quizzes || []).map(async (quiz: any) => {
        const attempt = await QuizAttempt.findOne({
          quiz: quiz._id,
          student: studentId,
        }).lean();

        let attemptStatus: "not-started" | "in-progress" | "completed" =
          "not-started";

        if (attempt) {
          attemptStatus = attempt.completedAt
            ? "completed"
            : "in-progress";
        }

        return {
          _id: quiz._id,
          title: quiz.title,
          timeLimit: quiz.timeLimit,
          status: quiz.status,
          attemptStatus,
          percentage: attempt?.percentage ?? null,
        };
      })
    );

    /* --------------------------
       Response
    -------------------------- */
    return NextResponse.json({
      success: true,
      quizzes: quizzesWithStatus,
    });
  } catch (error: any) {
    console.error("GET student class quizzes error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
