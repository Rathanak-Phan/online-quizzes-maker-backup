// src/app/api/student/classes/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ClassModel from "@/lib/models/Class";
import { verifyToken } from "@/lib/jwt";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const token =
      req.headers.get("authorization")?.replace("Bearer ", "") ||
      req.cookies.get("token")?.value;

    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = verifyToken(token);
    if (!user || user.role !== "user")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const search = req.nextUrl.searchParams.get("search");

    const query: any = {
      students: user._id || user.id, // 🔥 THIS IS THE MAGIC
    };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
      ];
    }

    const classes = await ClassModel.find(query)
      .populate("teacher", "name")
      .lean();

    const formatted = classes.map(cls => ({
      _id: cls._id,
      name: cls.name,
      subject: cls.subject,
      teacher: cls.teacher,
      studentCount: cls.students.length,
      quizCount: cls.quizzes.length,
      code: cls.code,
      createdAt: cls.createdAt,
    }));

    return NextResponse.json({ success: true, classes: formatted });
  } catch (error: any) {
    console.error("Student classes error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
