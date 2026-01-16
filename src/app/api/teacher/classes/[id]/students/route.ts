// src/app/api/teacher/classes/[id]/students/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ClassModel from "@/lib/models/Class";
import UserModel from "@/lib/models/User";
import { verifyToken } from "@/lib/jwt";

/* ======================
   GET: List students in a class
====================== */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id: classId } = await params;

    if (!classId) {
      return NextResponse.json({ error: "Class ID is required" }, { status: 400 });
    }

    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = verifyToken(token);
    if (!user) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const classDoc = await ClassModel.findById(classId)
      .populate("students", "name email createdAt quizzes avgScore")
      .lean();

    if (!classDoc) return NextResponse.json({ error: "Class not found" }, { status: 404 });

    const students = classDoc.students.map((s: any) => ({
      _id: s._id,
      name: s.name,
      email: s.email,
      joinedAt: s.createdAt,
      quizzesCompleted: s.quizzes?.length || 0,
      avgScore: s.avgScore || 0,
    }));

    return NextResponse.json({ students });
  } catch (err: any) {
    console.error("Fetch students error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/* ======================
   POST: Add a student to the class (teacher only)
====================== */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id: classId } = await params;
    if (!classId) {
      return NextResponse.json({ error: "Class ID is required" }, { status: 400 });
    }

    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = verifyToken(token);
    if (!user) return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    if (user.role !== "teacher")
      return NextResponse.json(
        { error: "Only teachers can add students" },
        { status: 403 }
      );

    const body = await req.json();
    const { studentId } = body;
    if (!studentId) return NextResponse.json({ error: "studentId is required" }, { status: 400 });

    const classDoc = await ClassModel.findById(classId);
    if (!classDoc) return NextResponse.json({ error: "Class not found" }, { status: 404 });

    const student = await UserModel.findById(studentId);
    if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

    // Avoid duplicates
    if (classDoc.students.includes(studentId)) {
      return NextResponse.json({ error: "Student already in class" }, { status: 400 });
    }

    classDoc.students.push(studentId);
    await classDoc.save();

    return NextResponse.json({ success: true, student });
  } catch (err: any) {
    console.error("Add student error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
