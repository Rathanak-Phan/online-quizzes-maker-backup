// src/app/teacher/classes/[id]/new/page.tsx
// src/app/teacher/classes/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, AlertCircle, Loader2, Globe, Lock } from "lucide-react";
import Link from "next/link";

export default function NewClassPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    type: "private" as "public" | "private",
    subject: "",
    schedule: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = "Class name is required";
    } else if (formData.name.length < 3) {
      errors.name = "Class name must be at least 3 characters";
    }

    if (formData.code.trim() && formData.code.length < 3) {
      errors.code = "Class code must be at least 3 characters";
    } else if (formData.code.trim() && !/^[A-Z0-9]+$/.test(formData.code.toUpperCase())) {
      errors.code = "Class code can only contain uppercase letters and numbers";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, code }));
    setValidationErrors(prev => ({ ...prev, code: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setValidationErrors({});

    if (!validateForm()) return;

    setLoading(true);

    try {
      const res = await fetch("/api/teacher/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          code: formData.code.trim().toUpperCase() || undefined, // auto-generated if empty
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error?.includes("required")) {
          throw new Error("Authentication issue - please log in again");
        }
        throw new Error(data.error || data.message || `Failed to create class (${res.status})`);
      }

      if (!data.success) {
        throw new Error(data.message || "Failed to create class");
      }

      // Success
      router.push("/teacher/classes");
      router.refresh(); // Refresh server components
    } catch (err: any) {
      console.error("Create class error:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/teacher/classes"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium mb-6 group"
          >
            <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            Back to Classes
          </Link>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">
            Create New Class
          </h1>
          <p className="text-lg text-gray-600">
            Set up a new class for your students
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 md:p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-red-800">Error</p>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Class Name */}
            <div className="mb-6">
              <label className="block text-lg font-semibold text-gray-900 mb-3">
                Class Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Mathematics Grade 10"
                className={`w-full px-6 py-4 text-lg border rounded-2xl focus:ring-4 transition ${
                  validationErrors.name ? "border-red-500 focus:ring-red-500/20" : "border-gray-300 focus:ring-blue-500/20"
                }`}
                disabled={loading}
              />
              {validationErrors.name && <p className="mt-2 text-sm text-red-600">{validationErrors.name}</p>}
            </div>

            {/* Class Code */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <label className="block text-lg font-semibold text-gray-900">
                  Class Code <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={generateCode}
                  disabled={loading}
                  className="px-5 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition disabled:opacity-50"
                >
                  Generate Code
                </button>
              </div>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="Auto-generated if empty"
                className={`w-full px-6 py-4 text-lg border rounded-2xl font-mono focus:ring-4 transition ${
                  validationErrors.code ? "border-red-500 focus:ring-red-500/20" : "border-gray-300 focus:ring-blue-500/20"
                }`}
                disabled={loading}
                maxLength={10}
              />
              {validationErrors.code && <p className="mt-2 text-sm text-red-600">{validationErrors.code}</p>}
              <p className="mt-2 text-sm text-gray-500">
                Students will use this code to join. Leave empty to auto-generate.
              </p>
            </div>

            {/* Class Type */}
            <div className="mb-6">
              <label className="block text-lg font-semibold text-gray-900 mb-3">
                Class Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: "public" })}
                  className={`p-6 rounded-2xl border-2 transition-all ${
                    formData.type === "public"
                      ? "border-blue-500 bg-blue-50/50 shadow-sm"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="text-center">
                    <Globe className="w-8 h-8 mx-auto mb-3 text-blue-600" />
                    <h3 className="font-bold">Public</h3>
                    <p className="text-sm text-gray-600 mt-1">Anyone can join with code</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: "private" })}
                  className={`p-6 rounded-2xl border-2 transition-all ${
                    formData.type === "private"
                      ? "border-purple-500 bg-purple-50/50 shadow-sm"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="text-center">
                    <Lock className="w-8 h-8 mx-auto mb-3 text-purple-600" />
                    <h3 className="font-bold">Private</h3>
                    <p className="text-sm text-gray-600 mt-1">Approval required</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Subject & Schedule (Optional) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-3">Subject (Optional)</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g., Mathematics, English"
                  className="w-full px-6 py-4 text-lg border border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-500/20 transition"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-3">Schedule (Optional)</label>
                <input
                  type="text"
                  value={formData.schedule}
                  onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                  placeholder="e.g., Mon/Wed 9-11 AM"
                  className="w-full px-6 py-4 text-lg border border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-500/20 transition"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <Link
              href="/teacher/classes"
              className="flex-1 px-8 py-5 text-center border-2 border-gray-300 text-gray-700 rounded-2xl font-bold text-lg hover:bg-gray-50 transition disabled:opacity-50"
              tabIndex={loading ? -1 : 0}
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-8 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Class"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}