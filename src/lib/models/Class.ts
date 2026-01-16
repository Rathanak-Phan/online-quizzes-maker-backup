// src/lib/models/Class.ts
import mongoose, { Schema, model, models } from "mongoose";

const ClassSchema = new Schema(
  {
    teacher: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Teacher is required"],
      index: true,
    },
    name: {
      type: String,
      required: [true, "Class name is required"],
      trim: true,
      maxlength: 100,
    },
    code: {
      type: String,
      unique: true,
      trim: true,
      uppercase: true,
      minlength: 6,
      maxlength: 10,
      index: true,
      // Remove required: true - we'll auto-generate it
    },
    type: {
      type: String,
      enum: ["public", "private"],
      default: "private",
    },
    students: [{
      type: Schema.Types.ObjectId,
      ref: "User",
      default: [],
    }],
    quizzes: [{
      type: Schema.Types.ObjectId,
      ref: "Quiz",
      default: [],
    }],
    inviteCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    subject: { type: String, trim: true, maxlength: 100 },
    schedule: { type: String, trim: true },
  },
  { timestamps: true }
);

// Auto-generate code & inviteCode + clean invalid refs
ClassSchema.pre("save", async function () {
  if (!this.code) {
    this.code = Math.random().toString(36).substring(2, 10).toUpperCase();
  }
  if (!this.inviteCode) {
    this.inviteCode = Math.random().toString(36).substring(2, 12).toUpperCase();
  }

  // Clean invalid ObjectIds
  if (this.isModified("students") && Array.isArray(this.students)) {
    this.students = this.students.filter(id => id && mongoose.Types.ObjectId.isValid(id));
  }
  if (this.isModified("quizzes") && Array.isArray(this.quizzes)) {
    this.quizzes = this.quizzes.filter(id => id && mongoose.Types.ObjectId.isValid(id));
  }
});

// Virtuals for convenience
ClassSchema.virtual("studentCount").get(function () {
  return this.students?.length || 0;
});

ClassSchema.virtual("quizCount").get(function () {
  return this.quizzes?.length || 0;
});

const ClassModel = models.Class || model("Class", ClassSchema);
export default ClassModel;