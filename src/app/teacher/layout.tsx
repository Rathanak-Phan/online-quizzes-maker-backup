"use client";

import Header from "@/app/teacher/components/Header";
import Sidebar from "@/app/teacher/components/Sidebar";
import { usePathname } from "next/navigation";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar currentPath={pathname} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
