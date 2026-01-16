// src/lib/models/Quiz.ts
import mongoose, { Schema, models, Document } from "mongoose";

interface IQuestion {
  _id: mongoose.Types.ObjectId;
  text: string;
  type: "multiple" | "truefalse" | "shortanswer";
  options: string[];
  correctAnswer: string | number;
  points: number;
  explanation?: string;
}

interface IQuiz extends Document {
  title: string;
  description: string;
  status: "draft" | "published" | "archived";
  category: string;
  timeLimit: number;
  isTemplate: boolean;
  createdBy: mongoose.Types.ObjectId;
  questions: IQuestion[];
  avgScore?: number;
  lastUsed?: Date;
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  password?: string;
  assignedToClasses: mongoose.Types.ObjectId[];
}

const QuestionSchema = new Schema<IQuestion>(
  {
    text: {
      type: String,
      required: [true, "Question text is required"],
      trim: true,
    },
    type: {
      type: String,
      enum: ["multiple", "truefalse", "shortanswer"],
      required: true,
    },
    options: {
      type: [String],
      default: [],
      validate: {
        validator: function (this: any, val: string[]) {
          if (this.type === "multiple") return val.length >= 2;
          if (this.type === "truefalse") return val.length === 2;
          return true;
        },
        message: "Invalid number of options for question type",
      },
    },
    correctAnswer: {
      type: Schema.Types.Mixed,
      required: true,
      validate: {
        validator: function (this: any, value: any) {
          if (this.type === "multiple") return Number.isInteger(value) && value >= 0;
          if (this.type === "truefalse") return value === "True" || value === "False";
          if (this.type === "shortanswer") return typeof value === "string" && value.trim() !== "";
          return false;
        },
        message: "Correct answer format doesn't match question type",
      },
    },
    points: {
      type: Number,
      min: 1,
      default: 1,
    },
    explanation: {
      type: String,
      trim: true,
    },
  },
  { _id: true }
);

const QuizSchema = new Schema<IQuiz>(
  {
    title: {
      type: String,
      required: [true, "Quiz title is required"],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      default: "",
      maxlength: 2000,
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
      index: true,
    },
    category: {
      type: String,
      default: "General",
      trim: true,
    },
    timeLimit: {
      type: Number,
      min: 0,
      default: 30,
    },
    isTemplate: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Quiz must have a creator"],
      index: true,
    },
    questions: {
      type: [QuestionSchema],
      default: [],
      validate: [(val: any[]) => val.length > 0, "Quiz must have at least one question"],
    },
    avgScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    lastUsed: {
      type: Date,
      default: null,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      default: null,
    },
    assignedToClasses: [{
      type: Schema.Types.ObjectId,
      ref: "Class"
    }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for total points
QuizSchema.virtual("totalPoints").get(function (this: IQuiz) {
  return this.questions.reduce((sum, q) => sum + (q.points || 1), 0);
});

// Pre-save hook - CLEANED UP (removed next())
QuizSchema.pre("save", async function () {
  this.questions.forEach((q) => {
    if (q.type === "multiple" && typeof q.correctAnswer !== "number") {
      q.correctAnswer = Number(q.correctAnswer);
    }
  });
});

const Quiz = models.Quiz || mongoose.model<IQuiz>("Quiz", QuizSchema);
export default Quiz;