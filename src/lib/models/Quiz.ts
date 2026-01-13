// src/lib/models/Quiz.ts
import mongoose, { Schema, models } from "mongoose";

/* =========================
   Question Sub Schema
========================= */
const QuestionSchema = new Schema(
  {
    text: { type: String, required: true },

    type: {
      type: String,
      enum: ["multiple", "truefalse", "shortanswer"],
      required: true,
    },

    options: {
      type: [String],
      default: [],
    },

    correctAnswer: {
      type: Schema.Types.Mixed,
      required: true,
    },

    points: {
      type: Number,
      default: 1,
    },

    explanation: String,
  },
  { _id: false }
);

/* =========================
   Quiz Schema
========================= */
const QuizSchema = new Schema(
  {
    title: { type: String, required: true },

    description: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["active", "draft", "archived"],
      default: "draft",
    },

    category: {
      type: String,
      default: "",
    },

    timeLimit: {
      type: Number,
      default: 30, // minutes
    },

    isTemplate: {
      type: Boolean,
      default: false,
    },

    questions: {
      type: [QuestionSchema],
      default: [],
    },

    avgScore: {
      type: Number,
      default: null,
    },

    lastUsed: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

/* =========================
   Model Export (IMPORTANT)
========================= */
const Quiz = models.Quiz || mongoose.model("Quiz", QuizSchema);
export default Quiz;
