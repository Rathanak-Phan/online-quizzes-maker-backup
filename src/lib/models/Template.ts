// src/lib/models/Template.ts
import mongoose, { Schema, Document, model, Types } from "mongoose";

export interface ITemplate extends Document {
  teacherId: Types.ObjectId; // <-- use Types.ObjectId
  name: string;
  category: string;
  questions: number;
  uses: number;
  createdAt: Date;
  updatedAt: Date;
}

const templateSchema = new Schema<ITemplate>(
  {
    teacherId: { type: Schema.Types.ObjectId, ref: "User", required: true }, // stays the same
    name: { type: String, required: true },
    category: { type: String, required: true },
    questions: { type: Number, required: true },
    uses: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Template =
  mongoose.models.Template || model<ITemplate>("Template", templateSchema);
