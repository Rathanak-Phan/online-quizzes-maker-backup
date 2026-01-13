// scr/app/admin/state/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";
import Quiz from "@/lib/models/Quiz";

export async function GET() {
  try {
    await connectDB();

    const totalUsers = await User.countDocuments({});
    const totalTeachers = await User.countDocuments({ role: "teacher" });
    const pendingApproval = await User.countDocuments({ approved: false });
    const totalQuizzes = await Quiz.countDocuments({});

    return NextResponse.json({
      totalUsers,
      totalTeachers,
      pendingApproval,
      totalQuizzes,
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ message: err.message || "Server error" }, { status: 500 });
  }
}
