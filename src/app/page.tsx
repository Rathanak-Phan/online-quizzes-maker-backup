"use client";

import { useState, useEffect } from "react";
import Header from "./components/Header";
import HomePage from "./components/Home";

export default function Home() {
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (!res.ok) {
          setUser(null); // not logged in
          return;
        }
        const data = await res.json();
        setUser(data); // logged in
      } catch {
        setUser(null); // error, treat as not logged in
      }
    };

    fetchUser();
  }, []);

  return (
    <div>
      {/* Not logged in: show sample header */}
      {!user && (
        <div>
          <Header />
          <HomePage />
        </div>
      )}

      {/* Logged in as student: show student header */}
      {user?.role === "user" && (
        <div>
          <Header />
          <HomePage />
        </div>
      )}

      {/* <HomePage /> */}

      {/* Logged in as teacher/admin: show nothing */}
      {user && user.role !== "user" && (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
            <div className="text-6xl mb-4">🚫</div>

            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Access Restricted
            </h2>

            <p className="text-gray-600 mb-6">
              This page is available only for{" ... "}
              <span className="font-semibold">Students</span>. Your current role
              does not have permission.
            </p>

            <button
              onClick={() => window.history.back()}
              className="px-6 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              Go Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
