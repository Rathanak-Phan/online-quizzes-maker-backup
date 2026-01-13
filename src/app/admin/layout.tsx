"use client"; // <- Must be first line

import Header from "@/app/admin/components/Header";
import Sidebar from "@/app/admin/components/Sidebar";
import { usePathname } from "next/navigation";

export default function AdminLayout({
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
