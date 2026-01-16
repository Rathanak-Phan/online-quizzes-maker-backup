// app/student/results/[attemptId]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Trophy,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  BookOpen,
} from "lucide-react";

interface QuestionResult {
  questionId: string;
  text: string;
  type: "multiple" | "truefalse" | "shortanswer";
  options?: string[];
  correctAnswer: string | number;
  selected: any;
  isCorrect: boolean | null;
  points: number;
  earnedPoints: number;
  explanation?: string;
}

export default function StudentResultPage() {
  const { attemptId } = useParams();
  const router = useRouter();

  const [result, setResult] = useState<any>(null);
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!attemptId) return;
    fetchResult();
  }, [attemptId]);

  const fetchResult = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/student/results/${attemptId}`, {
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 404) throw new Error("Result not found");
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error("Failed to load result");
      }

      const data = await response.json();
      setResult(data.attempt);
      setQuiz(data.quiz);
    } catch (err: any) {
      setError(err.message || "Failed to load result");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error || !result || !quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Result Not Found</h2>
          <p className="text-gray-600 mb-6">{error || "This result may have been deleted."}</p>
          <Link
            href="/student/dashboard"
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const totalQuestions = quiz.questions.length;
  const correctCount = result.answers.filter((a: any) => a.isCorrect === true).length;
  const pendingCount = result.answers.filter((a: any) => a.isCorrect === null).length;
  const scorePercentage = result.percentage.toFixed(1);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/student/dashboard"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Quiz Result</h1>
          <p className="text-xl text-gray-700 mt-2">{quiz.title}</p>
        </div>

        {/* Score Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 text-center">
          <div className="mb-6">
            {result.percentage >= 70 ? (
              <Trophy className="w-20 h-20 text-yellow-500 mx-auto" />
            ) : result.status === "pending" ? (
              <AlertCircle className="w-20 h-20 text-orange-500 mx-auto" />
            ) : (
              <XCircle className="w-20 h-20 text-red-500 mx-auto" />
            )}
          </div>

          <div className="text-6xl font-bold text-gray-900 mb-2">
            {scorePercentage}%
          </div>
          <p className="text-2xl text-gray-700 mb-4">
            {result.score} / {result.totalPoints} points
          </p>

          <div className="flex justify-center gap-8 text-sm">
            <div>
              <p className="text-gray-500">Correct</p>
              <p className="text-2xl font-semibold text-green-600">
                {correctCount}
              </p>
            </div>
            {pendingCount > 0 && (
              <div>
                <p className="text-gray-500">Pending</p>
                <p className="text-2xl font-semibold text-orange-600">
                  {pendingCount}
                </p>
              </div>
            )}
            <div>
              <p className="text-gray-500">Time Taken</p>
              <p className="text-2xl font-semibold text-indigo-600">
                {Math.floor(result.timeSpent / 60)}m {result.timeSpent % 60}s
              </p>
            </div>
          </div>

          {result.status === "pending" && (
            <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-orange-800 font-medium">
                This quiz contains short-answer questions that need manual grading by your teacher.
              </p>
              <p className="text-orange-700 text-sm mt-1">
                Final score will be updated once grading is complete.
              </p>
            </div>
          )}
        </div>

        {/* Questions Review */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6" />
            Question Review
          </h2>

          {quiz.questions.map((q: any, index: number) => {
            const answer = result.answers.find(
              (a: any) => a.questionId.toString() === q._id.toString()
            );

            const isCorrect = answer?.isCorrect === true;
            const isPending = answer?.isCorrect === null;
            const selected = answer?.selected;

            return (
              <div
                key={q._id}
                className={`bg-white rounded-xl shadow-sm p-6 border-2 ${
                  isCorrect
                    ? "border-green-500"
                    : isPending
                    ? "border-orange-400"
                    : "border-red-400"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Question {index + 1}
                  </h3>
                  <div className="flex items-center gap-2">
                    {isCorrect && <CheckCircle className="w-6 h-6 text-green-500" />}
                    {isPending && <AlertCircle className="w-6 h-6 text-orange-500" />}
                    {!isCorrect && !isPending && <XCircle className="w-6 h-6 text-red-500" />}
                    <span className="font-medium">
                      {isCorrect ? q.points : isPending ? "?" : 0} / {q.points} pts
                    </span>
                  </div>
                </div>

                <p className="text-gray-800 mb-4">{q.text}</p>

                {/* Show options for multiple/truefalse */}
                {(q.type === "multiple" || q.type === "truefalse") && (
                  <div className="space-y-2 mb-4">
                    {q.options.map((opt: string, i: number) => {
                      const isSelected = selected === i || selected === opt;
                      const isCorrectAnswer = 
                        (q.type === "multiple" && i === q.correctAnswer) ||
                        (q.type === "truefalse" && opt === q.correctAnswer);

                      return (
                        <div
                          key={i}
                          className={`p-3 rounded-lg border ${
                            isCorrectAnswer
                              ? "bg-green-50 border-green-400"
                              : isSelected && !isCorrectAnswer
                              ? "bg-red-50 border-red-400"
                              : "border-gray-200"
                          }`}
                        >
                          <span className="font-medium">{opt}</span>
                          {isCorrectAnswer && (
                            <span className="ml-3 text-green-700 text-sm font-medium">
                              ✓ Correct Answer
                            </span>
                          )}
                          {isSelected && !isCorrectAnswer && (
                            <span className="ml-3 text-red-700 text-sm font-medium">
                              ✗ Your Answer
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Short answer */}
                {q.type === "shortanswer" && (
                  <div className="mb-4">
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-300">
                      <p className="text-sm text-gray-600 mb-1">Your Answer:</p>
                      <p className="font-medium">{selected || "No answer"}</p>
                    </div>
                    {isPending && (
                      <p className="mt-3 text-orange-700 text-sm font-medium">
                        ⏳ Awaiting teacher grading...
                      </p>
                    )}
                  </div>
                )}

                {/* Explanation */}
                {q.explanation && (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-indigo-600 hover:text-indigo-700 font-medium">
                      Show Explanation
                    </summary>
                    <p className="mt-2 text-gray-700 bg-indigo-50 p-4 rounded-lg">
                      {q.explanation}
                    </p>
                  </details>
                )}
              </div>
            );
          })}
        </div>

        {/* Back Button */}
        <div className="mt-12 text-center">
          <Link
            href="/student/dashboard"
            className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium text-lg"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}