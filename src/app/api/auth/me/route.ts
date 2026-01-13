// src/app/api/auth/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";
import { verifyToken } from "@/lib/jwt";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const token = req.cookies.get("token")?.value;

    if (!token) {
      console.log("❌ No token in cookies");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);

    if (!decoded || !decoded.id) {
      console.log("❌ Invalid token:", decoded);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      console.log("❌ User not found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage || "/logo.png",
    });
  } catch (error) {
    console.error("❌ /auth/me error:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
