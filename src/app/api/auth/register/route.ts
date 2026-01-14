// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongodb"; // MongoDB connection
import User from "@/lib/models/User"; // Mongoose User model

export async function POST(req: NextRequest) {
  try {
    await connectDB(); // connect to MongoDB

    const { name, email, password, role } = await req.json();

    // Normalize role to match enum in Mongoose
    const normalizedRole = role.toLowerCase(); // 'teacher', 'user', or 'admin'

    const status = normalizedRole === "teacher" ? "pending" : "active";
    const validated = normalizedRole === "teacher" ? false : true;

    // Validate input
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    // Check enum validity
    const validRoles = ["admin", "teacher", "user"];
    if (!validRoles.includes(normalizedRole)) {
      return NextResponse.json({ message: "Invalid role" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "Email already registered" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: normalizedRole,
      validated,
      status, // <-- keep status
    });

    // Generate JWT token only for students/admins (not pending teachers)
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role, email: newUser.email },
      process.env.NEXTAUTH_SECRET!,
      { expiresIn: "7d" }
    );

    // Prepare response
    const response = NextResponse.json({
      message:
        normalizedRole === "teacher"
          ? "Account created. Awaiting admin approval."
          : "Registered and logged in successfully",
      user: {
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
        validated: newUser.validated,
      },
    });

    // Auto-login for students/admins
    if (normalizedRole !== "teacher") {
      response.cookies.set({
        name: "token",
        value: token,
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
    }

    return response;
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { message: err.message || "Server error" },
      { status: 500 }
    );
  }
}
