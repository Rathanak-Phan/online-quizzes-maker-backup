// src/app/api/teacher/classes/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ClassModel from "@/lib/models/Class";
import { verifyToken } from "@/lib/jwt";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const token = req.cookies.get("token")?.value;
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = verifyToken(token);
    if (!user)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    // Fetch classes created by this teacher only
    const classes = await ClassModel.find({ teacherId: user.id }).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ success: true, classes });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, message: "Failed to fetch classes" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { name, code, type } = body;

    const token = req.cookies.get("token")?.value;
    if (!token)
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const user = verifyToken(token);
    if (!user)
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });

    const teacherId = user.id || user._id;
    if (!teacherId) {
      return NextResponse.json({ success: false, message: "Teacher ID missing" }, { status: 400 });
    }

    // Create new class in MongoDB
    const newClass = await ClassModel.create({
      teacherId,
      name,
      code,
      type,
      students: 0,
    });

    return NextResponse.json({ success: true, class: newClass }, { status: 201 });
  } catch (err) {
    console.error("Error creating class:", err);
    return NextResponse.json(
      { success: false, message: "Failed to create class" },
      { status: 500 }
    );
  }
}
