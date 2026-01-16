// src/app/student/quizzes/[quizId]/attempt/page.tsx (UI for completing quiz)
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";

export default function QuizAttempt() {
  const { quizId } = useParams();
  const router = useRouter();
  const [attempt, setAttempt] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);

  useEffect(() => {
    axios.get(`/api/student/quizzes/${quizId}/attempt`)
      .then(res => {
        setAttempt(res.data.attempt);
        setAnswers(res.data.attempt.answers);
      })
      .catch(err => console.error(err));
  }, [quizId]);

  const handleAnswer = (questionId: string, selected: any) => {
    const newAnswers = [...answers];
    const idx = newAnswers.findIndex(a => a.questionId === questionId);
    if (idx > -1) newAnswers[idx].selected = selected;
    setAnswers(newAnswers);
  };

  const submit = () => {
    axios.patch(`/api/student/quizzes/${quizId}/attempt`, { answers, status: "submitted", timeSpent: 0 /* calculate */ })
      .then(() => router.push("/student/quizzes/completed"))
      .catch(err => console.error(err));
  };

  if (!attempt) return <div>Loading...</div>;

  const q = attempt.questions[currentQuestion];

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Taking Quiz: {attempt.quiz.title}</h1>
      <div className="border p-4 mb-4">
        <h2>{q.text} ({q.points} pts)</h2>
        {q.type === "multiple" && q.options.map((opt: string, i: number) => (
          <div key={i}>
            <input 
              type="radio" 
              name="answer" 
              onChange={() => handleAnswer(q._id, i)} 
              checked={answers.find(a => a.questionId === q._id)?.selected === i}
            /> {opt}
          </div>
        ))}
        {q.type === "truefalse" && (
          <>
            <input type="radio" name="answer" onChange={() => handleAnswer(q._id, "True")} /> True
            <input type="radio" name="answer" onChange={() => handleAnswer(q._id, "False")} /> False
          </>
        )}
        {q.type === "shortanswer" && (
          <textarea onChange={e => handleAnswer(q._id, e.target.value)} />
        )}
      </div>
      <button onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))} className="mr-2">Prev</button>
      <button onClick={() => setCurrentQuestion(prev => Math.min(attempt.questions.length - 1, prev + 1))} className="mr-2">Next</button>
      <button onClick={submit} className="bg-red-500 text-white px-4 py-2">Submit</button>
    </div>
  );
}