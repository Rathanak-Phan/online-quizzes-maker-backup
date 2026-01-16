// src/app/student/components/ClassCard.tsx
"use client";

import { FC } from "react";

interface ClassCardProps {
  classData: {
    _id: string;
    name: string;
    subject?: string;
    teacher: { name: string; email: string };
    studentCount: number;
    quizCount: number;
    code: string;
    createdAt: string;
  };
  onClick?: () => void; // ✅ optional onClick prop
}

export const ClassCard: FC<ClassCardProps> = ({ classData, onClick }) => {
  return (
    <div
      onClick={onClick} // attach the handler
      className="border p-4 rounded-lg shadow hover:shadow-md cursor-pointer transition"
    >
      <h3 className="font-semibold text-lg">{classData.name}</h3>
      {classData.subject && (
        <p className="text-gray-500 text-sm">{classData.subject}</p>
      )}
      <p className="text-gray-400 text-xs mt-2">
        {classData.studentCount} students · {classData.quizCount} quizzes
      </p>
      <p className="text-gray-400 text-xs mt-1">Teacher: {classData.teacher.name}</p>
    </div>
  );
};
