// app/student/classes/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  BookOpen,
  Calendar,
  Search,
  Loader2,
  GraduationCap,
  ArrowRight,
} from "lucide-react";
import { ClassCard } from "@/app/student/components/ClassCard";
import { ClassSkeleton } from "@/app/student/components/ClassSkeleton";
import { EmptyState } from "@/app/student/components/EmptyState";

interface Class {
  _id: string;
  name: string;
  subject?: string;
  teacher: { name: string; email: string };
  studentCount: number;
  quizCount: number;
  code: string;
  createdAt: string;
}

function getAuthToken(): string | null {
  if (typeof window !== "undefined") {
    return (
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    );
  }
  return null;
}

export default function StudentClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchClasses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getAuthToken();
      const params = new URLSearchParams();
      if (searchTerm.trim()) params.set("search", searchTerm.trim());

      const res = await fetch(`/api/student/classes?${params.toString()}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        cache: "no-store",
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to load classes");
      }

      const data = await res.json();
      setClasses(data.classes || []);
    } catch (err: any) {
      console.error("Classes fetch error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const filteredClasses = classes.filter(
    (cls) =>
      cls.name.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
      (cls.subject?.toLowerCase().includes(searchTerm.toLowerCase().trim()) ??
        false)
  );

  if (error && classes.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-red-600 mb-4">
            <GraduationCap size={64} className="mx-auto" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Failed to load classes</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchClasses}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Loader2 className="animate-spin" size={18} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Classes</h1>
            <p className="text-gray-600 mt-1">
              All classes you're currently enrolled in
            </p>
          </div>

          <div className="relative w-full sm:w-80">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by name or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>
        </div>

        {/* Loading */}
        {loading && classes.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <ClassSkeleton key={i} />
            ))}
          </div>
        ) : filteredClasses.length === 0 ? (
          <EmptyState
            icon={<Users size={48} />}
            title={
              searchTerm
                ? "No matching classes found"
                : "You're not enrolled in any classes yet"
            }
            description={
              searchTerm
                ? "Try different keywords or clear the search"
                : "Ask your teacher to add you to a class using the class code"
            }
            action={
              searchTerm ? (
                <button
                  onClick={() => setSearchTerm("")}
                  className="mt-4 px-6 py-2.5 bg-gray-200 hover:bg-gray-300 rounded-lg transition"
                >
                  Clear Search
                </button>
              ) : null
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* {filteredClasses.map((cls) => (
              // <ClassCard key={cls._id} classData={cls} onClick={() => {}} />
            ))} */}
          </div>
        )}

        {/* Quick actions footer */}
        {!loading && (
          <div className="mt-12 text-center text-sm text-gray-500">
            Need to join a new class? Ask your teacher for the class code.
          </div>
        )}
      </div>
    </div>
  );
}
