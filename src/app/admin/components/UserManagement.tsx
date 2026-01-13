"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  UserCheck,
  CheckCircle,
  Loader2,
  GraduationCap,
  ClipboardList,
  BookOpen,
  School,
  Users,
  FileText,
} from "lucide-react";
import StatCard from "./StatCard";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "teacher" | "user"; // match DB
  status: "active" | "pending"; // match DB
  validated?: boolean;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "user" as "admin" | "teacher" | "user",
    status: "pending" as "active" | "pending",
  });
  const [isApproving, setIsApproving] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      setUsers(data.users);
    } catch (error) {
      console.error("Fetch users error:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // --- Add User ---
  const handleAddUser = async () => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });
      if (!res.ok) throw new Error("Failed to add user");

      setIsAddModalOpen(false);
      setNewUser({ name: "", email: "", role: "user", status: "pending" });
      fetchUsers();

      // ✅ Show success message
      setMessage({ type: "success", text: "User added successfully!" });
      setTimeout(() => setMessage(null), 3000); // auto-hide after 3s
    } catch (error: any) {
      console.error(error);
      setMessage({
        type: "error",
        text: error.message || "Failed to add user",
      });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // --- Edit User ---
  const handleEditUser = async () => {
    if (!selectedUser) return;
    try {
      const res = await fetch(`/api/admin/users/${selectedUser._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedUser),
      });
      if (!res.ok) throw new Error("Failed to update user");
      setIsEditModalOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      console.error(error);
    }
  };

  // --- Delete User ---
  const handleDeleteUser = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete user");
      setIsDeleteConfirmOpen(false);
      setSelectedUser(null);
      fetchUsers();

      setMessage({ type: "success", text: "User deleted successfully!" });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      console.error(error);
      setMessage({
        type: "error",
        text: error.message || "Failed to delete user",
      });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // --- Filtered Users ---
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Approve Teacher ---
  const handleApproveUser = async (userId: string) => {
    setIsApproving(userId); // start loading
    try {
      const res = await fetch(`/api/admin/users/approve/${userId}`, {
        method: "POST",
      });
      const data = await res.json();

      if (res.ok) {
        alert("Teacher approved successfully");
        setUsers((prev) =>
          prev.map((user) =>
            user._id === userId
              ? { ...user, status: "active", validated: true }
              : user
          )
        );
      } else {
        alert(data.message || "Failed to approve teacher");
      }
    } catch (err: any) {
      alert(err.message || "Something went wrong");
    } finally {
      setIsApproving(null); // stop loading
    }
  };

  // --- Filter out Admins from the lists ---
  const nonAdminUsers = users.filter((u) => u.role !== "admin");

  // Stats
  const totalUsers = nonAdminUsers.length;
  const activeTeachers = nonAdminUsers.filter(
    (u) => u.role === "teacher" && u.status === "active"
  ).length;
  const pendingReviews = nonAdminUsers.filter(
    (u) => u.status === "pending"
  ).length;

  // Pending teachers (non-admins)
  const pendingTeachers = nonAdminUsers.filter(
    (u) => u.role === "teacher" && u.status === "pending"
  );

  return (
    <div className="min-h-screen">
      <div className="w-full">
        {/* Pending Teachers */}
        <h2 className="text-2xl font-bold mb-6">
          Pending Teacher Approvals ({pendingTeachers.length})
        </h2>
        {pendingTeachers.length === 0 ? (
          <p className="text-gray-500">No pending approvals</p>
        ) : (
          <div className="space-y-4">
            {pendingTeachers.map((teacher) => (
              <div
                key={teacher._id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <p className="font-semibold">{teacher.name}</p>
                  <p className="text-gray-600">{teacher.email}</p>
                </div>
                <button
                  onClick={() => handleApproveUser(teacher._id)}
                  disabled={isApproving === teacher._id}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {isApproving === teacher._id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Approving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mt-6">
          <StatCard
            title="Total Users"
            value={totalUsers}
            icon={<UserCheck className="w-8 h-8" />}
            color="bg-blue-100"
            textColor="text-blue-600"
          />
          <StatCard
            title="Active Teachers"
            value={activeTeachers}
            icon={<GraduationCap className="w-8 h-8" />}
            color="bg-green-100"
            textColor="text-green-600"
          />
          <StatCard
            title="Pending Reviews"
            value={pendingReviews}
            icon={<ClipboardList className="w-8 h-8" />}
            color="bg-amber-100"
            textColor="text-amber-600"
          />
          <StatCard
            title="Total Quizzes"
            value={56}
            icon={<BookOpen className="w-8 h-8" />}
            color="bg-purple-100"
            textColor="text-purple-600"
          />
          <StatCard
            title="Total Classes"
            value={18}
            icon={<School className="w-8 h-8" />}
            color="bg-teal-100"
            textColor="text-teal-600"
          />
          <StatCard
            title="Total Students"
            value={342}
            icon={<Users className="w-8 h-8" />}
            color="bg-indigo-100"
            textColor="text-indigo-600"
          />
        </div>

        {/* User Table */}
        <div className="my-10">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-xl font-semibold text-gray-900">
                User Management
              </h2>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by name, email or role..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 w-full sm:w-80"
                  />
                </div>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
                >
                  <Plus className="w-5 h-5" /> Add User
                </button>
              </div>
            </div>

            <div>
              {message && (
                <div
                  className={`text-center px-4 py-5 rounded-lg shadow-md text-white z-50 ${
                    message.type === "success" ? "bg-green-600" : "bg-red-600"
                  }`}
                >
                  {message.text}
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-semibold">
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-3 py-1 text-xs font-medium rounded-full ${
                              user.status === "active"
                                ? "bg-green-100 text-green-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {user.status}
                          </span>
                          {user.status === "pending" &&
                            user.role === "teacher" && (
                              <button
                                onClick={() => handleApproveUser(user._id)}
                                disabled={isApproving === user._id}
                                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
                              >
                                {isApproving === user._id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <CheckCircle className="w-4 h-4" />
                                )}
                                Approve
                              </button>
                            )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              if (user.role !== "admin") {
                                setSelectedUser(user);
                                setIsEditModalOpen(true);
                              }
                            }}
                            className={`text-gray-400 hover:text-blue-600 ${
                              user.role === "admin"
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                            disabled={user.role === "admin"}
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => {
                              if (user.role !== "admin") {
                                setSelectedUser(user);
                                setIsDeleteConfirmOpen(true);
                              }
                            }}
                            className={`text-gray-400 hover:text-red-600 ${
                              user.role === "admin"
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                            disabled={user.role === "admin"}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-700">
                Showing {filteredUsers.length} of {totalUsers} users
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* --- Modals --- */}
      {isAddModalOpen && (
        <AddEditModal
          title="Add New User"
          user={newUser}
          setUser={setNewUser}
          onSave={handleAddUser}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}

      {isEditModalOpen && selectedUser && (
        <AddEditModal
          title="Edit User"
          user={selectedUser}
          setUser={setSelectedUser}
          onSave={handleEditUser}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}

      {isDeleteConfirmOpen && selectedUser && (
        <DeleteModal
          user={selectedUser}
          onDelete={() => handleDeleteUser(selectedUser._id)}
          onClose={() => setIsDeleteConfirmOpen(false)}
        />
      )}
    </div>
  );
}

// --- Reusable Add/Edit Modal ---
function AddEditModal({ title, user, setUser, onSave, onClose }: any) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <input
          type="text"
          placeholder="Name"
          value={user.name}
          onChange={(e) => setUser({ ...user, name: e.target.value })}
          className="w-full mb-3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="email"
          placeholder="Email"
          value={user.email}
          onChange={(e) => setUser({ ...user, email: e.target.value })}
          className="w-full mb-3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={user.role}
          onChange={(e) => setUser({ ...user, role: e.target.value })}
          className="w-full mb-3 px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="admin">Admin</option>
          <option value="teacher">Teacher</option>
          <option value="user">Student</option>{" "}
          {/* label can stay as Student */}
        </select>
        <select
          value={user.status}
          onChange={(e) => setUser({ ...user, status: e.target.value })}
          className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="active">Active</option>
          <option value="pending">Pending</option>
        </select>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Delete Modal ---
function DeleteModal({ user, onDelete, onClose }: any) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
        <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
        <p className="mb-4">Are you sure you want to delete {user.name}?</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={onDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
