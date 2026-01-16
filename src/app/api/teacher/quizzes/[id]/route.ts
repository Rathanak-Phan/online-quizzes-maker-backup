// src/app/api/teacher/quizzes/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Quiz from "@/lib/models/Quiz";
import { verifyToken } from "@/lib/jwt";

/* ======================
   GET: Single quiz
====================== */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const resolvedParams = await params;
    const { id } = resolvedParams;

    const token = req.cookies.get("token")?.value;
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = verifyToken(token);
    if (!user)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const quiz = await Quiz.findById(id).lean();

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
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const resolvedParams = await params;
    const { id } = resolvedParams;

    const token = req.cookies.get("token")?.value;
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = verifyToken(token);
    if (!user)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const body = await req.json();

    const updatedQuiz = await Quiz.findByIdAndUpdate(
      id,
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
        { success: false, error: "Quiz not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, quiz: updatedQuiz });
  } catch (error: any) {
    console.error("UPDATE quiz error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/* ======================
   DELETE: Remove quiz
====================== */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const resolvedParams = await params;
    const { id } = resolvedParams;

    const token = req.cookies.get("token")?.value;
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = verifyToken(token);
    if (!user)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const deletedQuiz = await Quiz.findByIdAndDelete(id);

    if (!deletedQuiz) {
      return NextResponse.json(
        { success: false, error: "Quiz not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE quiz error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/* ======================
   POST: Duplicate quiz (FIXED)
====================== */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const resolvedParams = await params;
    const { id } = resolvedParams;

    const token = req.cookies.get("token")?.value;
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = verifyToken(token);
    if (!user)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const quiz = await Quiz.findById(id);

    if (!quiz) {
      return NextResponse.json(
        { success: false, error: "Quiz not found" },
        { status: 404 }
      );
    }

    // Create the duplicate with ALL required fields
    const duplicated = await Quiz.create({
      title: `${quiz.title} (Copy)`,
      description: quiz.description || "",
      category: quiz.category || "General",
      status: "draft",
      questions: quiz.questions || [],
      timeLimit: quiz.timeLimit || 30,
      isTemplate: quiz.isTemplate || false,
      createdBy: user._id,               // ← THIS IS THE FIX! Current teacher becomes creator
      // Defaults for new fields (prevents future errors)
      isPublic: false,
      password: null,
      assignedToClasses: [],
    });

    return NextResponse.json({
      success: true,
      quiz: duplicated,
    });
  } catch (error: any) {
    console.error("DUPLICATE quiz error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}