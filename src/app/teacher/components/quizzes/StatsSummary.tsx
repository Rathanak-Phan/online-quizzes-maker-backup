// app/teacher/components/quizzes/StatsSummary.tsx
import { FileText, Users, Trophy } from "lucide-react";

interface StatsSummaryProps {
  totalQuizzes: number;
  activeQuizzes: number;
  draftQuizzes: number;
  completedQuizzes: number;
  categoriesCount: number;
  averageScore?: number; // optional, if you want
}

export function StatsSummary({
  totalQuizzes,
  activeQuizzes,
  draftQuizzes,
  completedQuizzes,
  categoriesCount,
  averageScore = 0,
}: StatsSummaryProps) {
  const stats = [
    {
      label: "Total Quizzes",
      value: totalQuizzes,
      icon: FileText,
      color: "blue",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-500",
      textColor: "text-blue-600",
    },
    {
      label: "Active Quizzes",
      value: activeQuizzes,
      icon: Users,
      color: "green",
      bgColor: "bg-green-50",
      iconColor: "text-green-500",
      textColor: "text-green-600",
    },
    {
      label: "Draft Quizzes",
      value: draftQuizzes,
      icon: Trophy,
      color: "yellow",
      bgColor: "bg-yellow-50",
      iconColor: "text-yellow-500",
      textColor: "text-yellow-600",
    },
    {
      label: "Completed Quizzes",
      value: completedQuizzes,
      icon: Trophy,
      color: "purple",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-500",
      textColor: "text-purple-600",
    },
    {
      label: "Categories",
      value: categoriesCount,
      icon: FileText,
      color: "teal",
      bgColor: "bg-teal-50",
      iconColor: "text-teal-500",
      textColor: "text-teal-600",
    },
    {
      label: "Average Score",
      value: `${averageScore}%`,
      icon: Trophy,
      color: "pink",
      bgColor: "bg-pink-50",
      iconColor: "text-pink-500",
      textColor: "text-pink-600",
    },
  ];

  return (
    <div className="mt-12 pt-8 border-t border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Overview</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className={`${stat.bgColor} rounded-xl p-6`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${stat.textColor}`}>
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stat.value}
                  </p>
                </div>
                <Icon className={`w-8 h-8 ${stat.iconColor}`} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
