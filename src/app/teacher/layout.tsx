"use client";

import Header from "@/app/teacher/components/Header";
import Sidebar from "@/app/teacher/components/Sidebar";
import { usePathname, redirect } from "next/navigation";
import { useState, useEffect } from "react";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

   const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  
    useEffect(() => {
      const fetchUser = async () => {
        try {
          const res = await fetch("/api/auth/me", { credentials: "include" });
          if (!res.ok) {
            setUser(null); // not logged in
            return;
          }
          const data = await res.json();
          setUser(data); // logged in
        } catch {
          setUser(null); // error, treat as not logged in
        }
      };
  
      fetchUser();
    }, []);
  
    if (user && user.role !== "teacher") {
      redirect("/");
    }
  

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
