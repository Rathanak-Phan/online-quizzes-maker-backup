// src/app/api/admin/users/approve/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";

export async function POST(
  req: NextRequest,
  { params }: { params: any } // params is a Promise in Next.js 14+
) {
  await connectDB();

  // ✅ Unwrap params Promise
  const resolvedParams = await params;
  const userId = resolvedParams.id;

  const user = await User.findById(userId);
  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  // ✅ Keep your existing approval logic
  user.status = "active";
  user.validated = true;

  await user.save();

  return NextResponse.json({
    message: "Teacher approved successfully",
  });
}
