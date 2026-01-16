// src/app/student/quizzes/[quizId]/attempt/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

/* ================= Helper to read cookie token ================= */
function getAuthTokenFromCookie(name: string = "token") {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? match[2] : null;
}

export default function QuizAttempt() {
  const { quizId } = useParams();
  const router = useRouter();
  const [attempt, setAttempt] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH ATTEMPT ================= */
  useEffect(() => {
    if (!quizId) return;

    const token = getAuthTokenFromCookie();
    setLoading(true);

    fetch(`/api/student/quizzes/${quizId}/attempt`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: "no-store",
    })
      .then((res) => res.json())
      .then((data) => {
        setAttempt(data.attempt);
        setAnswers(data.attempt?.answers || []);
      })
      .catch((err) => console.error("Fetch attempt error:", err))
      .finally(() => setLoading(false));
  }, [quizId]);

  /* ================= HANDLE ANSWER ================= */
  const handleAnswer = (questionId: string, selected: any) => {
    const newAnswers = [...answers];
    const idx = newAnswers.findIndex((a) => a.questionId === questionId);
    if (idx > -1) newAnswers[idx].selected = selected;
    else newAnswers.push({ questionId, selected });
    setAnswers(newAnswers);
  };

  /* ================= SUBMIT ================= */
  const submit = () => {
    const token = getAuthTokenFromCookie();
    fetch(`/api/student/quizzes/${quizId}/attempt`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        answers,
        status: "submitted",
        timeSpent: 0, // calculate time if needed
      }),
    })
      .then(() => router.push("/student/quizzes/completed"))
      .catch((err) => console.error("Submit attempt error:", err));
  };

  if (loading) return <div>Loading...</div>;
  if (!attempt) return <div>No attempt data found</div>;

  const q = attempt.questions[currentQuestion];

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Taking Quiz: {attempt.quiz.title}</h1>

      <div className="border p-4 mb-4">
        <h2>
          {q.text} ({q.points} pts)
        </h2>

        {q.type === "multiple" &&
          q.options.map((opt: string, i: number) => (
            <div key={i}>
              <input
                type="radio"
                name="answer"
                onChange={() => handleAnswer(q._id, i)}
                checked={answers.find((a) => a.questionId === q._id)?.selected === i}
              />{" "}
              {opt}
            </div>
          ))}

        {q.type === "truefalse" && (
          <>
            <input
              type="radio"
              name="answer"
              onChange={() => handleAnswer(q._id, "True")}
            />{" "}
            True
            <input
              type="radio"
              name="answer"
              onChange={() => handleAnswer(q._id, "False")}
            />{" "}
            False
          </>
        )}

        {q.type === "shortanswer" && (
          <textarea
            className="w-full mt-2 border rounded p-2"
            onChange={(e) => handleAnswer(q._id, e.target.value)}
            value={answers.find((a) => a.questionId === q._id)?.selected || ""}
          />
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() =>
            setCurrentQuestion((prev) => Math.max(0, prev - 1))
          }
          className="px-4 py-2 border rounded"
        >
          Prev
        </button>
        <button
          onClick={() =>
            setCurrentQuestion((prev) =>
              Math.min(attempt.questions.length - 1, prev + 1)
            )
          }
          className="px-4 py-2 border rounded"
        >
          Next
        </button>
        <button
          onClick={submit}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Submit
        </button>
      </div>
    </div>
  );
}
