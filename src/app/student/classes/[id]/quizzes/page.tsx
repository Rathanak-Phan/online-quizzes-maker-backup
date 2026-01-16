// src/app/student/classes/[id]/quizzes/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import {
  BookOpen,
  Clock,
  AlertCircle,
  Trophy,
  Loader2,
  Play,
  RotateCcw,
} from "lucide-react";

/* ================= TYPES ================= */
type QuizStatus = "not-started" | "in-progress" | "completed";

interface Quiz {
  _id: string;
  title: string;
  description?: string;
  timeLimit: number;
  attemptStatus: QuizStatus;
  percentage?: number;
}

interface Stats {
  total: number;
  available: number;
  pending: number;
  completed: number;
}

const STATUS_FILTERS = [
  { label: "All", value: "all", icon: BookOpen },
  { label: "Available", value: "not-started", icon: Clock },
  { label: "Pending", value: "in-progress", icon: AlertCircle },
  { label: "Completed", value: "completed", icon: Trophy },
] as const;

/* ================= HELPER: get token from cookie ================= */
function getAuthTokenFromCookie(name: string = "token") {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? match[2] : null;
}

/* ================= DEBOUNCE ================= */
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

/* ================= COMPONENT ================= */
export default function StudentClassQuizzesPage() {
  const { id: classId } = useParams();

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] =
    useState<(typeof STATUS_FILTERS)[number]["value"]>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const debouncedSearch = useDebounce(searchTerm, 400);

  /* ================= FETCH QUIZZES ================= */
  const fetchQuizzes = async () => {
    if (!classId) return;

    try {
      setLoading(true);
      setError(null);

      const token = getAuthTokenFromCookie();

      const res = await fetch(
        `/api/student/classes/${classId}/quizzes?search=${debouncedSearch}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          cache: "no-store",
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to load quizzes");
      }

      const data = await res.json();
      setQuizzes(data.quizzes || []);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, [classId, debouncedSearch]);

  /* ================= FILTERING ================= */
  const filteredQuizzes = useMemo(() => {
    if (activeFilter === "all") return quizzes;
    return quizzes.filter((q) => q.attemptStatus === activeFilter);
  }, [quizzes, activeFilter]);

  /* ================= STATS ================= */
  const stats: Stats = useMemo(
    () => ({
      total: quizzes.length,
      available: quizzes.filter((q) => q.attemptStatus === "not-started")
        .length,
      pending: quizzes.filter((q) => q.attemptStatus === "in-progress").length,
      completed: quizzes.filter((q) => q.attemptStatus === "completed").length,
    }),
    [quizzes]
  );

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold">Class Quizzes</h1>
            <p className="text-gray-600 mt-1">
              All quizzes assigned in this class
            </p>
          </div>

          {/* Status Filters */}
          <div className="flex flex-wrap gap-3">
            {STATUS_FILTERS.map((f) => (
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

        {/* Search Input */}
        <div className="mb-6 max-w-md relative">
          <input
            type="text"
            placeholder="Search quizzes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-3 py-2 rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Mini Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 mb-12">
          <MiniStatCard title="Total" value={stats.total} icon={BookOpen} color="blue" />
          <MiniStatCard title="Available" value={stats.available} icon={Clock} color="green" />
          <MiniStatCard title="Pending" value={stats.pending} icon={AlertCircle} color="amber" />
          <MiniStatCard title="Completed" value={stats.completed} icon={Trophy} color="purple" />
        </div>

        {/* Quizzes Grid */}
        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
          </div>
        ) : error ? (
          <ErrorState error={error} onRetry={fetchQuizzes} />
        ) : filteredQuizzes.length === 0 ? (
          <EmptyState activeFilter={activeFilter} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuizzes.map((quiz) => (
              <QuizCardStudent key={quiz._id} quiz={quiz} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */
function MiniStatCard({ title, value, icon: Icon, color }: any) {
  return (
    <div className="bg-white border rounded-xl p-6 shadow-sm">
      <div
        className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4`}
        style={{ backgroundColor: `${color}20` }}
      >
        <Icon className={`text-${color}-600`} size={24} />
      </div>
      <p className="text-sm text-gray-600">{title}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}

function QuizCardStudent({ quiz }: { quiz: Quiz }) {
  return (
    <div className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition">
      <h3 className="text-xl font-semibold mb-2">{quiz.title}</h3>
      {quiz.description && <p className="text-gray-600 mb-3">{quiz.description}</p>}
      <p className="text-gray-600 mb-4">Time limit: {quiz.timeLimit} min</p>

      {quiz.attemptStatus === "completed" && (
        <p className="text-green-600 font-medium mb-3">
          Score: {quiz.percentage}%
        </p>
      )}

      <button
        onClick={() =>
          (window.location.href =
            quiz.attemptStatus === "not-started"
              ? `/student/quizzes/${quiz._id}/start`
              : quiz.attemptStatus === "in-progress"
              ? `/student/quizzes/${quiz._id}/attempt`
              : `/student/quizzes/${quiz._id}/result`)
        }
        className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-white ${
          quiz.attemptStatus === "not-started"
            ? "bg-green-600 hover:bg-green-700"
            : quiz.attemptStatus === "in-progress"
            ? "bg-yellow-500 hover:bg-yellow-600"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {quiz.attemptStatus === "not-started" && <Play size={18} />}
        {quiz.attemptStatus === "in-progress" && <RotateCcw size={18} />}
        {quiz.attemptStatus === "completed" && <Trophy size={18} />}
        {quiz.attemptStatus === "not-started"
          ? "Start Quiz"
          : quiz.attemptStatus === "in-progress"
          ? "Resume Quiz"
          : "View Result"}
      </button>
    </div>
  );
}

function ErrorState({ error, onRetry }: any) {
  return (
    <div className="text-center py-20">
      <AlertCircle className="mx-auto text-red-500 mb-4" size={64} />
      <h3 className="text-xl font-bold mb-3">Something went wrong</h3>
      <p className="text-gray-600 mb-6">{error}</p>
      <button
        onClick={onRetry}
        className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
      >
        Try Again
      </button>
    </div>
  );
}

function EmptyState({ activeFilter }: { activeFilter: string }) {
  return (
    <div className="bg-white rounded-2xl p-12 text-center border shadow-sm">
      <BookOpen className="mx-auto text-gray-400 mb-6" size={72} />
      <h3 className="text-2xl font-semibold mb-3">
        {activeFilter === "all"
          ? "No quizzes yet"
          : `No ${activeFilter.replace("-", " ")} quizzes`}
      </h3>
      <p className="text-gray-600 max-w-lg mx-auto">
        Your teacher will assign quizzes soon. Stay tuned!
      </p>
    </div>
  );
}
