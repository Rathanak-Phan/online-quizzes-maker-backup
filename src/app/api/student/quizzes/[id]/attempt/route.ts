// src/app/api/student/quizzes/[id]/attempt/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import QuizAttempt from "@/lib/models/QuizAttempt";
import Quiz from "@/lib/models/Quiz";
import { verifyToken } from "@/lib/jwt";

export async function GET(req: NextRequest, { params }: { params: { quizId: string } }) {
  try {
    await connectDB();

    const token = req.cookies.get("token")?.value;
    if (!token) return unauthorized();

    const user = verifyToken(token);
    if (!user || user.role !== "user") return unauthorized();

    const attempt = await QuizAttempt.findOne({
      quiz: params.quizId,
      student: user.id,
      status: "in-progress"
    }).populate("quiz", "questions timeLimit");

    if (!attempt) return NextResponse.json({ error: "No active attempt" }, { status: 404 });

    return NextResponse.json({
      success: true,
      attempt: {
        _id: attempt._id,
        startedAt: attempt.startedAt,
        timeSpent: attempt.timeSpent,
        answers: attempt.answers,
        questions: attempt.quiz.questions.map((q: any) => ({
          _id: q._id,
          text: q.text,
          type: q.type,
          options: q.options,
          points: q.points
        }))
      }
    });
  } catch (error) {
    console.error("GET attempt:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { quizId: string } }) {
  try {
    await connectDB();

    const token = req.cookies.get("token")?.value;
    if (!token) return unauthorized();

    const user = verifyToken(token);
    if (!user || user.role !== "user") return unauthorized();

    const body = await req.json();
    const { answers, status, timeSpent } = body; // answers: [{questionId, selected, timeSpent}]

    const attempt = await QuizAttempt.findOne({
      quiz: params.quizId,
      student: user.id,
      status: "in-progress"
    });

    if (!attempt) return NextResponse.json({ error: "No active attempt" }, { status: 404 });

    // Update answers
    if (answers) {
      answers.forEach((ans: any) => {
        const existing = attempt.answers.find((a: any) => a.questionId.toString() === ans.questionId);
        if (existing) {
          existing.selected = ans.selected;
          existing.timeSpent = ans.timeSpent || existing.timeSpent;
        }
      });
    }

    attempt.timeSpent = timeSpent || attempt.timeSpent;

    if (status === "submitted") {
      attempt.status = "submitted";
      attempt.submittedAt = new Date();

      // Auto-grade objective questions
      const quiz = await Quiz.findById(params.quizId);
      let score = 0;

      attempt.answers.forEach((ans: any) => {
        const q = quiz.questions.find((qq: any) => qq._id.toString() === ans.questionId.toString());
        if (q) {
          let isCorrect = false;
          if (q.type === "multiple") {
            isCorrect = Number(ans.selected) === Number(q.correctAnswer);
          } else if (q.type === "truefalse") {
            isCorrect = ans.selected === q.correctAnswer;
          } else if (q.type === "shortanswer") {
            // Pending for manual grade
            ans.isCorrect = null;
            attempt.status = "pending"; // If any shortanswer
            return;
          }
          ans.isCorrect = isCorrect;
          if (isCorrect) score += q.points;
        }
      });

      attempt.score = score;
      attempt.percentage = (score / attempt.totalPoints) * 100;
      attempt.isGraded = attempt.status !== "pending";
    }

    await attempt.save();

    return NextResponse.json({ success: true, attempt });
  } catch (error) {
    console.error("PATCH attempt:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}