// src/app/api/teacher/classes/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ClassModel from "@/lib/models/Class";
import { verifyToken } from "@/lib/jwt";

/* ======================
   GET: Fetch classes
     - Teacher: classes they created
     - Student: classes they are enrolled in
====================== */
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // 1️⃣ Get token
    const token = req.cookies.get("token")?.value;
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 2️⃣ Verify token
    const user = verifyToken(token);
    if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    let classes;

    if (user.role === "teacher") {
      // Teacher: fetch classes they created
      classes = await ClassModel.find({ teacher: user._id || user.id })
        .populate("teacher", "name email")
        .sort({ createdAt: -1 })
        .lean();
    } else if (user.role === "student") {
      // Student: fetch classes they are enrolled in
      classes = await ClassModel.find({ students: user._id || user.id })
        .populate("teacher", "name email")
        .sort({ createdAt: -1 })
        .lean();
    } else {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Add counts (studentCount, quizCount)
    const result = classes.map((cls) => ({
      ...cls,
      studentCount: cls.students?.length || 0,
      quizCount: cls.quizzes?.length || 0,
    }));

    return NextResponse.json({ classes: result });
  } catch (error: any) {
    console.error("Classes fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch classes" },
      { status: 500 }
    );
  }
}

/* ======================
   POST: Create new class (teacher only)
====================== */
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const token = req.cookies.get("token")?.value;
    if (!token)
      return NextResponse.json(
        { error: "Unauthorized - no token" },
        { status: 401 }
      );

    const user = verifyToken(token);
    if (!user)
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );

    if (user.role !== "teacher")
      return NextResponse.json(
        { error: "Only teachers can create classes" },
        { status: 403 }
      );

    const body = await req.json();

    if (!body.name?.trim()) {
      return NextResponse.json(
        { error: "Class name is required" },
        { status: 400 }
      );
    }

    const code = body.code?.trim().toUpperCase() || undefined;
    const inviteCode = body.inviteCode?.trim() || undefined;

    const newClass = await ClassModel.create({
      teacher: user._id || user.id,
      name: body.name.trim(),
      code,
      type: body.type || "private",
      students: [], // initially empty
      quizzes: [],
      inviteCode,
      subject: body.subject?.trim() || "",
      schedule: body.schedule?.trim() || "",
    });

    return NextResponse.json(
      { success: true, class: newClass, classId: newClass._id },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("CREATE class error:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { error: "Validation failed", details: errors },
        { status: 400 }
      );
    }

    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Code or invite code already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to create class" },
      { status: 500 }
    );
  }
}
