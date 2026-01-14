// src/app/api/admin/users/route.ts
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    const users = await User.find().select("-password");
    return NextResponse.json({ users });
  } catch (error) {
    console.error("Fetch users error:", error);
    return NextResponse.json({ message: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const data = await req.json();

    const newUser = new User({
      name: data.name,
      email: data.email,
      role: data.role,
      status: data.status,
    });

    await newUser.save();

    return NextResponse.json({ message: "User created successfully", user: newUser });
  } catch (error) {
    console.error("Create user error:", error);
    return NextResponse.json({ message: "Failed to create user" }, { status: 500 });
  }
}
