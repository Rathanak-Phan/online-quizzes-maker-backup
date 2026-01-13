"use client";

import { useEffect, useState } from "react";

interface Category {
  _id: string;
  name: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/teacher/categories", { credentials: "same-origin" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch categories");
      setCategories(data.categories || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const submitCategory = async () => {
    if (!name.trim()) return setError("Category name required");

    setSaving(true);
    setError(null);
    setSuccess(null);

    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `/api/teacher/categories/${editingId}` : "/api/teacher/categories";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ name }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to save category");

      // Update state
      if (editingId) {
        setCategories((prev) =>
          prev.map((c) => (c._id === editingId ? result.category : c))
        );
        setSuccess("Category updated successfully!");
      } else {
        setCategories((prev) => [result.category, ...prev]);
        setSuccess("Category added successfully!");
      }

      setName("");
      setEditingId(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/teacher/categories/${id}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete category");

      setCategories((prev) => prev.filter((c) => c._id !== id));
      setSuccess("Category deleted successfully!");
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Manage Categories</h1>

      {/* Form */}
      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Category name"
          disabled={saving}
        />
        <button
          onClick={submitCategory}
          disabled={saving}
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : editingId ? "Update" : "Add"}
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">{success}</div>
      )}

      {/* Categories List */}
      {loading ? (
        <p>Loading categories...</p>
      ) : categories.length === 0 ? (
        <p className="text-gray-500">No categories yet.</p>
      ) : (
        <ul className="bg-white shadow rounded-md divide-y">
          {categories.map((cat) => (
            <li
              key={cat._id}
              className="flex justify-between items-center p-4 hover:bg-gray-50"
            >
              <span>{cat.name}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setName(cat.name);
                    setEditingId(cat._id);
                  }}
                  className="px-3 py-1 bg-yellow-400 text-white rounded-md hover:bg-yellow-500"
                  disabled={saving}
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteCategory(cat._id)}
                  className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                  disabled={saving}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
