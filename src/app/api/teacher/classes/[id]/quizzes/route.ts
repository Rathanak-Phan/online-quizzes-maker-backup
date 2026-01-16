// src/app/api/teacher/classes/[id]/quizzes/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ClassModel from "@/lib/models/Class";
import QuizModel from "@/lib/models/Quiz";
import { verifyToken } from "@/lib/jwt";

/* ======================
   GET: Get all quizzes for a class
====================== */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id: classId } = await params;

    const token = req.cookies.get("token")?.value;
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = verifyToken(token);
    if (!user)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const cls = await ClassModel.findById(classId)
      .populate("quizzes", "title avgScore status")
      .lean();

    if (!cls)
      return NextResponse.json(
        { success: false, error: "Class not found" },
        { status: 404 }
      );

    return NextResponse.json({ success: true, quizzes: cls.quizzes || [] });
  } catch (error: any) {
    console.error("GET class quizzes error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/* ======================
   POST: Add a quiz to the class
====================== */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id: classId } = await params;

    const token = req.cookies.get("token")?.value;
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = verifyToken(token);
    if (!user || user.role !== "teacher")
      return NextResponse.json(
        { error: "Only teachers can add quizzes" },
        { status: 403 }
      );

    const { quizId } = await req.json();

    const cls = await ClassModel.findById(classId);
    if (!cls)
      return NextResponse.json(
        { success: false, error: "Class not found" },
        { status: 404 }
      );

    // Prevent duplicate quizzes
    if (cls.quizzes.includes(quizId))
      return NextResponse.json({
        success: false,
        error: "Quiz already added to class",
      });

    cls.quizzes.push(quizId);
    await cls.save();

    return NextResponse.json({ success: true, class: cls });
  } catch (error: any) {
    console.error("POST add quiz error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
