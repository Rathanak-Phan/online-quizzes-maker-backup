// app/teacher/quizzes/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  HelpCircle,
  Clock,
  Hash,
  Loader2,
} from "lucide-react";

interface Question {
  id: string;
  text: string;
  type: "multiple" | "truefalse" | "shortanswer";
  options: string[];
  correctAnswer: string | number;
  points: number;
  explanation?: string;
}

export default function NewQuizPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Mathematics",
    timeLimit: 30,
    status: "draft" as "draft" | "published",
    isTemplate: false,
  });

  const [questions, setQuestions] = useState<Question[]>([
    {
      id: Date.now().toString(),
      text: "",
      type: "multiple",
      options: ["", "", "", ""],
      correctAnswer: 0,
      points: 10,
      explanation: "",
    },
  ]);

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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleQuestionChange = (
    index: number,
    field: keyof Question,
    value: any
  ) => {
    const updatedQuestions = [...questions];

    if (field === "type") {
      if (value === "multiple") {
        updatedQuestions[index].options = ["", "", "", ""];
        updatedQuestions[index].correctAnswer = 0;
      } else if (value === "truefalse") {
        updatedQuestions[index].options = ["True", "False"];
        updatedQuestions[index].correctAnswer = "True";
      } else if (value === "shortanswer") {
        updatedQuestions[index].options = [];
        updatedQuestions[index].correctAnswer = "";
      }
    }

    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value,
    };

    setQuestions(updatedQuestions);
  };

  const handleOptionChange = (
    questionIndex: number,
    optionIndex: number,
    value: string
  ) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(updatedQuestions);
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      text: "",
      type: "multiple",
      options: ["", "", "", ""],
      correctAnswer: 0,
      points: 10,
      explanation: "",
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length <= 1) {
      alert("At least one question is required");
      return;
    }
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setError("Quiz title is required");
      return false;
    }

    if (!formData.category.trim()) {
      setError("Category is required");
      return false;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];

      if (!q.text.trim()) {
        setError(`Question ${i + 1} text is required`);
        return false;
      }

      if (q.type === "multiple" && q.options.some(opt => !opt.trim())) {
        setError(`Question ${i + 1} has empty options`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    setError(null);

    if (!validateForm()) return;

    try {
      setLoading(true);

      const quizData = {
        ...formData,
        questions: questions.map(q => ({
          text: q.text.trim(),
          type: q.type,
          options: q.options,
          correctAnswer: q.correctAnswer,
          points: Number(q.points) || 1,
          explanation: q.explanation?.trim() || "",
        })),
      };

      const response = await fetch("/api/teacher/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // sends your token cookie
        body: JSON.stringify(quizData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
          (result.details?.join(", ")) ||
          "Failed to create quiz"
        );
      }

      router.push(`/teacher/quizzes/${result.quiz._id}/edit`);
    } catch (err: any) {
      console.error("Create quiz error:", err);

      let errorMsg = "Failed to create quiz";
      if (err.message.includes("creator") || err.message.includes("Unauthorized")) {
        errorMsg = "Please login again as a teacher.";
      } else if (err.message.includes("status")) {
        errorMsg = "Invalid status value.";
      } else if (err.message.includes("questions")) {
        errorMsg = "Add at least one valid question.";
      } else {
        errorMsg = err.message;
      }

      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = () => {
    setFormData(prev => ({ ...prev, status: "draft" }));
    handleSubmit();
  };

  const handlePublish = () => {
    setFormData(prev => ({ ...prev, status: "published" }));
    handleSubmit();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <Link
                href="/teacher/quizzes"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Quizzes
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Create New Quiz</h1>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-60"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {loading ? "Saving..." : "Save as Draft"}
              </button>

              <button
                type="button"
                onClick={handlePublish}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:shadow-lg disabled:opacity-60"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {loading ? "Publishing..." : "Publish Quiz"}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-start gap-3">
            <HelpCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-8">
          {/* Basic Info */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quiz Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter quiz title"
                  required
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe what this quiz is about..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Limit (minutes) *
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  <input
                    type="number"
                    name="timeLimit"
                    value={formData.timeLimit}
                    onChange={handleInputChange}
                    min="1"
                    max="180"
                    className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Questions Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Questions ({questions.length})
              </h2>
              <button
                type="button"
                onClick={addQuestion}
                className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Question
              </button>
            </div>

            {questions.map((question, index) => (
              <div
                key={question.id}
                className="border border-gray-200 rounded-lg p-6 mb-6 last:mb-0 bg-gray-50/30"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Question {index + 1}
                  </h3>
                  <button
                    type="button"
                    onClick={() => removeQuestion(index)}
                    className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question Text *
                    </label>
                    <textarea
                      value={question.text}
                      onChange={(e) => handleQuestionChange(index, "text", e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={2}
                      placeholder="Enter your question..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question Type *
                    </label>
                    <select
                      value={question.type}
                      onChange={(e) => handleQuestionChange(index, "type", e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      <option value="multiple">Multiple Choice</option>
                      <option value="truefalse">True/False</option>
                      <option value="shortanswer">Short Answer</option>
                    </select>
                  </div>

                  {question.type === "multiple" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Options (Select the correct answer) *
                      </label>
                      <div className="space-y-3">
                        {question.options.map((option, optIndex) => (
                          <div key={optIndex} className="flex items-center gap-3">
                            <input
                              type="radio"
                              name={`correctAnswer-${index}`}
                              checked={question.correctAnswer === optIndex}
                              onChange={() => handleQuestionChange(index, "correctAnswer", optIndex)}
                              className="w-4 h-4 text-blue-600"
                            />
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => handleOptionChange(index, optIndex, e.target.value)}
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder={`Option ${optIndex + 1}`}
                              required
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {question.type === "truefalse" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Correct Answer *
                      </label>
                      <div className="flex gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name={`correctAnswer-${index}`}
                            value="True"
                            checked={question.correctAnswer === "True"}
                            onChange={() => handleQuestionChange(index, "correctAnswer", "True")}
                            className="w-4 h-4 text-blue-600"
                          />
                          True
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name={`correctAnswer-${index}`}
                            value="False"
                            checked={question.correctAnswer === "False"}
                            onChange={() => handleQuestionChange(index, "correctAnswer", "False")}
                            className="w-4 h-4 text-blue-600"
                          />
                          False
                        </label>
                      </div>
                    </div>
                  )}

                  {question.type === "shortanswer" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Correct Answer *
                      </label>
                      <input
                        type="text"
                        value={question.correctAnswer as string}
                        onChange={(e) => handleQuestionChange(index, "correctAnswer", e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter the correct answer..."
                        required
                      />
                    </div>
                  )}

                  <div className="max-w-xs">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Points *
                    </label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                      <input
                        type="number"
                        value={question.points}
                        onChange={(e) => handleQuestionChange(index, "points", Number(e.target.value) || 1)}
                        min="1"
                        max="100"
                        className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Explanation (Optional)
                    </label>
                    <textarea
                      value={question.explanation || ""}
                      onChange={(e) => handleQuestionChange(index, "explanation", e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={2}
                      placeholder="Explain why this is the correct answer..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Settings */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Settings</h2>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isTemplate"
                  checked={formData.isTemplate}
                  onChange={handleInputChange}
                  id="isTemplate"
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="isTemplate" className="ml-3 text-gray-700">
                  Save as template for future use
                </label>
              </div>

              <div className="text-sm text-gray-500">
                <p>Templates can be reused to create new quizzes quickly.</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-200">
            <Link
              href="/teacher/quizzes"
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors w-full sm:w-auto text-center"
            >
              Cancel
            </Link>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={loading}
                className="flex-1 sm:flex-none px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {loading ? "Saving..." : "Save as Draft"}
              </button>

              <button
                type="button"
                onClick={handlePublish}
                disabled={loading}
                className="flex-1 sm:flex-none px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {loading ? "Publishing..." : "Publish Quiz"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}