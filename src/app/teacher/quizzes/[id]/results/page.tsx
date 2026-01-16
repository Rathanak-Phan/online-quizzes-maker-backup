// src/app/teacher/quizzes/[id]/results/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  Users,
  Trophy,
  BarChart3,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface QuizAttempt {
  _id: string;
  student: {
    _id: string;
    name: string; // populated from User
  };
  status: "not-started" | "in-progress" | "submitted" | "pending" | "completed";
  score: number;
  totalPoints: number;
  percentage: number;
  timeSpent: number;
  submittedAt?: string;
  isGraded: boolean;
}

export default function QuizResultsPage() {
  const { id: quizId } = useParams();
  const router = useRouter();

  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [quizTitle, setQuizTitle] = useState<string>("Loading...");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Statistics (only completed & graded attempts)
  const stats = useMemo(() => {
    const gradedAttempts = attempts.filter(
      a => a.status === "completed" && a.isGraded && a.percentage > 0
    );

    const percentages = gradedAttempts.map(a => a.percentage);

    if (percentages.length === 0) {
      return {
        average: 0,
        highest: 0,
        lowest: 0,
        passRate: 0,
        totalGraded: 0,
        pending: attempts.filter(a => a.status === "pending").length,
      };
    }

    const sum = percentages.reduce((a, b) => a + b, 0);
    const average = sum / percentages.length;

    return {
      average: Number(average.toFixed(1)),
      highest: Math.max(...percentages),
      lowest: Math.min(...percentages),
      passRate: Math.round((percentages.filter(p => p >= 70).length / percentages.length) * 100),
      totalGraded: percentages.length,
      pending: attempts.filter(a => a.status === "pending").length,
    };
  }, [attempts]);

  useEffect(() => {
    if (!quizId) return;
    fetchResults();
  }, [quizId]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/teacher/quizzes/${quizId}/results`, {
        credentials: "include",
        cache: "no-store",
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/teacher/login?redirect=/teacher/quizzes");
          return;
        }

        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData?.error ||
          `Failed to load results (${response.status})`
        );
      }

      const data = await response.json();

      setQuizTitle(data.quizTitle || "Quiz Results");
      setAttempts(data.attempts || []);
    } catch (err: any) {
      console.error("Fetch results error:", err);
      setError(err.message || "Failed to load quiz results");

      // Dev fallback with mock data
      if (process.env.NODE_ENV === "development") {
        console.warn("Using mock data for development");
        setAttempts(getMockAttempts());
        setQuizTitle("Development Mock Results");
        setError(null);
      }
    } finally {
      setLoading(false);
    }
  };

  // Mock data for development (updated for QuizAttempt)
  const getMockAttempts = (): QuizAttempt[] => [
    {
      _id: "att1",
      student: { _id: "s1", name: "Sokha Meas" },
      status: "completed",
      score: 46,
      totalPoints: 50,
      percentage: 92,
      timeSpent: 1620,
      submittedAt: new Date(Date.now() - 3600000).toISOString(),
      isGraded: true,
    },
    {
      _id: "att2",
      student: { _id: "s2", name: "Vannak Chheang" },
      status: "completed",
      score: 39,
      totalPoints: 50,
      percentage: 78,
      timeSpent: 1980,
      submittedAt: new Date(Date.now() - 86400000).toISOString(),
      isGraded: true,
    },
    {
      _id: "att3",
      student: { _id: "s3", name: "Chanthy Kim" },
      status: "pending",
      score: 32,
      totalPoints: 50,
      percentage: 64,
      timeSpent: 1440,
      submittedAt: new Date(Date.now() - 172800000).toISOString(),
      isGraded: false,
    },
    {
      _id: "att4",
      student: { _id: "s4", name: "Rithy Sam" },
      status: "completed",
      score: 48,
      totalPoints: 50,
      percentage: 96,
      timeSpent: 1380,
      submittedAt: new Date().toISOString(),
      isGraded: true,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading quiz results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/teacher/quizzes"
              className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
            >
              <ArrowLeft size={18} />
              Back
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {quizTitle}
            </h1>
          </div>

          <button
            onClick={() => alert("Export coming soon!")}
            disabled={attempts.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Download size={18} />
            Export Results
          </button>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-start gap-3">
            <AlertCircle className="mt-0.5" size={18} />
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
          <StatCard title="Average Score" value={`${stats.average}%`} icon={<BarChart3 className="w-8 h-8 text-blue-500" />} />
          <StatCard title="Highest" value={`${stats.highest}%`} icon={<Trophy className="w-8 h-8 text-yellow-500" />} />
          <StatCard title="Total Graded" value={stats.totalGraded.toString()} icon={<Users className="w-8 h-8 text-purple-500" />} />
          <StatCard title="Pass Rate" value={`${stats.passRate}%`} icon={<CheckCircle className="w-8 h-8 text-green-500" />} />
          <StatCard title="Pending Grading" value={stats.pending.toString()} icon={<AlertCircle className="w-8 h-8 text-orange-500" />} />
        </div>

        {/* Results Table */}
        {attempts.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">
                Student Attempts ({attempts.length})
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Percentage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time Spent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {attempts.map((attempt) => (
                    <tr key={attempt._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {attempt.student?.name || "Anonymous"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                          attempt.status === "completed" && attempt.isGraded
                            ? "bg-green-100 text-green-800"
                            : attempt.status === "pending"
                            ? "bg-orange-100 text-orange-800"
                            : attempt.status === "in-progress"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}>
                          {attempt.status === "completed" && attempt.isGraded
                            ? "Graded"
                            : attempt.status.charAt(0).toUpperCase() + attempt.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {attempt.score} / {attempt.totalPoints}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {attempt.percentage.toFixed(1)}%
                          </span>
                          {attempt.percentage >= 70 ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {Math.floor(attempt.timeSpent / 60)}m {attempt.timeSpent % 60}s
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {attempt.submittedAt
                          ? new Date(attempt.submittedAt).toLocaleString("en-US", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() =>
                            router.push(`/teacher/quizzes/${quizId}/results/${attempt._id}`)
                          }
                          className="text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No attempts yet
            </h3>
            <p className="text-gray-600 mb-6">
              Students haven't taken this quiz.
            </p>
            <Link
              href="/teacher/quizzes"
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Back to Quizzes
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        {icon}
      </div>
    </div>
  );
}