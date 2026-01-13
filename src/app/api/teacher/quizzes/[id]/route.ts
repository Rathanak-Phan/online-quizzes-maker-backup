// src/app/api/teacher/quizzes/[id]/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Quiz } from "@/lib/models/Quiz";
import { verifyToken } from "@/lib/jwt";

/* ======================
   GET: Single quiz
====================== */
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const quiz = await Quiz.findById(params.id).lean();

    if (!quiz) {
      return NextResponse.json(
        { success: false, error: "Quiz not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      quiz,
    });
  } catch (error: any) {
    console.error("GET quiz error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/* ======================
   PUT: Update quiz
====================== */
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const body = await req.json();

    const updatedQuiz = await Quiz.findByIdAndUpdate(
      params.id,
      {
        title: body.title,
        description: body.description,
        category: body.category,
        status: body.status,
        timeLimit: body.timeLimit,
        isTemplate: body.isTemplate,
        questions: body.questions,
      },
      { new: true }
    );

    if (!updatedQuiz) {
      return NextResponse.json(
        { error: "Quiz not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      quiz: updatedQuiz,
    });
  } catch (error: any) {
    console.error("UPDATE quiz error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

/* ======================
   DELETE: Remove quiz
====================== */
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    await Quiz.findByIdAndDelete(params.id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE quiz error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

/* ======================
   POST: Duplicate quiz
====================== */
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const quiz = await Quiz.findById(params.id);

    if (!quiz) {
      return NextResponse.json(
        { error: "Quiz not found" },
        { status: 404 }
      );
    }

    const duplicated = await Quiz.create({
      title: `${quiz.title} (Copy)`,
      description: quiz.description,
      category: quiz.category,
      status: "draft",
      questions: quiz.questions || [],
      timeLimit: quiz.timeLimit || 30,
      isTemplate: quiz.isTemplate || false,
    });

    return NextResponse.json({ quiz: duplicated });
  } catch (error: any) {
    console.error("DUPLICATE quiz error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
