// src/app/api/student/quizzes/[id]/save/route.ts
import { verifyToken } from "@/lib/auth";
import QuizAttempt from "@/lib/models/QuizAttempt";
import connectDB from "@/lib/mongodb";
import { forbidden, unauthorized } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  await connectDB();

  const token = req.cookies.get("token")?.value;
  if (!token) return unauthorized();

  const user = verifyToken(token);
  if (!user || user.role !== "user") return unauthorized();

  const attempt = await QuizAttempt.findOne({ quiz: id, student: user._id });
  if (!attempt || attempt.status !== "in-progress") return forbidden();

  attempt.answers = body.answers;
  await attempt.save();

  return NextResponse.json({ success: true });
}