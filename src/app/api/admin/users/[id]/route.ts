// src/app/api/admin/users/[id]/route.ts
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

/* ===================== GET ===================== */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid user ID" }, { status: 400 });
    }

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Fetch user error:", error);
    return NextResponse.json(
      { message: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

/* ===================== PUT ===================== */
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await context.params;
    const data = await req.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid user ID" }, { status: 400 });
    }

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // ✅ keep your update logic
    if (data.name) user.name = data.name;
    if (data.email) user.email = data.email;
    if (data.role) user.role = data.role;
    if (data.status) user.status = data.status;
    if (data.validated !== undefined) user.validated = data.validated;

    await user.save();

    return NextResponse.json({
      message: "User updated successfully",
      user,
    });
  } catch (error: any) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}

/* ===================== DELETE ===================== */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid user ID" }, { status: 400 });
    }

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    await User.findByIdAndDelete(id);

    return NextResponse.json({
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { message: "Failed to delete user" },
      { status: 500 }
    );
  }
}
