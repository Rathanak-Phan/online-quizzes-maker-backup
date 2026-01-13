import React from "react";
import Link from "next/link";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    // <div className="min-h-screen flex flex-col">
    //   {/* Header */}
    //   <header className="bg-blue-600 text-white p-4 flex justify-between">
    //     <h1 className="text-xl font-bold">Student Portal</h1>
    //     <nav className="flex gap-4">
    //       <Link href="/student" className="hover:underline">Dashboard</Link>
    //       <Link href="/student/quizzes" className="hover:underline">Quizzes</Link>
    //       <Link href="/student/classes" className="hover:underline">Classes</Link>
    //     </nav>
    //   </header>

    //   {/* Main Content */}
    //   <main className="flex-1 p-6 bg-gray-50">{children}</main>

    //   {/* Footer */}
    //   <footer className="bg-gray-200 text-center p-4">
    //     &copy; 2026 Online Quiz Platform
    //   </footer>
    // </div>
    <div>
      {children}
    </div>
  );
}
