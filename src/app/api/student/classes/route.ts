// src/app/api/student/classes/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ClassModel from "@/lib/models/Class";
import { verifyToken } from "@/lib/jwt";

/* ======================
   GET: Student's classes
====================== */
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // ✅ Get token from cookie (SAME AS TEACHER)
    const token = req.cookies.get("token")?.value;
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = verifyToken(token);
    if (!user || user.role !== "user")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const search = req.nextUrl.searchParams.get("search") || "";

    // ✅ Find classes where student is enrolled
    const classes = await ClassModel.find({
      students: user._id,
      ...(search && {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { subject: { $regex: search, $options: "i" } },
        ],
      }),
    })
      .populate("teacher", "name email")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ classes });
  } catch (error: any) {
    console.error("Student classes error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
