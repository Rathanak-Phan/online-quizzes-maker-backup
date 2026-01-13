// src/app/api/teacher/stats/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ClassModel from "@/lib/models/Class";

export async function GET() {
  await connectDB();

  const totalClasses = await ClassModel.countDocuments();

  return NextResponse.json({
    success: true,
    stats: {
      totalClasses,
      totalStudents: 0,
      activeQuizzes: 0,
      pendingReviews: 0,
    },
  });
}
