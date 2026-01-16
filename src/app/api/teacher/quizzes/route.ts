// src/app/api/teacher/quizzes/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Quiz from "@/lib/models/Quiz";
import { verifyToken } from "@/lib/jwt";

/* ======================
   GET: Fetch quizzes (teacher's own only)
====================== */
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user || user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const sort = searchParams.get("sort");

    const query: any = { createdBy: user.id }; // ← Only show this teacher's quizzes

    if (search) query.title = { $regex: search, $options: "i" };
    if (status && status !== "all") query.status = status;
    if (category && category !== "all") query.category = category;

    let quizzes = await Quiz.find(query).sort(
      sort === "title" ? { title: 1 } : { createdAt: -1 }
    ).lean();

    return NextResponse.json({ quizzes });
  } catch (error: any) {
    console.error("GET quizzes error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/* ======================
   POST: Create quiz (with auth!)
====================== */
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // 1. Get token from cookie
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized - no token" }, { status: 401 });
    }

    // 2. Verify token
    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // 3. Only teachers can create quizzes
    if (user.role !== "teacher") {
      return NextResponse.json({ error: "Only teachers can create quizzes" }, { status: 403 });
    }

    // 4. Parse body
    const body = await req.json();

    // 5. Basic validation
    if (!body.title?.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    if (!body.questions?.length) {
      return NextResponse.json({ error: "Quiz must have at least one question" }, { status: 400 });
    }

    // 6. Create quiz - NOW WITH createdBy!
    const newQuiz = await Quiz.create({
      title: body.title.trim(),
      description: body.description?.trim() || "",
      category: body.category || "General",
      timeLimit: Number(body.timeLimit) || 30,
      status: body.status || "draft",
      isTemplate: !!body.isTemplate,
      createdBy: user.id,                // ← This fixes the error!
      questions: body.questions.map((q: any) => ({
        text: q.text?.trim(),
        type: q.type,
        options: q.options || [],
        correctAnswer: q.correctAnswer,
        points: Number(q.points) || 1,
        explanation: q.explanation?.trim(),
      })),
    });

    return NextResponse.json(
      { success: true, quiz: newQuiz, quizId: newQuiz._id },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("CREATE quiz error:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { error: "Validation failed", details: errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to create quiz" },
      { status: 500 }
    );
  }
}