"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function AdminPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTeachers: 0,
    pendingApproval: 0,
    totalQuizzes: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/stats");
        if (!res.ok) throw new Error("Failed to fetch stats");
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold text-gray-900">Welcome back, Admin!</h1>
      <p className="text-gray-600 mt-2 text-lg">
        Here's what's happening in your platform today.
      </p>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <h3 className="text-lg font-medium opacity-90">Total Users</h3>
          <p className="text-5xl font-bold mt-4">{stats.totalUsers}</p>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <h3 className="text-lg font-medium opacity-90">Teachers</h3>
          <p className="text-5xl font-bold mt-4">{stats.totalTeachers}</p>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
          <h3 className="text-lg font-medium opacity-90">Pending Approval</h3>
          <p className="text-5xl font-bold mt-4">{stats.pendingApproval}</p>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <h3 className="text-lg font-medium opacity-90">Total Quizzes</h3>
          <p className="text-5xl font-bold mt-4">{stats.totalQuizzes}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/admin/users"
            className="bg-blue-600 text-white text-center py-4 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Manage Users
          </Link>
          <Link
            href="/admin/quizzes"
            className="bg-green-600 text-white text-center py-4 rounded-lg hover:bg-green-700 transition font-medium"
          >
            View Quizzes
          </Link>
          <Link
            href="/admin/reports"
            className="bg-purple-600 text-white text-center py-4 rounded-lg hover:bg-purple-700 transition font-medium"
          >
            Reports
          </Link>
          <Link
            href="/admin/settings"
            className="bg-gray-700 text-white text-center py-4 rounded-lg hover:bg-gray-800 transition font-medium"
          >
            Settings
          </Link>
        </div>
      </div>
    </div>
  );
}
