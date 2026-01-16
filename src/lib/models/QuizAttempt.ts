// src/lib/models/QuizAttempt.ts
import mongoose from "mongoose";

const QuizAttemptSchema = new mongoose.Schema({
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Quiz",
    required: true
  },

  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    default: null
  },

  status: {
    type: String,
    enum: ["not-started", "in-progress", "submitted", "pending", "completed"],
    default: "not-started"
  },

  startedAt: { type: Date },
  submittedAt: { type: Date },
  timeSpent: { type: Number, default: 0 }, // total seconds

  score: { type: Number, default: 0 },
  totalPoints: { type: Number, required: true },
  percentage: { type: Number, default: 0 },

  answers: [{
    questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
    selected: mongoose.Schema.Types.Mixed,          // number, string, etc.
    isCorrect: { type: Boolean, default: null },
    timeSpent: Number,
    gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // if manual
    gradedAt: Date
  }],

  isGraded: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.models.QuizAttempt || mongoose.model("QuizAttempt", QuizAttemptSchema);