"use client";

import { useState, useEffect } from "react";
import UserManagement from "../components/UserManagement";

interface UserType {
  _id: string;
  name: string;
  email: string;
  role: "user" | "teacher" | "admin";
  isValidated?: boolean;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<string | null>(null); // track which teacher is being approved

  // Fetch all users from API
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (Array.isArray(data.users)) {
        setUsers(data.users);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error(err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filters
  const pendingTeachers = users.filter(
    (u) => u.role === "teacher" && !u.isValidated
  );
  const approvedTeachers = users.filter(
    (u) => u.role === "teacher" && u.isValidated
  );
  const students = users.filter((u) => u.role === "user");

  if (loading) return <p>Loading users...</p>;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">User Management</h1>

      {/* Students, Approved Teachers, Platform Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Students */}
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center justify-center">
          <p className="text-gray-500 text-sm">Students</p>
          <p className="text-3xl font-bold text-gray-900">{students.length}</p>
        </div>

        {/* Approved Teachers */}
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center justify-center">
          <p className="text-gray-500 text-sm">Approved Teachers</p>
          <p className="text-3xl font-bold text-gray-900">
            {approvedTeachers.length}
          </p>
        </div>

        {/* Platform Stats */}
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center justify-center">
          <p className="text-gray-500 text-sm">Total Users</p>
          <p className="text-3xl font-bold text-gray-900">{users.length}</p>

          <div className="mt-3 w-full flex justify-between text-sm text-gray-500">
            <span>
              Teachers: {approvedTeachers.length + pendingTeachers.length}
            </span>
            <span>Students: {students.length}</span>
          </div>
        </div>
      </div>

      <UserManagement />
    </div>
  );
}
