// src/app/api/admin/users/create/route.ts
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  await connectDB();
  const body = await req.json();

  const user = await User.create({
    name: body.name,
    email: body.email,
    role: body.role.toLowerCase(),
    validated: body.role !== "teacher",
  });

  return NextResponse.json({ id: user._id });
}
