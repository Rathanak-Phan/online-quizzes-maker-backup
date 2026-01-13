// src/app/api/admin/users/approve/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";

export async function POST(req: NextRequest, { params }: any) {
  await connectDB();
  const { id } = params;

  const user = await User.findById(id);
  if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

  user.status = "active";
  user.validated = true;

  await user.save();

  return NextResponse.json({ message: "Teacher approved successfully", user });
}
