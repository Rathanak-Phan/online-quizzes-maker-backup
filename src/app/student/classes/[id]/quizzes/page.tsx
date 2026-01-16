// src/app/student/classes/[classId]/quizzes/page.tsx (UI for viewing quizzes in a class)
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";

export default function ClassQuizzes() {
  const { classId } = useParams();
  const [quizzes, setQuizzes] = useState([]);
  const router = useRouter();

  useEffect(() => {
    axios.get(`/api/student/classes/${classId}/quizzes`)
      .then(res => setQuizzes(res.data.quizzes))
      .catch(err => console.error(err));
  }, [classId]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Quizzes in Class</h1>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border p-2">Title</th>
            <th className="border p-2">Time Limit</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {quizzes.map((q: any) => (
            <tr key={q._id}>
              <td className="border p-2">{q.title}</td>
              <td className="border p-2">{q.timeLimit} min</td>
              <td className="border p-2">{q.attemptStatus}</td>
              <td className="border p-2">
                {q.attemptStatus === "not-started" && (
                  <button onClick={() => router.push(`/student/quizzes/${q._id}/start`)} className="bg-green-500 text-white px-2 py-1">
                    Start
                  </button>
                )}
                {q.attemptStatus === "in-progress" && (
                  <button onClick={() => router.push(`/student/quizzes/${q._id}/attempt`)} className="bg-yellow-500 text-white px-2 py-1">
                    Resume
                  </button>
                )}
                {q.attemptStatus === "completed" && <span>Completed ({q.percentage}%)</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}