"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";

type ClassForm = {
  name: string;
  code: string;
  type: "public" | "private";
  subject: string;
  schedule: string;
};

export default function EditClassPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const classId = params.id;

  const [formData, setFormData] = useState<ClassForm>({
    name: "",
    code: "",
    type: "public",
    subject: "",
    schedule: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch class details
  useEffect(() => {
    if (!classId) return;

    const fetchClass = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/teacher/classes/${classId}`);
        const data = await res.json();

        console.log("Fetched class data:", data); // <-- debug

        // If your API returns data directly without {class: ...}
        const cls = data.class ?? data;

        setFormData({
          name: cls.name ?? "",
          code: cls.code ?? "",
          type: cls.type ?? "public",
          subject: cls.subject ?? "",
          schedule: cls.schedule ?? "",
        });
      } catch (err) {
        console.error("Fetch class error:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false); // <-- this must always run
      }
    };

    fetchClass();
  }, [classId]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/teacher/classes/${classId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update class");
      }

      router.push("/teacher/classes");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <p className="text-center py-12">
        Loading class details... <br />
        classId = {classId} <br />
        formData = {JSON.stringify(formData)}
      </p>
    );
  }

  if (error)
    return (
      <div className="text-center py-12 text-red-600">
        <p>{error}</p>
        <Link href="/teacher/classes" className="underline text-blue-600">
          Back to Classes
        </Link>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/teacher/classes"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Classes
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-6">Edit Class</h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-white p-6 rounded-3xl shadow-lg border border-gray-100"
        >
          <div>
            <label className="block text-lg font-semibold text-gray-900 mb-2">
              Class Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-6 py-3 border rounded-xl text-lg"
              required
            />
          </div>

          <div>
            <label className="block text-lg font-semibold text-gray-900 mb-2">
              Class Code
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value.toUpperCase() })
              }
              className="w-full px-6 py-3 border rounded-xl text-lg font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-lg font-semibold text-gray-900 mb-2">
              Class Type
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  type: e.target.value as "public" | "private",
                })
              }
              className="w-full px-6 py-3 border rounded-xl text-lg"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>

          <div>
            <label className="block text-lg font-semibold text-gray-900 mb-2">
              Subject
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) =>
                setFormData({ ...formData, subject: e.target.value })
              }
              className="w-full px-6 py-3 border rounded-xl text-lg"
            />
          </div>

          <div>
            <label className="block text-lg font-semibold text-gray-900 mb-2">
              Schedule
            </label>
            <input
              type="text"
              value={formData.schedule}
              onChange={(e) =>
                setFormData({ ...formData, schedule: e.target.value })
              }
              className="w-full px-6 py-3 border rounded-xl text-lg"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
