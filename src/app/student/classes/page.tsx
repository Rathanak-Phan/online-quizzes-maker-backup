// src/app/students/classes/page.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Users, BookOpen, Search, Loader2, GraduationCap,
  ArrowRight, AlertCircle,
} from "lucide-react";
import { ClassCard } from "@/app/student/components/ClassCard";
import { ClassSkeleton } from "@/app/student/components/ClassSkeleton";
import { EmptyState } from "@/app/student/components/EmptyState";

interface ClassItem {
  _id: string;
  name: string;
  subject?: string;
  teacher: { name: string };
  studentCount: number;
  quizCount: number;
  code: string;
  createdAt: string;
}

function getAuthToken() {
  return typeof window !== "undefined"
    ? localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    : null;
}

export default function StudentClassesPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const debouncedSearch = useDebounce(searchTerm, 400);

  const fetchClasses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getAuthToken();
      const params = new URLSearchParams();
      if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());

      const res = await fetch(`/api/student/classes?${params}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: "no-store",
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Failed (${res.status})`);
      }

      const data = await res.json();
      setClasses(data.classes || []);
    } catch (err: any) {
      setError(err.message || "Couldn't load your classes");
      setClasses([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const filteredClasses = useMemo(() => {
    if (!debouncedSearch) return classes;
    const term = debouncedSearch.toLowerCase();
    return classes.filter(
      c =>
        c.name.toLowerCase().includes(term) ||
        (c.subject?.toLowerCase().includes(term) ?? false) ||
        c.teacher.name.toLowerCase().includes(term)
    );
  }, [classes, debouncedSearch]);

  if (error && classes.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <AlertCircle className="mx-auto text-red-500 mb-6" size={64} />
          <h2 className="text-2xl font-bold mb-3">Failed to load classes</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">{error}</p>
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
            <p className="text-gray-600 mt-1">All classes you're enrolled in</p>
          </div>

          <div className="relative w-full sm:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search classes..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition shadow-sm"
            />
          </div>
        </div>

        {loading && classes.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => <ClassSkeleton key={i} />)}
          </div>
        ) : filteredClasses.length === 0 ? (
          <EmptyState
            title={debouncedSearch ? "No matching classes" : "No classes yet"}
            description={
              debouncedSearch
                ? "Try different keywords or clear search"
                : "Ask your teacher to enroll you in a class"
            }
            action={
              debouncedSearch ? (
                <button
                  onClick={() => setSearchTerm("")}
                  className="mt-4 px-6 py-2.5 bg-gray-200 hover:bg-gray-300 rounded-lg"
                >
                  Clear Search
                </button>
              ) : null
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClasses.map(cls => (
              <ClassCard
                key={cls._id}
                classData={cls}
                href={`/student/classes/${cls._id}/quizzes`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Simple debounce helper (you can also put it in utils)
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}