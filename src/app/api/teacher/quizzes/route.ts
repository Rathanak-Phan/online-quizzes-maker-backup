// src/app/api/teacher/quizzes/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Quiz } from "@/lib/models/Quiz";
import { verifyToken } from "@/lib/jwt";

/* ======================
   GET: Fetch quizzes
====================== */
export async function GET(req: Request) {
  try {
    await connectDB();

    // OPTIONAL AUTH (matches your frontend)
    const authHeader = req.headers.get("authorization");
    if (authHeader) {
      const token = authHeader.split(" ")[1];
      const decoded = verifyToken(token);
      if (!decoded) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const sort = searchParams.get("sort");

    const query: any = {};

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }
    if (status && status !== "all") {
      query.status = status;
    }
    if (category && category !== "all") {
      query.category = category;
    }

    let quizzes = await Quiz.find(query).lean();

    // Sorting (matches frontend)
    switch (sort) {
      case "title":
        quizzes.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "lastUsed":
        quizzes.sort(
          (a, b) =>
            new Date(b.lastUsed || 0).getTime() -
            new Date(a.lastUsed || 0).getTime()
        );
        break;
      default: // newest
        quizzes.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        );
    }

    return NextResponse.json({
      quizzes,
      source: "mongodb",
    });
  } catch (error: any) {
    console.error("GET quizzes error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

/* ======================
   POST: Create quiz
====================== */
export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();

    if (!body.title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const quiz = await Quiz.create({
      title: body.title,
      description: body.description || "",
      category: body.category || "General",
      status: "draft",
    });

    return NextResponse.json({ quiz }, { status: 201 });
  } catch (error: any) {
    console.error("CREATE quiz error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
