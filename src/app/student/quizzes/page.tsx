"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Clock, CheckCircle, AlertCircle, BookOpen,
  Search, Filter, Loader2, Trophy,
} from "lucide-react";
import { QuizCardStudent } from "@/components/student/QuizCardStudent";

type QuizStatus = "not-started" | "in-progress" | "pending" | "completed";

interface StudentQuiz {
  _id: string;
  title: string;
  description?: string;
  timeLimit: number;
  totalPoints: number;
  category: string;
  attemptStatus: QuizStatus;
  score?: number;
  percentage?: number;
  submittedAt?: string;
}

const STATUS_FILTERS = [
  { value: "all", label: "All", icon: BookOpen },
  { value: "available", label: "Available", icon: Clock },
  { value: "pending", label: "In Progress", icon: AlertCircle },
  { value: "completed", label: "Completed", icon: CheckCircle },
] as const;

export default function StudentQuizzesPage() {
  const [quizzes, setQuizzes] = useState<StudentQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<"all" | "available" | "pending" | "completed">("all");

  const fetchQuizzes = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      let url = "/api/student/quizzes/available";

      if (activeFilter === "pending") url = "/api/student/quizzes/pending";
      if (activeFilter === "completed") url = "/api/student/quizzes/completed";

      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) throw new Error("Failed to load quizzes");

      const data = await res.json();

      const items =
        activeFilter === "all" ? data.quizzes || [] :
        activeFilter === "completed" ? data.completed || [] :
        activeFilter === "pending" ? data.pending || [] :
        data.quizzes?.filter((q: StudentQuiz) =>
          ["not-started", "in-progress"].includes(q.attemptStatus)
        ) || [];

      setQuizzes(items);
    } catch (err: any) {
      setError(err.message || "Couldn't load quizzes");
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  const stats = useMemo(() => ({
    total: quizzes.length,
    available: quizzes.filter(q => ["not-started", "in-progress"].includes(q.attemptStatus)).length,
    pending: quizzes.filter(q => ["in-progress", "pending"].includes(q.attemptStatus)).length,
    completed: quizzes.filter(q => q.attemptStatus === "completed").length,
  }), [quizzes]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold">My Quizzes</h1>
            <p className="text-gray-600 mt-1">Manage and track all your assessments</p>
          </div>

          <div className="flex flex-wrap gap-3">
            {STATUS_FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => setActiveFilter(f.value)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all ${
                  activeFilter === f.value
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-white border hover:bg-gray-50"
                }`}
              >
                <f.icon size={18} />
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mini Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 mb-12">
          <MiniStatCard title="Total" value={stats.total} icon={BookOpen} color="blue" />
          <MiniStatCard title="Available" value={stats.available} icon={Clock} color="green" />
          <MiniStatCard title="Pending" value={stats.pending} icon={AlertCircle} color="amber" />
          <MiniStatCard title="Completed" value={stats.completed} icon={Trophy} color="purple" />
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <AlertCircle className="mx-auto text-red-500 mb-4" size={64} />
            <h3 className="text-xl font-bold mb-3">Something went wrong</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={fetchQuizzes}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        ) : quizzes.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border shadow-sm">
            <BookOpen className="mx-auto text-gray-400 mb-6" size={72} />
            <h3 className="text-2xl font-semibold mb-3">
              {activeFilter === "all" ? "No quizzes yet" : `No ${activeFilter} quizzes`}
            </h3>
            <p className="text-gray-600 max-w-lg mx-auto">
              {activeFilter === "all"
                ? "Your teacher will assign quizzes soon. Stay tuned!"
                : "Come back later when you have some activity here."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map(quiz => (
              <QuizCardStudent
                key={quiz._id}
                quiz={quiz}
                onAction={
                  quiz.attemptStatus === "not-started"
                    ? () => window.location.href = `/student/quizzes/${quiz._id}/start`
                    : quiz.attemptStatus === "in-progress"
                    ? () => window.location.href = `/student/quizzes/${quiz._id}/attempt`
                    : undefined
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MiniStatCard({ title, value, icon: Icon, color }: any) {
  return (
    <div className="bg-white border rounded-xl p-6 shadow-sm">
      <div className={`w-12 h-12 rounded-lg bg-${color}-100 flex items-center justify-center mb-4`}>
        <Icon className={`text-${color}-600`} size={24} />
      </div>
      <p className="text-sm text-gray-600">{title}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}