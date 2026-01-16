// src/app/students/components/Sidebar.tsx
"use client";

import Link from "next/link";
import { ArrowLeft, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const menuItems = [
  { name: "Dashboard", path: "/student/dashboard", icon: "🏠" },
  { name: "Classes", path: "/student/classes", icon: "👥" },
  { name: "Quizzes", path: "/student/quizzes", icon: "📝" },
  { name: "Results", path: "/student/results", icon: "📤" },
  { name: "Scores", path: "/student/scores", icon: "🔔" },
  { name: "Settings", path: "/student/settings", icon: "⚙️" },
];

export default function Sidebar({ currentPath }: { currentPath: string }) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    setUser(null);
    router.push("/");
    router.refresh();
  };

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-100">
          <Link
            href="/"
            className="flex items-center gap-2 hover:text-blue-600 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back Home
          </Link>
        </h1>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`flex items-center gap-4 px-4 py-3 rounded-lg transition ${
              currentPath === item.path
                ? "bg-blue-600 text-white shadow-lg"
                : "hover:bg-gray-800"
            }`}
          >
            <span className="text-2xl">{item.icon}</span>
            <span className="font-medium">{item.name}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-red-600 rounded-lg hover:bg-red-700 transition font-medium"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
