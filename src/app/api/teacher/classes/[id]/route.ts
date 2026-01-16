// src/app/api/teacher/classes/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ClassModel from "@/lib/models/Class";
import { verifyToken } from "@/lib/jwt";

/* ======================
   GET: Single class (teacher or student)
====================== */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    const token = req.cookies.get("token")?.value;
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = verifyToken(token);
    if (!user)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    // ✅ Lazy-load Quiz to avoid MissingSchemaError
    const Quiz = (await import("@/lib/models/Quiz")).default;

    // Fetch class with students, quizzes, and teacher populated
    const classDoc = await ClassModel.findById(id)
      .populate("students", "name email")
      .populate({ path: "quizzes", select: "title avgScore status" }) // populate quiz info
      .populate("teacher", "name email")
      .lean();

    if (!classDoc) {
      return NextResponse.json(
        { success: false, error: "Class not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, class: classDoc });
  } catch (error: any) {
    console.error("GET class error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/* ======================
   PUT: Update class (teacher only)
====================== */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const token = req.cookies.get("token")?.value;
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = verifyToken(token);
    if (!user)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    if (user.role !== "teacher")
      return NextResponse.json(
        { error: "Only teachers can update classes" },
        { status: 403 }
      );

    const body = await req.json();

    const updated = await ClassModel.findOneAndUpdate(
      { _id: id, teacher: user._id || user.id }, // ensure teacher owns it
      {
        name: body.name?.trim(),
        type: body.type,
        subject: body.subject?.trim(),
        schedule: body.schedule?.trim(),
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Class not found or not owned" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, class: updated });
  } catch (error: any) {
    console.error("UPDATE class error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/* ======================
   DELETE: Delete class (teacher only)
====================== */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const token = req.cookies.get("token")?.value;
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = verifyToken(token);
    if (!user)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    if (user.role !== "teacher")
      return NextResponse.json(
        { error: "Only teachers can delete classes" },
        { status: 403 }
      );

    const deleted = await ClassModel.findOneAndDelete({
      _id: id,
      teacher: user._id || user.id,
    });

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Class not found or not owned" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE class error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/* ======================
   POST: Duplicate class (teacher only)
====================== */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const token = req.cookies.get("token")?.value;
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = verifyToken(token);
    if (!user)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    if (user.role !== "teacher")
      return NextResponse.json(
        { error: "Only teachers can duplicate classes" },
        { status: 403 }
      );

    const cls = await ClassModel.findById(id);
    if (!cls)
      return NextResponse.json(
        { success: false, error: "Class not found" },
        { status: 404 }
      );

    const duplicated = await ClassModel.create({
      teacher: user._id || user.id,
      name: `${cls.name} (Copy)`,
      code: Math.random().toString(36).substring(2, 10).toUpperCase(),
      type: cls.type,
      students: [], // empty students for copy
      quizzes: [], // empty quizzes for copy
      inviteCode: Math.random().toString(36).substring(2, 12).toUpperCase(),
      subject: cls.subject,
      schedule: cls.schedule,
    });

    return NextResponse.json({ success: true, class: duplicated });
  } catch (error: any) {
    console.error("DUPLICATE class error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
