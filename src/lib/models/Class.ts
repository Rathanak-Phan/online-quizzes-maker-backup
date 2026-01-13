import mongoose, { Schema, model, models } from "mongoose";

const ClassSchema = new Schema(
  {
    teacherId: { type: String, required: true }, // JWT user id or email
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    type: { type: String, enum: ["public", "private"], default: "private" },
    students: { type: Number, default: 0 },
    inviteLink: { type: String },
    subject: { type: String },
    schedule: { type: String },
  },
  { timestamps: true }
);

// Check if model already exists (Next.js hot reload)
const ClassModel = models.Class || model("Class", ClassSchema);

export default ClassModel;
