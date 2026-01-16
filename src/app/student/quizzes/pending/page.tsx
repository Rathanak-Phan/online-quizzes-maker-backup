// src/app/student/quizzes/pending/page.tsx (UI for pending quizzes)
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function PendingQuizzes() {
  const [pending, setPending] = useState([]);
  const router = useRouter();

  useEffect(() => {
    axios.get("/api/student/quizzes/pending")
      .then(res => setPending(res.data.pending))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Pending Quizzes</h1>
      <ul>
        {pending.map((p: any) => (
          <li key={p._id} className="border p-2 mb-2">
            {p.quiz.title} - Status: {p.status}
            <button onClick={() => router.push(`/student/quizzes/${p.quiz._id}/attempt`)} className="ml-4 bg-yellow-500 text-white px-2 py-1">
              Resume
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}