// src/app/teacher/classes/[id]/quizzes/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Search, Plus, MoreVertical } from "lucide-react";

interface Quiz {
  _id: string;
  title: string;
  avgScore: number;
  status: "draft" | "published";
}

export default function ClassQuizzesPage() {
  const { id: classId } = useParams();
  const [classQuizzes, setClassQuizzes] = useState<Quiz[]>([]);
  const [allQuizzes, setAllQuizzes] = useState<Quiz[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [addingQuizId, setAddingQuizId] = useState<string | null>(null);

  useEffect(() => {
    fetchClassQuizzes();
    fetchAllQuizzes();
  }, [classId]);

  const fetchClassQuizzes = async () => {
    if (!classId) return;
    try {
      const res = await fetch(`/api/teacher/classes/${classId}/quizzes`);
      if (!res.ok) throw new Error("Failed to fetch class quizzes");
      const data = await res.json();
      setClassQuizzes(data.quizzes || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load class quizzes");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllQuizzes = async () => {
    try {
      const res = await fetch("/api/teacher/quizzes"); // all quizzes created by teacher
      if (!res.ok) throw new Error("Failed to fetch all quizzes");
      const data = await res.json();
      setAllQuizzes(data.quizzes || []);
    } catch (err) {
      console.error(err);
    }
  };

  const addQuizToClass = async (quizId: string) => {
    if (!classId) return;
    setAddingQuizId(quizId);
    try {
      const res = await fetch(`/api/teacher/classes/${classId}/quizzes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quizId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed");
      fetchClassQuizzes(); // refresh class quizzes
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Failed to add quiz");
    } finally {
      setAddingQuizId(null);
    }
  };

  const availableQuizzes = allQuizzes.filter(
    (q) => !classQuizzes.some((cq) => cq._id === q._id) &&
      q.title.toLowerCase().includes(search.toLowerCase())
  );

  if (loading)
    return <div className="text-center py-20">Loading quizzes...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link
        href={`/teacher/classes/${classId}`}
        className="inline-flex items-center gap-2 text-blue-600 mb-6"
      >
        ← Back to Class
      </Link>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">
          Class Quizzes ({classQuizzes.length})
        </h1>
      </div>

      {/* Search all quizzes */}
      <div className="relative max-w-md mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search quizzes to add..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-5 py-3 border rounded-xl bg-gray-50"
        />
      </div>

      {/* Available quizzes to add */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden mb-10">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-6 font-medium text-gray-700">Title</th>
              <th className="text-left p-6 font-medium text-gray-700">Status</th>
              <th className="p-6"></th>
            </tr>
          </thead>
          <tbody>
            {availableQuizzes.length === 0 && (
              <tr>
                <td colSpan={3} className="p-6 text-center text-gray-500">
                  No quizzes to add.
                </td>
              </tr>
            )}
            {availableQuizzes.map((quiz) => (
              <tr key={quiz._id} className="border-b hover:bg-gray-50">
                <td className="p-6">{quiz.title}</td>
                <td className="p-6 capitalize">{quiz.status}</td>
                <td className="p-6">
                  <button
                    onClick={() => addQuizToClass(quiz._id)}
                    disabled={addingQuizId === quiz._id}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                    {addingQuizId === quiz._id ? "Adding..." : "Add"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Already added quizzes */}
      <h2 className="text-2xl font-semibold mb-4">Quizzes in this Class</h2>
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-6 font-medium text-gray-700">Title</th>
              <th className="text-left p-6 font-medium text-gray-700">Avg Score</th>
              <th className="text-left p-6 font-medium text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {classQuizzes.length === 0 && (
              <tr>
                <td colSpan={3} className="p-6 text-center text-gray-500">
                  No quizzes added to this class yet.
                </td>
              </tr>
            )}
            {classQuizzes.map((quiz) => (
              <tr key={quiz._id} className="border-b hover:bg-gray-50">
                <td className="p-6">{quiz.title}</td>
                <td className="p-6 font-medium text-green-600">{quiz.avgScore}%</td>
                <td className="p-6 capitalize">{quiz.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
