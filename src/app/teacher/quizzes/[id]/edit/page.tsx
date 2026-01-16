// app/teacher/quizzes/[id]/edit/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  HelpCircle,
  Clock,
  Type,
  Hash,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface Question {
  _id?: string;
  text: string;
  type: "multiple" | "truefalse" | "shortanswer";
  options: string[];
  correctAnswer: string | number;
  points: number;
  explanation?: string;
}

interface Quiz {
  _id: string;
  title: string;
  description: string;
  category: string;
  timeLimit: number;
  status: "draft" | "published" | "archived";
  isTemplate: boolean;
  questions: Question[];
}

export default function EditQuizPage() {
  const router = useRouter();
  const { id: quizId } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Mathematics",
    timeLimit: 30,
    status: "draft",
    isTemplate: false,
  });

  const [questions, setQuestions] = useState<Question[]>([]);

  const categories = [
    "Mathematics",
    "Science",
    "History",
    "English",
    "Computer Science",
    "Geography",
    "Art",
    "Music",
    "Physical Education",
    "Other",
  ];

  // Fetch quiz
  useEffect(() => {
    if (!quizId) return;

    const fetchQuiz = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/teacher/quizzes/${quizId}`, {
          credentials: "include", // important → sends cookies (token)
          cache: "no-store",
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();

        if (!data.success || !data.quiz) {
          throw new Error(data.error || "Quiz not found");
        }

        const quiz: Quiz = data.quiz;

        setFormData({
          title: quiz.title,
          description: quiz.description || "",
          category: quiz.category || "Mathematics",
          timeLimit: quiz.timeLimit || 30,
          status: quiz.status || "draft",
          isTemplate: !!quiz.isTemplate,
        });

        setQuestions(
          (quiz.questions || []).map((q: any) => ({
            _id: q._id,
            text: q.text || "",
            type: q.type || "multiple",
            options: q.options || [],
            correctAnswer: q.correctAnswer ?? (q.type === "multiple" ? 0 : ""),
            points: q.points || 10,
            explanation: q.explanation || "",
          }))
        );
      } catch (err: any) {
        console.error("Fetch quiz error:", err);
        setError(err.message || "Failed to load quiz");
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleQuestionChange = (
    index: number,
    field: keyof Question,
    value: any
  ) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };

      // Reset correct answer & options when type changes
      if (field === "type") {
        if (value === "multiple") {
          updated[index].options = ["", "", "", ""];
          updated[index].correctAnswer = 0;
        } else if (value === "truefalse") {
          updated[index].options = ["True", "False"];
          updated[index].correctAnswer = "True";
        } else if (value === "shortanswer") {
          updated[index].options = [];
          updated[index].correctAnswer = "";
        }
      }

      return updated;
    });
  };

  const handleOptionChange = (
    qIndex: number,
    optIndex: number,
    value: string
  ) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[qIndex].options[optIndex] = value;
      return updated;
    });
  };

  const addQuestion = () => {
    const newQ: Question = {
      text: "",
      type: "multiple",
      options: ["", "", "", ""],
      correctAnswer: 0,
      points: 10,
      explanation: "",
    };
    setQuestions((prev) => [...prev, newQ]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length <= 1) {
      alert("You need at least one question");
      return;
    }
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setError("Quiz title is required");
      return false;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) {
        setError(`Question ${i + 1}: Please enter question text`);
        return false;
      }

      if (q.type === "multiple") {
        if (q.options.some((opt) => !opt.trim())) {
          setError(`Question ${i + 1}: All options must be filled`);
          return false;
        }
        if (typeof q.correctAnswer !== "number") {
          setError(`Question ${i + 1}: Please select correct answer`);
          return false;
        }
      }

      if (q.type === "truefalse" && !["True", "False"].includes(q.correctAnswer as string)) {
        setError(`Question ${i + 1}: Please select True or False`);
        return false;
      }

      if (q.type === "shortanswer" && !(q.correctAnswer as string)?.trim()) {
        setError(`Question ${i + 1}: Please provide correct answer`);
        return false;
      }
    }

    setError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        questions: questions.map((q) => ({
          text: q.text,
          type: q.type,
          options: q.options,
          correctAnswer: q.correctAnswer,
          points: q.points,
          explanation: q.explanation,
          // do NOT send _id → let MongoDB handle it
        })),
      };

      const res = await fetch(`/api/teacher/quizzes/${quizId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to update quiz");
      }

      alert("Quiz updated successfully!");
      router.push("/teacher/quizzes");
    } catch (err: any) {
      setError(err.message || "Error saving quiz");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this quiz permanently?")) return;

    try {
      const res = await fetch(`/api/teacher/quizzes/${quizId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Delete failed");

      router.push("/teacher/quizzes");
    } catch (err: any) {
      setError("Failed to delete quiz");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error && !formData.title) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-3">Failed to load quiz</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/teacher/quizzes"
            className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Back to Quizzes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/teacher/quizzes"
              className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
            >
              <ArrowLeft size={18} />
              Back
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Edit Quiz</h1>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 text-sm border border-red-300 text-red-700 rounded-lg hover:bg-red-50"
            >
              <Trash2 size={16} />
              Delete
            </button>

            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-60 shadow-sm transition-colors"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save size={16} />
              )}
              {saving ? "Saving..." : "Save Quiz"}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-start gap-3">
            <AlertCircle className="mt-0.5" size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* ── Basic Info ── */}
          <section className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">Quiz Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g. Midterm Exam - Algebra Basics"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Optional description or instructions for students..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time Limit (minutes)
                </label>
                <input
                  type="number"
                  name="timeLimit"
                  min="5"
                  max="180"
                  value={formData.timeLimit}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="flex items-center pt-6">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="isTemplate"
                    checked={formData.isTemplate}
                    onChange={handleInputChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  <span className="ml-3 text-sm font-medium text-gray-700">
                    Use as Template
                  </span>
                </label>
              </div>
            </div>
          </section>

          {/* ── Questions ── */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">
                Questions ({questions.length})
              </h2>
              <button
                type="button"
                onClick={addQuestion}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 font-medium"
              >
                <Plus size={18} />
                Add Question
              </button>
            </div>

            <div className="space-y-6">
              {questions.map((question, index) => (
                <div
                  key={index}
                  className="bg-white border rounded-xl shadow-sm overflow-hidden"
                >
                  <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-b">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-700">
                        Question {index + 1}
                      </span>
                      <span className="px-2.5 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">
                        {question.type === "multiple"
                          ? "Multiple Choice"
                          : question.type === "truefalse"
                          ? "True/False"
                          : "Short Answer"}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeQuestion(index)}
                      className="text-red-600 hover:text-red-800 p-1"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* Question Text */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Question Text <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={question.text}
                        onChange={(e) =>
                          handleQuestionChange(index, "text", e.target.value)
                        }
                        rows={3}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Write your question here..."
                        required
                      />
                    </div>

                    {/* Question Type */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Question Type
                        </label>
                        <select
                          value={question.type}
                          onChange={(e) =>
                            handleQuestionChange(index, "type", e.target.value)
                          }
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                        >
                          <option value="multiple">Multiple Choice</option>
                          <option value="truefalse">True / False</option>
                          <option value="shortanswer">Short Answer</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Points
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={question.points}
                          onChange={(e) =>
                            handleQuestionChange(index, "points", Number(e.target.value))
                          }
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    {/* Options / Answer */}
                    {question.type === "multiple" && (
                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">
                          Answer Options
                        </label>
                        {question.options.map((opt, optIndex) => (
                          <div key={optIndex} className="flex items-center gap-3">
                            <input
                              type="radio"
                              name={`correct-${index}`}
                              checked={question.correctAnswer === optIndex}
                              onChange={() =>
                                handleQuestionChange(index, "correctAnswer", optIndex)
                              }
                              className="w-5 h-5 text-indigo-600"
                            />
                            <input
                              value={opt}
                              onChange={(e) =>
                                handleOptionChange(index, optIndex, e.target.value)
                              }
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder={`Option ${optIndex + 1}`}
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {question.type === "truefalse" && (
                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">
                          Correct Answer
                        </label>
                        <div className="flex gap-6">
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`tf-${index}`}
                              value="True"
                              checked={question.correctAnswer === "True"}
                              onChange={() =>
                                handleQuestionChange(index, "correctAnswer", "True")
                              }
                              className="w-5 h-5 text-indigo-600"
                            />
                            True
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`tf-${index}`}
                              value="False"
                              checked={question.correctAnswer === "False"}
                              onChange={() =>
                                handleQuestionChange(index, "correctAnswer", "False")
                              }
                              className="w-5 h-5 text-indigo-600"
                            />
                            False
                          </label>
                        </div>
                      </div>
                    )}

                    {question.type === "shortanswer" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Correct Answer <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={question.correctAnswer as string}
                          onChange={(e) =>
                            handleQuestionChange(index, "correctAnswer", e.target.value)
                          }
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Exact answer expected from student..."
                        />
                      </div>
                    )}

                    {/* Explanation */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Explanation (optional - shown after submission)
                      </label>
                      <textarea
                        value={question.explanation || ""}
                        onChange={(e) =>
                          handleQuestionChange(index, "explanation", e.target.value)
                        }
                        rows={2}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Why this is the correct answer..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Bottom Save Bar */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-10">
            <div className="max-w-5xl mx-auto flex justify-end gap-4">
              <Link
                href="/teacher/quizzes"
                className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-60 flex items-center gap-2"
              >
                {saving && <Loader2 className="w-5 h-5 animate-spin" />}
                Save Quiz
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}