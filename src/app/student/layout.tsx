"use client";

import Header from "@/app/student/components/Header";
import Sidebar from "@/app/student/components/Sidebar";
import HomePage from "../components/Home";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (!res.ok) {
          setUser(null); // not logged in
        } else {
          const data = await res.json();
          setUser(data); // logged in
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Show loading state while fetching
  if (loading) return <p>Loading...</p>;

  // If user is not logged in
  if (!user) return <p>Please log in to access this page.</p>;

  // Conditional layout based on pathname
  if (pathname === "/") {
    return (
      <div>
        <Header />
        <HomePage />
      </div>
    );
  }

  if (pathname.startsWith("/student")) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        {/* Sidebar */}
        <Sidebar currentPath={pathname} />

        {/* Main content */}
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="p-8 overflow-y-auto">{children}</main>
        </div>
      </div>
    );
  }

  // Fallback for other paths
  return <p>Page not found</p>;
}
