// src/lib/models/Challenge.ts
import mongoose from "mongoose";

const ScoreSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  score: { type: Number, default: 0 },
  status: { type: String, enum: ["pending","completed"], default: "pending" },
});

const ChallengeSchema = new mongoose.Schema({
  title: { type: String },
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
  class: { type: mongoose.Schema.Types.ObjectId, ref: "Class" },
  startTime: { type: Date },
  endTime: { type: Date },
  isActive: { type: Boolean, default: true },
  leaderboard: [{
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    score: Number,
    percentage: Number,
    timeSpent: Number,
    submittedAt: Date
  }],
  scores: [ScoreSchema],
}, { timestamps: true });

export default mongoose.models.Challenge || mongoose.model("Challenge", ChallengeSchema);