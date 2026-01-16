// app/teacher/quizzes/[id]/preview/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, AlertCircle, Loader2 } from "lucide-react";

interface Question {
  _id: string;
  text: string;
  type: "multiple" | "truefalse" | "shortanswer";
  options: string[];
  points: number;
}

export default function QuizPreviewPage() {
  const { id } = useParams();
  const router = useRouter();

  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await fetch(`/api/teacher/quizzes/${id}`, {
          credentials: "include",
        });

        if (!res.ok) throw new Error("Failed to load quiz");

        const data = await res.json();
        setQuiz(data.quiz);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Couldn't load preview</h2>
          <p className="text-gray-600 mb-6">{error || "Quiz not found"}</p>
          <Link
            href="/teacher/quizzes"
            className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg"
          >
            Back to Quizzes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/teacher/quizzes"
            className="text-indigo-600 hover:text-indigo-800 flex items-center gap-2 mb-4"
          >
            <ArrowLeft size={18} />
            Back to quizzes
          </Link>

          <div className="flex items-start justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{quiz.title}</h1>
              {quiz.description && (
                <p className="mt-3 text-gray-600">{quiz.description}</p>
              )}
            </div>

            {quiz.timeLimit > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-800 rounded-lg">
                <Clock size={20} />
                <span>{quiz.timeLimit} minutes</span>
              </div>
            )}
          </div>

          <div className="mt-4 flex gap-3 flex-wrap">
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
              {quiz.questions.length} questions
            </span>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
              {quiz.category || "General"}
            </span>
          </div>
        </div>

        {/* Questions Preview */}
        <div className="space-y-10">
          {quiz.questions.map((q: Question, index: number) => (
            <div
              key={q._id || index} // ✅ Now _id exists
              className="bg-white rounded-xl shadow-sm p-6 border"
            >
              <div className="flex items-start gap-4 mb-4">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-medium">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    {q.text}
                  </h3>

                  {q.type === "multiple" && (
                    <div className="space-y-3 mt-4">
                      {q.options.map((opt: string, i: number) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50"
                        >
                          <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex-shrink-0" />
                          <span>{opt}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {q.type === "truefalse" && (
                    <div className="flex gap-6 mt-4">
                      <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 flex-1">
                        <div className="w-6 h-6 rounded-full border-2 border-gray-300" />
                        <span>True</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 flex-1">
                        <div className="w-6 h-6 rounded-full border-2 border-gray-300" />
                        <span>False</span>
                      </div>
                    </div>
                  )}

                  {q.type === "shortanswer" && (
                    <div className="mt-4">
                      <div className="p-4 border border-dashed rounded-lg bg-gray-50">
                        <p className="text-gray-500 italic">
                          Students will type their answer here...
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 text-sm text-gray-500">
                    {q.points} point{q.points !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          This is a preview — students will see the same layout during the quiz
        </div>
      </div>
    </div>
  );
}
