import mongoose from "mongoose";

const ScoreSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  score: { type: Number, default: 0 },
  status: { type: String, enum: ["pending","completed"], default: "pending" },
});

const ChallengeSchema = new mongoose.Schema({
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: "QuizTemplate" },
  class: { type: mongoose.Schema.Types.ObjectId, ref: "Class" },
  scores: [ScoreSchema],
}, { timestamps: true });

export default mongoose.models.Challenge || mongoose.model("Challenge", ChallengeSchema);
