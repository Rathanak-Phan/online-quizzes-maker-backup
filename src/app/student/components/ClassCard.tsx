// src/app/student/components/ClassCard.tsx
import Link from "next/link";
import { BookOpen, Users, Calendar, ArrowRight } from "lucide-react";

interface ClassCardProps {
  classData: {
    _id: string;
    name: string;
    subject?: string;
    teacher: { name: string };
    studentCount: number;
    quizCount: number;
    code: string;
    createdAt: string;
  };
  href?: string; // optional link to class quizzes page
}

export function ClassCard({ classData, href = "#" }: ClassCardProps) {
  return (
    <Link href={href} className="block bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{classData.name}</h3>
            {classData.subject && (
              <p className="text-sm text-gray-600 mt-1">{classData.subject}</p>
            )}
          </div>
          <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
            {classData.quizCount} Quizzes
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
              <Users size={20} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-medium">{classData.studentCount}</p>
              <p className="text-xs text-gray-500">Students</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <BookOpen size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium">{classData.quizCount}</p>
              <p className="text-xs text-gray-500">Quizzes</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="text-gray-600">
            Teacher: <span className="font-medium">{classData.teacher.name}</span>
          </div>
          <div className="flex items-center gap-1 text-blue-600 font-medium">
            View <ArrowRight size={16} />
          </div>
        </div>
      </div>
    </Link>
  );
}