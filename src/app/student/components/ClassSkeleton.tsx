// src/app/student/components/ClassSkeleton.tsx

export function ClassSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-200"></div>
      <div className="p-6 space-y-4">
        {/* Title skeleton */}
        <div className="h-7 bg-gray-300 rounded w-3/4"></div>
        
        {/* Subtitle / subject */}
        <div className="h-5 bg-gray-200 rounded w-1/2"></div>
        
        {/* Stats row */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-300"></div>
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-300"></div>
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>

        {/* Teacher & button area */}
        <div className="pt-4 flex items-center justify-between">
          <div className="h-5 bg-gray-200 rounded w-32"></div>
          <div className="h-10 bg-gray-300 rounded-lg w-28"></div>
        </div>
      </div>
    </div>
  );
}