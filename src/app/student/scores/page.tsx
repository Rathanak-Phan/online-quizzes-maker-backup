// src/app/student/scores/page.tsx (UI for scores)
"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function StudentScores() {
  const [stats, setStats] = useState(null);
  const [attempts, setAttempts] = useState([]);

  useEffect(() => {
    axios.get("/api/student/scores")
      .then(res => {
        setStats(res.data.stats);
        setAttempts(res.data.attempts);
      })
      .catch(err => console.error(err));
  }, []);

  if (!stats) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">My Scores</h1>
      <div className="mb-4">
        <p>Total Quizzes: {stats.totalQuizzes}</p>
        <p>Avg Score: {stats.avgScore.toFixed(2)}</p>
        <p>Avg Percentage: {stats.avgPercentage.toFixed(2)}%</p>
        <p>Highest Score: {stats.highestScore}</p>
      </div>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border p-2">Quiz</th>
            <th className="border p-2">Score</th>
            <th className="border p-2">Percentage</th>
            <th className="border p-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {attempts.map((a: any) => (
            <tr key={a._id}>
              <td className="border p-2">{a.quiz.title}</td>
              <td className="border p-2">{a.score}</td>
              <td className="border p-2">{a.percentage}%</td>
              <td className="border p-2">{new Date(a.submittedAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}