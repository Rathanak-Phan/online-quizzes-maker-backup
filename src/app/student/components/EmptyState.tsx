// src/app/student/components/EmptyState.tsx
import { ReactNode } from 'react';
import { BookOpen, SearchX } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode;
  showSearchIllustration?: boolean;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  showSearchIllustration = false,
}: EmptyStateProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center max-w-3xl mx-auto">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
        {icon || (
          showSearchIllustration ? (
            <SearchX className="h-10 w-10 text-gray-400" />
          ) : (
            <BookOpen className="h-10 w-10 text-gray-400" />
          )
        )}
      </div>

      <h3 className="text-2xl font-semibold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">{description}</p>

      {action && (
        <div className="mt-4">{action}</div>
      )}
    </div>
  );
}