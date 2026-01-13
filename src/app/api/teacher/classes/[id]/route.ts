// src/app/api/teacher/classes/[id]/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ClassModel from "@/lib/models/Class";

type Params = { id: string };

export async function GET(req: Request, context: { params: Promise<Params> }) {
  await connectDB();

  try {
    const { id } = await context.params;

    const cls = await ClassModel.findById(id).lean();

    if (!cls) {
      return NextResponse.json(
        { success: false, error: "Class not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: cls, // ✅ MATCH FRONTEND
    });
  } catch (err) {
    console.error("GET ERROR:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch class" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  context: { params: Promise<Params> }
) {
  await connectDB();

  try {
    const { id } = await context.params; // ✅ REQUIRED
    const body = await req.json();

    const { name, code, type, subject, schedule } = body;

    if (!name || !code) {
      return NextResponse.json(
        { success: false, message: "Name and code are required" },
        { status: 400 }
      );
    }

    const updated = await ClassModel.findByIdAndUpdate(
      id,
      {
        name,
        code: code.toUpperCase(),
        type,
        subject,
        schedule,
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Class not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, class: updated });
  } catch (err) {
    console.error("PATCH ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Failed to update class" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<Params> }
) {
  await connectDB();

  try {
    const { id } = await context.params; // ✅ REQUIRED

    const deleted = await ClassModel.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Class not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Failed to delete class" },
      { status: 500 }
    );
  }
}
