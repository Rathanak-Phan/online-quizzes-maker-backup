// src/app/student/quizzes/pending/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/* ================= Cookie helper ================= */
function getAuthTokenFromCookie(name: string = "token") {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? match[2] : null;
}

export default function PendingQuizzes() {
  const [pending, setPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  /* ================= FETCH PENDING QUIZZES ================= */
  useEffect(() => {
    const token = getAuthTokenFromCookie();

    fetch("/api/student/quizzes/pending", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: "no-store",
    })
      .then((res) => res.json())
      .then((data) => {
        setPending(data.pending || []);
      })
      .catch((err) => console.error("Pending quizzes error:", err))
      .finally(() => setLoading(false));
  }, []);

  /* ================= UI ================= */
  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Pending Quizzes</h1>

      {pending.length === 0 ? (
        <p className="text-gray-600">No pending quizzes 🎉</p>
      ) : (
        <ul>
          {pending.map((p) => (
            <li key={p._id} className="border p-3 mb-3 rounded">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{p.quiz.title}</p>
                  <p className="text-sm text-gray-600">
                    Status: {p.status}
                  </p>
                </div>

                <button
                  onClick={() =>
                    router.push(`/student/quizzes/${p.quiz._id}/attempt`)
                  }
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded"
                >
                  Resume
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
