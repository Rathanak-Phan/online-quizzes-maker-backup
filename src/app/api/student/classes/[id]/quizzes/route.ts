// src/app/api/student/classes/[id]/quizzes/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Quiz from "@/lib/models/Quiz";
import ClassModel from "@/lib/models/Class";
import { verifyToken } from "@/lib/jwt";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // ✅ Get token from cookie or header
    const token =
      req.headers.get("authorization")?.replace("Bearer ", "") ||
      req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = verifyToken(token);
    if (!user || user.role !== "user")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (!user._id)
      return NextResponse.json({ error: "Invalid user data" }, { status: 403 });

    // ✅ Get classId from URL
    const url = new URL(req.url);
    const pathParts = url.pathname.split("/"); // ["", "api", "student", "classes", "{id}", "quizzes"]
    const classId = pathParts[5];
    if (!classId || !mongoose.Types.ObjectId.isValid(classId))
      return NextResponse.json({ error: "Invalid Class ID" }, { status: 400 });

    // ✅ Find class
    const cls = await ClassModel.findById(classId).lean();
    if (!cls) return NextResponse.json({ error: "Class not found" }, { status: 404 });

    // ✅ Check student enrollment safely
    if (!Array.isArray(cls.students) || !cls.students.some((s: any) => s?.toString() === user._id.toString())) {
      return NextResponse.json({ error: "Not enrolled in this class" }, { status: 403 });
    }

    // Optional search
    const search = url.searchParams.get("search") || "";

    // ✅ Get quizzes assigned to this class
    let quizzes = await Quiz.find({
      assignedToClasses: classId,
      status: "published",
      title: { $regex: search, $options: "i" },
    }).lean();

    // Map minimal data
    quizzes = quizzes.map((q: any) => ({
      _id: q._id,
      title: q.title,
      description: q.description,
      timeLimit: q.timeLimit,
      attemptStatus: "not-started", // you can update if you track attempts
    }));

    return NextResponse.json({ success: true, quizzes });
  } catch (err: any) {
    console.error("Student class quizzes error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
