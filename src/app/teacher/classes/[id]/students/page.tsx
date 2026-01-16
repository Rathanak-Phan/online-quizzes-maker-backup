// src/app/teacher/classes/[id]/students/page.tsx
"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Search, Plus } from "lucide-react";
import { useState, useEffect } from "react";

interface Student {
  _id: string;
  name: string;
  email: string;
  joinedAt: string;
  quizzesCompleted: number;
  avgScore: number;
  inClass?: boolean;
}

export default function ClassStudentsPage() {
  const { id: classId } = useParams();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [addingId, setAddingId] = useState<string | null>(null);

  useEffect(() => {
    fetchStudents();
  }, [classId]);

  const fetchStudents = async () => {
    if (!classId) return;
    try {
      // 1️⃣ Get students already in this class
      const res = await fetch(`/api/teacher/classes/${classId}/students`);
      if (!res.ok) throw new Error("Failed to fetch students in class");
      const data = await res.json();
      const studentsInClassIds = data.students.map((s: Student) => s._id);

      // 2️⃣ Get all users in the system
      const allRes = await fetch(`/api/admin/users`);
      if (!allRes.ok) throw new Error("Failed to fetch all users");
      const allData = await allRes.json();

      // 3️⃣ Filter to only students (role === "user") and mark if already in class
      const allStudents: Student[] = allData.users
        .filter((u: any) => u.role === "user")
        .map((s: any) => ({
          ...s,
          inClass: studentsInClassIds.includes(s._id),
          quizzesCompleted: s.quizzes?.length || 0,
          avgScore: s.avgScore || 0,
          joinedAt: s.createdAt,
        }));

      setStudents(allStudents);
    } catch (err) {
      console.error(err);
      alert("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const addToClass = async (studentId: string) => {
    if (!classId) return;
    try {
      setAddingId(studentId);
      const res = await fetch(`/api/teacher/classes/${classId}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to add student");

      setStudents((prev) =>
        prev.map((s) => (s._id === studentId ? { ...s, inClass: true } : s))
      );
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to add student");
    } finally {
      setAddingId(null);
    }
  };

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="text-center py-20">Loading students...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link href={`/teacher/classes/${classId}`} className="inline-flex items-center gap-2 text-blue-600 mb-6">
        ← Back to Class
      </Link>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Students ({students.length})</h1>
      </div>

      <div className="relative max-w-md mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search students..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-5 py-3 border rounded-xl bg-gray-50"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-6 font-medium text-gray-700">Name</th>
              <th className="text-left p-6 font-medium text-gray-700">Email</th>
              <th className="text-left p-6 font-medium text-gray-700">Joined</th>
              <th className="text-left p-6 font-medium text-gray-700">Quizzes</th>
              <th className="text-left p-6 font-medium text-gray-700">Avg Score</th>
              <th className="p-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((student) => (
              <tr key={student._id} className="border-b hover:bg-gray-50">
                <td className="p-6 font-medium">{student.name}</td>
                <td className="p-6 text-gray-600">{student.email}</td>
                <td className="p-6 text-gray-600">{new Date(student.joinedAt).toLocaleDateString()}</td>
                <td className="p-6">{student.quizzesCompleted}</td>
                <td className="p-6 font-medium text-green-600">{student.avgScore}%</td>
                <td className="p-6 text-right">
                  {student.inClass ? (
                    <span className="text-gray-500">Added</span>
                  ) : (
                    <button
                      onClick={() => addToClass(student._id)}
                      disabled={addingId === student._id}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4" />
                      {addingId === student._id ? "Adding..." : "Add"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500">
                  No students found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
