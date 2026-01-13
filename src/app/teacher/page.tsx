"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  School,
  Users,
  FileText,
  Clock,
} from "lucide-react";

type Teacher = {
  _id: string;
  name: string;
  email: string;
  role: string;
};

type Stats = {
  totalClasses: number;
  totalStudents: number;
  activeQuizzes: number;
  pendingReviews: number;
};

type ClassItem = {
  _id: string;
  name: string;
  students?: any[];
};

export default function Page() {
  const router = useRouter();

  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [stats, setStats] = useState<Stats>({
    totalClasses: 0,
    totalStudents: 0,
    activeQuizzes: 0,
    pendingReviews: 0,
  });
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        // 🔐 Get logged-in user
        const meRes = await fetch("/api/auth/me", {
          credentials: "include",
        });

        if (!meRes.ok) {
          router.replace("/login");
          return;
        }

        const me = await meRes.json();

        if (me.role !== "teacher") {
          router.replace("/");
          return;
        }

        setTeacher(me);

        // 📊 Stats (optional API)
        try {
          const statsRes = await fetch("/api/teacher/stats", {
            credentials: "include",
          });
          if (statsRes.ok) {
            const data = await statsRes.json();
            setStats(data.stats);
          }
        } catch {}

        // 📚 Classes (optional API)
        try {
          const classRes = await fetch("/api/teacher/classes", {
            credentials: "include",
          });
          if (classRes.ok) {
            const data = await classRes.json();
            setClasses(data.classes || []);
          }
        } catch {}

      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [router]);

  if (loading) {
    return <div className="p-10 text-xl">Loading dashboard...</div>;
  }

  if (!teacher) return null;

  return (
    <div className="space-y-10">
      {/* Welcome */}
      <h1 className="text-4xl font-bold">
        Welcome back, {teacher.name}!
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-blue-100 p-6 rounded-xl text-center">
          <School className="mx-auto mb-2 w-6 h-6" />
          <p className="text-2xl font-bold">{stats.totalClasses}</p>
          <p>Total Classes</p>
        </div>

        <div className="bg-green-100 p-6 rounded-xl text-center">
          <Users className="mx-auto mb-2 w-6 h-6" />
          <p className="text-2xl font-bold">{stats.totalStudents}</p>
          <p>Total Students</p>
        </div>

        <div className="bg-purple-100 p-6 rounded-xl text-center">
          <FileText className="mx-auto mb-2 w-6 h-6" />
          <p className="text-2xl font-bold">{stats.activeQuizzes}</p>
          <p>Active Quizzes</p>
        </div>

        <div className="bg-yellow-100 p-6 rounded-xl text-center">
          <Clock className="mx-auto mb-2 w-6 h-6" />
          <p className="text-2xl font-bold">{stats.pendingReviews}</p>
          <p>Pending Reviews</p>
        </div>
      </div>

      {/* Classes */}
      <div>
        <h2 className="text-2xl font-bold mb-4">My Classes</h2>

        {classes.length === 0 ? (
          <p>No classes yet. Create your first one!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {classes.map((cls) => (
              <div
                key={cls._id}
                className="p-4 bg-white rounded-xl shadow-md"
              >
                <h3 className="font-bold">{cls.name}</h3>
                <p>{cls.students?.length || 0} students</p>

                <Link
                  href={`/teacher/classes/${cls._id}`}
                  className="text-blue-600 hover:underline"
                >
                  View Class
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
